<template>
  <div :key="forceRefresh" class="navbar" :class="_getNavbarHeightClass()">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <size-select id="size-select" class="right-menu-item hover-effect" />
      </template>

      <el-popover
        v-model="headPanelVisible"
        placement="bottom"
        width="360"
        :trigger="'hover'"
        :visible-arrow="false"
        :popper-class="'head-panel'"
        class="avatar-container right-menu-item hover-effect"
      >
        <div :class="_getAccountNameFontClass()" style="color: #c1c6c8; margin: 0 0 0 20px; line-height: 20px;">{{ this.$store.getters.name }}</div>
        <div style="font-size: 12px; color: #888; margin: 3px 0 0 20px; line-height: 20px;">账号ID：{{ this.$store.getters.account }}</div>
        <span class="menu-splitline" />
        <el-menu
          background-color="#1e222d"
          text-color="#c1c6c8"
          active-text-color="#c1c6c8"
          class="head-menu"
          @select="menuSelected"
        >
          <el-menu-item index="profile">
            <span slot="title" :class="_getMenuItemFontClass()">个人信息</span>
          </el-menu-item>
        </el-menu>
        <el-menu
          background-color="#1e222d"
          text-color="#c1c6c8"
          active-text-color="#c1c6c8"
          class="head-menu"
          @select="menuSelected"
        >
          <el-menu-item index="changePass">
            <span slot="title" :class="_getMenuItemFontClass()">修改密码</span>
          </el-menu-item>
        </el-menu>
        <span class="menu-splitline" />
        <el-menu
          background-color="#1e222d"
          text-color="#c1c6c8"
          active-text-color="#c1c6c8"
          class="head-menu"
          @select="menuSelected"
        >
          <el-menu-item index="logout">
            <span slot="title" :class="_getMenuItemFontClass()">退出登录</span>
          </el-menu-item>
        </el-menu>
        <div slot="reference" class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import { logout } from '@/api/login'
import { getSize, getSizeFontClass } from '../../utils/globalsize'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect
  },
  data() {
    return {
      forceRefresh: this.$store.getters.size,
      headPanelVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ])
  },
  watch: {
    $route(route) {
      this.forceRefresh = this.$store.getters.size;
    }
  },
  methods: {
    _getAccountNameFontClass() {
      return "account-name-label-" + getSize();
    },
    _getMenuItemFontClass() {
      return getSizeFontClass();
    },
    _getNavbarHeightClass() {
      return 'navbar-' + getSize();
    },
    _getRightMenuItemClass() {
      return 'right-menu-item-' + getSize();
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async menuSelected(index) {
      this.headPanelVisible = false;
      if (index == 'profile') {
        this.$router.push('/profile');
      } else if (index == 'changePass') {
        this.$router.push('/changepass');
      } else if (index == 'logout') {
        await logout()
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.account-name-label-default,
.account-name-label-medium {
  font-size: 16px;
}

.account-name-label-small {
  font-size: 15px;
}

.account-name-label-mini {
  font-size: 14px;
}

.navbar-default,
.navbar-medium {
  height: 50px;

  .hamburger-container {
    line-height: 46px;
  }

  .right-menu {
    line-height: 50px;

    .right-menu-item {
      font-size: 18px;
    }

    .avatar-container {
      .avatar-wrapper {
        margin-top: 10px;

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
        }
      }
    }
  }
}

.navbar-small {
  height: 45px;

  .account-name-label {
    font-size: 14px;
  }

  .hamburger-container {
    line-height: 42px;
  }

  .right-menu {
    line-height: 45px;

    .right-menu-item {
      font-size: 15px;
    }

    .avatar-container {
      .avatar-wrapper {
        margin-top: 9px;

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 14px;
        }
      }
    }
  }
}

.navbar-mini {
  height: 40px;

  .account-name-label {
    font-size: 12px;
  }

  .hamburger-container {
    line-height: 36px;
  }

  .right-menu {
    line-height: 40px;

    .right-menu-item {
      font-size: 12px;
    }

    .avatar-container {
      .avatar-wrapper {
        margin-top: 8px;

        .user-avatar {
          width: 24px;
          height: 24px;
          border-radius: 12px;
        }
      }
    }
  }
}

.navbar {
  overflow: hidden;
  position: relative;
  background: #262f3e;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);

  .hamburger-container {
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        position: relative;

        .user-avatar {
          cursor: pointer;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
