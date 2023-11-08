<template>
	<div class="app-container anal-prod-heat">
		<div class="filter-container">
			<product-select
				v-model="selectedProduct"
				placeholder="全部产品"
				style="width: 220px; margin: 0 10px 0 0;"
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

		<el-tabs v-model="activeTabName" type="card" @tab-click="tabSelectChanged">
    		<el-tab-pane label="汇总分析" name="summary">
				<bar-chart
					v-if="activeTabName == 'summary'"
					ref="barChart"
					v-loading="data.loading"
					height="300px"
					:data-types="data.summary.types"
					:data="data.summary.chartData"
					:x-labels="data.summary.xLabels"
					:legend-orient="'horizontal'"
					:legend-item-width="35"
					:legend-align-horz="'center'"
					:legend-align-vert="'bottom'"
					:legend-show-tooltip="false"
					:legend-max-len="20"
				/>

				<div class="prod-heat-tool">
					<div class="tool-button" @click="exportSummary2Excel">
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
					:data="data.summary.list"
					fit
					stripe
					style="width: 100%; margin-top: 15px;"
				>
					<el-table-column label="产品名称" align="center" min-width="150">
						<template slot-scope="{ row }">
							<span>{{ row.ProductName }}</span>
						</template>
					</el-table-column>
					<el-table-column label="访问次数" align="center" min-width="150">
						<template slot-scope="{ row }">
							<span>{{ row.VisitTimes }}</span>
						</template>
					</el-table-column>
					<el-table-column label="访问人数" align="center" min-width="150">
						<template slot-scope="{ row }">
							<span>{{ row.VisitUsers }}</span>
						</template>
					</el-table-column>
				</el-table>
			</el-tab-pane>
    		<el-tab-pane label="明细分析" name="detail">
				<line-chart
					v-if="activeTabName == 'detail'"
					ref="lineChart"
					v-loading="data.loading"
					height="300px"
					:title-show="false"
					:data-types="data.detail.types"
					:data="data.detail.chartData"
					:x-labels="data.detail.xLabels"
					:x-axis-label-rotate="350"
					:grid-top="15"
					:grid-bottom="45"
					:grid-right="17"
					:legend-orient="'horizontal'"
					:legend-item-width="35"
					:legend-align-horz="'center'"
					:legend-align-vert="'bottom'"
					:legend-show-tooltip="false"
					:legend-max-len="20"
				/>

				<div class="prod-heat-tool">
					<div class="tool-button" @click="exportDetail2Excel">
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
					:data="data.detail.currPageList"
					fit
					stripe
					style="width: 100%; margin-top: 15px;"
				>
					<el-table-column label="产品名称" align="center" min-width="160">
						<template slot-scope="{ row }">
							<span>{{ row.ProductName }}</span>
						</template>
					</el-table-column>
					<el-table-column label="统计日期" align="center" width="150">
						<template slot-scope="{ row }">
							<span>{{ row.CreateTime }}</span>
						</template>
					</el-table-column>
					<el-table-column label="访问次数" align="center" min-width="100">
						<template slot-scope="{ row }">
							<span>{{ row.VisitTimes }}</span>
						</template>
					</el-table-column>
					<el-table-column label="访问人数" align="center" min-width="100">
						<template slot-scope="{ row }">
							<span>{{ row.VisitUsers }}</span>
						</template>
					</el-table-column>
				</el-table>

				<pagination
					v-show="data.detail.list && data.detail.list.length > 0"
					:total="data.detail.list ? data.detail.list.length : 0"
					:page.sync="data.detail.queryParams.pageindex"
					:limit.sync="data.detail.queryParams.pagesize"
					@pagination="getDetailPageData"
				/>
			</el-tab-pane>
  		</el-tabs>
    </div>
</template>

<script>
import ProductSelect from "@/components/ProductSelect";
import BarChart from '@/components/Charts/BarChart'
import LineChart from '@/components/Charts/LineChart'
import Pagination from "@/components/Pagination";
import {
	getStatsProductHeat, getStatsProductHeatPerday
} from '@/api/extend'

export default {
    name: "ProductHeat",
    components: { ProductSelect, BarChart, LineChart, Pagination },
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
			selectedProduct: null,
			selectedDateRange: '',
			activeTabName: 'summary',
			data: {
				loading: false,
				summary: {
					list: [],
					types: [],
					chartData: [],
					xLabels: []
				},
				detail: {
					list: [],
					types: [],
					chartData: [],
					xLabels: [],
					queryParams: {
						pageindex: 1,
						pagesize: 20
					},
					currPageList: []
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
			this.loadSummaryData();
		})
	},
	methods: {
		tabSelectChanged() {
			if (this.activeTabName == 'summary') {
				this.loadSummaryData();
			} else if (this.activeTabName == 'detail') {
				this.loadDetailData();
			}
		},
		doSearch() {
			if (this.activeTabName == 'summary') {
				this.loadSummaryData();
			} else if (this.activeTabName == 'detail') {
				this.data.detail.queryParams.pageindex = 1;
				this.loadDetailData();
			}
		},
		loadSummaryData() {
			this.data.loading = true;

			const start = this.$moment(this.selectedDateRange[0]).format("YYYY-MM-DD") + " 00:00:00";
			const end = this.$moment(this.selectedDateRange[1]).format("YYYY-MM-DD") + " 23:59:59";

			const data = {
				params: {
					prod: this.selectedProduct,
					start,
					end
				}
			}

			getStatsProductHeat(data)
				.then(res => {
					this.data.summary.list = res.data;
					this.genSummaryChartData();
				})
				.finally(() => {
					this.data.loading = false;
				})
		},
		genSummaryChartData() {
			this.data.summary.types = ['访问次数', '访问人数'];
			this.data.summary.xLabels = [];
			this.data.summary.chartData = [];

			this.data.summary.list.forEach(item => {
				this.data.summary.xLabels.push(item.ProductName);
				this.data.summary.chartData.push([item.VisitTimes, item.VisitUsers]);
			})
		},
		exportSummary2Excel() {
			if (this.data.summary.list &&
				this.data.summary.list.length > 0) {
				const exportData = [];
				this.data.summary.list.forEach((item, index) => {
					exportData.push([
						index + 1,
						item.ProductName,
						item.VisitTimes,
						item.VisitUsers
					])
				});

				import('@/vendor/Export2Excel').then(excel => {
					excel.export_json_to_excel({
						header: ['序号', '产品名称', '访问次数', '访问人数'],
						filename: '产品访问热度汇总报表-' + this.$moment(new Date()).format("YYYYMMDD"),
						data: exportData,
						autoWidth: true,
						bookType: 'xlsx'
					});
				});
			}
		},
		loadDetailData() {
			this.data.loading = true;

			const start = this.$moment(this.selectedDateRange[0]).format("YYYY-MM-DD") + " 00:00:00";
			const end = this.$moment(this.selectedDateRange[1]).format("YYYY-MM-DD") + " 23:59:59";

			const data = {
				params: {
					prod: this.selectedProduct,
					start,
					end
				}
			}

			getStatsProductHeatPerday(data)
				.then(res => {
					if (this.$refs["lineChart"]) {
						this.$refs["lineChart"].clear();
					}

					this.data.detail.list = res.data;
					this.genDetailChartData();
					this.getDetailPageData();
				})
				.finally(() => {
					this.data.loading = false;
				})
		},
		genDetailChartData() {
			this.data.detail.types = [];
			this.data.detail.xLabels = [];
			this.data.detail.chartData = [];

			this.data.detail.list.forEach(item => {
				let prodIndex = this.data.detail.types.indexOf(item.ProductName);
				if (prodIndex < 0) {
					this.data.detail.types.push(item.ProductName)
					prodIndex = this.data.detail.types.length - 1;
				}

				if (this.data.detail.xLabels.indexOf(item.CreateTime) < 0) {
					this.data.detail.xLabels.push(item.CreateTime)
				}

				if (prodIndex >= this.data.detail.chartData.length) {
					this.data.detail.chartData.push([]);
				}

				this.data.detail.chartData[prodIndex].push(item.VisitTimes);
			})

			this.data.detail.xLabels.reverse();
			this.data.detail.chartData.forEach(x => {
				x.reverse();
			});
		},
		getDetailPageData() {
			const start = this.data.detail.queryParams.pagesize *
				(this.data.detail.queryParams.pageindex - 1);
			let end = this.data.detail.queryParams.pagesize *
				this.data.detail.queryParams.pageindex;
			if (this.data.detail.list) {
				if (this.data.detail.list.length >= start) {
					if (this.data.detail.list.length < end) {
						end = this.data.detail.list.length;
					}
					this.data.detail.currPageList = this.data.detail.list.slice(start, end);
					return;
				}
			}

			this.data.detail.currPageList = null;
		},
		exportDetail2Excel() {
			if (this.data.detail.list &&
				this.data.detail.list.length > 0) {
				const exportData = [];
				this.data.detail.list.forEach((item, index) => {
					exportData.push([
						index + 1,
						item.ProductName,
						item.CreateTime,
						item.VisitUsers,
						item.VisitTimes
					])
				});

				import('@/vendor/Export2Excel').then(excel => {
					excel.export_json_to_excel({
						header: ['序号', '产品名称', '统计日期', '访问人数', '访问次数'],
						filename: '产品访问热度明细报表-' + this.$moment(new Date()).format("YYYYMMDD"),
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
.prod-heat-tool {
	margin: 30px 5px 0 0;
	display: flex;
	justify-content: right;
	align-items: center;
}

.prod-heat-tool .tool-button {
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

.anal-prod-heat .export-icon {
    margin: 0 5px 0 0;
    color: #2a86ff;
    cursor: pointer;
}
</style>
