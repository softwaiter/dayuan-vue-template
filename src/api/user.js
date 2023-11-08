import request from '@/utils/request'

export function getUsers(data) {
    return request.get('/user', data)
}

export function saveUser(data) {
    return request({
        url: '/user',
        method: 'post',
        data
    })
}

export function updateUser(id, data) {
    return request({
        url: `/user/${id}`,
        method: 'put',
        data
    })
}

export function deleteUser(id) {
    return request({
        url: `/user/${id}`,
        method: 'delete'
    })
}

export function getUserDetail(id) {
    return request({
        url: `/user/${id}`,
        method: 'get'
    })
}
