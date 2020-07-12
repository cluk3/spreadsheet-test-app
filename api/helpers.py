import re

def to_tuple(cell_str):
    col = cell_str[:1]
    row = cell_str[1:3]
    return col, row

def default_to_zero(value):
    return 0 if value is None else value

def is_int(s):
    if s[0] in ('-', '+'):
        return s[1:].isdigit()
    return s.isdigit()

def to_tuple_list(refs):
    result = []
    for ref in refs:
        result.append((ref.dependee_col, ref.dependee_row))
    return result

valid_value_re = re.compile(r"^-?\d+$|^=(-?\d+|[A-J]{1}(10|\d{1}))(\+(-?\d+|[A-J]{1}(10|\d{1})))*$")
def is_invalid_value(value):
    return re.search(valid_value_re, value) is None