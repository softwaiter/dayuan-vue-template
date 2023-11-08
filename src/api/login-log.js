import request from '@/utils/request'

export function getLoginLogs(data) {
    return request.get('/log/login', data)
}

export function getLoginLogDetail(id) {
    return request({
        url: `/log/login/${id}`,
        method: 'get'
    })
}
