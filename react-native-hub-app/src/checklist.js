/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';
import {Client, Where} from '@textile/threads-client';
import {ThreadID} from '@textile/threads-id';
import {Buckets, Context, createAPISig} from '@textile/textile';
import {Libp2pCryptoIdentity} from '@textile/threads-core';
import {USER_API_SECRET, USER_API_KEY, API_URL} from 'react-native-dotenv';

const MAX_STEPS = 2;
const IDENTITY_KEY = 'identity';
const CONTEXT_KEY = 'context';
const TOKEN_KEY = 'token';
const ASTRONAUT_THREAD_ID = 'astronaut_id';
const sleep = (m) => new Promise((r) => setTimeout(r, m));

class CheckList extends React.Component {
  constructor(props) {
    super(props);
  }

  // you could also do this, so no constructor needed
  state = {
    steps: [
      {key: 'Step 0', name: 'Prepare Identity & API Token', status: 0},
      {key: 'Step 1', name: 'Setup ThreadDB', status: 0},
      {key: 'Step 2', name: 'Add Instance to Collection', status: 0},
      {key: 'Step 3', name: 'Query from our Collection', status: 0},
      {key: 'Step 4', name: 'List existing Buckets', status: 0},
    ],
    step: 0,
    errorMessage: '',
  };

  incrementStatus(index) {
    const steps = this.state.steps;
    const data = steps[index];
    if (data.status >= MAX_STEPS) {
      return;
    }
    data.status = data.status += 1;
    steps[index] = data;
    this.setState({
      steps: steps,
    });
  }

  async generateIdentity() {
    let idStr = await AsyncStorage.getItem(IDENTITY_KEY);
    if (idStr) {
      return await Libp2pCryptoIdentity.fromString(idStr);
    } else {
      const id = await Libp2pCryptoIdentity.fromRandom();
      idStr = id.toString();
      await AsyncStorage.setItem(IDENTITY_KEY, idStr);
      return id;
    }
  }

  async getUserToken(database, id) {
    let token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      return token;
    }
    token = await database.getToken(id);
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return token;
  }

  async getContext() {
    // Pull the stored context to reuse if available && valid date
    let contextStr = await AsyncStorage.getItem(CONTEXT_KEY);
    if (contextStr) {
      const ctxJson = JSON.parse(contextStr);
      if (
        ctxJson['x-textile-api-sig-msg'] && (Date.parse(ctxJson['x-textile-api-sig-msg'])) > (new Date()).getTime()) {
        // Not expired
        const ctx = Context.fromJSON(ctxJson, API_URL);
        return ctx;
      }
    }
  }

  async getAstronautThread(db) {
    let idStr;// = await AsyncStorage.getItem(ASTRONAUT_THREAD_ID);
    if (idStr) {
      const id = ThreadID.fromString(idStr);
      return id;
    } else {
      const id = ThreadID.fromRandom();
      await AsyncStorage.setItem(ASTRONAUT_THREAD_ID, id.toString());
      await db.newDB(id);
      await db.newCollection(id, 'Astronaut', astronautSchema);
      return id;
    }
  }

  async runStep(stepNumber) {
    const steps = this.state.steps;
    const data = steps[stepNumber];
    try {
      let {ctx, db, threadId} = this.state;
      switch (stepNumber) {
        case 0: {
          let updatedState = {};
          const id = await this.generateIdentity();

          // Pull the stored context to reuse if available && valid date
          const existingCtx = await this.getContext();
          if (existingCtx) {
            const database = new Client(existingCtx);
            updatedState = {
              ctx: existingCtx,
              db: database,
            };
          } else {
            // Signs the API secret to create a new API token that will expire
            ctx = new Context(API_URL);
            const sig = await createAPISig(USER_API_SECRET);
            ctx = ctx.withAPIKey(USER_API_KEY).withAPISig(sig);

            // Create a new crypto identity for your user
            // The API will return a token to be used for this user
            const database = new Client(ctx);
            const token = await this.getUserToken(database, id);

            // We want to update our Context with the token now.
            ctx = ctx.withToken(token);

            // store the context for future use
            const ctxStr = JSON.stringify(ctx.toJSON());
            await AsyncStorage.setItem(CONTEXT_KEY, ctxStr);

            updatedState = {
              ctx: ctx,
              db: database,
              steps: steps,
            };
          }

          data.status = 2;
          steps[stepNumber] = data;
          this.setState(updatedState);

          break;
        }
        case 1: {
          const tid = await this.getAstronautThread(db);
          // Update our app state with success
          data.status = 2;
          steps[stepNumber] = data;
          this.setState({
            threadId: tid,
            steps: steps,
            message: ctx,
          });
          break;
        }
        case 2: {
          // Create a new instance of an Astronaut
          const ids = await db.create(threadId, 'Astronaut', [
            createAstronaut(),
          ]);

          // Update our app state with success
          data.status = 2;
          steps[stepNumber] = data;
          data.message = ids[0];
          this.setState({
            entityId: ids[0],
            steps: steps,
          });
          break;
        }
        case 3: {
          // Search for an Instance with firstName of Buzz
          const q = new Where('firstName').eq('Buzz');
          const r = await db.find(threadId, 'Astronaut', q);

          // Update our app state with success (if we really found the instance)
          data.status = r.instancesList[0]._id === this.state.entityId ? 2 : 9;
          data.message = r.instancesList[0];
          steps[stepNumber] = data;
          this.setState({
            steps: steps,
          });
          break;
        }
        case 4: {
          const buckets = new Buckets(ctx);
          const roots = await buckets.list();
          // Update our app state with success (if we really found the instance)
          data.status = 2;
          this.setState({
            steps: steps,
          });
          break;
        }
        default:
          data.status = 9;
          steps[stepNumber] = data;
          this.setState({
            steps: steps,
          });
          return;
      }
    } catch (err) {
      data.status = 9;
      data.message = err.message;
      steps[stepNumber] = data;
      this.setState({
        steps: steps,
      });
    }
  }

  async runAllSteps(stepNumber) {
    try {
      await sleep(1200); // <- just adds a delay between steps for UI looks
      this.runStep(stepNumber);
    } catch (err) {
      const steps = this.state.steps;
      const data = steps[stepNumber];
      data.status = 9;
      steps[stepNumber] = data;
      this.setState({
        steps: steps,
      });
    }
  }

  showStatus(stepNumber) {
    const steps = this.state.steps;
    const data = steps[stepNumber];
    let message = JSON.stringify(data.message);
    if (!message) {
      switch (data.status) {
        case 0: {
          message = 'step pending';
          break;
        }
        case 1: {
          message = 'step running';
          break;
        }
        case 2: {
          message = 'step success';
          break;
        }
        default: {
          message = 'step failed';
          break;
        }
      }
    }
    this.setState({errorMessage: message});
  }

  renderRow(value) {
    const {item, index} = value;
    if (item.status === 0 && this.state.step === index) {
      this.runAllSteps(index);
      this.incrementStatus(index);
    } else if (item.status === 2 && this.state.step === index) {
      this.setState({step: this.state.step + 1});
    }
    const status =
      item.status === 2
        ? 'success'
        : item.status === 9
        ? 'error'
        : this.state.step === index
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
          data={this.state.steps}
          keyExtractor={(item) => item.key}
          renderItem={this.renderRow.bind(this)}
        />
        <View>
          <Text style={styles.error}>{this.state.errorMessage}</Text>
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

const astronautSchema = {
  $id: 'https://example.com/astronaut.schema.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Astronauts',
  type: 'object',
  required: ['_id'],
  properties: {
    _id: {
      type: 'string',
      description: "The instance's id.",
    },
    firstName: {
      type: 'string',
      description: "The astronaut's first name.",
    },
    lastName: {
      type: 'string',
      description: "The astronaut's last name.",
    },
    missions: {
      description: 'Missions.',
      type: 'integer',
      minimum: 0,
    },
  },
};

const createAstronaut = () => {
  return {
    _id: '',
    firstName: 'Buzz',
    lastName: 'Aldrin',
    missions: 2,
  };
};

export default CheckList;
