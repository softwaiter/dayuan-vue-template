<template>
  <div :key="forceRefresh" :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
    </div>
  </div>
</template>

<script>
import RightPanel from '@/components/RightPanel'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { mapState } from 'vuex'
import { getSize } from '../utils/globalsize'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    TagsView
  },
  mixins: [ResizeMixin],
  data() {
		return {
			forceRefresh: this.$store.getters.size
		}
  },
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      showSettings: state => state.settings.showSettings,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
	watch: {
		$route(route) {
      this.forceRefresh = this.$store.getters.size;
		}
	},
  mounted() {
    this._resetSlidebarWidth();
  },
  updated() {
    this._resetSlidebarWidth();
  },
  methods: {
    _resetSlidebarWidth() {
      let dialogTitleFontSize = '18px'
      let formItemLabelFontSize = '14px';
      let linkFontSize = '14px';
      let tableCellLineHeight = '21px';
      let tableCellFontSize = '14px';
      let navbarHeight = '50px';
      let appContainerPadding = '20px';
      let slideWidth = '210px'
      let messageBoxWidth = '420px'
      const size = getSize();
      if (size == 'mini') {
        dialogTitleFontSize = '14px';
        formItemLabelFontSize = '12px';
        linkFontSize = '12px';
        tableCellLineHeight = '16px';
        tableCellFontSize = '12px';

        navbarHeight = '40px';
        appContainerPadding = '10px';
        slideWidth = '170px';

        messageBoxWidth = '380px'
      } else if (size == 'small') {
        dialogTitleFontSize = '15px';
        formItemLabelFontSize = '13px';
        linkFontSize = '13px';
        tableCellLineHeight = '18px';
        tableCellFontSize = '13px';

        navbarHeight = '45px';
        appContainerPadding = '15px';
        slideWidth = '190px';

        messageBoxWidth = '400px'
      }

      document.documentElement.style.setProperty('--dialog-title-fontsize', dialogTitleFontSize);
      document.documentElement.style.setProperty('--form-item-label-fontsize', formItemLabelFontSize);
      document.documentElement.style.setProperty('--link-fontsize', linkFontSize);
      document.documentElement.style.setProperty('--table-cell-lineheight', tableCellLineHeight);
      document.documentElement.style.setProperty('--table-cell-fontsize', tableCellFontSize);

      document.documentElement.style.setProperty('--navbar-height', navbarHeight);
      document.documentElement.style.setProperty('--app-container-padding', appContainerPadding);
      document.documentElement.style.setProperty('--slidebar-width', slideWidth);

      document.documentElement.style.setProperty('--message-box-width', messageBoxWidth);
    },
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 999;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
