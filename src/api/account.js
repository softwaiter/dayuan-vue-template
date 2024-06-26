import request from '@/utils/request'

export function getUploadAvatarUrl() {
  return process.env.VUE_APP_BASE_API + '/account/avatar/upload';
}

export function getAvatar() {
  return request.get('/account/avatar');
}

export function bindPhone(data, verifycode) {
    return request({
      url: '/account/bind/phone',
      method: 'post',
      headers: {
        "Sms": verifycode
      },
      data
    })
}

export function getBindEmailVerifycode(data) {
    return request.get('/account/bind/email/verifycode', data)
}

export function bindEmail(data) {
    return request({
        url: '/account/bind/email',
        method: 'post',
        data
      })
}

export function showWechatQRCode(elementId) {
  new WxLogin({
    self_redirect: false,
    id: elementId,
    appid: "替换成自己微信应用的AppId",
    scope: "snsapi_login",
    redirect_uri: encodeURIComponent(process.env.VUE_APP_BASE_API + "​/account/bind/wechat"),
    style: "white"
  })
}

export function getBindWechatState() {
  return request.get('/account/bind/wechat/state')
}

export function register(data, verifycode) {
  return request({
    url: '/account/register',
    method: 'post',
    headers: {
      "Sms": verifycode
    },
    data
  })
}
