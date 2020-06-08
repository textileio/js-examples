/** Import our server libraries */
import koa from "koa";
import Router from "koa-router";
import {UserAuth} from "@textile/hub"

import { getAPISig } from './hub-helpers';


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
 * This endpoint will provide authorization for _any_ user.
 */
api.get( '/userauth', async (ctx: koa.Context, next: () => Promise<any>) => {
  /** Get API authorization for the user */
  const auth = await getAPISig()

  /** Include the token in the auth payload */
  const credentials: UserAuth = {
    ...auth,
    key: process.env.USER_API_KEY,
  };
  
  /** Return the auth in a JSON object */
  ctx.body = credentials
  
  await next();
});

export default api;