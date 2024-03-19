import Router from './web-router'

const route = new Router()

route.get('/list', async (req, res) => {
  res.json({ name: null })
  // const list1 = await getDeviceList(true)
  // const list2 = await getDeviceList(false)
  // console.log("this")
  // res.json({ joinTrue: list1, joinFalse: list2 })
})

export default route
