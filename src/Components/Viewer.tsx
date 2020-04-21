import React from "react";
import { Icon, Table, Label, Dropdown, Input, Form } from "semantic-ui-react";
import Moment from "react-moment";
import toPretty from "pretty-bytes";
import { iconFromMimeType } from "./Utils";
import { useStore } from "../Store/Store";
import { FileInfo } from "../Store/State";
import { useDebounce } from "use-debounce";

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
      <Table.Cell>
        <Label.Group>
          {file.tags?.map((tag) => (
            <Label as="a" key={tag}>
              {tag}
              <Icon
                name="delete"
                onClick={() => {
                  store.dispatch({
                    type: "update_file",
                    file: {
                      ...file,
                      tags: file.tags?.filter((t) => t !== tag) || [],
                    },
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
            const tags = [...new Set([...(file.tags || []), tag])];
            if (tags !== file.tags) {
              store.dispatch({
                type: "update_file",
                file: { ...file, tags },
              });
            }
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
      <Table.Cell>
        <Moment fromNow>{file.added}</Moment>
      </Table.Cell>
      <Table.Cell>{toPretty(file.size)}</Table.Cell>
      <Table.Cell collapsing>
        <Dropdown item icon="wrench" simple inline compact direction="left">
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                store.dispatch({
                  type: "remove_file",
                  id: file.ID,
                });
              }}
            >
              Remove
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                store.dispatch({
                  type: "download_file",
                  file,
                });
              }}
            >
              Download...
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Table.Cell>
    </Table.Row>
  );
};

export const Viewer: React.FC = () => {
  const [filter, setFilter] = React.useState("");
  const [debounced] = useDebounce(filter, 500);
  const store = useStore();

  const files = Object.entries(store.state.files)
    .filter(([_, file]) => file.tags?.includes(debounced) || debounced === "")
    .sort(([, a], [, b]) => b.added - a.added)
    .map(([id, file]) => <Row key={id} file={file} />);

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan={6} textAlign="right">
            <Input
              iconPosition="left"
              placeholder="Filter..."
              onChange={(event, { value }) => setFilter(value)}
            >
              <Icon name="filter" />
              <input />
            </Input>
          </Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell width={4}>Name</Table.HeaderCell>
          <Table.HeaderCell width={5}>Tags</Table.HeaderCell>
          <Table.HeaderCell width={2} />
          <Table.HeaderCell width={2}>Updated</Table.HeaderCell>
          <Table.HeaderCell width={2}>Size</Table.HeaderCell>
          <Table.HeaderCell width={1} />
        </Table.Row>
      </Table.Header>
      <Table.Body>{files}</Table.Body>
    </Table>
  );
};
