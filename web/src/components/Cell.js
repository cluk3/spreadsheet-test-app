import React, { useCallback, useRef } from "react";
import "twin.macro";
import { CellValueInput } from "./CellValueInput";

export const Cell = React.memo(
  ({ computedValue, isSelected, startEditing, isEditing }) => {
    const isFocused = useRef();

    const handleKeyDown = useCallback(
      (evt) => {
        if (isSelected && !isEditing) {
          startEditing(evt.target.value);
        }
      },
      [isSelected, isEditing, startEditing]
    );
    const handleDoubleClick = useCallback(() => {
      if (!isEditing) {
        startEditing();
      }
    }, [isEditing, startEditing]);

    return (
      <div
        tabIndex="0"
        isSelected={isSelected}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        tw="h-full outline-none text-sm font-normal"
        onFocus={() => (isFocused.current = true)}
        onBlur={() => (isFocused.current = false)}
      >
        {isEditing ? (
          <CellValueInput autoFocus={isFocused.current}></CellValueInput>
        ) : (
          <span tw="flex justify-end items-center w-full h-full">
            {computedValue}
          </span>
        )}
      </div>
    );
  }
);
