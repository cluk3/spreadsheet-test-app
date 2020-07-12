import React, { useCallback, useRef, useState, useEffect } from "react";
import tw, { styled } from "twin.macro";
import { CellValueInput } from "./CellValueInput";

const Span = styled.span(({ hasRefError }) => [
  tw`flex justify-end items-center w-full h-full select-none`,
  hasRefError && tw`text-red-400`,
]);

export const Cell = React.memo(
  ({ computedValue, isSelected, startEditing, isEditing, hasRefError }) => {
    const isFocused = useRef();
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
      if (!isEditing && showInput) {
        setShowInput(false);
      }
      // we only want this effect to run when isEditing changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    const handleKeyDown = useCallback(
      (evt) => {
        if (isSelected && !isEditing) {
          setShowInput(true);
          if (evt.key === "Enter") {
            evt.preventDefault();
          }
        }
      },
      [isSelected, isEditing]
    );
    const handleDoubleClick = useCallback(() => {
      if (!isEditing) {
        setShowInput(true);
      }
    }, [isEditing]);

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
        {showInput ? (
          <CellValueInput autoFocus={isFocused.current}></CellValueInput>
        ) : (
          <Span hasRefError={hasRefError}>
            {hasRefError ? "#REF!" : computedValue}
          </Span>
        )}
      </div>
    );
  }
);
