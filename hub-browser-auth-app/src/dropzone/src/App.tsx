import React from 'react';
import Avatar from './Avatar';
import Photos from './Photos';

import "semantic-ui-css/semantic.min.css";
import Dropzone from 'react-dropzone'
// @ts-ignore
import browserImageSize from 'browser-image-size'
// @ts-ignore
import { readAndCompressImage } from 'browser-image-resizer'
import { Buckets, PushPathResult } from '@textile/hub'
import { Libp2pCryptoIdentity, Identity } from '@textile/threads-core';
import { Button, Header, Segment } from "semantic-ui-react";

import {PhotoSample, Photo, GalleryIndex, AppState} from './Types'
import './App.css';

const API = 'https://api.textile.io:443'

class App extends React.Component {
  state: AppState = {
    metadata: [],
    photos: [],
    isLoading: true,
    isDragActive: false,
    index: {
      author: '',
      date: 0,
      paths: []
    }
  }
  async componentDidMount() {
    // Clear your user during development
    // await localStorage.clear()
    const identity = await this.getIdentity()
    // you might want to do the I18N setup here
    this.setState({ 
      identity: identity
    })

    // authorize user with the hub
    const userAuth = await this.loginWithChallenge(identity)
    this.setState({ 
      userAuth: userAuth
    })

    // get their photo bucket
    const {bucketKey, buckets} = await this.getBucketKey()
    this.setState({ 
      buckets: buckets,
      bucketKey: bucketKey
    })

    await this.getBucketLinks()

    const index = await this.getPhotoIndex()
    if (index) {
      await this.galleryFromIndex(index)
      this.setState({ 
        index,
        isLoading: false
      })
    }
  }

  /**
   * getIdentity uses a basic private key identity.
   * The user's identity will be cached client side. This is long
   * but ephemeral storage not sufficient for production apps.
   * 
   * Read more here:
   * https://docs.textile.io/tutorials/hub/libp2p-identities/
   */
  getIdentity = async (): Promise<Libp2pCryptoIdentity> => {
    try {
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
  }

  /**
   * loginWithChallenge uses websocket to initiate and respond to
   * a challenge for the user based on their keypair.
   * 
   * Read more about setting up user verification here:
   * https://docs.textile.io/tutorials/hub/web-app/
   */
  loginWithChallenge = async (id: Identity) => {  
    return new Promise((resolve, reject) => {
      /** 
       * Configured for our development server
       * 
       * Note: this should be upgraded to wss for production environments.
       */
      const socketUrl = `ws://localhost:3001/ws/userauth`
      
      /** Initialize our websocket connection */
      const socket = new WebSocket(socketUrl)
  
      /** Wait for our socket to open successfully */
      socket.onopen = () => {
        /** Get public key string */
        const publicKey = id.public.toString();
  
        /** Send a new token request */
        socket.send(JSON.stringify({
          pubkey: publicKey,
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
                sig: Buffer.from(signed).toJSON()
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
  }

  /**
   * getBucketKey will create a new Buckets client with the UserAuth
   * and then open our custom bucket named, 'io.textile.dropzone'
   */
  getBucketKey = async () => {
    if (!this.state.userAuth) {
      throw new Error('Missing user auth')
    }
    const buckets = await Buckets.withUserAuth(this.state.userAuth, API)
    const root = await buckets.open('io.textile.dropzone')
    if (!root) {
      throw new Error('Failed to open bucket')
    }
    return {buckets: buckets, bucketKey: root.key};
  }

  /**
   * getBucketLinks returns all the protocol endpoints for the bucket.
   * Read more:
   * https://docs.textile.io/hub/buckets/#bucket-protocols 
   */
  getBucketLinks = async () => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    const links = await this.state.buckets.links(this.state.bucketKey)
    this.setState({
      ...links
    })
  }

  /**
   * storeIndex stores the updated index of all images in the Bucket
   * This could easily be designed to write directly to the thread
   * instead of json files. 
   * @param index 
   */
  storeIndex = async (index: GalleryIndex) => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    const buf = Buffer.from(JSON.stringify(index, null, 2))
    const path = `index.json`
    await this.state.buckets.pushPath(this.state.bucketKey, path, buf)
  }

  initIndex = async () => {
    if (!this.state.identity) {
      console.error('Identity not set')
      return
    }
    const index = {
      author: this.state.identity.public.toString(),
      date: (new Date()).getTime(),
      paths: []
    }
    await this.storeIndex(index)
    return index
  }

  /**
   * initPublicGallery will write a basic HTML file to the root of the bucket
   * that knows how to read the index.json and load all the images. This will
   * allow the bucket to be rendered over any gateway or ipns endpoint.
   */
  initPublicGallery = async () => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    const buf = Buffer.from(publicGallery)
    await this.state.buckets.pushPath(this.state.bucketKey, 'index.html', buf)
  }

  /**
   * galleryFromIndex parses the index.json and pulls the metadata for each image
   * @param index 
   */
  galleryFromIndex = async (index: GalleryIndex) => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    for (let path of index.paths) {
      const metadata = await this.state.buckets.pullPath(this.state.bucketKey, path)
      const { value } = await metadata.next();
      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }
      const json: Photo = JSON.parse(str)
      const photo = index.paths.length > 1 ? json.preview : json.original
      this.setState({ 
        photos: [
          ...this.state.photos,
          {
            src:`https://${photo.cid}.ipfs.hub.textile.io`,
            width: photo.width,
            height: photo.height,
            key: photo.name,
          }
        ]
      })
    }
  }

  /**
   * getPhotoIndex pulls the index.json from the root of the bucket (or creates it
   * if it doesn't exist yet)
   */
  getPhotoIndex = async () => {
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    try {
      const metadata = this.state.buckets.pullPath(this.state.bucketKey, 'index.json')
      const { value } = await metadata.next();
      let str = "";
      for (var i = 0; i < value.length; i++) {
        str += String.fromCharCode(parseInt(value[i]));
      }
      const index: GalleryIndex = JSON.parse(str)
      return index
    } catch (error) {
      const index = await this.initIndex()
      await this.initPublicGallery()
      return index
    }
  }

  /**
   * Pushes files to the bucket
   * @param file 
   * @param path 
   */
  insertFile(file: File, path: string): Promise<PushPathResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onabort = () => reject('file reading was aborted')
      reader.onerror = () => reject('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const binaryStr = reader.result

        if (!this.state.buckets || !this.state.bucketKey) {
          reject('No bucket client or root key')
          return
        }
        this.state.buckets.pushPath(this.state.bucketKey, path, binaryStr).then((raw) => {
          resolve(raw)
        })
      }
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * processAndStore resamples the image and extracts the metadata. Next, it
   * calls insertFile to store each of the samples plus the metadata in the bucket.
   * @param image 
   * @param path 
   * @param name 
   * @param limits 
   */
  processAndStore = async (image: File, path: string, name: string, limits?: {maxWidth: number, maxHeight: number}): Promise<PhotoSample> => {
    const finalImage = limits ? await readAndCompressImage(image, limits) : image
    const size = await browserImageSize(finalImage)
    const location = `${path}${name}`
    const raw = await this.insertFile(finalImage, location)
    const metadata = {
      cid: raw.path.cid.toString(),
      name: name,
      path: location,
      ...size
    }
    return metadata
  }

  handleNewFile = async (file: File) => {
    const preview = {
      maxWidth: 800,
      maxHeight: 800
    }
    const thumb = {
      maxWidth: 200,
      maxHeight: 200
    }
    if (!this.state.buckets || !this.state.bucketKey) {
      console.error('No bucket client or root key')
      return
    }
    const imageSchema: {[key: string]: any} = {}
    const now = new Date().getTime()
    imageSchema['date'] = now
    imageSchema['name'] = `${file.name}`
    const filename = `${now}_${file.name}`
    
    imageSchema['original'] = await this.processAndStore(file, 'originals/', filename)
    
    imageSchema['preview'] = await this.processAndStore(file, 'previews/', filename, preview)

    imageSchema['thumb'] = await this.processAndStore(file, 'thumbs/', filename, thumb)

    const metadata = Buffer.from(JSON.stringify(imageSchema, null, 2))
    const metaname = `${now}_${file.name}.json`
    const path = `metadata/${metaname}`
    await this.state.buckets.pushPath(this.state.bucketKey, path, metadata)

    const photo = this.state.photos.length > 1 ? imageSchema['preview'] : imageSchema['original']

    this.setState({ 
      index: {
        ...this.state.index,
        paths: [...this.state.index.paths, path]
      },
      photos: [
        ...this.state.photos,
        {
          src:`https://${photo.cid}.ipfs.hub.textile.io`,
          width: photo.width,
          height: photo.height,
          key: photo.name,
        }
      ]
    })
  }
  onDrop = async (acceptedFiles: File[]) => {
    if (this.state.photos.length > 50) {
      throw new Error('Gallery at maximum size')
    }
    if (acceptedFiles.length > 5) {
      throw new Error('Max 5 images at a time')
    }
    for (const accepted of acceptedFiles) {
      await this.handleNewFile(accepted)
    }
    this.storeIndex(this.state.index)
  }

  renderDropzone = () => {
    return (
      <Dropzone 
        onDrop={this.onDrop}
        accept={'image/jpeg, image/png, image/gif'}
        maxSize={20000000}
        multiple={true}
        >
        {({getRootProps, getInputProps}) => (
          <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} />
            <Button
              className="icon"
              icon="images"
              title="add"
            />
            <span>DRAG & DROP</span>
          </div>
        )}
      </Dropzone>
    )
  }
  render () {
    return (
      <div className="App">
        <Segment.Group style={{ height: "100%" }}>
          <Segment clearing className="nav">
            <Header className="avatar" as="h2" floated="left" title={this.state.identity ? this.state.identity.toString() : 'identity'}>
              {this.state.identity && <Avatar identity={this.state.identity.toString()}/>}
            </Header>
            <Header className="dropzone-container" as="h2" floated="right" title={'add photo'}>
              {!this.state.isLoading && this.renderDropzone()}
            </Header>
            {this.state.url &&
              <a href={this.state.url} target="_blank" rel="noopener noreferrer">
                <Button
                  className="link"
                  floated="right"
                >BUCKET</Button>
              </a>
            }
            {this.state.www &&
              <a href={this.state.www} target="_blank" rel="noopener noreferrer">
                <Button
                  className="link"
                  floated="right"
                >WWW</Button>
              </a>
            }
            {this.state.ipns &&
              <a href={this.state.ipns} target="_blank" rel="noopener noreferrer">
                <Button
                  className="link"
                  floated="right"
                >IPNS</Button>
              </a>
            }
          </Segment>
          <Segment className={ this.state.isLoading ? 'rendering' : 'complete'}>
            <Photos photos={this.state.photos}/>
          </Segment>
        </Segment.Group>
      </div>
    )
  }
}

const publicGallery = '<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta http-equiv=x-ua-compatible content="ie=edge"><meta property="twitter:description" content="built with textile.io. uses textile buckets and ipns to serve photo galleries over ipns"><title>Public Gallery</title><link rel=stylesheet href=https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css><script src=https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js></script><div class=wrapper><div class=grid></div></div><script>const loadIndex=async()=>{const elements=[]\n' +
'const index=await fetch("index.json")\n' +
'const json=await index.json()\n' +
'for(let path of json.paths){try{const meta=await fetchMetadata(path)\n' +
'elements.push({href:meta.path,type:"image"})}catch(err){console.log(err)}}\n' +
'const lightbox=GLightbox({selector:".grid",touchNavigation:true,closeButton:false,loop:true,elements:elements,});lightbox.open();}\n' +
'const fetchMetadata=async(path)=>{const index=await fetch(path)\n' +
'const json=await index.json()\n' +
'return json.original}\n' +
'window.addEventListener("DOMContentLoaded",function(){loadIndex()});</script>';

export default App;
