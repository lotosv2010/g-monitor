const Koa = require('koa');
const static = require('koa-static');
const path = require('path');
const api = require('./middleware/api');
const sourceMap = require('./middleware/sourceMap');

const app = new Koa();
const port = 3000;

app.use(api);
app.use(sourceMap);

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = '../website'
app.use(static(
  path.join( __dirname,  staticPath)
));

app.listen(port, () => {
  console.log(`the port ${port} is started!`);
});
