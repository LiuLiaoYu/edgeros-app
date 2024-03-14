import { Manager } from "@edgeros/jsre-medias";
import WebMedia from "webmedia";
import CameraSource from '@edgeros/jsre-camera-src'
// import CameraSource from './camera_src.1'

// if (true) {
// 	var CameraSource = require('./camera_src')
// } else {
// 	var CameraSource = require('./camera_src2')
// }


const sourceName = 'camera-flv';
WebMedia.registerSource(sourceName, CameraSource);


const opts = {
  mediaTimeout: 1800000,
  searchCycle: 20000,
  autoGetCamera: false
}
export const server = new Manager(app, null, opts, (opts) => {
  return {
    source: sourceName,
    inOpts: opts,
    outOpts: {}  // ! FIXME
  }
})

server.on('open', (media) => {
  console.log('Media open.')
  media.on('open', (media, client) => console.log('Media client open.'))
  media.on('close', (media, client) => console.log('Media client close.'))
})

import util from "util";

import permission from 'permission'

permission.fetch(function(error, perm) {
  if (perm) {
    if (perm.network) {
      console.log('Current App has network permission!');
    }
    if (perm.devices.includes('xxxx'))  {
      console.log('Current App can request and control device xxxx!');
    }
  }
});


/*
setTimeout(async () => {
  // const a = deviceManager.deviceList.filter(x => x.label == '智能氛围灯2')
  // console.log(a[0].devid)
  // const res = await deviceManager.control(toDevice(a[0].devid).set({ state: "on" }))
  // console.log(res)
  // console.log("over")
  let devs = []
  server.iterDev((key, dev) => {
    var info = dev.dev
    var stream = dev.mainStream
    var media = stream ? stream.media : null
    devs.push({
      devid: key,
      alias: `${info.hostname}:${info.port}${info.path}`,
      report: info.urn,
      path: media ? '/' + media.sid : '',
      status: media ? true : false
    })
  })

  const device = devs[0]
  const camera = server.findDev(device.devid)

  console.log(camera)

  server.createStream(camera.key, { username: 'admin', password: '123456' }, async (err, streams) => {
    if (err) {
      console.log('No stream.');
    }
    console.log("---")

    try {

      server.createMedia(camera.key, camera.mainStream.token, { username: 'admin', password: '123456' }, (err, media) => {
        console.log(media)
        console.log(err)
      })
    }
    catch (err) {
      console.log(err)
    }

    // try {
    //   const res = await util.promisify(server.createMedia)(camera.key, camera.mainStream.token, { username: 'admin', password: '123456' })
    // }
    // catch (err) {
    //   console.log(err)
    // }

  });
}, 10000)
*/
