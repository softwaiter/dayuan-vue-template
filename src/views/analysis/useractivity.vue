<template>
	<div class="app-container anl-user-activity">
		<div class="filter-container">
			<product-select
				v-model="selectedProduct"
				placeholder="全部产品"
				style="width: 220px; margin: 0 10px 0 0;"
				@changed="doSearch"
			/>
			<org-select
				v-if="$visible('anal_user_activity_everyorg')"
				v-model="selectedOrg"
				style="width: 250px; margin: 0 10px 0 0;"
				@changed="orgSelectChanged"
			/>
			<user-select
				v-if="$visible('anal_user_activity_everyorg') || $visible('anal_user_activity_ownorg')"
				v-model="selectedUser"
				:org="selectedOrg"
				style="width: 150px; margin: 0 10px 0 0;"
				@changed="doSearch"
			/>
			<el-date-picker
                ref="datePicker"
				v-model="selectedDateRange"
				:clearable="false"
                type="daterange"
				align="right"
				unlink-panels
				range-separator="至"
				start-placeholder="开始日期"
				end-placeholder="结束日期"
				style="width: 350px;"
				:picker-options="pickerOptions"
				@change="doSearch()"
			/>
        </div>

		<line-chart
			v-loading="userinfo.activity.loading"
			height="300px"
			:title-show="false"
			:data-types="['新增用户', '活跃用户']"
			:data="userinfo.activity.data"
			:x-labels="userinfo.activity.xLabels"
			:x-axis-label-rotate="350"
			:grid-top="15"
			:grid-bottom="45"
			:grid-right="17"
			:legend-orient="'horizontal'"
			:legend-item-width="35"
			:legend-align-horz="'center'"
			:legend-align-vert="'bottom'"
			:legend-show-tooltip="false"
		/>

		<div class="user-activity-tool">
			<div class="tool-button" @click="export2Excel">
				<svg-icon icon-class="fastapi-export-excel" class="export-icon" />
				<el-link
					type="primary"
					:underline="false"
				>
					导出数据列表
				</el-link>
			</div>
		</div>

		<el-table
			v-loading="userinfo.activity.loading"
			:data="userinfo.activity.currPageList"
			fit
			stripe
			style="width: 100%; margin-top: 15px;"
		>
			<el-table-column label="活跃日期" align="center" min-width="150">
				<template slot-scope="{ row }">
                    <span>{{
                        $moment(row.CreateTime).format("YYYY-MM-DD")
                    }}</span>
				</template>
			</el-table-column>
			<el-table-column label="活跃用户数" align="center" min-width="150">
				<template slot-scope="{ row }">
					<span>{{ row.ActiveCount }}</span>
				</template>
			</el-table-column>
			<el-table-column label="新增用户数" align="center" min-width="150">
				<template slot-scope="{ row }">
					<span>{{ row.NewCount }}</span>
				</template>
			</el-table-column>
			<el-table-column label="活跃构成(新用户占比)" align="center" min-width="150">
				<template slot-scope="{ row }">
					<span v-if="row.NewCount > 0">{{ (row.NewCount / row.ActiveCount * 100).toFixed(0) }}%</span>
					<span v-else>0%</span>
				</template>
			</el-table-column>
			<el-table-column
				label="操作"
				align="center"
				width="180"
				fixed="right"
			>
				<template slot-scope="{ row }">
                    <el-link
						v-if="$visible('anal_user_activity_detail') && row.ActiveCount > 0"
                        type="primary"
                        :underline="false"
                        @click="showDetail(row)"
                        >
                        查看用户详情
                    </el-link>
					<div v-else>--</div>
				</template>
			</el-table-column>
		</el-table>

		<pagination
			v-show="userinfo.activity.source && userinfo.activity.source.length > 0"
			:total="userinfo.activity.source ? userinfo.activity.source.length : 0"
			:page.sync="userinfo.activity.queryParams.pageindex"
			:limit.sync="userinfo.activity.queryParams.pagesize"
			@pagination="getPageData"
		/>

		<el-dialog
			ref="dlgActivityUsersDetailList"
			v-el-drag-dialog
			:title="'活跃用户详情'"
			width="720px"
			center
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="userinfo.detail.showing"
            @open="$dialogReposition($refs['dlgActivityUsersDetailList'])"
            @opened="$dialogReposition($refs['dlgActivityUsersDetailList'])"
		>
			<el-table
				v-loading="userinfo.detail.loading"
				:data="userinfo.detail.data.list"
				height="396"
				fit
				border
				stripe
			>
				<el-table-column label="活跃日期" align="center" width="150">
					<template slot-scope="{ row }">
						<span>{{
							$moment(row.ActiveDate).format("YYYY-MM-DD")
						}}</span>
					</template>
				</el-table-column>
				<el-table-column label="用户账号" align="center" min-width="150">
					<template slot-scope="{ row }">
						<span>{{ row.User.Code }}</span>
					</template>
				</el-table-column>
				<el-table-column label="用户名称" align="center" min-width="150">
					<template slot-scope="{ row }">
						<span>{{ row.User.Name }}</span>
					</template>
				</el-table-column>
				<el-table-column label="登录次数" align="center" width="100">
					<template slot-scope="{ row }">
						<span>{{ row.LoginTimes }}</span>
					</template>
				</el-table-column>
				<el-table-column label="新用户" align="center" width="100">
					<template slot-scope="{ row }">
						<span>{{ row.User.CreateDate == row.ActiveDate ? '是' : '--' }}</span>
					</template>
				</el-table-column>
			</el-table>

			<pagination
				v-show="userinfo.detail.data.total > 0"
				:total="userinfo.detail.data.total"
				:page.sync="userinfo.detail.data.queryParams.pageindex"
				:limit.sync="userinfo.detail.data.queryParams.pagesize"
				@pagination="queryDetailList"
			/>
		</el-dialog>
    </div>
</template>

<script>
import OrgSelect from "@/components/OrgSelect";
import UserSelect from "@/components/UserSelect";
import ProductSelect from "@/components/ProductSelect";
import LineChart from '@/components/Charts/LineChart'
import Pagination from "@/components/Pagination";
import {
    getUserActivityInfo
} from '@/api/analysis'
import {
	getExtendActivityUsers
} from '@/api/extend'
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui

export default {
    name: "UserActivity",
    components: { OrgSelect, UserSelect, ProductSelect, LineChart, Pagination },
	directives: { elDragDialog },
    data() {
        return {
			pickerOptions: {
          		shortcuts: [{
            		text: '近一周',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
              			picker.$emit('pick', [start, end]);
            		}
          		}, {
            		text: '近一个月',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 29);
              			picker.$emit('pick', [start, end]);
            		}
          		}, {
            		text: '近三个月',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 89);
              			picker.$emit('pick', [start, end]);
            		}
          		}, {
            		text: '近半年',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 179);
              			picker.$emit('pick', [start, end]);
            		}
          		}, {
            		text: '近一年',
            		onClick(picker) {
              			const end = new Date();
              			const start = new Date();
              			start.setTime(start.getTime() - 3600 * 1000 * 24 * 359);
              			picker.$emit('pick', [start, end]);
            		}
          		}]
        	},
			selectedOrg: null,
			selectedUser: null,
			selectedProduct: null,
			selectedDateRange: '',
            userinfo: {
                activity: {
                    loading: false,
					source: null,
					currPageList: [],
					queryParams: {
						pageindex: 1,
						pagesize: 20
					},
                    xLabels: [],
                    data: []
                },
				detail: {
					showing: false,
					loading: false,
					data: {
						queryParams: {
							pageindex: 1,
							pagesize: 20
						},
						list: [],
						total: 0
					}
				}
            }
        }
    },
    mounted() {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
        this.selectedDateRange = [start, end];

		setTimeout(() => {
			this.loadData();
		})
    },
    methods: {
		orgSelectChanged() {
			if (this.selectedUser == null) {
				this.doSearch();
			}
		},
		getPageData() {
			const start = this.userinfo.activity.queryParams.pagesize *
				(this.userinfo.activity.queryParams.pageindex - 1);
			let end = this.userinfo.activity.queryParams.pagesize *
				this.userinfo.activity.queryParams.pageindex;
			if (this.userinfo.activity.source) {
				if (this.userinfo.activity.source.length >= start) {
					if (this.userinfo.activity.source.length < end) {
						end = this.userinfo.activity.source.length;
					}
					this.userinfo.activity.currPageList = this.userinfo.activity.source.slice(start, end);
					return;
				}
			}

			this.userinfo.activity.currPageList = null;
		},
        doSearch() {
			this.userinfo.activity.queryParams.pageindex = 1;
			this.loadData();
        },
		loadData() {
			this.userinfo.activity.loading = true;

			const start = this.$moment(this.selectedDateRange[0]).format("YYYY-MM-DD") + " 00:00:00";
			const end = this.$moment(this.selectedDateRange[1]).format("YYYY-MM-DD") + " 23:59:59";

			const data = {
				params: {
					prod: this.selectedProduct,
					org: this.selectedOrg,
					user: this.selectedUser,
					start,
					end
				}
			}

			getUserActivityInfo(data)
				.then(res => {
                    const labels = []
                    const data1 = []
                    const data2 = []

                    if (res.code == 0 && res.data != null && res.data.length) {
						this.userinfo.activity.source = res.data;

                        res.data.forEach(item => {
                            labels.push(item.CreateTime);
                            data1.push(item.NewCount);
                            data2.push(item.ActiveCount)
                        });

						this.userinfo.activity.source.reverse();
                    }

                    this.userinfo.activity.xLabels = labels;
                    this.userinfo.activity.data = [data1, data2]
				})
				.finally(() => {
					this.getPageData();

					this.userinfo.activity.loading = false;
				})
		},
		queryDetailList(time) {
			this.userinfo.detail.data.list = [];
			this.userinfo.detail.data.total = 0;

			this.userinfo.detail.loading = true;

			const data = {
				params: {
					prod: this.selectedProduct,
					org: this.selectedOrg,
					user: this.selectedUser,
					time
				}
			}

			getExtendActivityUsers(data)
				.then(res => {
					this.userinfo.detail.data.list = res.data.list;
					this.userinfo.detail.data.total = res.data.total
				})
				.finally(() => {
					this.userinfo.detail.loading = false;
				})
		},
		showDetail(row) {
			this.userinfo.detail.showing = true;

			this.queryDetailList(row.CreateTime)
		},
		export2Excel() {
			if (this.userinfo.activity.source &&
				this.userinfo.activity.source.length > 0) {
				const exportData = [];
				this.userinfo.activity.source.forEach((item, index) => {
					exportData.push([
						index + 1,
						item.CreateTime,
						item.ActiveCount,
						item.NewCount,
						item.NewCount > 0 ? (item.NewCount / item.ActiveCount * 100).toFixed(0) + '%' : '0%'
					]);
				})

				import('@/vendor/Export2Excel').then(excel => {
					excel.export_json_to_excel({
						header: ['序号', '活跃日期', '活跃用户数', '新增用户数', '活跃构成（新用户占比）'],
						filename: '用户活跃度统计报表-' + this.$moment(new Date()).format("YYYYMMDD"),
						data: exportData,
						autoWidth: true,
						bookType: 'xlsx'
					});
				});
			}
		}
    }
}
</script>

<style>
.user-activity-tool {
	margin: 30px 5px 0 0;
	display: flex;
	justify-content: right;
	align-items: center;
}

.user-activity-tool .tool-button {
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

.anl-user-activity .export-icon {
    margin: 0 5px 0 0;
    color: #2a86ff;
    cursor: pointer;
}
</style>
