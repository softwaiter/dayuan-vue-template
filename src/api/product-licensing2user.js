import request from '@/utils/request'

export function getUserProductLicensings(data) {
    return request.get('/user/product', data)
}

export function saveUserProductLicensing(data) {
    return request({
        url: '/user/product',
        method: 'post',
        data
    })
}

export function updateUserProductLicensing(id, data) {
    return request({
        url: `/user/product/${id}`,
        method: 'put',
        data
    })
}

export function deleteUserProductLicensing(id) {
    return request({
        url: `/user/product/${id}`,
        method: 'delete'
    })
}
