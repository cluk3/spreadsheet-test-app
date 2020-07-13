import React from "react";
import { AppContext } from "../AppContext";

export const AppContextProvider = ({
  children,
  setContextValue = (ctx) => ctx,
}) => {
  return (
    <AppContext.Provider value={setContextValue(defaultContextValue)}>
      {children}
    </AppContext.Provider>
  );
};

const defaultContextValue = {
  state: {
    editMode: {
      editValue: "",
      acceptsRefs: false,
    },
  },
  dispatch() {},
  handleEndEditing() {},
};
