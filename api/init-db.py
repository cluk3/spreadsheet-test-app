from app import db, CellModel

db.drop_all()
db.create_all()

def char_range(c1, c2):
    for c in range(ord(c1), ord(c2)+1):
        yield chr(c)

for col in char_range('A', 'J'):
    for row in range(1, 11):
        cell = CellModel(col, row)
        db.session.add(cell)

db.session.commit()
