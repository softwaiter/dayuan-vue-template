import request from '@/utils/request'

export function getLogs(data) {
    return request.get('/log', data)
}

export function getLogDetail(id) {
    return request({
        url: `/log/${id}`,
        method: 'get'
    })
}
