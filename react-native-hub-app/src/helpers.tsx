import { AsyncStorage } from 'react-native'
import { ThreadID, Identity, PrivateKey } from '@textile/hub'

const version = 10002 //Math.floor(Math.random() * 1000);
const IDENTITY_KEY = 'identity-' + version
const USER_THREAD_ID = 'user-thread-' + version

export const cacheUserThread = async (id: ThreadID) => {
  await AsyncStorage.setItem(USER_THREAD_ID, id.toString())
}

export const getCachedUserThread = async (): Promise<ThreadID | undefined> => {
  /**
   * All storage should be scoped to the identity
   *
   * If the identity changes and you try to use an old database,
   * it will error due to not authorized.
   */
  const idStr = await AsyncStorage.getItem(USER_THREAD_ID)
  if (idStr) {
    /**
     * Temporary hack to get ThreadID working in RN
     */
    const id: ThreadID = ThreadID.fromString(idStr)
    return id
  }
  return undefined
}

export const generateIdentity = async (): Promise<PrivateKey> => {
  let idStr = await AsyncStorage.getItem(IDENTITY_KEY)
  if (idStr) {
    return await PrivateKey.fromString(idStr)
  } else {
    const id = await PrivateKey.fromRandom()
    idStr = id.toString()
    await AsyncStorage.setItem(IDENTITY_KEY, idStr)
    return id
  }
}

export const astronautSchema = {
  $id: 'https://example.com/astronaut.schema.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Astronauts',
  type: 'object',
  required: ['_id'],
  properties: {
    _id: {
      type: 'string',
      description: "The instance's id.",
    },
    firstName: {
      type: 'string',
      description: "The astronaut's first name.",
    },
    lastName: {
      type: 'string',
      description: "The astronaut's last name.",
    },
    missions: {
      description: 'Missions.',
      type: 'integer',
      minimum: 0,
    },
  },
}

export const createAstronaut = () => {
  return {
    _id: '',
    firstName: 'Buzz',
    lastName: 'Aldrin',
    missions: 2,
  }
}

export const generateWebpage = (title: string) => {
  return `<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,minimum-scale=1,initial-scale=1,maximum-scale=1"><title>${title}</title><link rel=apple-touch-icon sizes=180x180 href=https://hub.textile.io/public/img/apple-touch-icon.png><link rel=icon type=image/png sizes=32x32 href=https://hub.textile.io/public/img/favicon-32x32.png><link rel=icon type=image/png sizes=16x16 href=https://hub.textile.io/public/img/favicon-16x16.png><style>html,body{margin:0;padding:0;background:#333;font-family:Arial,Geneva,sans-serif;font-size:30px}@media(min-width:600px){body{font-size:40px}}@media(min-width:800px){body{font-size:60px}}@media(min-width:1000px){body{font-size:75px}}.title{position:fixed;top:30%;left:50%;transform:translate(-50%,-30%);color:#ddd;text-align:center}.link{position:absolute;bottom:1%;right:2%;z-index:1}.link a{font-size:10px;color:#777;text-decoration:none}.background{position:absolute;display:block;top:0;left:0;bottom:0;right:0;width:100%;height:100%;z-index:0}</style><script src=https://npmcdn.com/particlesjs@2.2.2/dist/particles.min.js></script><div class=title>${title}</div><div class=link><a href=https://docs.textile.io target=_blank>Built with Textile</a></div><canvas class=background></canvas><script>window.onload=function(){Particles.init({selector:'.background',color:'#FFB6D4',maxParticles:130,connectParticles:true,responsive:[{breakpoint:768,options:{maxParticles:80}},{breakpoint:375,options:{maxParticles:50}}]});};</script>`
}
