module.exports = {
  title: '大圆Admin前端开发模板（VUE版）',
  shortTitle: '前端开发模板（VUE）',

  /**
   * @type {boolean} true | false
   * @description Whether show the settings right-panel
   */
  showSettings: false,

  /**
   * @type {boolean} true | false
   * @description Whether need tagsView
   */
  tagsView: false,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: true,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: true,

  /**
   * 侧边栏同一时刻是否只能展开一项
   */
  sidebarUniqueOpen: false,

  /**
   * 侧边栏初始状态是否收起
   */
  sidebarCollapsed: false,

  /**
   * 侧边栏初始是否展开所有项
   */
  sidebarExpandAll: true,

  /**
   * 保留侧边栏最后展示状态
   */
  sidebarKeepLastState: true,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',

  showBindWechatInProfile: true,

  platform: 'web',

  service: 'dayuan_service',

  /**
   * 开发时应修改成对应产品编码
   */
  product: 'dayuan'
}
