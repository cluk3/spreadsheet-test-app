from flask import Flask, jsonify, abort, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

app = Flask(__name__)
app.config.from_pyfile('config.py')
db = SQLAlchemy(app)
ma = Marshmallow(app)

class CellModel(db.Model):
    __tablename__ = 'cell'
    col = db.Column(db.CHAR(), primary_key=True, unique=False)
    row = db.Column(db.Integer, primary_key=True, unique=False)
    value = db.Column(db.String(120))
    computed = db.Column(db.Integer)

    def __init__(self, row, col, value = None):
        self.row = row
        self.col = col
        self.value = value
        self.computed = compute_cell_value(value)

    def serialize(self):
        return {
            "id": self.id,
            "row": self.row,
            "col": self.col,
            "value": self.value,
            "computed": self.computed
                }

class CellSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = CellModel

cell_schema = CellSchema()
spreadsheet_schema = CellSchema(many=True)

@app.route('/api/cell/<string:col>_<int:row>/')
def get_cell(col, row):
    print(col, row)
    return cell_schema.jsonify(CellModel.query.get((col, row)))


@app.route('/api/cells/')
def get_spreadsheet():
    return jsonify(spreadsheet_schema.dump(CellModel.query.all()))


@app.route('/api/cell/', methods=['POST'])
def create_cell():
    if not request.json or not 'col' in request.json or not 'row' in request.json:
        abort(400)
    cell = CellModel(request.json['row'], request.json['col'], request.json['value'])
    db.session.add(cell)
    db.session.commit()
    return cell_schema.jsonify(cell), 201


@app.route('/api/cell/<string:col>_<int:row>/', methods=['DELETE'])
def delete_cell(col, row):
    db.session.delete(CellModel.query.get((col, row)))
    db.session.commit()
    return jsonify({'result': True})


@app.route('/api/cell/<string:col>_<int:row>/', methods=['PUT'])
def update_cell(col, row):
    cell = CellModel.query.get((col, row))
    cell.value = request.json.get('value')
    cell.computed = compute_cell_value(cell.value)
    db.session.add(cell)
    db.session.commit()
    return cell_schema.jsonify(cell)

def compute_cell_value(value):
    if (value is None):
        return 0
    if not value.startswith("="):
        return int(value)

    cells = value[1:].split("+")
    sum = 0
    for cell_id in cells:
        cell = CellModel.query.get(toTuple(cell_id))
        print(cell)
        sum += cell.computed

    return sum
    
def toTuple(cell_str):
    col = cell_str[:1]
    row = cell_str[1:2]
    return col, row

if __name__ == '__main__':
    app.run(debug=True)