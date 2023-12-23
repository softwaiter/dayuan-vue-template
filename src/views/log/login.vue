<template>
    <div class="app-container">
		<div class="filter-container">
			<org-select
				v-if="$visible('loginlog_everyorg')"
				v-model="selectedOrg"
				style="width: 280px; margin: 0 10px 0 0;"
				@changed="orgSelectChanged"
			/>
			<user-select
				v-if="$visible('loginlog_everyorg') || $visible('loginlog_ownorg')"
				v-model="selectedUser"
				:org="selectedOrg"
				style="width: 160px; margin: 0 10px 0 0;"
				@changed="userSelectChanged"
			/>
			<product-select
				v-model="selectedProduct"
				:org="selectedOrg"
				:user="selectedUser"
				style="width: 250px; margin: 0 10px 0 0;"
				@changed="doSearch"
			/>
			<el-date-picker
				v-model="selectedDateRange"
				type="daterange"
				align="right"
				unlink-panels
				clearable
				range-separator="至"
				start-placeholder="开始日期"
				end-placeholder="结束日期"
				style="width: 350px;"
				:picker-options="pickerOptions"
				@change="doSearch()"
			/>
		</div>

		<el-table
			v-loading="list.loading"
			:data="list.data"
			border
			fit
			stripe
			style="width: 100%"
		>
			<el-table-column label="登录机构" align="center" width="250">
				<template slot-scope="{ row }">
					<span v-if="row.OrgName">{{ row.OrgName }}</span>
                    <span v-else>--</span>
				</template>
			</el-table-column>
			<el-table-column label="登录用户" align="center" width="180">
				<template slot-scope="{ row }">
					<span v-if="row.UserName">{{ row.UserName }}</span>
                    <span v-else>--</span>
				</template>
			</el-table-column>
			<el-table-column label="登录产品" align="center" min-width="250">
				<template slot-scope="{ row }">
					<span v-if="row.ProductName">{{ row.ProductName }}</span>
                    <span v-else>--</span>
				</template>
			</el-table-column>
			<el-table-column label="登录方式" align="center" width="100">
				<template slot-scope="{ row }">
					{{ getLoginModeText(row.Mode) }}
				</template>
			</el-table-column>

			<el-table-column label="IP地址" align="center" width="200">
				<template slot-scope="{ row }">
					<span>{{ row.ClientIP }}</span>
				</template>
			</el-table-column>
			<el-table-column label="登录时间" align="center" width="160">
				<template slot-scope="{ row }">
                    <span>{{
                        $moment(row.CreateTime).format("YYYY-MM-DD HH:mm:ss")
                    }}</span>
				</template>
			</el-table-column>
			<el-table-column label="平台" align="center" width="100">
				<template slot-scope="{ row }">
					<span>{{ row.Platform }}</span>
				</template>
			</el-table-column>
		</el-table>

		<pagination
			v-show="list.total > 0"
			:total="list.total"
			:page.sync="list.queryParams.pageindex"
			:limit.sync="list.queryParams.pagesize"
			@pagination="loadData"
		/>
    </div>
</template>

<script>
import OrgSelect from "@/components/OrgSelect";
import UserSelect from "@/components/UserSelect";
import ProductSelect from "@/components/ProductSelect";
import Pagination from "@/components/Pagination";
import { getLoginLogs } from "@/api/login-log";

export default {
	name: "SysLog",
	components: { OrgSelect, UserSelect, ProductSelect, Pagination },
	data() {
        return {
			pickerOptions: {
          		shortcuts: [{
            		text: '近一周',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              			picker.$emit('pick', [start, end]);
            		}
          		}, {
            		text: '近一个月',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              			picker.$emit('pick', [start, end]);
            		}
          		}, {
            		text: '近三个月',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              			picker.$emit('pick', [start, end]);
            		}
          		}, {
            		text: '近半年',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
              			picker.$emit('pick', [start, end]);
            		}
          		}, {
            		text: '近一年',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 360);
              			picker.$emit('pick', [start, end]);
            		}
          		}]
        	},
			selectedOrg: null,
			selectedUser: null,
			selectedProduct: null,
			selectProducts: {
					loading: false,
					list: []
			},
			selectedDateRange: '',
			list: {
				loading: false,
				queryParams: {
					search: "",
					pageindex: 1,
					pagesize: 20
				},
				data: [],
				total: 0
			},
			detail: {
				shownig: false,
				loading: true,
				currRow: null,
				data: []
			}
        }
    },
    beforeMount() {
		if (!this.$visible('loginlog_everyorg') && !this.$visible('loginlog_ownorg')) {
			this.selectedUser = this.$store.getters.account;
		}

        this.loadData();
    },
    methods: {
		getLoginModeText(mode) {
			if (mode == 0) {
				return "账户密码";
			} else if (mode == 1) {
				return "手机短信";
			} else if (mode == 2) {
				return "SIGN签名";
			} else if (mode == 3) {
				return "微信";
			} else if (mode == 4) {
				return "微信手机号";
			}
			return "其他";
		},
		orgSelectChanged() {
			if (this.selectedUser == null && this.selectedProduct == null) {
				this.doSearch();
			}
		},
		userSelectChanged() {
			if (this.selectedProduct == null) {
				this.doSearch();
			}
		},
		doSearch() {
			this.list.queryParams.pageindex = 1;
			this.loadData();
        },
		loadData() {
			this.list.loading = true;

			var data = {
				params: {
					pageindex: this.list.queryParams.pageindex,
					pagesize: this.list.queryParams.pagesize,
					gettotal: true,
					sort: "id_desc",
                    source: "Id,Org.Name,User.Name,Product.Name,ClientIP,CreateTime,Platform",
					where: ''
				}
			};

			if (this.selectedUser != null &&
				this.selectedUser.length > 0) {
				if (data.params.where.length > 0) {
					data.params.where += ' and ';
				}
				data.params.where += `User=${this.selectedUser}`;
			} else if (this.selectedOrg != null &&
				this.selectedOrg.length > 0) {
				if (data.params.where.length > 0) {
					data.params.where += ' and ';
				}
				data.params.where += `Org=${this.selectedOrg}`;
			}

            if (this.selectedProduct != null &&
                this.selectedProduct.length > 0) {
				if (data.params.where.length > 0) {
					data.params.where += ' and ';
				}
                data.params.where += `Product=${this.selectedProduct}`;
            }

			if (this.selectedDateRange != null &&
				this.selectedDateRange.length == 2) {
				const start = this.$moment(this.selectedDateRange[0]).format("YYYY-MM-DD") + " 00:00:00";
				const end = this.$moment(this.selectedDateRange[1]).format("YYYY-MM-DD") + " 23:59:59";
				data.params.where += ` and CreateTime*=${start},${end}`;
			}

			getLoginLogs(data)
				.then((response) => {
					this.list.data = response.data.list;
					this.list.total = response.data.total;
				})
				.finally(() => {
					this.list.loading = false;
				});
		}
    }
}
</script>
