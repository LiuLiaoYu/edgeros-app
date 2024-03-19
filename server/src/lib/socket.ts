// socketio 2.2; jsre builtin
import SocketServer from 'socket.io'

export class StatePusher {
  socketServer: any
  constructor(app, options) {
    this.socketServer = SocketServer(app, options)
  }

  send(event, data) {
    this.socketServer.sockets.emit(event, data)
  }

  report(report) {
    this.socketServer.sockets.emit('device:report', report)
  }

  listenAll(event, callbackFn) {
    this.socketServer.sockets.on(event, callbackFn)
  }
}
