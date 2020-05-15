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
  View,
  Text,
  TouchableOpacity,
  AsyncStorage,
  Linking,
} from 'react-native';
// @ts-ignore
import Prompt from 'react-native-input-prompt';
// @ts-ignore
import {USER_API_SECRET, USER_API_KEY, API_URL} from 'react-native-dotenv';
// @ts-ignore
import Filter from 'bad-words';
import {Client, Where} from '@textile/threads-client';
import {ThreadID} from '@textile/threads-id';
import {Buckets, Context} from '@textile/textile';
import {Libp2pCryptoIdentity} from '@textile/threads-core';
import { astronautSchema, createAstronaut, generateWebpage } from './helpers';
import styles from './styles';

const MAX_STEPS = 2;
const version = 103;
const IDENTITY_KEY = 'identity-' + version;
const CONTEXT_KEY = 'context';
const TOKEN_KEY = 'token';
const USER_THREAD_ID = 'user_thread';
const sleep = (m: number) => new Promise((r) => setTimeout(r, m));

interface StateProps {
  steps: any
  step: number
  errorMessage: string
  showPrompt: boolean
  promptTitle: string
  promptHint: string
  identity: string
  db: Client
  threadId?: ThreadID
  entityId?: string
  bucketKey?: string
  ipfsAddr?: string
  content?: string
}
class CheckList extends React.Component<StateProps> {
  // you could also do this, so no constructor needed
  state: StateProps = {
    steps: [
      {key: 'Step 0', name: 'Prepare Identity & Token', status: 0},
      {key: 'Step 1', name: 'Setup ThreadDB', status: 0},
      {key: 'Step 2', name: 'Add Instance to Collection', status: 0},
      {key: 'Step 3', name: 'Query from our Collection', status: 0},
      {key: 'Step 4', name: 'Create a webpage', status: 0},
      {key: 'Step 5', name: 'Push webpage to User Bucket', status: 0},
    ],
    step: 0,
    errorMessage: '',
    showPrompt: false,
    promptTitle: '',
    promptHint: '',
    identity: '',
    db: new Client(),
  };

  incrementStatus(index: number) {
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

  async generateIdentity(): Promise<Libp2pCryptoIdentity> {
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

  async getUserToken(id: Libp2pCryptoIdentity, db: Client): Promise<string> { 
    const persistenceKey = `${id.toString()}-${TOKEN_KEY}`
    let token = await AsyncStorage.getItem(persistenceKey);
    if (token) {
      /**
       * We need to update our connection context with the exising token
       */
      db.context.withToken(token);
      return token;
    }
    /**
     * The token will automatically be added to the DB context when running getToken
     */
    token = await db.getToken(id);
    await AsyncStorage.setItem(persistenceKey, token);
    return token;
  }

  async getContext(id: string): Promise<Context | undefined> {
    const persistenceKey = `${id}-${CONTEXT_KEY}`
    // Pull the stored context to reuse if available && valid date
    let contextStr = await AsyncStorage.getItem(persistenceKey);
    if (contextStr) {
      const ctxJson = JSON.parse(contextStr);
      if (
        ctxJson['x-textile-api-sig-msg'] && (Date.parse(ctxJson['x-textile-api-sig-msg'])) > (new Date()).getTime()) {
        // Not expired
        const ctx = Context.fromJSON(ctxJson, API_URL);
        return ctx;
      }
    }
    return undefined;
  }

  async getUserThread(id: string, db: Client): Promise<ThreadID> {
    /**
     * All storage should be scoped to the identity
     * 
     * If the identity changes and you try to use an old database,
     * it will error due to not authorized.
     */
    const persistenceKey = `${id}-${USER_THREAD_ID}`
    let idStr = await AsyncStorage.getItem(persistenceKey);
    if (idStr) {
      /**
       * Temporary hack to get ThreadID working in RN
       */
      const id: ThreadID = ThreadID.fromString(idStr);
      return id;
    } else {
      const id: ThreadID = ThreadID.fromRandom();
      await AsyncStorage.setItem(persistenceKey, id.toString());

      /**
       * Each new ThreadID requires a `newDB` call.
       */
      await db.newDB(id)

      /** 
       * We add our first Collection to the DB for Astronauts.
       */
      await db.newCollection(id, 'Astronaut', astronautSchema);
      return id;
    }
  }

  async runStep(stepNumber: number) {
    const steps = this.state.steps;
    const data = steps[stepNumber];
    try {
      let {db, threadId} = this.state;
      switch (stepNumber) {
        case 0: {
          /**
           * Create a new user Identity
           * 
           * The identity pk will be cached in AsyncStorage.
           * On the next session, the pk identity will be reused
           */
          const id = await this.generateIdentity();
          const identity = id.toString();
          
          /**
           * Context contains the token and session information
           * 
           * If possible, we'll reuse an existing session. 
           * If it doesn't exist or is expired, we'll create a new one.
           */
          const existingCtx = await this.getContext(identity);
          if (existingCtx) {
            db = new Client(existingCtx);
            data.message = 'Using existing Identity'
          } else {
            /** 
             * Create a new Context (API_URL can be blank)
             */
            const ctx = new Context(API_URL);
            
            /**
             * Authenticate the user with your User Key and Secret
             * 
             * This will allow the user to store threads and buckets
             * using your developer resources on the Hub.
             */
            ctx.withUserKey({
              key: USER_API_KEY,
              secret: USER_API_SECRET,
              type: 1,
            })

            /**
             * Update our Database context
             * 
             * API calls will now include the credentials created above
             */
            db = new Client(ctx);

            /**
             * Generate an app user API token
             * 
             * The app user (defined by Identity) needs an API token
             * The API will give you one based on ID plus Credentials
             * 
             * The token will be added to the existing db.context.
             */
            await this.getUserToken(id, db);

            /**
             * The Context is reusable in future app sessions, so we store it.
             */
            const ctxStr = JSON.stringify(ctx.toJSON());
            await AsyncStorage.setItem(CONTEXT_KEY, ctxStr);

            data.message = 'Created new Identity'
          }

          data.status = 2;
          steps[stepNumber] = data;
          this.setState({
            identity,
            db: db,
          });

          break;
        }
        case 1: {
          /**
           * An app should create a minimum number of Threads per user
           * 
           * A single Thread can contain a large number of distinct 
           * Collections for different types of data.
           * 
           * Here, we create or restore the user's 
           */
          const tid = await this.getUserThread(this.state.identity!, db);

          /**
           * Update our context with the target threadId.
           */
          db.context.withThread(tid);

          // Update our app state with success
          data.status = 2;
          data.message = 'User Thread linked to Identity'
          steps[stepNumber] = data;
          this.setState({
            threadId: tid,
            steps: steps,
          });
          break;
        }
        case 2: {
          /**
           * Add a new Astronaut
           * 
           * Our Thread contains the Astronaut Collection, so you just need
           * to add a new astronaut that matches the expected schema.
           * 
           * If you run this app many times, you'll notice many Buzz Aldrin
           * entries in your ThreadDB, each with a unique ID.
           */
          const ids = await db.create(threadId!, 'Astronaut', [
            createAstronaut(),
          ]);

          // Update our app state with success
          data.status = 2;
          steps[stepNumber] = data;
          data.message = `New instance added: ${ids[0]}`;
          this.setState({
            entityId: ids[0],
            steps: steps,
          });
          break;
        }
        case 3: {
          /**
           * You can search all your existing Buzz Aldrins
           */
          const q = new Where('firstName').eq('Buzz');
          const r = await db.find(threadId!, 'Astronaut', q);

          const ids = r.instancesList.map((instance: any) => instance._id)

          /**
           * Clean up our entries (just delete them all!)
           */
          await db.delete(threadId!, 'Astronaut', ids);

          data.status = ids.indexOf(this.state.entityId) > -1 ? 2 : 9;
          data.message = `${ids.length} existing instances found`;
          steps[stepNumber] = data;
          this.setState({
            steps: steps,
          });
          break;
        }
        case 4: {
          /**
           * Buckets
           * 
           * You can now create Buckets for your User.
           * Bucket will contain raw files and documents.
           * 
           * We'll use the same Context we setup for the ThreadsDB.
           */
          const buckets = new Buckets(db.context);

          const roots = await buckets.list();
          const existing = roots.find((bucket) => bucket.name === 'files')

          /**
           * If a Bucket named 'files' already existed for this user, use it.
           * If not, create one now.
           */
          let bucketKey = ''
          if (existing) {
            bucketKey = existing.key;
          } else {
            const created = await buckets.init('files');
            bucketKey = created.root!.key;
          }

          this.setState({
            bucketKey,
            promptTitle: existing ? 'Update your Website' : 'Create new Website',
            promptHint: existing ? 'Give it a new name, like "Fakeblock"' : 'Give it a name, like "Rainbows and Cupcakes"',
            showPrompt: true,
          });
          break;
        }
        case 5: {
          const {bucketKey} = this.state;
          
          /**
           * Still using the same context.
           */
          const buckets = new Buckets(db.context);

          /**
           * Create a simple html string for the webpage
           */
          const webpage = generateWebpage(this.state.content || '');

          /**
           * Add a simple file Buffer
           * 
           * Alternative formats are here: https://github.com/textileio/js-textile/blob/master/src/normalize.ts#L14
           * 
           * We add the file as index.html so that we can render it right in the browser afterwards.
           */
          const file = { path: '/index.html', content: Buffer.from(webpage) }

          /**
           * Push the file to the root of the Files Bucket.
           */
          const raw = await buckets.pushPath(bucketKey!, 'index.html', file)
          
          data.status = 2;
          this.setState({
            ipfsAddr: raw.root,
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

  async runAllSteps(stepNumber: number) {
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

  showStatus(stepNumber: number) {
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
  renderRow(value: any) {
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

  websiteCancelled() {
    const steps = this.state.steps;
    const data = steps[4];
    data.status = 9;
    data.message = 'User cancelled'
    steps[4] = data;
    this.setState({
      steps: steps,
      showPrompt: false,
    })
  }

  websiteNamed(title: string) {
    const steps = this.state.steps;
    const data = steps[4];
    const filter = new Filter();
    let content = title
    if (filter.isProfane(content)) {
      content = filter.clean(content)
    }
    data.status = 2;
    steps[4] = data;
    this.setState({
      steps: steps,
      showPrompt: false,
      content,
    })
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
        <View>
          <Text style={{...styles.error, ...{color: 'blue'}}}
                onPress={() => Linking.openURL(`https://${this.state.bucketKey}.textile.space`)}>
            {this.state.ipfsAddr ? 'IPNS Webpage Link' : ''}
          </Text>
        </View>
        <View>
          <Text style={{...styles.error, ...{color: 'blue'}}}
                onPress={() => Linking.openURL(`https://${this.state.threadId}.thread.hub.textile.io/buckets/${this.state.bucketKey}`)}>
            {this.state.ipfsAddr ? 'Thread Bucket Link' : ''}
          </Text>
        </View>
        <Prompt
            visible={this.state.showPrompt}
            title={this.state.promptTitle}
            placeholder={this.state.promptHint}
            onCancel={() => this.websiteCancelled()}
            onSubmit={(text: string) => this.websiteNamed(text)}
        />
      </View>
    );
  }
}
export default CheckList;
