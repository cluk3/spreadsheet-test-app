import os
from flask import Flask, jsonify, abort, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from dependency import create_dependency_graph
from flask_cors import CORS

app = Flask(__name__)
app.config.from_pyfile('config.py')
cors = CORS(app, resources={r"/api/*": {"origins": os.environ.get('ALLOWED_ORIGINS', "*")}})

db = SQLAlchemy(app)
ma = Marshmallow(app)

# TODO: check circular dependencies
# TODO: check cell referencing itself
# TODO: check =A1+A1

class CellModel(db.Model):
    __tablename__ = 'cell'
    col = db.Column(db.CHAR(), primary_key=True, unique=False)
    row = db.Column(db.Integer, primary_key=True, unique=False)
    value = db.Column(db.String(120))
    computed = db.Column(db.Integer)

    def __init__(self, col, row, value = None):
        self.col = col
        self.row = row
        self.value = value
        self.computed = compute_cell_value(value, col, row)


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
    
    cell.value = request.json.get('value')

    # if it was a number and stays a number, do nothin
    # else update dependencies

    old_computed = cell.computed
    cell.computed = compute_cell_value(cell.value, cell.col, cell.row)
    db.session.add(cell)
    updated_cells = [cell]

    # check dependencies
    dependencies = CellDependenciesModel.query.filter_by(dependee_col=cell.col, dependee_row=cell.row).all()

    # TODO: recursive update of deps
    for dependency in dependencies:
        dep_cell = CellModel.query.get((dependency.dependent_col, dependency.dependent_row))
        dep_cell.computed += cell.computed - old_computed
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
    for cell_id in cells:
        cell = CellModel.query.get(toTuple(cell_id))
        dependency = CellDependenciesModel(dependee_col=cell.col, dependee_row=cell.row, dependent_col=col, dependent_row=row)
        db.session.add(dependency)
        db.session.commit()
        sum += 0 if cell.computed is None else cell.computed

    return sum
    
def toTuple(cell_str):
    col = cell_str[:1]
    row = cell_str[1:2]
    return col, row

if __name__ == '__main__':
    app.run(debug=True)