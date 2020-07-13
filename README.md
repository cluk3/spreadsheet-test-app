# Spreadsheet App

The app has been deployed at https://spreadsheeets.netlify.app/ .
The frontend app has been deployed with Netlify, the Api with https://www.pythonanywhere.com/

## How to build locally

### Backend

Requirements:

- Python v3.7
- sqlite

I'm using `pipenv` to manage the virtual env, anyway there shouldn't be any problem using any other virtual env software.
Inside the virtual env shell run:

```sh
python init-db.py
flask run
```

This will initialize/reset the database and start the server.

It was my first time developing on the backend with python, so for sure the folder structure and the quality of the code can be greatly improved!

### Frontend

I built the frontend app with Create React App.
To build and run the frontend you can run:

```sh
cd web
echo "REACT_APP_API_ENDPOINT=http://127.0.0.1:5000" >> .env.development
yarn install
yarn start
```

## Implemented Features

- Keyboard Navigation
- Detection of circular references
- Interactive updates: changing one value will automatically update all the other values depeding on it
- Highlight of referenced cell during edit mode
- Add a cell reference by clicking it during edit mode.

## Test assignment

### Building an Interactive Spreadsheet

Today, the vast majority of businesses implement their commission plan models
in Microsoft Excel, Google Sheets, or some other spreadsheet software. In this
problem, you will implement a simplified browser-based spreadsheet that can be
used to implement an extremely simple financial model.

### Requirements

* For simplicity, the size of the spreadsheet is fixed to 10 rows and 10
  columns.
  - Columns are named after capital letters, starting with "A".
	- Rows are numbered and increasing, starting from "1".
* The state of the spreadsheet should be maintained in a backend service that
  is mutatable via API calls.
* The frontend should be interactive: saving data after a cell in the
  spreadsheet changes, and updating any affected cells with their newly
  computed values.
* The state of the spreadsheet should be persisted across server restarts.
* Cell values should support either an integer or a simple formula that
  references other cells and only needs to support addition.
    - For example, `-1` and `123` should be able to be stored in a cell.
    - `=A1+B1` should be able to be stored in a cell, and the display value
      should be the result of evaluating the sum of the value in `A1` and
      the value in `B1`.

### Out-of-scope

* Don't worry about handling multiple concurrent users viewing and editing the
  spreadsheet at the same time.

