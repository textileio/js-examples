import React from "react";
import {
  Icon,
  Segment,
  Table,
  Button,
  Dimmer,
  Header,
  Label,
  Dropdown,
  Input,
  Form,
  Loader,
} from "semantic-ui-react";
import Moment from "react-moment";
import { useDropzone } from "react-dropzone";
import toPretty from "pretty-bytes";
import { iconFromMimeType } from "./Utils";
import { useStore } from "../Store/Store";
import { FileInfo } from "../Store/State";
import moment from "moment";

type RowType = {
  file: FileInfo;
};

export const Row: React.FC<RowType> = (props) => {
  const { file } = props;
  const [tag, setTag] = React.useState("");
  const store = useStore();
  return (
    <Table.Row>
      <Table.Cell>
        <Icon fitted name={iconFromMimeType(file.type)} /> {file.name}
      </Table.Cell>
      <Table.Cell collapsing>
        <Label.Group>
          {file.tags?.map((tag) => (
            <Label as="a" key={tag}>
              {tag}
              <Icon
                name="delete"
                onClick={() => {
                  store.dispatch({
                    type: "set_tags",
                    name: file.name,
                    tags: file.tags?.filter((t) => t !== tag) || [],
                  });
                }}
              />
            </Label>
          ))}
        </Label.Group>
      </Table.Cell>
      <Table.Cell>
        <Form
          onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            store.dispatch({
              type: "set_tags",
              name: file.name,
              tags: [...(file.tags || []), tag],
            });
            setTag("");
          }}
        >
          <Form.Field>
            <Input
              transparent
              placeholder="Add tag..."
              fluid
              value={tag}
              onChange={(event, { value }) => setTag(value)}
            />
          </Form.Field>
        </Form>
      </Table.Cell>
      <Table.Cell collapsing textAlign="right">
        <Moment fromNow>{file.added}</Moment>
      </Table.Cell>
      <Table.Cell collapsing>{toPretty(file.size)}</Table.Cell>
      <Table.Cell collapsing>
        <Dropdown item icon="wrench" simple inline compact direction="left">
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                store.dispatch({
                  type: "remove_file",
                  name: file.name,
                });
              }}
            >
              Remove
            </Dropdown.Item>
            <Dropdown.Item disabled>Copy link...</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Table.Cell>
    </Table.Row>
  );
};

export const Viewer: React.FC = () => {
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const fileInfo = {
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

  const store = useStore();

  const files = store.state.files.map((file) => (
    <Row key={file.name} file={file} />
  ));

  return (
    <div {...getRootProps()}>
      <Dimmer.Dimmable as={Segment} attached dimmed={isDragActive}>
        <Dimmer inverted active={isDragActive || store.state.isLoading}>
          {isDragActive && (
            <Header as="h2" inverted color="grey">
              Drop files here
            </Header>
          )}
          {store.state.isLoading && (
            <Loader indeterminate>Uploading files...</Loader>
          )}
        </Dimmer>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan={6} textAlign="right">
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
                <input {...getInputProps()} hidden />
              </Table.HeaderCell>
            </Table.Row>
            {files.length > 0 ? (
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell colSpan={2}>Tags</Table.HeaderCell>
                <Table.HeaderCell>Updated</Table.HeaderCell>
                <Table.HeaderCell>Size</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            ) : (
              <Table.Row>
                <Table.HeaderCell>
                  <Header as="h2" textAlign="center" color="grey">
                    Upload a file by dragging and dropping here
                  </Header>
                </Table.HeaderCell>
              </Table.Row>
            )}
          </Table.Header>
          <Table.Body>{files}</Table.Body>
        </Table>
      </Dimmer.Dimmable>
    </div>
  );
};
