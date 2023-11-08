<template>
  <div class="sidebar-logo-container" :class="_getLogoContainerClass()">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 v-else class="sidebar-title">{{ title }} </h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 class="sidebar-title">{{ title }} </h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
import { getSize } from '../../../utils/globalsize'

const defaultSettings = require('../../../settings.js')

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: defaultSettings.shortTitle || defaultSettings.title,
      logo: require('@/assets/logo/dayuan_mini.png')
    }
  },
  methods: {
    _getLogoContainerClass() {
      let cls = 'sidebar-logo-container-' + getSize();
      if (this.collapse) {
        cls = 'collapse ' + cls;
      }
      return cls;
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container a {
  display: flex !important;
  flex-flow: row nowrap !important;
  align-items: center !important;
  justify-content: center !important;
}

.sidebar-logo-container a h1 {
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-logo-container-default,
.sidebar-logo-container-medium {
  height: 50px;
  line-height: 50px;

  & .sidebar-logo-link {
    & .sidebar-logo {
      width: 37px;
      height: 37px;
      margin-right: 12px;
    }

    & .sidebar-title {
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
    }
  }
}

.sidebar-logo-container-small {
  height: 45px;
  line-height: 45px;

  & .sidebar-logo-link {
    & .sidebar-logo {
      width: 30px;
      height: 30px;
      margin-right: 11px;
    }

    & .sidebar-title {
      font-weight: 600;
      line-height: 45px;
      font-size: 13px;
    }
  }
}

.sidebar-logo-container-mini {
  height: 40px;
  line-height: 40px;

  & .sidebar-logo-link {
    & .sidebar-logo {
      width: 28px;
      height: 28px;
      margin-right: 10px;
    }

    & .sidebar-title {
      font-weight: 600;
      line-height: 40px;
      font-size: 12px;
    }
  }
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  background: #262f3e;  //#192530 2b2f3a;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      vertical-align: middle;
      border-radius: 3px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
