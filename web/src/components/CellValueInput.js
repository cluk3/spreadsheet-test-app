import React, { useCallback, useContext } from "react";
import { AppContext } from "../AppContext";
import { updateCellValue } from "../api";
import "twin.macro";

export const CellValueInput = React.memo(({ className, ...props }) => {
  const { state, dispatch } = useContext(AppContext);
  const {
    selectedCell,
    editMode: { editValue, acceptsRefs, isPristine },
  } = state;

  const setEditValue = useCallback(
    (value) => {
      dispatch({ type: "set_edit_value", payload: value });
    },
    [dispatch]
  );

  const startEditing = useCallback(() => {
    dispatch({ type: "start_editing" });
  }, [dispatch]);

  const handleChange = useCallback(
    (evt) => {
      setEditValue(evt.target.value);
    },
    [setEditValue]
  );

  const handleCellUpdate = useCallback(async () => {
    const updatedCells = await updateCellValue(selectedCell.id, editValue);
    dispatch({ type: "update_cells", payload: updatedCells });
  }, [dispatch, selectedCell, editValue]);

  const handleKeyPress = useCallback(
    (evt) => {
      if (!isPristine && evt.key === "Enter") {
        handleCellUpdate();
      }
    },
    [handleCellUpdate, isPristine]
  );
  const handleBlur = useCallback(
    (evt) => {
      acceptsRefs && evt.target.focus();
    },
    [acceptsRefs]
  );
  return (
    <input
      className={className}
      tw="w-full h-full outline-none px-1"
      type="text"
      value={editValue}
      autoComplete="off"
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      onFocus={startEditing}
      autoFocus={acceptsRefs}
      onBlur={handleBlur}
      {...props}
    />
  );
});
