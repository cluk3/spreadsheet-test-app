import React from "react";
import "tailwindcss/dist/base.min.css";
import { AppContextProvider } from "./AppContext";
import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { Formula } from "./components/Formula";
import { Grid } from "./components/Grid";
import { Theme } from "./Theme";

function App() {
  return (
    <div tw="flex flex-col h-screen">
      <Theme>
        <Header></Header>
        <Main>
          <AppContextProvider>
            <Formula></Formula>
            <Grid></Grid>
          </AppContextProvider>
        </Main>
      </Theme>
    </div>
  );
}

export default App;
