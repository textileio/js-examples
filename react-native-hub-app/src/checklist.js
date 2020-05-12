/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {FlatList, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {Client} from '@textile/threads-client';
import {ThreadID} from '@textile/threads-id';
import {Context, createAPISig} from '@textile/textile';
import {Libp2pCryptoIdentity} from '@textile/threads-core';
import {USER_API_SECRET, USER_API_KEY} from 'react-native-dotenv'

const MAX_STEPS = 2;
const sleep = (m) => new Promise((r) => setTimeout(r, m));

class CheckList extends React.Component {
  constructor(props) {
    super(props);
  }

  // you could also do this, so no constructor needed
  state = {
    test: 0,
    tests: [
      {key: 'Test 0', name: 'Create signature', status: 0},
      {key: 'Test 1', name: 'Create user token', status: 0},
      {key: 'Test 2', name: 'Create new client DB', status: 0},
      {key: 'Test 3', name: 'pending', status: 0},
      {key: 'Test 4', name: 'pending', status: 0},
    ],
    errorMessage: '',
  };

  incrementStatus(index) {
    const tests = this.state.tests;
    const data = tests[index];
    if (data.status >= MAX_STEPS) {
      return;
    }
    data.status = data.status += 1;
    tests[index] = data;
    this.setState({
      tests: tests,
    });
  }

  async test(testNumber) {
    const tests = this.state.tests;
    const data = tests[testNumber];
    try {
      let {ctx, db, threadId} = this.state;
      switch (testNumber) {
        case 0: {
          ctx = new Context();
          const sig = await createAPISig(USER_API_SECRET);
          ctx = ctx.withAPIKey(USER_API_KEY).withAPISig(sig);

          data.status = 2;
          tests[testNumber] = data;
          this.setState({
            ctx: ctx,
            tests: tests,
          });

          break;
        }
        case 1: {
          db = new Client(ctx);
          const identity = await Libp2pCryptoIdentity.fromRandom();
          const tok = await db.getToken(identity);
          ctx = ctx.withToken(tok);

          // Update our app state with success
          data.status = 2;
          tests[testNumber] = data;
          this.setState({
            identity: identity,
            tok: tok,
            ctx: ctx,
            db: db,
            tests: tests,
          });
          break;
        }
        case 2: {
          ctx = ctx.withThreadName('foo');
          threadId = ThreadID.fromRandom();
          // // Update our app state with success
          await db.newDB(threadId, ctx);
          // const res = await client.getThread('foo', ctx);

          // Update our app state with success
          data.status = 2;
          tests[testNumber] = data;
          this.setState({
            tests: tests,
            message: ctx,
          });
          break;
        }
        case 3: {
          // Update our app state with success
          data.status = 2;
          tests[testNumber] = data;
          this.setState({
            tests: tests,
          });
          break;
        }
        case 4: {
          // Update our app state with success (if we really found the instance)
          data.status = r.instancesList[0]._id === this.state.entityId ? 2 : 9;
          data.message = r.instancesList[0];
          tests[testNumber] = data;
          this.setState({
            tests: tests,
          });
          break;
        }
        default:
          data.status = 9;
          tests[testNumber] = data;
          this.setState({
            tests: tests,
          });
          return;
      }
    } catch (err) {
      data.status = 9;
      data.message = err.message;
      tests[testNumber] = data;
      this.setState({
        tests: tests,
      });
    }
  }

  async runTest(testNumber) {
    try {
      await sleep(1500); // <- just adds a delay between tests for UI looks
      this.test(testNumber);
    } catch (err) {
      const tests = this.state.tests;
      const data = tests[testNumber];
      data.status = 9;
      tests[testNumber] = data;
      this.setState({
        tests: tests,
      });
    }
  }

  showStatus(testNumber) {
    const tests = this.state.tests;
    const data = tests[testNumber];
    let message = JSON.stringify(data.message);
    if (!message) {
      switch (data.status) {
        case 0: {
          message = 'test pending';
          break;
        }
        case 1: {
          message = 'test running';
          break;
        }
        case 2: {
          message = 'test success';
          break;
        }
        default: {
          message = 'test failed';
          break;
        }
      }
    }
    this.setState({errorMessage: message});
  }

  renderRow(value) {
    const {item, index} = value;
    if (item.status === 0 && this.state.test === index) {
      this.runTest(index);
      this.incrementStatus(index);
    } else if (item.status === 2 && this.state.test === index) {
      this.setState({test: this.state.test + 1});
    }
    const status =
      item.status === 2
        ? 'success'
        : item.status === 9
        ? 'error'
        : this.state.test === index
        ? 'running'
        : 'pending';

    const statusText =
      item.status < 1
        ? ' ▵ '
        : item.status === 1
        ? ' ★ '
        : item.status === 2
        ? ' ✓ '
        : ' ✘ ';

    const iconColor =
      item.status < 1
        ? 'grey'
        : item.status === 1
        ? 'orange'
        : item.status === 2
        ? 'green'
        : 'red';

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          this.showStatus(index);
        }}>
        <View style={styles.row_cell_timeplace}>
          <Text style={styles.row_time}>{`${item.key}`}</Text>
          <Text style={styles.row_name}>{item.name}</Text>
        </View>

        <Text style={styles.row_cell_temp}>{status}</Text>
        <View>
          <Text style={{color: iconColor}}>{statusText}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={this.state.tests}
          keyExtractor={(item) => item.key}
          renderItem={this.renderRow.bind(this)}
        />
        <View>
          <Text style={styles.error}>
            {this.state.errorMessage}
          </Text>
        </View>
      </View>
    );
  }
}

const values = {
  font_place_size: 14,
  font_time_size: 10,
  small_icon_size: 30,
};

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    alignSelf: 'stretch',
  },
  list: {
    margin: 0,
    alignSelf: 'stretch',
  },
  row: {
    elevation: 1,
    borderRadius: 2,
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row', // main axis
    justifyContent: 'flex-start', // main axis
    alignItems: 'center', // cross axis
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 18,
    paddingRight: 16,
    marginLeft: 14,
    marginRight: 14,
    marginTop: 0,
    marginBottom: 6,
  },
  row_cell_timeplace: {
    flex: 1,
    flexDirection: 'column',
  },
  row_cell_temp: {
    color: '#777',
    paddingHorizontal: 16,
    flex: 0,
    fontSize: values.font_temp_size,
    fontFamily: values.font_body,
  },
  row_time: {
    color: '#777',
    textAlignVertical: 'bottom',
    includeFontPadding: false,
    flex: 0,
    fontSize: values.font_time_size,
    fontFamily: values.font_body,
  },
  row_name: {
    color: '#333',
    textAlignVertical: 'top',
    includeFontPadding: false,
    flex: 0,
    fontSize: values.font_place_size,
    fontFamily: values.font_body,
  },
  error: {
    color: '#333',
    flex: 0,
    paddingTop: 24,
    textAlign: 'center',
    fontSize: values.font_place_size,
    fontFamily: values.font_body,
  },
});

const personSchema = {
  $id: 'https://example.com/person.schema.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Person',
  type: 'object',
  required: ['_id'],
  properties: {
    _id: {
      type: 'string',
      description: "The instance's id.",
    },
    firstName: {
      type: 'string',
      description: "The person's first name.",
    },
    lastName: {
      type: 'string',
      description: "The person's last name.",
    },
    age: {
      description: 'Age in years which must be equal to or greater than zero.',
      type: 'integer',
      minimum: 0,
    },
  },
};

const createPerson = () => {
  return {
    _id: '',
    firstName: 'Adam',
    lastName: 'Doe',
    age: 21,
  };
};

export default CheckList;
