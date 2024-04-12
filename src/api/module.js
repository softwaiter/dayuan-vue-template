import request from '@/utils/request'

export function getModules(data) {
    return request.get('/module', data)
}

export function getModuleChildCount(data) {
    return request.get('/module/childcount', data)
}

export function saveModule(data) {
    return request({
        url: '/module',
        method: 'post',
        data
    })
}

export function updateModule(id, data) {
    return request({
        url: `/module/${id}`,
        method: 'put',
        data
    })
}

export function deleteModule(id) {
    return request({
        url: `/module/${id}`,
        method: 'delete'
    })
}
