import request from '@/utils/request'

export function getSmsCode(data) {
    return request.get('/sms', data)
}
