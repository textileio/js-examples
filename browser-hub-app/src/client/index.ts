import { template } from 'lodash';
import jdenticon from 'jdenticon';
import { Client } from '@textile/textile'
import { Context, UserAuth } from '@textile/context'
import {Libp2pCryptoIdentity} from '@textile/threads-core';

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
const getTokenRemote = async (identity: string) => {
  const response = await fetch(`/api/auth?id=${identity}`, {
    method: 'GET',
  })
  const data = await response.json()
  return data;
}

/**
 * More secure method for getting token & API auth.
 * 
 * Keeps private key locally in the app.
 */
const getTokenWithChallenge = async (id: Libp2pCryptoIdentity): Promise<UserAuth> => {  
  return new Promise((resolve, reject) => {
    /** 
     * Configured for our development server
     * 
     * Note: this should be upgraded to wss for production environments.
     */
    const socketUrl = `ws://localhost:3000/ws/auth`
    
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

/**
 * Display an avatar based on the user identity
 */
const displayAvatar = (identity: string) => {
  const outputElement = document.getElementById('identity');
  if (outputElement) {
    var compiled = template(`
      <svg width="80" height="80" data-jdenticon-value="<%- identity %>"></svg>
    `.trim());
    outputElement.innerHTML = compiled({
      identity,
    });
    /** trigger rendering */
    jdenticon();
  }
}

/**
 * Display the identity short string
 */
const displayIdentity = (publicKey: string) => {
  const shortId = publicKey.substr(publicKey.length - 11, 10)
  const outputElement = document.getElementById('publicKey');
  if (outputElement) {
    var compiled = template(`
      <strong>identity:</strong> <%- shortId %>
    `.trim());
    outputElement.innerHTML = compiled({
      shortId,
    });
  }
}

/**
 * Notify the user that they are verified on the API
 */
const displayTokenVerification = () => {
  const tokenElement = document.getElementById('token');
  if (tokenElement) {
    tokenElement.classList.add("verified");
  }
  /** Timeout just so the UI changes some after it loads :) */
  setTimeout(()=> {
    const labelElement = document.getElementById('token-label');
    if (labelElement) {
      labelElement.innerHTML = 'API AVAILABLE'
    }
  }, 800)
}

/**
 * Display any user threads created
 */
const displayThreadsList = (threads: string) => {
  /** Timeout just so the UI changes some after it loads :) */
  setTimeout(() => {
    const threadsElement = document.getElementById('threads-list');
    if (threadsElement) {
      threadsElement.classList.add("verified");
      threadsElement.innerHTML = threads;
    }
  }, 1000)
}

/**
 * Run when app launches
 */
const main = async () => {
  /** Create or get identity */
  const id = await getIdentity();
  /** Contains the full identity (including private key) */
  const identity = id.toString();

  /** Render our avatar */
  displayAvatar(identity)

  /** Get the public key */
  const publicKey = id.public.toString();

  /** Display the publicKey short ID */
  displayIdentity(publicKey)

  /** Use the identity to request a new API token */
  const auth = await getTokenWithChallenge(id);

  console.log('Verified on Textile API')

  displayTokenVerification();

  console.log(auth)
  /** Setup a new connection with the API and our user auth */
  const ctx = Context.fromUserAuth(auth)
  const client = new Client(ctx)

  /** Query for all the user's existing threads (expected none) */
  const threads = await client.listThreads()

  /** Display the results */
  displayThreadsList(JSON.stringify(threads));
}

window.onload = main;
