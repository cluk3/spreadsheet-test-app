import React from "react";
import "twin.macro";

export const Main = ({ children }) => {
  return <main tw="w-full h-full flex-auto bg-gray-600">{children}</main>;
};
