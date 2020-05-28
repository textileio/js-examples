/** Import our server libraries */
import koa from "koa";
import Router from "koa-router";

/** Textile libraries */
import {Libp2pCryptoIdentity} from '@textile/threads-core';

import { newClientDB, getAPISig } from './hub';


/**
 * Start API Routes
 * 
 * All prefixed with `/api/`
 */
const api = new Router({
  prefix: '/api'
});

/**
 * Create a REST API endpoint at /api/auth
 * 
 * Takes a request parameter of 'id' that should be the string identity
 */
api.get( '/auth', async (ctx: koa.Context, next: () => Promise<any>) => {
  /** Identity provided as the 'id' parameter in the request */
  const {id} = ctx.query
  /** Generate a Libp2pCryptoIdentity from the string  */
  const identity = await Libp2pCryptoIdentity.fromString(id);

  /** 
   * Init new Hub API Client 
   * 
   * see ./hub.ts
   */
  const db = await newClientDB()

  /** Request a token from the API */
  const token = await db.getToken(identity);

  /** Get API authorization for the client */
  const auth = await getAPISig()

  /** Return the token in a JSON object */
  ctx.body = {
    ...auth,
    token: token,
    key: process.env.USER_API_KEY,
  };
  
  await next();
});

export default api;