import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import router from '@/router'
import { setToken, getToken } from '@/utils/auth'
import { validate, logout } from '@/api/login'

const defaultSettings = require('../settings.js')

// create an axios instance
const service = axios.create({
    baseURL: window.RELEASE_APP_BASE_URL || process.env.VUE_APP_BASE_API,
    withCredentials: true, // send cookies when cross-domain requests
    timeout: 50000 // request timeout
})

function showErrorMessage(response) {
    const fullUrl = response.request.responseURL;
    const baseUrl = response.config.baseURL;
    const path = fullUrl.replace(baseUrl, "");
    if (['/account/login/validate'].indexOf(path) != -1) {
        return false;
    }
    return true;
}

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent

        const token = getToken();
        if (token) {
            // let each request carry token
            // ['X-Token'] is a custom headers key
            // please modify it according to the actual situation
            config.headers['Authorization'] = token
        }
        config.headers['Platform'] = defaultSettings.platform
        config.headers['Product'] = defaultSettings.product
        if (router && router.currentRoute &&
            router.currentRoute.meta &&
            router.currentRoute.meta.roles &&
            router.currentRoute.meta.roles.length > 0) {
            config.headers['Module'] = router.currentRoute.meta.roles[0]
        }
        if (window.captcha) {
            config.headers['Captcha'] = window.captcha
        }
        return config
    },
    error => {
        // do something with request error
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
    */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    async response => {
        const reqModule = response.config.headers['Module'];
        if (!(reqModule == null || reqModule == '')) {
            if (router.currentRoute.meta.roles.indexOf(reqModule) < 0) {
                return {};
            }
        }

        delete window.captcha;

        const res = response.data

        // if the custom code is not 20000, it is judged as an error.
        if (res.code !== 0) {
            // 1001: Illegal token; 1002: require product param; 1003: Token expired; 2001: require login
            if (res.code === 1001 || res.code === 1002 || res.code === 1003 ||
                res.code === 2001) {
                const token = await validate();
                if (token) {
                    setToken(token);

                    const config = response.config;
                    config.headers['Authorization'] = token
                    return await service.request(config);
                } else {
                    setTimeout(() => {
                        if (router.currentRoute.path !== "/" &&
                            router.currentRoute.path !== "/login") {
                            // to re-login
                            MessageBox.confirm('　　当前账户即将退出登录状态，可能是您长时间未进行操作登录状态过期或其他原因；您可以选择取消留在当前页面或重新登录进入系统。', '退出提示', {
                                confirmButtonText: '重新登录',
                                cancelButtonText: '取消',
                                type: 'confirm'
                            }).then(() => {
                                store.dispatch('user/resetToken').then(() => {
                                    location.reload()
                                })
                            })
                        }
                    }, 50);
                }
            } else if (res.code == 2002) { // 密码重置后，第一登录需先修改密码
                router.push({ path: '/setpass' });
            } else {
                if (showErrorMessage(response)) {
                    Message({
                        message: res.error || '请求返回错误，请按F5键刷新重试。',
                        type: 'error',
                        duration: 5 * 1000
                    })
                }
            }

            return Promise.reject({
                code: res.code,
                error: res.error || '请求返回错误，请按F5键刷新重试。'
            })
        } else {
            return res
        }
    },
    error => {
        let code = -1;
        let msg = error.message == "Network Error" ? "请求发生异常，请检查网络是否正常或按F5刷新重试！" : error.message;

        const reqModule = error.config.headers['Module'];
        if (!(reqModule == null || reqModule == '')) {
            if (router.currentRoute.meta.roles.indexOf(reqModule) < 0) {
                msg = '';
            }
        }

        if (typeof (error.response) != 'undefined') {
            code = error.response.status;
            if (error.response.status == 401) {
                msg = "您没有权限，请联系管理员解决。";
            } else if (error.response.status == 403) {
                msg = "您没有权限，请联系管理员解决！";
            } else if (error.response.status == 404) {
                msg = "不能识别的请求，请使用正确的服务地址！";
            } else if (error.response.status == 419) {
                if (error.config.method == 'get') {
                    msg = "当前数据您无权查看，拒绝服务！";
                } else {
                    msg = "当前数据您无权操作，拒绝服务！";
                }
            } else if (error.response.status == 429) {
                msg = "操作太频繁，请稍后再进行操作！";
            } else if (error.response.status == 444) {
                if (error.response.data) {
                    msg = error.response.data.error;
                    if (error.response.data.code == 4442) {
                        logout();
                    }
                } else {
                    msg = "请求IP地址异常，暂停服务！";
                }
            } else if (error.response.status == 500) {
                msg = "服务异常，请稍后按F5刷新重试！";
            } else if (error.response.status == 501) {
                msg = "访问被拒绝，请联系管理员！";
            } else if (error.response.status == 503) {
                if (error.response.data) {
                    msg = error.response.data.error;
                }

                if (typeof (msg) == 'undefined' && msg == '') {
                    msg = "请求数量超过限额，请联系管理员。";
                }
            }
        }

        if (typeof (msg) != 'undefined' && msg != '') {
            Message({
                message: msg,
                type: 'error',
                duration: 5 * 1000
            })
        }

        return Promise.reject({
            code,
            error
        })
    }
)

export default service
