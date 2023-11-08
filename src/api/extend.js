import request from '@/utils/request'

export function getExtendProducts(data) {
    return request.get('/extend/product', data)
}

export function getExtendModules(data) {
    return request.get('/extend/module', data)
}

export function getExtendPermissions(data) {
    return request.get('/extend/permission', data)
}

export function getExtendRoles(data) {
    return request.get('/extend/role', data)
}

export function getExtendActivityUsers(data) {
    return request.get('/extend/user/activities', data);
}

export function getExtendUserDuration(data) {
    return request.get('/extend/user/duration', data);
}

export function getStatsProductHeat(data) {
    return request.get('/extend/product/heat', data);
}

export function getStatsProductHeatPerday(data) {
    return request.get('/extend/product/heat/perday', data);
}

export function getStatsModuleHeat(data) {
    return request.get('/extend/module/heat', data);
}
