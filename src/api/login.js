import request from '@/utils/request'
import store from '@/store'
import { resetRouter } from '@/router'
import { removeToken } from '@/utils/auth'

export function login(data) {
    return request({
      url: '/account/login/password',
      method: 'post',
      data
    })
}

export function loginByMobile(data, verifycode) {
  return request({
    url: '/account/login/mobile',
    method: 'post',
    headers: {
      "Sms": verifycode
    },
    data
  })
}

export async function validate(data) {
  return new Promise(resolve => {
    request({
      url: '/account/login/validate',
      method: 'get',
      params: data
    }).then(res => {
      if (res.code == 0) {
        resolve(res.data.token)
      } else {
        resolve(null)
      }
    }).catch(() => {
      resolve(null)
    })
  });
}

export function resetPass(id, data) {
  return request({
      url: `/resetpass/${id}`,
      method: 'post',
      data
  })
}

export function changePass(data) {
  return request({
    url: '/changepass',
    method: 'post',
    data
  })
}

export async function logout(data) {
  return new Promise((resolve, reject) => {
    request({
      url: '/account/logout',
      method: 'post',
      data
    });

    removeToken()
    store.commit('user/SET_ROLES', [])

    resetRouter()

    store.dispatch('tagsView/delAllViews', null, { root: true })

    resolve()
  })
}

export async function getLoginInfo() {
  return new Promise((resolve, reject) => {
    request({
      url: '/account/login/info',
      method: 'get'
    }).then(res => {
      if (res.code == 0) {
        resolve(res.data)
      } else {
        reject(res.error)
      }
    }).catch(err => {
      reject(err)
    })
  })
}
