import request from '@/utils/request'

export function getProducts(data) {
    return request.get('/product', data)
}

export function saveProduct(data) {
    return request({
        url: '/product',
        method: 'post',
        data
    })
}

export function updateProduct(id, data) {
    return request({
        url: `/product/${id}`,
        method: 'put',
        data
    })
}

export function deleteProduct(id) {
    return request({
        url: `/product/${id}`,
        method: 'delete'
    })
}
