import { logout } from '@/api/login'
import { resetRouter } from '@/router'
import { getToken, removeToken } from '@/utils/auth'

import defaultHeadImg from '@/assets/head/default.svg'

const state = {
    id: '',
    code: '',
    name: '',
    avatar: defaultHeadImg,
    roles: [],
    orgCode: '',
    orgName: ''
}

const mutations = {
    SET_ID: (state, id) => {
        state.id = id
    },
    SET_CODE: (state, code) => {
        state.code = code
    },
    SET_NAME: (state, name) => {
        state.name = name
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
        state.roles = roles
    },
    SET_ORGCODE: (state, code) => {
        state.orgCode = code
    },
    SET_ORGNAME: (state, name) => {
        state.orgName = name
    }
}

const actions = {
    setUserInfo({ commit }, userInfo) {
        commit('SET_ID', userInfo.Id)
        commit('SET_CODE', userInfo.Code)
        commit('SET_NAME', userInfo.Name)
        if (userInfo.Org != null) {
            commit('SET_ORGCODE', userInfo.Org.Code)
            commit('SET_ORGNAME', userInfo.Org.Name)
        } else {
            commit('SET_ORGCODE', '')
            commit('SET_ORGNAME', '')
        }
    },

    setAvatar({ commit }, avatar) {
        commit('SET_AVATAR', avatar)
    },

    setRoles({ commit }, roles) {
        commit('SET_ROLES', roles)
    },

    // user logout
    logout({ commit, state, dispatch }) {
        return new Promise((resolve, reject) => {
            const token = getToken();
            logout(token).then(() => {
                removeToken();
                commit('SET_ROLES', [])

                resetRouter()

                // reset visited views and cached views
                // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
                dispatch('tagsView/delAllViews', null, { root: true })

                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },

    // remove token
    resetToken({ commit }) {
        return new Promise(resolve => {
            removeToken();
            commit('SET_ROLES', [])
            resolve()
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
