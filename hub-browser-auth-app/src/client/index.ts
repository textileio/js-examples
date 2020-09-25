
import { Client, UserAuth, Identity, PrivateKey } from '@textile/hub'
import {displayIdentity, displayStatus, displayAvatar, displayThreadsList} from './ui'

/**
 * Creates a new random keypair-based Identity
 * 
 * The identity will be cached in the browser for later
 * sessions.
 */
const getIdentity = (async (): Promise<PrivateKey> => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  try {
    if (urlParams.get('force')) {
      window.history.replaceState({}, document.title, "/");
      throw new Error('Forced new identity')
    }
    var storedIdent = localStorage.getItem("identity")
    if (storedIdent === null) {
      throw new Error('No identity')
    }
    const restored = PrivateKey.fromString(storedIdent)
    return restored
  }
  catch (e) {
    /**
     * If any error, create a new identity.
     */
    try {
      const identity = PrivateKey.fromRandom()
      const identityString = identity.toString()
      localStorage.setItem("identity", identityString)
      return identity
    } catch (err) {
      return err.message
    }
  }
});


/**
 * More secure method for getting token & API auth.
 * 
 * Keeps private key locally in the app.
 */
const loginWithChallenge = (identity: Identity): () => Promise<UserAuth> => {
  // we pass identity into the function returning function to make it
  // available later in the callback
  return () => {
    return new Promise((resolve, reject) => {
      /** 
       * Configured for our development server
       * 
       * Note: this should be upgraded to wss for production environments.
       */
      const socketUrl = `ws://localhost:3001/ws/userauth`
      
      /** Initialize our websocket connection */
      const socket = new WebSocket(socketUrl)

      /** Wait for our socket to open successfully */
      socket.onopen = () => {
        /** Get public key string */
        const publicKey = identity.public.toString();

        /** Send a new token request */
        socket.send(JSON.stringify({
          pubkey: publicKey,
          type: 'token'
        })); 

        /** Listen for messages from the server */
        socket.onmessage = async (event) => {
          const data = JSON.parse(event.data)
          switch (data.type) {
            /** Error never happen :) */
            case 'error': {
              reject(data.value);
              break;
            }
            /** The server issued a new challenge */
            case 'challenge':{
              /** Convert the challenge json to a Buffer */
              const buf = Buffer.from(data.value)
              /** User our identity to sign the challenge */
              const signed = await identity.sign(buf)
              /** Send the signed challenge back to the server */
              socket.send(JSON.stringify({
                type: 'challenge',
                sig: Buffer.from(signed).toJSON()
              })); 
              break;
            }
            /** New token generated */
            case 'token': {
              resolve(data.value)
              break;
            }
          }
        }
      }
    });
  }
}

/**
 * Method for using the server to create credentials without identity
 */
const createCredentials = async (): Promise<UserAuth> => {
  const response = await fetch(`/api/userauth`, {
    method: 'GET',
  })
  const userAuth: UserAuth = await response.json()
  return userAuth;
}

class HubClient {

  /** The users unique pki identity */
  id?: PrivateKey

  /** The Hub API authentication */
  client?: Client

  constructor () {}

  sign = async (buf: Buffer) => {
    if (!this.id) {
      throw Error('No user ID found')
    }
    return this.id.sign(buf)
  }
  setupIdentity = async () => {
    /** Create or get identity */
    this.id = await getIdentity();
    /** Contains the full identity (including private key) */
    const identity = this.id.public.toString();

    /** Render our avatar */
    displayAvatar(identity)

    /** Get the public key */
    const publicKey = this.id.public.toString();

    /** Display the publicKey short ID */
    displayIdentity(publicKey)
  }

  listThreads = async () => {
    if (!this.client) {
      throw Error('User not authenticated')
    }
    /** Query for all the user's existing threads (expected none) */
    const result = await this.client.listThreads()

    /** Display the results */
    displayThreadsList(JSON.stringify(result.listList));
  }

  /**
   * Provides a full login where
   * - pubkey is shared with the server
   * - identity challenge is fulfilled here, on client
   * - hub api token is sent from the server
   * 
   * see index.html for example running this method
   */
  login = async () => {
    if (!this.id) {
      throw Error('No user ID found')
    }

    /** Use the identity to request a new API token when needed */
    const loginCallback = loginWithChallenge(this.id);
    this.client = Client.withUserAuth(loginCallback)

    console.log('Verified on Textile API')
    displayStatus();
  }

  /**
   * Provides a basic auth where
   * - the server doesn't care about the user identity
   * - the server just provides user auth on any request
   * 
   * see simple.html for example running this method
   */
  simpleAuth = async () => {
    if (!this.id) {
      throw Error('No user ID found')
    }
    /** Use the simple auth REST endpoint to get API access */
    /** The simple auth endpoint generates a user's Hub API Token */
    const client = Client.withUserAuth(createCredentials)
    /** getToken will get and store the user token in the Client */
    await client.getToken(this.id)

    /** Update our auth to include the token */
    this.client = client

    console.log('Verified on Textile API')
    displayStatus();
  }
}

(<any>window).HubClient = HubClient;