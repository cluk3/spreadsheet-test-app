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


if __name__ == '__main__':
    app.run(debug=True)