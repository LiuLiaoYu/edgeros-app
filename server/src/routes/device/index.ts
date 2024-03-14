import Router from "../WebRouter"
// import { getDeviceList } from "./device-manager"

const deviceRoute = new Router()

deviceRoute.get("/list", async (req, res) => {
  res.json({ name: null })
  // const list1 = await getDeviceList(true)
  // const list2 = await getDeviceList(false)
  // console.log("this")
  // res.json({ joinTrue: list1, joinFalse: list2 })
})


export default deviceRoute