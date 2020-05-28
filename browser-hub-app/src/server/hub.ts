import {Client} from '@textile/textile';
import {Context, createAPISig} from '@textile/context';


/**
 * Get API Sig and Message
 * 
 * seconds (300) time until the sig expires
 */
export const getAPISig = async (seconds: number = 300) => {
  const expiration = new Date(Date.now() + 1000 * seconds)
  return await createAPISig(process.env.USER_API_SECRET, expiration)
}

/**
 * newContext creates a Context containing API access control attributes
 * 
 * see @textile/context
 */
export const newContext = async () => {
  const apiCtx = new Context(process.env.API);
  await apiCtx.withUserKey({
    key: process.env.USER_API_KEY,
    secret: process.env.USER_API_SECRET,
    type: 0,
  })
  return apiCtx
}

/**
 * newDB creates a Client (remote DB) connection to the Hub
 * 
 * A Hub connection is required to use the getToken API
 */
export const newClientDB = async () => {
  const ctx = await newContext();
  const db = new Client(ctx);
  return db;
}