import request from '@/utils/request'

export function getCaptchaRequired(data) {
    return request.get('/captcha/required', data)
}

export function getCaptcha(data) {
    return request.get('/captcha', data)
}
