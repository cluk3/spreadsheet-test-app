import React, { useCallback, useContext, useState } from "react";
import { AppContext } from "../AppContext";
import tw, { styled } from "twin.macro";

const VALID_INPUT_REGEX = /^(-?\d*$|=)/;

const Input = styled.input(({ hasInvalidInput }) => [
  tw`w-full h-full outline-none px-1`,
  hasInvalidInput && tw`bg-opacity-25 bg-red-200`,
]);

export const CellValueInput = React.memo(({ className, ...props }) => {
  const { state, dispatch, handleEndEditing } = useContext(AppContext);
  const {
    editMode: { editValue, acceptsRefs },
  } = state;
  const [hasInvalidInput, setInvalidInput] = useState(false);

  const setEditValue = useCallback(
    (value) => {
      const isValidInput = VALID_INPUT_REGEX.test(value);
      if (isValidInput) {
        dispatch({ type: "set_edit_value", payload: value });
      }
      setInvalidInput(!isValidInput);
    },
    [dispatch, setInvalidInput]
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

  const handleKeyPress = useCallback(
    (evt) => {
      if (evt.key === "Enter") {
        handleEndEditing();
        dispatch({ type: "keyboard_navigation", payload: "Enter" });
      }
    },
    [handleEndEditing, dispatch]
  );
  const handleBlur = useCallback(
    (evt) => {
      acceptsRefs && evt.target.focus();
    },
    [acceptsRefs]
  );
  return (
    <Input
      className={className}
      type="text"
      value={editValue}
      hasInvalidInput={hasInvalidInput}
      autoComplete="off"
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      onFocus={acceptsRefs ? void 0 : startEditing}
      autoFocus={acceptsRefs}
      onBlur={handleBlur}
      {...props}
    />
  );
});
