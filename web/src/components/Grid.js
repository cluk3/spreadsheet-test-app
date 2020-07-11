import React, { useContext, useCallback } from "react";
import tw, { styled } from "twin.macro";
import { AppContext } from "../AppContext";
import { Cell } from "./Cell";

const COLUMNS = Array.from("ABCDEFGHIJ");
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);

const REF_COLORS = ["orange", "green", "yellow", "teal", "pink", "blue"];

const getRefColors = ({ colors }) =>
  REF_COLORS.map((color) => colors[color]["500"]);

const HeadingCell = styled.th`
  width: 9vw;
  ${tw`border border-solid border-gray-600`}
`;

const CellContainer = styled(HeadingCell)(({ isSelected, theme, refIndex }) => [
  tw`bg-white border-gray-400`,
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
    state: { cells, editMode, selectedCell },
    dispatch,
  } = useContext(AppContext);

  const startEditing = useCallback(() => {
    dispatch({ type: "start_editing" });
  }, [dispatch]);

  const handleCellClick = useCallback(
    (cellId) => () => {
      if (editMode.acceptsRefs) {
        selectedCell.id !== cellId &&
          dispatch({ type: "add_referred_cell", payload: cellId });
      } else {
        dispatch({ type: "selected_cell_change", payload: cellId });
      }
    },
    [dispatch, editMode, selectedCell.id]
  );

  return (
    <table tw="w-full h-full flex-auto bg-gray-200 flex flex-col">
      <ColumnHeading />
      <tbody>
        {ROWS.map((rowId) => (
          <tr key={rowId} tw="w-full h-8 flex-auto bg-gray-200 flex">
            <HeadingCell>{rowId}</HeadingCell>
            {COLUMNS.map((colId) => {
              const cellId = colId + rowId;
              const { computed } = cells[cellId];
              const isSelected = cellId === selectedCell.id;
              const refIndex = editMode.referredCells.indexOf(cellId);
              return (
                <CellContainer
                  key={cellId}
                  onClick={handleCellClick(cellId)}
                  isSelected={isSelected}
                  refIndex={refIndex}
                >
                  <Cell
                    computedValue={computed}
                    isSelected={isSelected}
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
