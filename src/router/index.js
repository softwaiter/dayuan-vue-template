import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 *
 * tree  user   lock    edit    peoples search  star    message excel   setting documentation   people  theme   list
 */
 const myConstantRoutes = [
    {
        path: '/redirect',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '/redirect/:path(.*)',
                component: () => import('@/views/redirect/index')
            }
        ]
    },
    {
        path: '/login',
        component: () => import('@/views/login/index'),
        hidden: true
    },
    {
        path: '/register',
        component: () => import('@/views/register/index'),
        hidden: true
    },
    {
        path: '/404',
        component: () => import('@/views/error-page/404'),
        hidden: true
    },
    {
        path: '/401',
        component: () => import('@/views/error-page/401'),
        hidden: true
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                component: () => import('@/views/dashboard/index'),
                name: 'Dashboard',
                meta: {
                    title: '首页',
                    icon: 'dashboard',
                    affix: true
                }
            }
        ]
    },
    {
        path: '/changepass',
        component: Layout,
        redirect: '/changepass',
        hidden: true,
        children: [
            {
                path: '/',
                component: () => import('@/views/changepass/index'),
                name: 'ChangePass',
                meta: {
                    title: '修改密码',
                    icon: 'el-icon-key'
                }
            }
        ]
    },
    {
        path: '/profile',
        component: Layout,
        redirect: '/profile',
        hidden: true,
        children: [
            {
                path: '/',
                component: () => import('@/views/profile/index'),
                name: 'Profile',
                meta: {
                    title: '个人信息',
                    icon: 'el-icon-user'
                }
            }
        ]
    },
    {
        path: '/setpass',
        component: () => import('@/views/changepass/index'),
        hidden: true
    },
    {
        path: '/getpass',
        component: () => import('@/views/getpass/index'),
        hidden: true
    }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
 const myAsyncRoutes = [
    {
        path: '/log',
        component: Layout,
        alwaysShow: true,
        redirect: 'noRedirect',
        name: 'log-monitor',
        meta: {
            title: '日志审计',
            icon: 'fastapi-log',
            roles: ['loginlog', 'syslog', 'bizlog', 'defenselog']
        },
        children: [
            {
                path: 'login',
                component: () => import('@/views/log/login'),
                name: 'LoginLog',
                meta: {
                    title: '登录日志',
                    roles: ['loginlog']
                }
            },
            {
                path: 'sys',
                component: () => import('@/views/log/sys'),
                name: 'SysLog',
                meta: {
                    title: '系统日志',
                    roles: ['syslog']
                }
            },
            {
                path: 'biz',
                component: () => import('@/views/log/biz'),
                name: 'BizLog',
                meta: {
                    title: '业务日志',
                    roles: ['bizlog']
                }
            },
            {
                path: 'defense',
                component: () => import('@/views/log/defense'),
                name: 'DefenseLog',
                meta: {
                    title: '防御日志',
                    roles: ['defenselog']
                }
            }
        ]
    },
    {
        path: '/analysis',
        component: Layout,
        alwaysShow: true,
        redirect: 'noRedirect',
        name: '',
        meta: {
            title: '统计分析',
            icon: 'fastapi-analysis',
            roles: ['anal_user_activity', 'anal_user_duration', 'anal_prod_heat', 'anal_module_heat']
        },
        children: [
            {
                path: 'user/activity',
                component: () => import('@/views/analysis/useractivity'),
                name: 'UserActivity',
                meta: {
                    title: '用户活跃度',
                    roles: ['anal_user_activity']
                }
            },
            {
                path: 'user/duration',
                component: () => import('@/views/analysis/userduration'),
                name: 'UserDuration',
                meta: {
                    title: '用户使用时长',
                    roles: ['anal_user_duration']
                }
            },
            {
                path: 'prod/heat',
                component: () => import('@/views/analysis/prodheat'),
                name: 'ProductHeat',
                meta: {
                    title: '产品访问热度',
                    roles: ['anal_prod_heat']
                }
            },
            {
                path: '',
                component: () => import('@/views/analysis/moduleheat'),
                name: 'ModuleHeat',
                meta: {
                    title: '功能访问热度',
                    roles: ['anal_module_heat']
                }
            }
        ]
    },

    // 404 page must be placed at the end !!!
    { path: '*', redirect: '/404', hidden: true }
]

const loadModulesRouters = () => {
    const modulesRouters = require.context('@/submodules', true, /\/router\.js$/)
    modulesRouters.keys().forEach(key => {
        const imported = modulesRouters(key).default || modulesRouters(key)

        myConstantRoutes.push(...imported.constantRoutes);

        imported.asyncRoutes.forEach(routeItem => {
            if (typeof routeItem.position != 'undefined' &&
                routeItem.position >= 0 &&
                routeItem.position < myAsyncRoutes.length) {
                myAsyncRoutes.splice(routeItem.position, 0, routeItem)
            } else {
                myAsyncRoutes.push(routeItem)
            }
        })
    })
}
loadModulesRouters();

export const constantRoutes = myConstantRoutes;
export const asyncRoutes = myAsyncRoutes;

const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router
