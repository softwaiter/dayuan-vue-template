import request from '@/utils/request'

export function getGlobalSettings(data) {
    return request.get('/globalsetting', data)
}

export function getGlobalSetting(id) {
    return request({
        url: `/globalsetting/${id}`,
        method: 'get'
    })
}

export function saveGlobalSetting(data) {
    return request({
        url: '/globalsetting',
        method: 'post',
        data
    })
}

export function updateGlobalSetting(id, data) {
    return request({
        url: `/globalsetting/${id}`,
        method: 'put',
        data
    })
}

export function deleteGlobalSetting(id) {
    return request({
        url: `/globalsetting/${id}`,
        method: 'delete'
    })
}
