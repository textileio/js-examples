import React from "react";
import "semantic-ui-css/semantic.min.css";
import "react-semantic-toasts/styles/react-semantic-alert.css";
import { Dimmer, Header, Button, Label, Segment } from "semantic-ui-react";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import { useDropzone } from "react-dropzone";
import { Viewer } from "../Viewer";
import { useStore } from "../../Store/Store";
import { ulid } from "ulid";
import moment from "moment";
import { DelayedSpinner } from "../Utils";

function App() {
  const store = useStore();
  React.useEffect(() => {
    store.state.error &&
      toast({
        type: "error",
        icon: "exclamation",
        title: "Error",
        description: store.state.error,
        animation: "bounce",
        time: 5000,
      });
  }, [store.state.error]);

  const { getRootProps, isDragActive, getInputProps, open } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const fileInfo = {
        ID: ulid(),
        name: file.name,
        type: file.type,
        size: file.size,
        added: moment.now(),
      };
      store.dispatch({ type: "add_file", file: fileInfo });
    },
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="App" {...getRootProps()}>
      <Segment.Group style={{ height: "100%" }}>
        <Segment clearing>
          <Header
            style={{ cursor: "pointer" }}
            as="h2"
            floated="left"
            onClick={() => {
              store.dispatch({
                type: "open_store",
                id: "bafksdrszu7raxxqu6pimkwkev5qob7iw3rjlydpuavw62zfd2nnhhxi",
              });
            }}
          >
            Filebox
          </Header>
          <Header as="h2" floated="right">
            <Button
              label={
                <Label
                  as="label"
                  style={{ cursor: "pointer" }}
                  basic
                  children="Upload"
                />
              }
              labelPosition="right"
              icon="upload"
              onClick={open}
            />
          </Header>
        </Segment>
        <Viewer />
      </Segment.Group>
      <footer>
        <Header as="h3" attached="top" textAlign="center">
          Drag and drop files to add them
        </Header>
      </footer>
      <input {...getInputProps()} hidden />
      {store.state.isLoading && <DelayedSpinner delay={500} />}
      <Dimmer active={isDragActive}>
        <Header inverted as="h2">
          Drop files here
        </Header>
      </Dimmer>
      <SemanticToastContainer position="top-right" animation="drop" />
    </div>
  );
}

export default App;
