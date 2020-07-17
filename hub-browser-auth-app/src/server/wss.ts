import route from "koa-route";
import Emittery from "emittery";
import { UserAuth } from "@textile/hub"

import {newClientDB, getAPISig} from "./hub-helpers"

interface UserModel {
  pubkey: string
  lastSeen: Date
}

/**
 * In a real system you might have a real user-singup flow
 * Here, we just stub in a basic user "database".
 * Users are added by their Public Key.
 * Users will only be added if they prove they hold the private key.
 * Proof is done using the Hub's built in token challenge API.
 */
const UserDB: {[key: string]: UserModel} = {}

/**
 * This login includes a more thorough identity verification step.
 * 
 * It leverages the Hub's public key verification via challenge.
 * The challenge is issued server-side by fulfilled here, client-side.
 * This has several benefits.
 * - User private key never needs to leave the user/client.
 * - The server will leverage the Hub verification in the process of user registration.
 * - The server can maintain a record of: user public key and user token in list of users.
 */
const wss = route.all('/ws/userauth', (ctx) => {
  /** Emittery allows us to wait for the challenge response event */
  const emitter = new Emittery();
  ctx.websocket.on('message', async (msg) => {
    try {
      /** All messages from client contain {type: string} */
      const data = JSON.parse(msg);
      switch (data.type) {
        /** The first type is a new token request */
        case 'token': {
          /** A new token request will contain the user's public key */
          if (!data.pubkey) { throw new Error('missing pubkey') }

          /** 
           * Init new Hub API Client 
           * 
           * see ./hub.ts
           */
          const db = await newClientDB()
          /** Request a token from the Hub based on the user public key */
          const token = await db.getTokenChallenge(
            data.pubkey, 
            /** The callback passes the challenge back to the client */
            (challenge: Uint8Array) => {
            return new Promise((resolve, reject) => {
              /** Pass the challenge to the client */
              ctx.websocket.send(JSON.stringify({
                type: 'challenge',
                value: Buffer.from(challenge).toJSON(),
              }))
              /** Wait for the challenge event from our event emitter */
              emitter.on('challenge', (sig) => {
                /** Resolve the promise with the challenge response */
                resolve(Buffer.from(sig))
              });
              /** Give client a reasonable timeout to respond to the challenge */
              setTimeout(() => {
                reject()
              }, 1500);

            })
          })

          /** 
           * The challenge was successfully completed by the client
           */

          /**
           * The user has verified they own the pubkey.
           * Add or update the user in the user database
           */
          const user: UserModel = {
            pubkey: data.pub,
            lastSeen: new Date(),
          }
          UserDB[data.pub] = user;

          /** Get API authorization for the user */
          const auth = await getAPISig()

          /** Include the token in the auth payload */
          const payload: UserAuth = {
            ...auth,
            token: token,
            key: process.env.USER_API_KEY,
          };
          
          /** Return the result to the client */
          ctx.websocket.send(JSON.stringify({
            type: 'token',
            value: payload,
          }))
          break;
        }
        /** The second type is a challenge response */
        case 'challenge': {
          /** A new challenge response will contain a signature */
          if (!data.sig) { throw new Error('missing signature (sig)') }

          /** 
           * If the timeout hasn't passed there is a waiting promise.
           * Emit the challenge signature for the waiting listener above.
           * */
          await emitter.emit('challenge', data.sig);
          break;
        }
      }
    } catch (error) {
      /** Notify our client of any errors */
      ctx.websocket.send(JSON.stringify({
        type: 'error',
        value: error.message,
      }))
    }
  });
});

export default wss;
