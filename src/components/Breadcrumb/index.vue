<template>
  <el-breadcrumb :class="_getBreadcrumbClass()" class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title + (index==levelList.length-1 ? $store.getters.routeSubtitle : '') }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import pathToRegexp from 'path-to-regexp'
import { getSize } from '../../utils/globalsize'

export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route(route) {
      this.$store.dispatch('app/setRouteSubtitle', '');
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    },
    "$store.getters.routeSubtitle": function() {
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    _getBreadcrumbClass() {
      return 'app-breadcrumb-' + getSize();
    },
    getBreadcrumb() {
      // only show routes with meta.title
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]

      if (!this.isDashboard(first)) {
        matched = [].concat(matched)
      }

      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb-default.el-breadcrumb,
.app-breadcrumb-medium.el-breadcrumb {
  font-size: 14px;
  line-height: 50px;
}

.app-breadcrumb-small.el-breadcrumb {
  font-size: 13px;
  line-height: 47px;
}

.app-breadcrumb-mini.el-breadcrumb {
  font-size: 12px;
  line-height: 42px;
}

.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  margin-left: 8px;

  .no-redirect {
    color: #c1c6c8;
    cursor: text;
  }
}
</style>
