import LightKV from 'lightkv'

export const kvdb = new LightKV('./camera.db', 'c+', LightKV.OBJECT)

if (!kvdb.has('cameras'))
  kvdb.set('cameras', {})
