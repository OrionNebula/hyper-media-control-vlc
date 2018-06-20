import { MediaPlugin, PlayerManager, HyperMediaConfig, Status, State } from 'hyper-media-control'
import { EventEmitter } from 'events'
import * as request from 'request'
import * as url from 'url'
import { parseString } from 'xml2js'

interface HyperMediaVlcConfig {
  port: number
  username: string
  password: string
}

namespace XmlStatus {
  export interface XmlStatusObject {
    readonly root: XmlStatusRoot
  }

  export interface XmlStatusRoot {
    readonly fullscreen: string[1]
    readonly audiodelay: string[1]
    readonly apiversion: string[1]
    readonly currentplid: string[1]
    readonly time: string[1]
    readonly volume: string[1]
    readonly length: string[1]
    readonly random: ('true' | 'false')[1]
    readonly audiofilters: { filter_0: string[] }[]
    readonly rate: string[1]
    readonly videoeffects: {}[]
    readonly state: string[1]
    readonly loop: ('true' | 'false')[1]
    readonly version: string[1]
    readonly position: string[1]
    readonly repeat: ('true' | 'false')[1]
    readonly subtitledelay: string[1]
    readonly equalizer: string[1]
    readonly information: { category: { '$': { name: 'meta' }, info: undefined | { '$': { name: 'title' | 'artist' | 'artwork_url' }, '_': string }[] }[] }[]
  }
}

export class HyperMediaVlc extends EventEmitter implements MediaPlugin {
  private eventPumpHandle: NodeJS.Timer
  private readonly config: HyperMediaVlcConfig
  private readonly baseUrl: string
  constructor (playerManager: PlayerManager, config: HyperMediaConfig & { vlc: HyperMediaVlcConfig | undefined }) {
    super()
    this.config = {
      port: 8080,
      username: '',
      password: 'password',
      ...config.vlc
    }

    this.baseUrl = `http://${this.config.username}:${this.config.password}@localhost:${this.config.port}`
  }

  playerName (): string {
    return 'vlc'
  }

  iconUrl (): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABKAAAASgB+3Je1gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOJSURBVHic7dvNixxFGMfxz05eNESTlVV8WSWIelBEkAhichCjLERNBEHBix4kiAcPgoiCf4Mgeo3gRUTBoxdBczEqSkBEwZeYrC9o0Kxi4ktedtZDTcsydM/0zFZVzw79heewXTv1/J6ap7qrnuohP9txED/hn579jFcx14Ce7LyGlQo72KCuLMzirOoB+BUbcgrq5HSGvdg0oP1S7M6kBfkHYF+N/9mfXEVDbMSS6vQv7NumBKZmj+HBF3ZTLlE5p0Cd9C94IJmKBvlG/Qz4MJeomVyOMI87cDuuwiU9W8bvwv3heyH4j3rXVjLqa2mZMGbkX6e0tLS0TBw51yotLRFZwI0R+rkGuyL0k51P0cUhPItbDa4GFWwQBu4pvIPz+CCNxHQ3mHn8UNL/eXyHY/gTfwgbnllsxQ7cgAv6PtcVNlAnEumNzpPqb33r2uMphKZaa49S/KjLuqkVbhUOO2JnwN+9vqOSIgMWcGGCfrfgntidphiAFOlfMPHToINfxE//wk7IfHI0KrukC76wqCdHsadAyvQvmOhp8IX0GfB1TMExM6CDIxH7q+JzE34f2C98S7G/+WN4OGMca6IjPLPfxDnjB72Md/GQehupkclRbZnHXcKp0G7crDqFu/gSh4Ud4CHhtCgZTZWbZoWXIeZ6Gk4KR2MnG9LT0tIynL34BEf77NEGNT1YoucrPBfb0Rz+Uv6ouj62sxG4XHhU9mvq4rqYjh4rcbIiLH2b5rBybU/HdPJWhZMl3BfT0YjcLzw6y7S9F8vJZqGCW7Va6+IlbIvlsAbb8ErPd5Wus8IrOGtmYYCT1fYjDggDlorNeEJ40bqOpkdiOH25prPCjgt34StiOO9xJZ7H4ohaXo/h/PiITgs7J8zDZ7DTaJuZTbit99n3jb+hWhrmd9he4BZ8NoLwQZwRNjqLPTuNU722i3GRcDK0Q3hTtP90aFz2CIM4Fi8Yfys7KfbiuMHDxxMQwFpt7Jevq1ZZ69Eqj+kH1QT3DWlfT1RWq4cNwLRQGUvVU2CL8Pud6IeRDbEsrEt+62+oyoC7TU/whBrkvWUNVQMwTelfUBpT2RSYESqxVyeVk5/TQiH2zOqLZRmw0/QFT1hp3tl/sWwApjH9C2rFdkTzC5dUtmjI/ucyg4sM02DXrg64fwpsHzZCU8C/q//Y2Nd4FG8LZ3m56AgDn5pTeEP4qf7//AdW16QeKCr01wAAAABJRU5ErkJggg=='
  }

  activate (): void {
    this.eventPumpHandle = setInterval(() => this.eventPump(), 500)
  }

  eventPump () {
    this.getStatus().then(status => this.emit('status', status))
  }

  deactivate (): void {
    clearInterval(this.eventPumpHandle)
  }

  private sendCommand (command: string, handler: request.RequestCallback): void {
    request({
      method: 'GET',
      url: url.resolve(this.baseUrl, 'requests/status.xml'),
      qs: {
        command
      },
      headers: {
        'cache-control': 'no-cache'
      }
    }, handler)
  }

  private getStatus (): Promise<Status> {
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        url: url.resolve(this.baseUrl, 'requests/status.xml'),
        headers: {
          'cache-control': 'no-cache'
        }
      }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          resolve({ isRunning: false, state: State.Stopped })
          return
        }

        parseString(body, (err, result: XmlStatus.XmlStatusObject) => {
          if (err) {
            resolve({ isRunning: false, state: State.Stopped })
            return
          }

          resolve(this.composeStatus(result))
        })
      })
    })
  }

  private composeStatus (result: XmlStatus.XmlStatusObject): Status {
    const trackData = result.root.information[0].category.find(x => x['$'].name === 'meta')
    let track = trackData && trackData.info
    let detail = {
      name: track && track.find(x => x['$'].name === 'title'),
      artist: track && track.find(x => x['$'].name === 'artist'),
      coverUrl: track && track.find(x => x['$'].name === 'artwork_url')
    }
    return {
      isRunning: true,
      state: result.root.state[0] as State,
      volume: Number(result.root.volume[0]) / 320,
      progress: Number(result.root.time[0]) * 1000,
      track: (track && {
        name: (detail.name && detail.name._) || '',
        artist: (detail.artist && detail.artist._) || '',
        coverUrl: detail.coverUrl && detail.coverUrl._,
        duration: Number(result.root.length[0]) * 1000
      })
    }
  }
}
