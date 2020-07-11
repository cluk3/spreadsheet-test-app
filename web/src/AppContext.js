import React, { useEffect, useReducer } from "react";
import { getAll } from "./api";

export const AppContext = React.createContext({});

const VALID_INPUT_REGEX = /^(-?\d*$|=)/;
const REFERRED_CELLS_REGEX = /(?=|\+)([A-J](10|\d))/g;

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

const getReferredCells = (inputText) => {
  if (!inputText) return;
  if (!inputText.startsWith("=")) {
    return {
      acceptsRefs: false,
      referredCells: [],
    };
  }
  // accepts refs when input text is "=" or it ends with "+"
  const acceptsRefs = inputText.length === 1 || inputText.slice(-1) === "+";
  const referredCells = inputText.match(REFERRED_CELLS_REGEX) || [];
  return {
    acceptsRefs,
    referredCells,
  };
};

const reducer = (state, { type, payload }) => {
  let editValue;
  switch (type) {
    case "hydrate":
      const cells = payload.reduce((cells, cellData) => {
        cells[cellData.id] = {
          ...state.cells[cellData.id],
          ...cellData,
        };
        return cells;
      }, {});
      return {
        ...state,
        cells,
        selectedCell: cells["A1"],
        editMode: {
          ...state.editMode,
          editValue: cells["A1"].value || "",
        },
      };
    case "selected_cell_change":
      const selectedCellId = payload;
      if (selectedCellId === state.selectedCell.id) return state;

      const selectedCell = state.cells[selectedCellId];

      return {
        ...state,
        selectedCell,
        editMode: {
          editValue: selectedCell.value || "",
          isEditing: false,
          acceptsRefs: false,
          referredCells: [],
        },
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
        editMode: {
          ...state.editMode,
          isEditing: false,
          acceptsRefs: false,
          referredCells: [],
        },
      };
    case "set_edit_value":
      const inputText = payload;
      return {
        ...state,
        editMode: {
          ...state.editMode,
          editValue: VALID_INPUT_REGEX.test(inputText)
            ? inputText
            : state.editMode.editValue,
          ...getReferredCells(inputText),
        },
      };
    case "start_editing":
      editValue =
        payload && VALID_INPUT_REGEX.test(payload)
          ? payload
          : state.editMode.editValue;
      return {
        ...state,
        editMode: {
          ...state.editMode,
          isEditing: true,
          editValue,
          ...getReferredCells(editValue),
        },
      };
    case "end_editing":
      return {
        ...state,
        editMode: {
          ...state.editMode,
          isEditing: false,
          acceptsRefs: false,
          referredCells: [],
        },
      };
    case "add_referred_cell":
      editValue = state.editMode.editValue + payload;
      return {
        ...state,
        editMode: {
          ...state.editMode,
          editValue: editValue,
          ...getReferredCells(editValue),
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
  editMode: {
    editValue: "",
    isEditing: false,
    acceptsRefs: false,
    referredCells: [],
  },
};
