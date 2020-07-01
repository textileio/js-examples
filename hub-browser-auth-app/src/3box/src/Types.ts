import { Buckets, UserAuth } from '@textile/hub'
import { Identity } from '@textile/threads-core'
import { PhotoProps } from 'react-photo-gallery'

export interface PhotoSample {
  cid: string
  name: string
  path: string
  width: number
  height: number
}
export interface Photo {
  date: number
  name: string
  original: PhotoSample
  preview: PhotoSample
  thumb: PhotoSample
}

export interface GalleryIndex {
  author: string
  date: number
  paths: string[]
}

export interface AppState {
  metadata: Array<Photo>
  photos: Array<PhotoProps>
  index: GalleryIndex
  isLoading: boolean
  isDragActive: boolean
  space?: any
  identity?: Identity
  userAuth?: UserAuth
  buckets?: Buckets
  bucketKey?: string
  www?: string
  url?: string
  ipns?: string
}