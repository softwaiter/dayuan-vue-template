const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  routeSubtitle: state => state.app.routeSubtitle,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  avatar: state => state.user.avatar,
  userid: state => state.user.id,
  account: state => state.user.code,
  name: state => state.user.name,
  roles: state => state.user.roles,
  orgCode: state => state.user.orgCode,
  orgName: state => state.user.orgName,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs
}
export default getters
