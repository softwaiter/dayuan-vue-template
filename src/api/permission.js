import request from '@/utils/request'

export function getPermissions(data) {
    return request.get('/permission', data)
}

export function savePermission(data) {
    return request({
        url: '/permission',
        method: 'post',
        data
    })
}

export function updatePermission(id, data) {
    return request({
        url: `/permission/${id}`,
        method: 'put',
        data
    })
}

export function deletePermission(id) {
    return request({
        url: `/permission/${id}`,
        method: 'delete'
    })
}

export function reloadPermissionSettings() {
    return request({
        url: '/permission/reload',
        method: 'post'
    })
}
