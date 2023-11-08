<template>
	<div class="app-container anal-module-heat">
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

        <bar-chart
            ref="barChart"
            v-loading="data.loading"
            height="300px"
            :data-types="data.chartData.types"
            :data="data.chartData.data"
            :x-labels="data.chartData.xLabels"
            :x-axis-label-rotate="355"
            :legend-orient="'horizontal'"
            :legend-item-width="35"
            :legend-align-horz="'center'"
            :legend-align-vert="'bottom'"
            :legend-show-tooltip="false"
            :legend-max-len="20"
        />

        <div class="module-heat-tool">
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
            :data="data.currPageList"
            fit
            stripe
            style="width: 100%; margin-top: 15px;"
        >
            <el-table-column label="产品名称" align="center" min-width="160">
                <template slot-scope="{ row }">
                    <span>{{ row.ProductName }}</span>
                </template>
            </el-table-column>
            <el-table-column label="功能模块" align="center" width="180">
                <template slot-scope="{ row }">
                    <span>{{ row.ModuleName }}</span>
                </template>
            </el-table-column>
            <el-table-column label="访问次数" align="center" min-width="120">
                <template slot-scope="{ row }">
                    <span>{{ row.VisitTimes }}</span>
                </template>
            </el-table-column>
            <el-table-column label="访问人数" align="center" min-width="80">
                <template slot-scope="{ row }">
                    <span>{{ row.VisitUsers }}</span>
                </template>
            </el-table-column>
        </el-table>

        <pagination
            v-show="data.list && data.list.length > 0"
            :total="data.list ? data.list.length : 0"
            :page.sync="data.queryParams.pageindex"
            :limit.sync="data.queryParams.pagesize"
            @pagination="getPageData"
        />
    </div>
</template>

<script>
import ProductSelect from "@/components/ProductSelect";
import BarChart from '@/components/Charts/BarChart'
import Pagination from "@/components/Pagination";
import {
	getStatsModuleHeat
} from '@/api/extend'

export default {
    name: 'ModuleHeat',
    components: { ProductSelect, BarChart, Pagination },
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
            data: {
                loading: false,
                queryParams: {
                    pageindex: 1,
                    pagesize: 20
                },
                list: [],
                currPageList: [],
                chartData: {
                    types: [],
                    xLabels: [],
                    data: []
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
        doSearch() {
            this.data.queryParams.pageindex = 1;
            this.loadData();
        },
        getPageData() {
			const start = this.data.queryParams.pagesize *
				(this.data.queryParams.pageindex - 1);
			let end = this.data.queryParams.pagesize *
				this.data.queryParams.pageindex;
			if (this.data.list) {
				if (this.data.list.length >= start) {
					if (this.data.list.length < end) {
						end = this.data.list.length;
					}
					this.data.currPageList = this.data.list.slice(start, end);
					return;
				}
			}

			this.data.currPageList = null;
        },
        genChartData() {
			this.data.chartData.types = ['访问次数', '访问人数'];
			this.data.chartData.xLabels = [];
			this.data.chartData.data = [];

            for (let i = 0; i < Math.min(20, this.data.list.length); i++) {
                const item = this.data.list[i];
				this.data.chartData.xLabels.push(item.ModuleName);
				this.data.chartData.data.push([item.VisitTimes, item.VisitUsers]);
            }
        },
        loadData() {
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

			getStatsModuleHeat(data)
				.then(res => {
					this.data.list = res.data;
                    this.genChartData();
                    this.getPageData();
				})
				.finally(() => {
					this.data.loading = false;
				})
        },
        export2Excel() {
			if (this.data.list &&
				this.data.list.length > 0) {
				const exportData = [];
				this.data.list.forEach((item, index) => {
					exportData.push([
						index + 1,
						item.ProductName,
                        item.ModuleName,
						item.VisitTimes,
						item.VisitUsers
					])
				});

				import('@/vendor/Export2Excel').then(excel => {
					excel.export_json_to_excel({
						header: ['序号', '产品名称', '功能模块', '访问次数', '访问人数'],
						filename: '功能访问热度汇总报表-' + this.$moment(new Date()).format("YYYYMMDD"),
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
.module-heat-tool {
	margin: 30px 5px 0 0;
	display: flex;
	justify-content: right;
	align-items: center;
}

.module-heat-tool .tool-button {
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

.anal-module-heat .export-icon {
    margin: 0 5px 0 0;
    color: #2a86ff;
    cursor: pointer;
}
</style>
