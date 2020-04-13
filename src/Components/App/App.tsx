import React from "react";
import "semantic-ui-css/semantic.min.css";
import { Header } from "semantic-ui-react";
import { Viewer } from "../Viewer";

function App() {
  return (
    <div className="App">
      <Header as="h2" attached="top">
        Filebox
      </Header>
      <Viewer />
    </div>
  );
}

export default App;
