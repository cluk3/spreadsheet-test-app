import os
from flask import Flask, jsonify, abort, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from helpers import to_tuple, default_to_zero, is_int ,to_tuple_list, is_invalid_value

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


@app.route('/api/cell/', methods=['POST'])
def create_cell():
    if not request.json or not 'col' in request.json or not 'row' in request.json:
        abort(400)
    
    cell = CellModel(request.json['col'], request.json['row'], request.json['value'])
    db.session.add(cell)
    db.session.commit()
    return cell_schema.jsonify(cell), 201


@app.route('/api/cell/<string:col>_<int:row>/', methods=['DELETE'])
def delete_cell(col, row):
    cell = CellModel.query.get((col, row))
    if cell is None:
        return abort(409)
    # if cell.value is a formula -> remove deps
    db.session.delete(cell)
    db.session.commit()
    return jsonify({'result': True})


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

    try:
        cell.computed = compute_cell_value(cell.value, cell.col, cell.row)
        cell.has_ref_error = False
    except RefError:
        cell.computed = None
        cell.has_ref_error = True
        db.session.add(cell)
        db.session.commit()
        return jsonify(spreadsheet_schema.dump([cell]))

    # TODO: update dependent cell to have ref error

    dep_set = find_cyclic_path((cell.col, cell.row))

    if len(dep_set):
        updated_cells = []
        for dep in dep_set:
            dep_cell = CellModel.query.get(dep)
            dep_cell.computed = None
            dep_cell.has_ref_error = True
            db.session.add(dep_cell)
            updated_cells.append(dep_cell)

        db.session.commit()
        return jsonify(spreadsheet_schema.dump(updated_cells))

    
    db.session.add(cell)
    updated_cells = [cell]


    old_computed = default_to_zero(cell.computed)

    # check dependencies
    dependencies = CellDependenciesModel.query.filter_by(dependee_col=cell.col, dependee_row=cell.row).all()

    # TODO: recursive update of deps
    for dependency in dependencies:
        dep_cell = CellModel.query.get((dependency.dependent_col, dependency.dependent_row))
        if not dep_cell.has_ref_error:
            dep_cell.computed += default_to_zero(cell.computed) - old_computed
            db.session.add(dep_cell)
            updated_cells.append(dep_cell)

    db.session.commit()
    return jsonify(spreadsheet_schema.dump(updated_cells))

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


def find_cyclic_path(cell):
    visited = set()
    path = set()

    def explore(node):
        if node in visited:
            return False
        visited.add(node)
        path.add(node)
        for neighbour in get_dependees(node):
            print(neighbour)
            if neighbour in path or explore(neighbour):
                return True
        path.remove(node)
        return False
    
    explore(cell)
    
    return path

def get_dependees(cell_id):
    return to_tuple_list(CellDependenciesModel.query.filter_by(dependent_col=cell_id[0], dependent_row=cell_id[1]).all())


if __name__ == '__main__':
    app.run(debug=True)