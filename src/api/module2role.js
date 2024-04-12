import request from '@/utils/request'

export function getRoleModules(data) {
    return request.get('/role/module', data)
}

export function saveRoleModules(data) {
    return request({
        url: '/role/module',
        method: 'post',
        data
    })
}

export function deleteRoleModules(ids) {
    var deleteUrl = '/role/module?';
    for (var i = 0; i < ids.length; i++) {
        deleteUrl += ("id=" + ids[i] + "&");
    }

    return request({
        url: deleteUrl,
        method: 'delete'
    })
}
