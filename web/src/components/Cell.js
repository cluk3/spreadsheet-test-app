import React, { useState, useCallback, useRef, useEffect } from "react";
import tw, { styled } from "twin.macro";

const regex = /^(-?\d*$|=)/;

export const Cell = React.memo(
  ({ computedValue, cellId, isSelected, cellValue = "", handleCellUpdate }) => {
    const [editValue, setEditValue] = useState(cellValue);
    const inputRef = useRef();
    const [isWaitingForComputed, setWFC] = useState(true);
    const [isEditing, setEditingMode] = useState();
    const [hasInvalidInput, setHasInvalidInput] = useState(false);

    useEffect(() => {
      // skip first call
      if (typeof isEditing !== "undefined")
        isEditing
          ? inputRef.current.focus()
          : handleCellUpdate(cellId, editValue);
    }, [isEditing]);

    useEffect(() => {
      setWFC(false);
    }, [computedValue, setWFC]);
    useEffect(() => {
      setEditValue(cellValue || "");
    }, [cellValue]);

    const handleChange = useCallback(
      (evt) => {
        const inputText = evt.target.value;
        if (regex.test(inputText)) {
          setEditValue(inputText);
          hasInvalidInput && setHasInvalidInput(false);
        } else {
          setEditValue(editValue || "");
          setHasInvalidInput(true);
        }
      },
      [hasInvalidInput, setHasInvalidInput, setEditValue, editValue]
    );

    const handleKeyDown = useCallback(
      (evt) => {
        if (isSelected && !isEditing) {
          setEditingMode(true);
          handleChange(evt);
        }
      },
      [isSelected, isEditing, setEditingMode, handleChange]
    );
    const handleDoubleClick = useCallback(() => {
      if (!isEditing) {
        setEditingMode(true);
      }
    }, [isEditing, setEditingMode]);

    const endEditing = useCallback(() => {
      if (isEditing) {
        setEditingMode(false);
        editValue !== cellValue && setWFC(true);
      }
    }, [isEditing, setEditingMode, setWFC, editValue, cellValue]);

    const handleKeyPress = useCallback(
      (evt) => {
        if (evt.key === "Enter") {
          endEditing();
        }
      },
      [endEditing]
    );

    return (
      <div
        tabIndex="0"
        isSelected={isSelected}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        tw="h-full outline-none"
      >
        <Input
          autoFocus
          isEditing={isEditing}
          type="text"
          value={editValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onBlur={endEditing}
          ref={inputRef}
        ></Input>
        <Span isEditing={isEditing}>
          {isWaitingForComputed ? "" : computedValue}
        </Span>
      </div>
    );
  }
);

const Input = styled.input(({ isEditing }) => [
  tw`w-full h-full outline-none px-1`,
  isEditing ? tw`block` : tw`hidden`,
]);

const Span = styled.span(({ isEditing }) => [
  tw`w-full h-full text-right`,
  isEditing ? tw`hidden` : tw`block`,
]);
