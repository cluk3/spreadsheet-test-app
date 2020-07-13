import React, { useEffect, useReducer, useCallback } from "react";
import { getAll, updateCellValue } from "./api";
import { LoadingRipple } from "./components/LoadingRipple";
import { eventKeysToAction } from "./keyboardNavigation";

export const AppContext = React.createContext({});

const REFERRED_CELLS_REGEX = /(?=|\+)([A-J](10|\d))/g;

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getAll().then((data) => {
      dispatch({ type: "hydrate", payload: data });
    });
  }, []);

  const handleEndEditing = useCallback(async () => {
    dispatch({ type: "end_editing" });
    const cellToUpdate = state.selectedCell;
    if (state.selectedCell.value !== state.editMode.editValue) {
      try {
        dispatch({ type: "start_loading", payload: cellToUpdate.id });
        const updatedCells = await updateCellValue(
          cellToUpdate.id,
          state.editMode.editValue
        );
        dispatch({ type: "update_cells", payload: updatedCells });
      } catch (err) {
        console.error(err);
        dispatch({ type: "show_error_msg", payload: err });
      } finally {
        dispatch({ type: "end_loading", payload: cellToUpdate.id });
      }
    }
  }, [dispatch, state.selectedCell, state.editMode.editValue]);

  return (
    <AppContext.Provider value={{ state, dispatch, handleEndEditing }}>
      {state.isBootstraping && <LoadingRipple />}
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
  if (process.env.NODE_ENV === "development") {
    console.debug("state", state);
    console.debug("action: ", type);
  }
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
        isBootstraping: false,
      };
    case "selected_cell_change":
      const selectedCellId = payload;
      if (selectedCellId === state.selectedCell.id) return state;

      const selectedCell = state.cells[selectedCellId];

      return {
        ...state,
        selectedCell,
        editMode: {
          ...state.editMode,
          editValue: selectedCell.value || "",
        },
      };
    case "keyboard_navigation":
      const nextSelectionId = eventKeysToAction[payload](state.selectedCell.id);

      return {
        ...state,
        selectedCell: state.cells[nextSelectionId],
        editMode: {
          ...state.editMode,
          editValue: state.cells[nextSelectionId].value || "",
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
      };
    case "set_edit_value":
      const inputText = payload.toUpperCase();

      return {
        ...state,
        editMode: {
          ...state.editMode,
          editValue: inputText,
          ...getReferredCells(inputText),
        },
      };
    case "start_editing":
      editValue = state.editMode.editValue;
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
    case "start_loading":
      return {
        ...state,
        loadingCellId: payload,
      };
    case "end_loading":
      return {
        ...state,
        loadingCellId: null,
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
  loadingCellId: null,
  isBootstraping: true,
};
