import React, { useCallback } from "react";
import tw, { styled } from "twin.macro";
import { CellValueInput } from "./CellValueInput";

const Span = styled.span(({ hasRefError }) => [
  tw`flex justify-end items-center w-full h-full select-none`,
  hasRefError && tw`text-red-400`,
]);

export const Cell = React.memo(
  ({ computedValue, startEditing, isEditing, hasRefError }) => {
    const handleDoubleClick = useCallback(() => {
      if (!isEditing) {
        startEditing();
      }
      // we only want this effect to run when isEditing changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    return (
      <div onDoubleClick={handleDoubleClick} tw="h-full text-sm font-normal">
        {isEditing ? (
          <CellValueInput autoFocus></CellValueInput>
        ) : (
          <Span hasRefError={hasRefError}>
            {hasRefError ? "#REF!" : computedValue}
          </Span>
        )}
      </div>
    );
  }
);
