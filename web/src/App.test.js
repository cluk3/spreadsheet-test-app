import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the title", async () => {
  const { getByText } = render(<App />);
  const titleElement = getByText(/Spreadsheeet/i);
  expect(titleElement).toBeInTheDocument();

  expect(await screen.findByText("22")).toBeInTheDocument();
  expect(await screen.findByText("#REF!")).toBeInTheDocument();
});
