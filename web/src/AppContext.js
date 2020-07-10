import React, { useEffect, useReducer } from "react";
import { getAll } from "./api";

export const AppContext = React.createContext({});

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getAll().then((data) => {
      dispatch({ type: "hydrate", payload: data });
    });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "hydrate":
      return {
        ...state,
        cells: payload.reduce((cells, cellData) => {
          cells[cellData.id] = {
            ...state.cells[cellData.id],
            ...cellData,
          };
          return cells;
        }, {}),
      };
    case "selected_cell_change":
      const selectedCellId = payload;
      if (selectedCellId === state.selectedCell.id) return state;

      return {
        ...state,
        selectedCell: state.cells[selectedCellId],
      };
    case "update_cells":
      const updatedCells = payload;

      return {
        ...state,
        cells: {
          ...state.cells,
          ...updatedCells.reduce((cells, updatedCell) => {
            cells[updatedCell.id] = {
              id: updatedCell.id,
              ...updatedCell,
            };
            return cells;
          }, {}),
        },
      };
    default:
      return state;
  }
};

const initialState = {
  selectedCell: {},
  cells: Array.from({ length: 100 }, (_, i) => ({
    id: `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`,
  })).reduce((cells, cellData) => {
    cells[cellData.id] = {
      id: cellData.id,
    };
    return cells;
  }, {}),
};
