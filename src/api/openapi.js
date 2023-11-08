import request from '@/utils/request'

export function queryOpenApi(userid) {
    return request({
        url: '/openapi/' + userid,
        method: 'get'
    })
}

export function createOpenApi(userid) {
    return request({
        url: '/openapi/' + userid,
        method: 'post'
    })
}

export function recreateOpenApiSecret(userid) {
    return request({
        url: '/openapi/' + userid + '/secret',
        method: 'put'
    })
}

export function enableOpenApi(userid, data) {
    return request({
        url: '/openapi/' + userid + '/enable',
        method: 'put',
        data
    })
}
