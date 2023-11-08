<template>
  <el-popover
    v-model="selectPanelVisible"
    placement="bottom"
    :trigger="'hover'"
    :visible-arrow="false"
    :popper-class="'fontsize-panel'"
    class="fontsize-container"
  >
    <el-menu
      background-color="#1e222d"
      text-color="#c1c6c8"
      active-text-color="#c1c6c8"
      class="fontsize-menu"
      @select="handleSetSize"
    >
      <el-menu-item
        v-for="item of sizeOptions"
        :key="item.value"
        :index="item.value"
        :disabled="size===item.value"
      >
        <span slot="title">{{ item.label }}</span>
      </el-menu-item>
    </el-menu>
    <div slot="reference" style="margin: 0 10px;">
      <svg-icon class-name="size-icon" icon-class="size" style="color: #c1c6c8;" />
    </div>
  </el-popover>
</template>

<script>
import { getSize } from '../../utils/globalsize'

export default {
  data() {
    return {
      selectPanelVisible: false,
      sizeOptions: [
        { label: '默认大小', value: 'default' },
        { label: '中号字体', value: 'medium' },
        { label: '小号字体', value: 'small' },
        { label: '迷你字体', value: 'mini' }
      ]
    }
  },
  computed: {
    size() {
      return getSize()
    }
  },
  methods: {
    handleSetSize(size) {
      this.selectPanelVisible = false;
      this.$ELEMENT.size = size
      this.$store.dispatch('app/setSize', size)
      this.refreshView()
      this.$message({
        message: '字号切换成功！',
        type: 'success'
      })
    },
    refreshView() {
      // In order to make the cached page re-rendered
      this.$store.dispatch('tagsView/delAllCachedViews', this.$route)

      const { fullPath } = this.$route

      this.$nextTick(() => {
        this.$router.replace({
          path: '/redirect' + fullPath
        })
      })
    }
  }

}
</script>

<style>
.fontsize-container {
  margin: 0 !important;
  padding: 0 !important;
}

.fontsize-panel {
  margin: 0 -5px 0 0 !important;
  padding: 10px 0 10px 0;
  width: 80px !important;
  border-radius: 0;
  border: none;
  background-color: #1e222d;
  color: #c1c6c8;
}

.fontsize-menu {
  border-right: none;
}

.fontsize-menu .el-menu-item {
  height: 32px;
  line-height: 32px;
}

.fontsize-menu .el-menu-item:hover {
  background-color: #344258 !important;
}
</style>
