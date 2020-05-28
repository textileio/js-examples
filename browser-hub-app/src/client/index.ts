
import { Client } from '@textile/textile'
import { Context, UserAuth } from '@textile/context'
import {Libp2pCryptoIdentity, ThreadID} from '@textile/threads-core';
import {displayIdentity, displayStatus, displayAvatar, displayThreadsList} from './ui'

/**
 * Creates a new random keypair-based Identity
 * 
 * The identity will be cached in the browser for later
 * sessions.
 */
const getIdentity = (async (): Promise<Libp2pCryptoIdentity> => {
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
    const restored = Libp2pCryptoIdentity.fromString(storedIdent)
    return restored
  }
  catch (e) {
    /**
     * If any error, create a new identity.
     */
    try {
      const identity = await Libp2pCryptoIdentity.fromRandom()
      const identityString = identity.toString()
      localStorage.setItem("identity", identityString)
      return identity
    } catch (err) {
      return err.message
    }
  }
});

/**
 * Optional method for using the server to do the full token generation
 */
const simpleAuth = async (): Promise<UserAuth> => {
  const response = await fetch(`/api/login`, {
    method: 'GET',
  })
  const userAuth = await response.json()
  return userAuth;
}

/**
 * More secure method for getting token & API auth.
 * 
 * Keeps private key locally in the app.
 */
const loginWithChallenge = async (id: Libp2pCryptoIdentity): Promise<UserAuth> => {  
  return new Promise((resolve, reject) => {
    /** 
     * Configured for our development server
     * 
     * Note: this should be upgraded to wss for production environments.
     */
    const socketUrl = `ws://localhost:3000/ws/login`
    
    /** Initialize our websocket connection */
    const socket = new WebSocket(socketUrl)

    /** Wait for our socket to open successfully */
    socket.onopen = () => {
      /** Get public key string */
      const publicKey = id.public.toString();

      /** Send a new token request */
      socket.send(JSON.stringify({
        pub: publicKey,
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
            const signed = await id.sign(buf)
            /** Send the signed challenge back to the server */
            socket.send(JSON.stringify({
              type: 'challenge',
              sig: signed.toJSON(),
              pub: publicKey
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
};

class Hub {

  /** The users unique pki identity */
  id?: Libp2pCryptoIdentity

  /** The Hub API authentication */
  auth?: UserAuth

  /** Hub API metadata for access control */
  context: Context = new Context()

  constructor () {}

  setupIdentity = async () => {
    /** Create or get identity */
    this.id = await getIdentity();
    /** Contains the full identity (including private key) */
    const identity = this.id.toString();

    /** Render our avatar */
    displayAvatar(identity)

    /** Get the public key */
    const publicKey = this.id.public.toString();

    /** Display the publicKey short ID */
    displayIdentity(publicKey)
  }

  listThreads = async () => {
    if (!this.auth) {
      throw Error('User not authenticated')
    }

    /** Setup a new connection with the API and our user auth */
    const client = new Client(this.context)

    /** Query for all the user's existing threads (expected none) */
    const threads = await client.listThreads()

    /** Display the results */
    displayThreadsList(JSON.stringify(threads));
  }

  login = async () => {
    if (!this.id) {
      throw Error('No user ID found')
    }

    /** Use the identity to request a new API token */
    this.auth = await loginWithChallenge(this.id);

    console.log('Verified on Textile API')
    displayStatus();

    /** Store the access control metadata */
    this.context = Context.fromUserAuth(this.auth, 'http://localhost:3007')
  }

  simpleAuth = async () => {
    if (!this.id) {
      throw Error('No user ID found')
    }

    /** Use the simple auth REST endpoint to get API access */
    this.auth = await simpleAuth()


    console.log('Verified on Textile API')
    displayStatus();

    /** Store the access control metadata */
    this.context = Context.fromUserAuth(this.auth)

    /** The simple auth endpoint doesn't provide a user's Hub API Token */
    const client = new Client(this.context)
    const token = await client.getToken(this.id)

    /** Update our context, including the token */
    this.auth = {
      ...this.auth,
      token: token,
    }
    this.context = Context.fromUserAuth(this.auth)
  }
}

(<any>window).Hub = Hub;