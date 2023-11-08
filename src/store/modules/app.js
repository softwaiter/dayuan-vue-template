import Cookies from 'js-cookie'

const defaultSettings = require('../../settings.js')

const state = {
  sidebar: {
    opened: Cookies.get(defaultSettings.product + '_sidebarStatus') ? !!+Cookies.get(defaultSettings.product + '_sidebarStatus') : !defaultSettings.sidebarCollapsed,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get(defaultSettings.product + '_size') || 'medium',
  routeSubtitle: ''
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set(defaultSettings.product + '_sidebarStatus', 1)
    } else {
      Cookies.set(defaultSettings.product + '_sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set(defaultSettings.product + '_sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set(defaultSettings.product + '_size', size)
  },
  SET_ROUTE_SUBTITLE: (state, subtitle) => {
    state.routeSubtitle = subtitle
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  setRouteSubtitle({ commit }, subtitle) {
    commit('SET_ROUTE_SUBTITLE', subtitle)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
