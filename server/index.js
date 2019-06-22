const express = require('express');
const {
	Nuxt,
	Builder
} = require('nuxt');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const isDev = !(process.env.NODE_ENV === 'production');

//const nuxtConfig = require('../nuxt.config.js');
const serverConfig = require('../config');
const config = require('../nuxt.config.js');

const host = serverConfig.env.HOST; //config.env.HOST;
const port = serverConfig.env.PORT; //config.env.PORT;

// req.body解析
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.text({limit: "50mb"}));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));

// cookie解析
app.use(cookieParser());
// 端口设置
app.set('port', port);

// 生产环境增加gzip压缩
if (!isDev) {
	app.use(compression());
}

async function start() {
	// Init Nuxt.js
	const nuxt = new Nuxt(config);
	// 本地模拟数据跨域响应投设置及路由配置
	app.all('/mock/*', function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});
	app.use('/mock', require('./mockRoutes'));
	
	// Build only in dev mode
	if (isDev) {
		const builder = new Builder(nuxt);
		await builder.build();
	}
	// Give nuxt middleware to express
	app.use(nuxt.render);
	// Listen the server
	app.listen(port, host)
	console.log(`Server listening on http://${host}:${port}`) // eslint-disable-line no-console
}
start();
