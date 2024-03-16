import io from 'socket.io-client'
import { authTokenHeader } from '..'

export const socketClient = io({
  path: '/socket/device-push',
  query: authTokenHeader.value,
  transports: ['websocket'],
})

socketClient.on('connect', () => {
  console.info('socket connected')
})

socketClient.on('device:report', (report) => {
  console.log(report)
})

socketClient.on('camera:stream', (data) => {
  console.log(data)
})
