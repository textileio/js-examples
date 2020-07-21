import koa from "koa";
import Router from "koa-router";
import logger from "koa-logger";
import json from "koa-json";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import websockify from "koa-websocket";
import cors from "@koa/cors";

import { createReadStream } from 'fs';
import dotenv from "dotenv";

import wss from "./wss";
import api from "./api";

dotenv.config();

if (
    !process.env.USER_API_KEY ||
    !process.env.USER_API_SECRET
) {
  process.exit(1);
}

const PORT = parseInt(process.env.PORT, 10) || 3001;

const app = websockify(new koa());

/** Middlewares */
app.use( json() );
app.use( logger() );
app.use( bodyParser() );

/* Not safe in production */
app.use(cors());

app.use(serve(__dirname + '/../client'));

/**
 * Start HTTP Routes
 */
const router = new Router();
app.use( router.routes() ).use( router.allowedMethods() );

/**
 * Serve index.html
 */
router.get( '/', async (ctx: koa.Context, next: () => Promise<any>) => {
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = createReadStream(__dirname + '/../client/index.html');
    await next();
});

/**
 * Create Rest endpoint for server-side token issue
 * 
 * See ./api.ts
 */
app.use( api.routes() );
app.use( api.allowedMethods() );

/**
 * Create Websocket endpoint for client-side token challenge
 * 
 * See ./wss.ts
 */
app.ws.use(wss);

/** Start the server! */
app.listen( PORT, () => console.log( "Server started." ) );