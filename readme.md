使用 pnpm 安装

注意：
1. eos打包时需要 main.js 和 node_modules 处于同一路径下，否则使用 node_modules 中的包将无法被找到
2. 前端
   1. 使用 web-sdk 进行权限请求；
   2. flv解流推荐 https://github.com/xqq/mpegts.js，支持h265；
   3. 在安全模式下，使用vue-router+vite-plugin-pages分块构建懒加载存在问题，请求会被后端拦截；直接使用`import()`是没有问题的，不清楚具体原因
3. 后端
   1. 优先使用异步调用的库，如 'async/device', 'async/permission'
   2.

文件夹：
app：eap打包的目录
server：后端代码，使用typescript，rollup打包，生成到app/main.js
web：前端代码，使用vue，vite构建，生成到app/public/下

