import os
from flask import Flask, jsonify, abort, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from helpers import to_tuple, default_to_zero, is_int, is_invalid_value

app = Flask(__name__)
app.config.from_pyfile('config.py')
cors = CORS(app, resources={r"/api/*": {"origins": os.environ.get('ALLOWED_ORIGINS', "*").split(",")}})

db = SQLAlchemy(app)
ma = Marshmallow(app)

class RefError(Exception):
    pass


class CellModel(db.Model):
    __tablename__ = 'cell'
    col = db.Column(db.CHAR(), primary_key=True, unique=False)
    row = db.Column(db.Integer, primary_key=True, unique=False)
    value = db.Column(db.String(120))
    computed = db.Column(db.Integer)
    has_ref_error = db.Column(db.Boolean)

    def __init__(self, col, row, value = None):
        self.col = col
        self.row = row
        self.value = value
        self.has_ref_error = False
        try:
            self.computed = compute_cell_value(value, col, row)
        except RefError:
            self.computed = None
            self.has_ref_error = True


class CellDependenciesModel(db.Model):
    __tablename__ = 'celldependencies'
    dependee_col = db.Column(db.CHAR(), primary_key=True, unique=False)
    dependee_row = db.Column(db.Integer, primary_key=True, unique=False)
    dependent_col = db.Column(db.CHAR(), primary_key=True, unique=False)
    dependent_row = db.Column(db.Integer, primary_key=True, unique=False)

    __table_args__ = (
        db.ForeignKeyConstraint(
            ['dependee_col', 'dependee_row'],
            ['cell.col', 'cell.row'],
        ),
        db.ForeignKeyConstraint(
            ['dependent_col', 'dependent_row'],
            ['cell.col', 'cell.row'],
        ),
    )

class CellSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CellModel

cell_schema = CellSchema()
spreadsheet_schema = CellSchema(many=True)

@app.route('/api/cell/<string:col>_<int:row>/')
def get_cell(col, row):
    cell = CellModel.query.get((col, row))
    if cell is None:
        return abort(404)
    return cell_schema.jsonify(cell)

@app.route('/api/cells/')
def get_spreadsheet():
    return jsonify(spreadsheet_schema.dump(CellModel.query.all()))


@app.route('/api/cell/<string:col>_<int:row>/', methods=['PUT'])
def update_cell(col, row):
    if not request.json or not 'value' in request.json:
        return abort(400)
    cell = CellModel.query.get((col, row))
    if cell is None:
        return abort(409)
    
    value = request.json.get('value')
    if is_invalid_value(value):
        return abort(make_response(jsonify(error=f"Value '{value}' is not valid."), 400))

    cell.value = value

    # clean up dependencies
    CellDependenciesModel.query.filter_by(dependent_col=col, dependent_row=row).delete()

    try:
        cell.computed = compute_cell_value(cell.value, cell.col, cell.row)
        cell.has_ref_error = False
    except RefError:
        cell.has_ref_error = True
    
    db.session.add(cell)

    if has_cyclic_path((cell.col, cell.row)):
        cell.has_ref_error = True

    if  cell.has_ref_error:
        updated_cells = set([cell])

        def spread_ref_error(dependee_cell):
            dependents = CellDependenciesModel.query.filter_by(dependee_col=dependee_cell.col, dependee_row=dependee_cell.row).all()
            for dependent in dependents:
                dependent_cell = CellModel.query.get((dependent.dependent_col, dependent.dependent_row))
                if (not dependent_cell in updated_cells) and (not dependent_cell.has_ref_error):
                    dependent_cell.has_ref_error = True
                    db.session.add(dependent_cell)
                    updated_cells.add(dependent_cell)
                    spread_ref_error(dependent_cell)

        spread_ref_error(cell)

        db.session.commit()
        return jsonify(spreadsheet_schema.dump(updated_cells))

    
    recomputed_cells = set([cell])

    # exclude the first cell as it has been already recomputed
    cells_to_recompute_ids = topological_sort_without_cycles((cell.col, cell.row))[1:]

    for cell_id in cells_to_recompute_ids:
        cell = CellModel.query.get(cell_id)
        try:
            cell.computed = compute_cell_value(cell.value, cell.col, cell.row)
            cell.has_ref_error = False
        except RefError:
            cell.has_ref_error = True
        
        db.session.add(cell)
        recomputed_cells.add(cell)

    db.session.commit()
    return jsonify(spreadsheet_schema.dump(recomputed_cells))

def compute_cell_value(value, col, row):
    if (value is None or value == ""):
        return None
    if not value.startswith("="):
        return int(value)

    cells = value[1:].split("+")
    sum = 0
    raise_when_finished = False
    for cell_id in cells:
        if is_int(cell_id):
            sum += int(cell_id)
        else:
            cell_id = to_tuple(cell_id)

            # check if cell is referring itself
            if cell_id == (col, row):
                raise RefError()
            cell = CellModel.query.get(cell_id)

            # add dependency if it doesn't exist already
            dependency = CellDependenciesModel.query.get((cell.col, cell.row, col, row))
            if dependency is None:
                dependency = CellDependenciesModel(dependee_col=cell.col, dependee_row=cell.row, dependent_col=col, dependent_row=row)
                db.session.add(dependency)
                db.session.commit() #check if it can go out of the loop
            
            # mask the ref error and throw it when all deps have been added
            if cell.has_ref_error:
                raise_when_finished = True
            else:
                sum += default_to_zero(cell.computed)

    if raise_when_finished:
        raise RefError()
    return sum


def has_cyclic_path(cell):
    visited = set()
    path = set()

    def explore(node):
        if node in visited:
            return False
        visited.add(node)
        path.add(node)
        for neighbour in get_dependees(node):
            if neighbour in path or explore(neighbour):
                return True
        path.remove(node)
        return False
    
    explore(cell)
    
    return len(path) > 0

def get_dependees(cell_id):
    refs = CellDependenciesModel.query.filter_by(dependent_col=cell_id[0], dependent_row=cell_id[1]).all()
    result = []
    for ref in refs:
        result.append((ref.dependee_col, ref.dependee_row))
    return result

def get_dependents(cell_id):
    refs = CellDependenciesModel.query.filter_by(dependee_col=cell_id[0], dependee_row=cell_id[1]).all()
    result = []
    for ref in refs:
        result.append((ref.dependent_col, ref.dependent_row))
    return result

def topological_sort_without_cycles(node):
    sorted = []
    seen = set()

    def explore(node):
        for neighbor in get_dependents(node):
            if neighbor not in seen:
                seen.add(neighbor)
                helper_res = explore(neighbor)
                if not helper_res is None:
                    return None if helper_res == node else helper_res
            elif neighbor not in sorted:
                return neighbor if neighbor != node else None
        sorted.insert(0, node)

    explore(node)
    return sorted

if __name__ == '__main__':
    app.run(debug=True)