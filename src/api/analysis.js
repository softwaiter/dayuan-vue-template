import request from '@/utils/request'

export function getOrgTotalInfo(data) {
    return request.get('/analysis/org/total', data)
}

export function getOrg30DayTrendsInfo(data) {
    return request.get('/analysis/org/trend/30day', data)
}

export function getUserTotalInfo(data) {
    return request.get('/analysis/user/total', data)
}

export function getUser30DayTrendsInfo(data) {
    return request.get('/analysis/user/trend/30day', data)
}

export function getUserActivityInfo(data) {
    return request.get('/analysis/user/activity', data);
}

export function getProductTotalInfo(data) {
    return request.get('/analysis/product/total', data)
}

export function getTop5ProductHot7Day(data) {
    return request.get('/analysis/product/hot/7day', data)
}

export function getProduct30DayTrendsInfo(data) {
    return request.get('/analysis/product/trend/30day', data)
}

export function getLogTotalInfo(data) {
    return request.get('/analysis/log/total', data)
}

export function getLog30DayTrendsInfo(data) {
    return request.get('/analysis/log/trend/30day', data)
}

export function getBlackWhieIpTotalInfo(data) {
    return request.get('/analysis/blackwhiteip/total', data)
}

export function getBlackWhiteIp30DayTrendInfo(data) {
    return request.get('/analysis/blackwhiteip/trend/30day', data)
}
