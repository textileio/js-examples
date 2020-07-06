import {createAPISig, Client} from '@textile/hub';

/**
 * getAPISig uses helper function to create a new sig
 * 
 * seconds (300) time until the sig expires
 */
export const getAPISig = async (seconds: number = 300) => {
  const expiration = new Date(Date.now() + 1000 * seconds)
  return await createAPISig(process.env.USER_API_SECRET, expiration)
}

/**
 * newClientDB creates a Client (remote DB) connection to the Hub
 * 
 * A Hub connection is required to use the getToken API
 */
export const newClientDB = async () => {
  const API = process.env.API || undefined
  const db = await Client.withKeyInfo({
    key: process.env.USER_API_KEY,
    secret: process.env.USER_API_SECRET
  }, API)
  return db;
}