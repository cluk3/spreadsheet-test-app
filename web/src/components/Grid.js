import React, { useContext, useCallback } from "react";
import tw, { styled } from "twin.macro";
import { AppContext } from "../AppContext";
import { Cell } from "./Cell";
import { updateCellValue } from "../api";

const HeadingCell = styled.th`
  width: 9vw;
  ${tw`border border-solid border-gray-800`}
`;

const CellContainer = styled(HeadingCell)(({ isSelected, theme }) => [
  tw`bg-white`,
  isSelected &&
    `
  z-index: 2;
  outline: 3px solid ${theme.colors.indigo["600"]};
  outline-offset: -2px;
`,
]);

export const Grid = () => {
  const { state, dispatch } = useContext(AppContext);

  const handleCellClick = useCallback(
    (cellId) => () => {
      dispatch({ type: "selected_cell_change", payload: cellId });
    },
    [dispatch]
  );
  const handleCellUpdate = useCallback(
    async (id, cellValue) => {
      const updatedCells = await updateCellValue(id, cellValue);
      dispatch({ type: "update_cells", payload: updatedCells });
    },
    [dispatch]
  );

  return (
    <table tw="w-full h-full flex-auto bg-gray-200 flex flex-col">
      <thead>
        <tr tw="w-full h-8 flex-auto bg-gray-200 flex">
          <HeadingCell />
          {Array.from("ABCDEFGHIJ", (x) => (
            <HeadingCell key={x}>{x}</HeadingCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 10 }, (_, i) => (
          <tr key={i} tw="w-full h-8 flex-auto bg-gray-200 flex">
            <HeadingCell>{i + 1}</HeadingCell>
            {Array.from("ABCDEFGHIJ", (x) => {
              const cellId = x + (i + 1);
              const { computed, value } = state.cells[cellId];
              return (
                <CellContainer
                  key={cellId}
                  onClick={handleCellClick(cellId)}
                  isSelected={cellId === state.selectedCell.id}
                >
                  <Cell
                    computedValue={computed}
                    isSelected={cellId === state.selectedCell.id}
                    cellId={cellId}
                    handleCellUpdate={handleCellUpdate}
                    cellValue={value}
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
