const server_url = 'http://127.0.0.1/';

module.exports = {
	mode: 'universal',
	head: {
		title: 'SYS',
		meta: [
			{charset: 'utf-8'},
			{name:'viewport', content:'width=device-width, initial-scale=1'},
			{hid:'description', name:'description', content:'TEST'}
		],
		link: [
			{rel: 'icon',type: 'image/x-icon',href: '/favicon.ico'}, 
			{rel: 'stylesheet',href: '/style/vendor.css' }
		]
	},
	/*
	** Customize the progress-bar color
	*/
	loading: {
		color: '#3B8070'
	},
	router: {
		middleware: 'auth'
	},
	/*
	** Global CSS
	*/
	css: [
		'~/assets/scss/base.scss',
	],
	/*
	** Plugins to load before mounting the App
	*/
	plugins: [
		{src: '~/plugins/polyfill',ssr: false},
		'~/plugins/lodash',
		'~/plugins/moment',
		{src: '~/plugins/cookies',ssr: false},
		'~/plugins/i18n',
		'~/plugins/element-ui',
		'~/plugins/axios',
		'~/plugins/filters.js',  //全局过滤器
		'~/plugins/global.js',  //全局变量
		'~/plugins/print',
		{src: '~/plugins/storage',ssr:false},
		{src: '~/plugins/echarts', ssr:false},
		{src: '~/plugins/VDistpicker', ssr:false},
		{src: '~/plugins/context-menu', ssr:false}
	],

	/*
	** Nuxt.js modules
	*/
	modules: [
		// 全局 scss 变量引入
		[
			"nuxt-sass-resources-loader",
			{resources: "~/assets/scss/var/common.scss"}
		],
		'@nuxtjs/axios'
	],
	/*
	** Axios module configuration
	*/
	axios: {
		baseURL: server_url,
		browserBaseURL: server_url
	},

	/*
	** Build configuration
	*/
	build: {
		vendor: ["vuedraggable"],
		extractCSS: true,
		extend(config, ctx) {
			const vueLoader = config.module.rules.find((rule) => rule.loader === 'vue-loader');
			vueLoader.options.loaders.i18n = '@kazupon/vue-i18n-loader';
		}
	},
}
