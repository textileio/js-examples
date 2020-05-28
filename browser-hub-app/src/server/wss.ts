import route from "koa-route";
import {newClientDB, getAPISig} from "./hub"

import Emittery from "emittery";

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
const wss = route.all('/ws/login', (ctx) => {
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
          if (!data.pub) { throw new Error('missing public key (pub)') }

          /** 
           * Init new Hub API Client 
           * 
           * see ./hub.ts
           */
          const db = await newClientDB()

          /** Request a token from the Hub based on the user public key */
          const token = await db.getTokenChallenge(
            data.pub, 
            /** The callback passes the challenge back to the client */
            (challenge: Buffer) => {
            return new Promise((resolve, reject) => {
              /** Pass the challenge to the client */
              ctx.websocket.send(JSON.stringify({
                type: 'challenge',
                value: challenge.toJSON(),
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


          /** Get API authorization for the user */
          const auth = await getAPISig()

          /** Include the token in the auth payload */
          const payload = {
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
