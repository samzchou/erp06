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
		{src: '~/plugins/storage',ssr:false},
		{src: '~/plugins/echarts', ssr:false}
	],

	/*
	** Nuxt.js modules
	*/
	modules: [
        // 全局 scss 变量引入
        '@nuxtjs/style-resources',
        // Doc: https://github.com/nuxt-community/axios-module#usage
        '@nuxtjs/axios'
    ],
    styleResources: {
        scss: '~/assets/scss/var/common.scss'
        //sass: []
    },
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
		//vendor: ["vuedraggable"],
		//extractCSS: true,
		transpile: [/^element-ui/],
		// 提取大体积模块
        optimization: {
            splitChunks: {
                chunks: 'all',
                automaticNameDelimiter: '.',
                maxAsyncRequests: 7,
                maxInitialRequests: 5, // 默认为3个，设置为能拆分为5个，nuxt自身也有个commons的cacheGroups
                cacheGroups: {
                    /* vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: 1
                    }, */
                    "vue-charts": {
                        test: /vue-charts/,
                        chunks: 'all',
                        priority: 20,
                        name: true
                    },
                    "element-ui": {
                        test: /element-ui/, //node_modules[\\/]element-ui/
                        chunks: 'all',
                        priority: 20,
                        name: true
                    }
                }
            }
        },
        splitChunks: {
            layouts: false,
            pages: true,
            commons: true
        },
		extend(config, { isDev, loaders: { vue } }) {
            vue.i18n = '@kazupon/vue-i18n-loader'; 
            if (isDev && process.client) {
                config.module.rules.push({
                    enforce: 'pre',
                    test: /.(js|vue)$/,
                    loader: 'eslint-loader',
                    exclude: /(node_modules)/
                });
            }
        }
	},
}
