<template>
	<div :key="forceRefresh" :class="{ 'has-logo': showLogo }">
		<logo v-if="showLogo" :collapse="isCollapse" />
		<el-scrollbar ref="sidebarScrollbar" wrap-class="scrollbar-wrapper">
			<el-menu
				ref="slidebar"
				:default-active="activeMenu"
				:collapse="isCollapse"
				:background-color="variables.menuBg"
				:text-color="variables.menuText"
				:unique-opened="uniqueOpen"
				:active-text-color="variables.subMenuActiveText"
				:collapse-transition="false"
				mode="vertical"
				@open="onMenuOpened"
				@close="onMenuClosed"
			>
				<sidebar-item
					v-for="route in permission_routes"
					:key="route.path"
					:item="route"
					:base-path="route.path"
				/>
			</el-menu>
		</el-scrollbar>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/styles/variables.scss";
import Cookies from 'js-cookie'

const defaultSettings = require('../../../settings.js')

export default {
	components: { SidebarItem, Logo },
	data() {
		return {
			forceRefresh: this.$store.getters.size
		}
	},
	computed: {
		...mapGetters(["permission_routes", "sidebar"]),
		activeMenu() {
			const route = this.$route;
			const { meta, path } = route;
			// if set path, the sidebar will highlight the path you set
			if (meta.activeMenu) {
				return meta.activeMenu;
			}
			return path;
		},
		showLogo() {
			return this.$store.state.settings.sidebarLogo;
		},
		variables() {
			return variables;
		},
		isCollapse() {
			return !this.sidebar.opened;
		},
		uniqueOpen() {
			return defaultSettings.sidebarUniqueOpen;
		}
	},
	watch: {
		$route(route) {
			this.forceRefresh = this.$store.getters.size;
		}
	},
	mounted() {
		if (this.sidebar.opened) {
			setTimeout(() => {
				this.permission_routes.forEach(item => {
					if (!item.hidden && item.children && item.children.length > 0) {
						try {
							let isExpand = defaultSettings.sidebarExpandAll;
							if (defaultSettings.sidebarKeepLastState) {
								const lastState = Cookies.get(defaultSettings.product + "sidebar_" + item.path + '_expanded');
								if (typeof lastState != "undefined") {
									isExpand = lastState == 1
								}
							}

							if (isExpand) {
								this.$refs.slidebar.open(item.path)
							}
						} catch (ex) {
							/* continue regardless of error */
						}
					}
				})
			})
		}
	},
	methods: {
		onMenuOpened(index, path) {
			Cookies.set(defaultSettings.product + "sidebar_" + path + '_expanded', 1);
		},
		onMenuClosed(index, path) {
			Cookies.set(defaultSettings.product + "sidebar_" + path + '_expanded', 0);
		}
	}
};
</script>
