import request from '@/utils/request'

export function getRoles(data) {
    return request.get('/role', data)
}

export function saveRole(data) {
    return request({
        url: '/role',
        method: 'post',
        data
    })
}

export function updateRole(id, data) {
    return request({
        url: `/role/${id}`,
        method: 'put',
        data
    })
}

export function deleteRole(id) {
    return request({
        url: `/role/${id}`,
        method: 'delete'
    })
}
