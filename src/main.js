import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './submodules'
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

import moment from 'moment'

import { hasModule } from './utils/auth'
import { dialogReposition } from './utils/dialog'

import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

const defaultSettings = require('./settings.js')

Vue.prototype.$moment = moment

Vue.prototype.$visible = hasModule

Vue.prototype.$dialogReposition = dialogReposition

Vue.use(VXETable)

let defaultSize = 'medium'
if (window.screen.width <= 1300) {
    defaultSize = 'mini'
}

Vue.use(Element, {
    size: Cookies.get(defaultSettings.product + '_size') || defaultSize // set element-ui default size
    //   locale: enLang // 如果使用中文，无需设置，请删除
})

// register global utility filters
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})
