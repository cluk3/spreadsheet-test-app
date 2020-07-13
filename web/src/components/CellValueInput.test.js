import React from "react";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CellValueInput } from "./CellValueInput";
import { AppContextProvider } from "../test/mockAppContext";

describe("CellValueInput component", () => {
  it("filters invalid inputs value", () => {
    const dispatchMock = jest.fn();
    const { getByDisplayValue } = render(
      <AppContextProvider
        setContextValue={(ctx) => ({
          ...ctx,
          state: {
            editMode: {
              ...ctx.state.editMode,
              editValue: "4",
            },
          },
          dispatch: dispatchMock,
        })}
      >
        <CellValueInput />
      </AppContextProvider>
    );
    const inputValueEl = getByDisplayValue("4");
    userEvent.type(inputValueEl, "44 invalid input");
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: "set_edit_value",
      payload: "44",
    });
    userEvent.type(inputValueEl, "=A1+B2");
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: "set_edit_value",
      payload: "=A1+B2",
    });
  });
  it("end editing when user presses Enter", () => {
    const handleEndEditingMock = jest.fn();
    const dispatchMock = jest.fn();
    const { getByDisplayValue } = render(
      <AppContextProvider
        setContextValue={(ctx) => ({
          ...ctx,
          state: {
            editMode: {
              ...ctx.state.editMode,
              editValue: "4",
            },
          },
          handleEndEditing: handleEndEditingMock,
          dispatch: dispatchMock,
        })}
      >
        <CellValueInput />
      </AppContextProvider>
    );
    const inputValueEl = getByDisplayValue("4");
    fireEvent.keyPress(inputValueEl, { key: "Enter", code: 13, charCode: 13 });
    expect(handleEndEditingMock).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "keyboard_navigation",
      payload: "Enter",
    });
  });
});
