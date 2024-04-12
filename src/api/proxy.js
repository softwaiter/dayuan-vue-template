import request from '@/utils/request'

export function getProxys(data) {
    return request.get('/proxy', data)
}

export function saveProxy(data) {
    return request({
        url: '/proxy',
        method: 'post',
        data
    })
}

export function updateProxy(id, data) {
    return request({
        url: `/proxy/${id}`,
        method: 'put',
        data
    })
}

export function deleteProxy(id) {
    return request({
        url: `/proxy/${id}`,
        method: 'delete'
    })
}

export function reloadProxySettings() {
    return request({
        url: '/proxy/reload',
        method: 'post'
    })
}
