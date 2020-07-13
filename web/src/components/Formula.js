import React from "react";
import "twin.macro";
import { CellValueInput } from "./CellValueInput";

export const Formula = React.memo(() => {
  return (
    <div tw="h-12 w-full flex">
      <span tw="flex items-center justify-center w-12 text-xl">Fx</span>
      <CellValueInput tw="px-2 text-lg" />
    </div>
  );
});
