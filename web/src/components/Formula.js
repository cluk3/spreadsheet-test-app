import React, { useContext } from "react";
import "twin.macro";
import { AppContext } from "../AppContext";

export const Formula = () => {
  const { state } = useContext(AppContext);

  return (
    <div tw="h-8 w-full flex">
      <span tw="w-8">fx</span>
      <input
        tw="flex-auto outline-none"
        type="text"
        value={state.selectedCell.value || ""}
      />
    </div>
  );
};
