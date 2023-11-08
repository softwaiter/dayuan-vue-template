import request from '@/utils/request'

export function getOrgs(data) {
    return request.get('/org', data)
}

export function saveOrg(data) {
    return request({
        url: '/org',
        method: 'post',
        data
    })
}

export function updateOrg(id, data) {
    return request({
        url: `/org/${id}`,
        method: 'put',
        data
    })
}

export function deleteOrg(id) {
    return request({
        url: `/org/${id}`,
        method: 'delete'
    })
}
