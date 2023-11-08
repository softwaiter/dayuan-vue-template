<template>
	<div class="app-container anal-user-duration">
		<div class="filter-container">
			<product-select
				v-model="selectedProduct"
				placeholder="全部产品"
				style="width: 220px; margin: 0 10px 0 0;"
				@changed="doSearch"
			/>
			<org-select
				v-if="$visible('anal_user_duration_everyorg')"
				v-model="selectedOrg"
				style="width: 250px; margin: 0 10px 0 0;"
				@changed="orgSelectChanged"
			/>
			<user-select
				v-if="$visible('anal_user_duration_everyorg') || $visible('anal_user_duration_ownorg')"
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

		<bar-chart
			ref="barChart"
			height="300px"
			:data-types="data.chartData.types"
			:data="data.chartData.data"
			:x-labels="data.chartData.xLabels"
			:legend-orient="'horizontal'"
			:legend-item-width="35"
			:legend-align-horz="'center'"
			:legend-align-vert="'bottom'"
			:legend-show-tooltip="false"
			:legend-max-len="20"
			:tooltip-formatter="buildTooltip"
			@legendSelectChanged="legendSelectChanged"
		/>

		<div class="user-duration-tool">
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
			v-loading="data.loading"
			:data="data.tableList.currPageList"
			fit
			stripe
			style="width: 100%; margin-top: 15px;"
		>
			<el-table-column label="产品名称" align="center" min-width="200">
				<template slot-scope="{ row }">
                    <span>{{ row.ProductName }}</span>
				</template>
			</el-table-column>
			<el-table-column label="用户名称" align="center" min-width="150">
				<template slot-scope="{ row }">
					<span>{{ row.UserName }}</span>
				</template>
			</el-table-column>
			<el-table-column label="登录次数" align="center" min-width="150">
				<template slot-scope="{ row }">
					<span>{{ row.Times }}</span>
				</template>
			</el-table-column>
			<el-table-column label="使用时长" align="center" min-width="150">
				<template slot-scope="{ row }">
					<span>{{ getDurationText(row.Duration) }}</span>
				</template>
			</el-table-column>
			<el-table-column
				label="操作"
				align="center"
				width="120"
				fixed="right"
			>
				<template slot-scope="{ row }">
                    <el-link
						v-if="$visible('anal_user_duration_detail')"
                        type="primary"
                        :underline="false"
						@click="showDetail(row)"
                    >
                        查看详情
                    </el-link>
					<div v-else>--</div>
				</template>
			</el-table-column>
		</el-table>

		<pagination
			v-show="data.tableList.data && data.tableList.data.length > 0"
			:total="data.tableList.data ? data.tableList.data.length : 0"
			:page.sync="data.tableList.queryParams.pageindex"
			:limit.sync="data.tableList.queryParams.pagesize"
			@pagination="getPageData"
		/>

		<el-dialog
			ref="dlgUserDurationDetailList"
			v-el-drag-dialog
			:title="'用户使用时长详情'"
			width="720px"
			center
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="detail.showing"
            @open="$dialogReposition($refs['dlgUserDurationDetailList'])"
            @opened="$dialogReposition($refs['dlgUserDurationDetailList'])"
		>
			<el-table
				v-loading="detail.loading"
				:data="detail.currPageList"
				height="396"
				fit
				border
				stripe
			>
				<el-table-column label="产品名称" align="center" min-width="180">
					<template slot-scope="{ row }">
						<span>{{ row.ProductName }}</span>
					</template>
				</el-table-column>
				<el-table-column label="用户名称" align="center" min-width="120">
					<template slot-scope="{ row }">
						<span>{{ row.UserName }}</span>
					</template>
				</el-table-column>
				<el-table-column label="登录时间" align="center" width="160">
					<template slot-scope="{ row }">
						<span>{{ $moment(row.BeginTime).format("YYYY-MM-DD HH:mm:ss") }}</span>
					</template>
				</el-table-column>
				<el-table-column label="使用时长" align="center" min-width="120">
					<template slot-scope="{ row }">
						<span>{{ getDurationText(row.Duration) }}</span>
					</template>
				</el-table-column>
			</el-table>

			<pagination
				v-show="detail.data && detail.data.length > 0"
				:total="detail.data ? detail.data.length : 0"
				:page.sync="detail.queryParams.pageindex"
				:limit.sync="detail.queryParams.pagesize"
				@pagination="getDetailPageData"
			/>
		</el-dialog>
    </div>
</template>

<script>
import OrgSelect from "@/components/OrgSelect";
import UserSelect from "@/components/UserSelect";
import ProductSelect from "@/components/ProductSelect";
import BarChart from '@/components/Charts/BarChart'
import Pagination from "@/components/Pagination";
import {
	getExtendUserDuration
} from '@/api/extend'
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui

export default {
    name: "UserDuration",
    components: { OrgSelect, UserSelect, ProductSelect, BarChart, Pagination },
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
			data: {
				loading: false,
				source: [],
				chartData: {
					types: [],
					xLabels: [],
					data: []
				},
				tableList: {
					queryParams: {
						pageindex: 1,
						pagesize: 20
					},
					data: null,
					currPageList: []
				}
			},
			detail: {
				showing: false,
				loading: false,
				queryParams: {
					pageindex: 1,
					pagesize: 20
				},
				data: [],
				currPageList: []
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
		buildTooltip(params, ticket, callback) {
			if (params.length > 0) {
				let str = `<div>${params[0].name}`;
				params.forEach(item => {
					str += `<div>${item.seriesName}：${item.value}人次</div>`;
				})
				str += '</div>';
				return str;
			}
			return '';
		},
		legendSelectChanged(params) {
			this.genBarChartData(params.selected)
		},
		orgSelectChanged() {
			if (this.selectedUser == null) {
				this.doSearch();
			}
		},
		doSearch() {
			this.data.tableList.queryParams.pageindex = 1;
			this.loadData();
		},
		getDurationText(duration) {
			const days = Math.floor(duration / (24 * 3600));
			const duration2 = duration % (24 * 3600);
			const hours = Math.floor(duration2 / 3600);
			const duration3 = duration2 % 3600;
			const minutes = Math.floor(duration3 / 60);
			const seconds = Math.floor(duration3 % 60);

			let text = '';
			if (days > 0) {
				text += `${days}天`;
			}
			if (hours > 0) {
				text += `${hours}小时`;
			}
			if (minutes > 0) {
				text += `${minutes}分`;
			}
			if (seconds > 0) {
				text += `${seconds}秒`;
			}

			if (text != '') {
				return text;
			} else {
				return '<1秒';
			}
		},
		calcUseDuration() {
			this.data.source.forEach(item => {
				const start = new Date(item.BeginTime);
				const end = new Date(item.EndTime);
				const usedTime = end - start;
				item.Duration = Math.floor(usedTime / 1000);
			})
		},
		genBarChartData(selected) {
			this.data.chartData.types = [];
			this.data.chartData.xLabels = ['1秒-60秒', '1分钟-5分钟', '5分钟-10分钟', '10分钟-30分钟', '30分钟+'];
			this.data.chartData.data = [
				[], [], [], [], []
			];

			this.data.source.forEach(item => {
				let typeIndex = this.data.chartData.types.indexOf(item.ProductName);
				if (typeIndex < 0) {
					this.data.chartData.types.push(item.ProductName)
					typeIndex = this.data.chartData.types.length - 1;

					this.data.chartData.data[0].push(0);
					this.data.chartData.data[1].push(0);
					this.data.chartData.data[2].push(0);
					this.data.chartData.data[3].push(0);
					this.data.chartData.data[4].push(0);
				}

				if (!selected || (selected && selected[item.ProductName])) {
					if (item.Duration < 60) {
						this.data.chartData.data[0][typeIndex]++;
					} else if (item.Duration < 299) {
						this.data.chartData.data[1][typeIndex]++;
					} else if (item.Duration < 599) {
						this.data.chartData.data[2][typeIndex]++;
					} else if (item.Duration < 1799) {
						this.data.chartData.data[3][typeIndex]++;
					} else {
						this.data.chartData.data[4][typeIndex]++;
					}
				}
			})

			for (let i = this.data.chartData.data.length - 1; i >= 0; i--) {
				let needRemove = true;
				for (let j = 0; j < this.data.chartData.data[i].length; j++) {
					if (this.data.chartData.data[i][j] > 0) {
						needRemove = false;
						break;
					}
				}

				if (needRemove) {
					this.data.chartData.xLabels.splice(i, 1);
					this.data.chartData.data.splice(i, 1);
				}
			}
		},
		genTableList() {
			this.data.tableList.data = [];

			const getListItem = (prodCode, userCode) => {
				const foundItem = this.data.tableList.data
					.find(item => item.Product == prodCode && item.User == userCode);
				if (typeof foundItem != "undefined") {
					return foundItem;
				}

				return null;
			};

			this.data.source.forEach(item => {
				let listItem = getListItem(item.Product, item.User);
				if (listItem == null) {
					listItem = {
						Product: item.Product,
						ProductName: item.ProductName,
						Org: item.Org,
						OrgName: item.OrgName,
						User: item.User,
						UserName: item.UserName,
						Times: 0,
						Duration: 0
					};

					this.data.tableList.data.push(listItem);
				}

				listItem.Times++;
				listItem.Duration += item.Duration;
			});
		},
		getPageData() {
			const start = this.data.tableList.queryParams.pagesize *
				(this.data.tableList.queryParams.pageindex - 1);
			let end = this.data.tableList.queryParams.pagesize *
				this.data.tableList.queryParams.pageindex;
			if (this.data.tableList.data) {
				if (this.data.tableList.data.length >= start) {
					if (this.data.tableList.data.length < end) {
						end = this.data.tableList.data.length;
					}
					this.data.tableList.currPageList = this.data.tableList.data.slice(start, end);
					return;
				}
			}

			this.data.tableList.currPageList = null;
		},
		loadData() {
			this.data.loading = true;

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

			getExtendUserDuration(data)
				.then(res => {
					this.$refs["barChart"].clear()

					this.data.source = res.data.list;
					this.calcUseDuration();

					this.genBarChartData(null);
					this.genTableList();
					this.getPageData();
				})
				.finally(() => {
					this.data.loading = false;
				})
		},
		export2Excel() {
			if (this.data.tableList.data &&
				this.data.tableList.data.length > 0) {
				const exportData = [];
				this.data.tableList.data.forEach((item, index) => {
					exportData.push([
						index + 1,
						item.ProductName,
						item.UserName,
						item.Times,
						this.getDurationText(item.Duration)
					])
				});

				import('@/vendor/Export2Excel').then(excel => {
					excel.export_json_to_excel({
						header: ['序号', '产品名称', '用户名称', '登录次数', '使用时长'],
						filename: '用户使用时长统计报表-' + this.$moment(new Date()).format("YYYYMMDD"),
						data: exportData,
						autoWidth: true,
						bookType: 'xlsx'
					});
				});
			}
		},
		genDetailData(product, user) {
			this.detail.data = [];
			this.data.source.forEach(item => {
				if (item.Product == product && item.User == user) {
					this.detail.data.push(item);
				}
			});
		},
		getDetailPageData() {
			const start = this.detail.queryParams.pagesize *
				(this.detail.queryParams.pageindex - 1);
			let end = this.detail.queryParams.pagesize *
				this.detail.queryParams.pageindex;
			if (this.detail.data) {
				if (this.detail.data.length >= start) {
					if (this.detail.data.length < end) {
						end = this.detail.data.length;
					}
					this.detail.currPageList = this.detail.data.slice(start, end);
					return;
				}
			}

			this.detail.currPageList = null;
		},
		showDetail(row) {
			this.detail.showing = true;
			this.detail.loading = true;

			setTimeout(() => {
				this.genDetailData(row.Product, row.User);
				this.getDetailPageData();
				this.detail.loading = false;
			}, 100);
		}
	}
}
</script>

<style>
.user-duration-tool {
	margin: 30px 5px 0 0;
	display: flex;
	justify-content: right;
	align-items: center;
}

.user-duration-tool .tool-button {
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

.anal-user-duration .export-icon {
    margin: 0 5px 0 0;
    color: #2a86ff;
    cursor: pointer;
}
</style>
