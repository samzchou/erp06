import Vue from 'vue'
import ECharts from 'vue-echarts'

// 全部引入
import 'echarts'

// 手动引入 ECharts 各模块来减小打包体积
// import 'echarts/lib/chart/bar'
// import 'echarts/lib/component/tooltip'
// import 'echarts/lib/chart/line'
// import 'echarts/lib/component/polar'

// 注册组件后即可使用
Vue.component('echart', ECharts)