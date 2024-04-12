import request from '@/utils/request'

export function getModulePermissions(data) {
    return request.get('/module/permission', data)
}

export function saveModulePermissions(data) {
    return request({
        url: '/module/permission',
        method: 'post',
        data
    })
}

export function deleteModulePermissions(ids) {
    var deleteUrl = '/module/permission?';
    for (var i = 0; i < ids.length; i++) {
        deleteUrl += ("id=" + ids[i] + "&");
    }

    return request({
        url: deleteUrl,
        method: 'delete'
    })
}
