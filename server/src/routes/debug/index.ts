import Router from '../web-router'

const debugRoute = new Router()

debugRoute.get('/server/info', (req, res) => {
  res.json({
    port: req.app.port(),
  })
})

export default debugRoute
