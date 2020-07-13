import React, { useContext, useCallback, useEffect } from "react";
import tw, { styled } from "twin.macro";
import { AppContext } from "../AppContext";
import { Cell } from "./Cell";
import { LoadingSnake } from "./LoadingSnake";

const COLUMNS = Array.from("ABCDEFGHIJ");
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);

const REF_COLORS = ["orange", "green", "yellow", "teal", "pink", "blue"];
const EVENT_KEYS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Tab"];

const getRefColors = ({ colors }) =>
  REF_COLORS.map((color) => colors[color]["500"]);

const HeadingCell = styled.th`
  width: calc(100% / 11);
  ${tw`border border-solid border-gray-600 select-none`}
`;

const CellContainer = styled(HeadingCell)(({ isSelected, theme, refIndex }) => [
  tw`bg-white border-gray-400 relative`,
  isSelected &&
    `
  z-index: 2;
  outline: 3px solid ${theme.colors.teal["400"]};
  outline-offset: -2px;
`,
  refIndex > -1 &&
    `
  z-index: 2;
  outline: 3px dashed ${getRefColors(theme)[refIndex]};
  outline-offset: -2px;
  `,
]);

export const Grid = () => {
  const {
    state: { cells, editMode, selectedCell, loadingCellId },
    dispatch,
    handleEndEditing,
  } = useContext(AppContext);

  useEffect(() => {
    const handleKeyDown = (evt) => {
      if (!editMode.isEditing) {
        if (EVENT_KEYS.includes(evt.key)) {
          dispatch({ type: "keyboard_navigation", payload: evt.key });
          evt.key === "Tab" && evt.preventDefault();
        } else {
          dispatch({ type: "start_editing" });
          evt.key === "Enter" && evt.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // we only want this effect to run when isEditing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode.isEditing]);

  const startEditing = useCallback(() => {
    dispatch({ type: "start_editing" });
  }, [dispatch]);

  const handleCellClick = useCallback(
    (cellId) => () => {
      if (editMode.acceptsRefs) {
        selectedCell.id !== cellId &&
          dispatch({ type: "add_referred_cell", payload: cellId });
      } else {
        editMode.isEditing && handleEndEditing();
        dispatch({ type: "selected_cell_change", payload: cellId });
      }
    },
    [dispatch, editMode, selectedCell.id, handleEndEditing]
  );

  return (
    <table tw="w-full h-full flex-auto bg-gray-200 flex flex-col">
      <ColumnHeading />
      <tbody>
        {ROWS.map((rowId) => (
          <tr key={rowId} tw="w-full h-10 flex-auto bg-gray-200 flex">
            <HeadingCell>{rowId}</HeadingCell>
            {COLUMNS.map((colId) => {
              const cellId = colId + rowId;
              const { computed, has_ref_error } = cells[cellId];
              const isSelected = cellId === selectedCell.id;
              const refIndex = editMode.referredCells.indexOf(cellId);
              return (
                <CellContainer
                  key={cellId}
                  onClick={isSelected ? void 0 : handleCellClick(cellId)}
                  isSelected={isSelected}
                  refIndex={refIndex}
                >
                  {loadingCellId === cellId && <LoadingSnake />}
                  <Cell
                    computedValue={computed}
                    hasRefError={has_ref_error}
                    isEditing={isSelected && editMode.isEditing}
                    startEditing={startEditing}
                  />
                </CellContainer>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ColumnHeading = React.memo(() => (
  <thead>
    <tr tw="w-full h-8 flex-auto bg-gray-200 flex">
      <HeadingCell />
      {COLUMNS.map((x) => (
        <HeadingCell key={x}>{x}</HeadingCell>
      ))}
    </tr>
  </thead>
));
