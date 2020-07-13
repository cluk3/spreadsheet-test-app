import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cell } from "./Cell";
import { AppContextProvider } from "../test/mockAppContext";

describe("Cell component", () => {
  it("shows computed value when has no ref error", () => {
    const startEditingMock = jest.fn();
    const { getByText } = render(
      <Cell
        computedValue={4}
        hasRefError={false}
        isEditing={false}
        startEditing={startEditingMock}
      />
    );
    const computedValueEl = getByText("4");
    expect(computedValueEl).toBeInTheDocument();
  });
  it("shows ref error when it is true", () => {
    const startEditingMock = jest.fn();
    const { getByText } = render(
      <Cell
        computedValue={4}
        hasRefError={true}
        isEditing={false}
        startEditing={startEditingMock}
      />
    );
    const refErrorEl = getByText("#REF!");
    expect(refErrorEl).toBeInTheDocument();
  });

  it("starts editing on double click", () => {
    const startEditingMock = jest.fn();
    const { getByText } = render(
      <Cell
        computedValue={4}
        hasRefError={false}
        isEditing={false}
        startEditing={startEditingMock}
      />
    );
    const computedValueEl = getByText("4");

    userEvent.dblClick(computedValueEl);

    expect(startEditingMock).toHaveBeenCalled();
  });
  it("renders the input when isEditing is true", () => {
    const startEditingMock = jest.fn();
    const { getByDisplayValue } = render(
      <AppContextProvider
        setContextValue={(ctx) => ({
          ...ctx,
          state: {
            editMode: {
              ...ctx.state.editMode,
              editValue: "=A1+B2",
            },
          },
        })}
      >
        <Cell
          computedValue={4}
          hasRefError={false}
          isEditing={true}
          startEditing={startEditingMock}
        />
      </AppContextProvider>
    );
    const inputValueEl = getByDisplayValue("=A1+B2");
    expect(inputValueEl).toBeInTheDocument();
  });
});
