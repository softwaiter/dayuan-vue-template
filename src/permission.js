import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
// import getPageTitle from '@/utils/get-page-title'
import { validate, getLoginInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register', '/getpass'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  // document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken();

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          const loginInfo = await getLoginInfo();
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          // const { roles } = await store.dispatch('user/getInfo')

          if (!loginInfo.modules || loginInfo.modules.length == 0) {
            loginInfo.modules = ['hahaha'];
          }

          // generate accessible routes map based on roles
          var accessRoutes = await store.dispatch('permission/generateRoutes', loginInfo.modules)

          // dynamically add accessible routes
          router.addRoutes(accessRoutes)

          store.dispatch('user/setUserInfo', loginInfo.user)
          store.dispatch('user/setRoles', loginInfo.modules)

          // store.permission.state.routes = constantRoutes.concat(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          // await store.dispatch('user/resetToken')

          removeToken();

          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    const token = await validate();
    if (token == null) {
      if (whiteList.indexOf(to.path) !== -1) {
        // in the free login whitelist, go directly
        next()
      } else {
        // other pages that do not have permission to access are redirected to the login page.
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    } else {
      setToken(token);
      location.reload();
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
