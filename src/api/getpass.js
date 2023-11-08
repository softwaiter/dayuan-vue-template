import request from '@/utils/request'

export function getVerifyCode(data) {
    return request.get('/setpass/verifycode', data)
}

export function setPassByMobile(data, verifycode) {
    return request({
        url: '/setpass/mobile',
        method: 'post',
        headers: {
            "Sms": verifycode
        },
        data
    })
}

export function setPassByEmail(data) {
    return request({
        url: '/setpass/email',
        method: 'post',
        data
    })
}
