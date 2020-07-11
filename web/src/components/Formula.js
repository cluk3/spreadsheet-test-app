import React from "react";
import "twin.macro";
import { CellValueInput } from "./CellValueInput";

export const Formula = React.memo(() => {
  return (
    <div tw="h-8 w-full flex">
      <span tw="flex items-center justify-center w-8 text-lg">Fx</span>
      <CellValueInput tw="px-2" />
    </div>
  );
});
