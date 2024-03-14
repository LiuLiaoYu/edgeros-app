// socketio 2.2; jsre builtin
import SocketServer from "socket.io";

export class DeviceStatePush {
  socketServer: any
  constructor(app, options) {
    this.socketServer = SocketServer(app, options)
  }
  report(report) {
    this.socketServer.sockets.emit("device:report", report)
  }
}