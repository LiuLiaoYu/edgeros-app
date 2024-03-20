import io from 'socket.io-client'
import { authTokenHeader } from '../utils/edger-auth-token'

function socketioOption() {
  return {
    path: '/socket/device-push',
    query: authTokenHeader.value,
    transports: ['websocket'],
  }
}

export class SocketClient {
  client?: any
  constructor() {

  }

  init(options) {
    this.client = io(options)

    this.client.on('connect', () => {
      console.info('socket connected')
    })
  }
}

export const socketClient = new SocketClient()

// console.log(authTokenHeader.value)

// export const socketClient
// = io({
//   path: '/socket/device-push',
//   query: authTokenHeader.value,
//   transports: ['websocket'],
// })

// socketClient.on('hello-test', (res) => {
//   console.log(res)
// })

// socketClient.on('device:report', (report) => {
//   console.log(report)
// })

// socketClient.on('camera:stream', (data) => {
//   console.log(data)
// })
