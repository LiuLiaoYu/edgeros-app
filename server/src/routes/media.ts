import Router from './web-router'

const route = new Router()

route.get('/list', async (req, res) => {
  res.json({ name: null })
})

export default route
