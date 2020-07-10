import React from "react";
import "tailwindcss/dist/base.min.css";
import "twin.macro";
import { AppContextProvider } from "./AppContext";
import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { Toolbar } from "./components/Toolbar";
import { Formula } from "./components/Formula";
import { Grid } from "./components/Grid";
import { Theme } from "./Theme";

function App() {
  return (
    <div tw="flex flex-col h-screen">
      <AppContextProvider>
        <Theme>
          <Header></Header>
          <Main>
            <Toolbar></Toolbar>
            <Formula></Formula>
            <Grid></Grid>
          </Main>
        </Theme>
      </AppContextProvider>
    </div>
  );
}

export default App;
