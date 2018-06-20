import { registerSubPlugin } from 'hyper-plugin-extend'
import { HyperMediaVlc } from './HyperMediaVlc'

export const onRendererWindow = registerSubPlugin('hyper-media-control', HyperMediaVlc)
