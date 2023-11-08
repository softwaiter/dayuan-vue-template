<template>
	<div class="app-container">
		<div class="filter-container">
			<el-date-picker
				v-model="selectedDateRange"
				type="daterange"
				align="right"
				unlink-panels
				clearable
				range-separator="至"
				start-placeholder="开始日期"
				end-placeholder="结束日期"
				style="width: 380px;"
				:picker-options="pickerOptions"
				@change="doSearch()"
			/>
			<div class="filter-input" style="width: 450px; margin: 0 0 0 10px;">
				<el-input
					v-model="list.queryParams.search"
					placeholder="路由地址，支持模糊搜索"
					clearable
					@keyup.enter.native="doSearch()"
					@clear="doSearch()"
				>
					<el-button
						slot="append"
						icon="el-icon-search"
						@click="doSearch()"
					/>
				</el-input>
			</div>
		</div>

		<el-table
			v-loading="list.loading"
			:data="list.data"
			border
			fit
			stripe
			style="width: 100%"
		>
			<el-table-column label="所属产品" align="center" width="211">
				<template slot-scope="{ row }">
					<span v-if="row.ProductName">{{ row.ProductName }}</span>
                    <span v-else>--</span>
				</template>
			</el-table-column>
			<el-table-column label="功能" align="center" min-width="150">
				<template slot-scope="{ row }">
					<span v-if="row.ModuleName">{{ row.ModuleName }}</span>
                    <span v-else>--</span>
				</template>
			</el-table-column>
			<el-table-column label="路由" align="center" min-width="150">
				<template slot-scope="{ row }">
					<span>{{ row.Path }}</span>
				</template>
			</el-table-column>
			<el-table-column label="IP地址" align="center" width="130">
				<template slot-scope="{ row }">
					<span>{{ row.ClientIP }}</span>
				</template>
			</el-table-column>

			<el-table-column label="攻击类型" align="center" width="110">
				<template slot-scope="{ row }">
					<el-tag v-if="row.ExtType==0" type="warning">探针攻击</el-tag>
					<el-tag v-if="row.ExtType==1" type="warning">爬虫攻击</el-tag>
					<el-tag v-if="row.ExtType==2" type="warning">暴力提交</el-tag>
					<el-tag v-if="row.ExtType==3" type="danger">越权攻击</el-tag>
					<el-tag v-if="row.ExtType==4" type="danger">虚假IP攻击</el-tag>
					<el-tag v-if="row.ExtType==999">其他攻击</el-tag>
				</template>
			</el-table-column>

			<el-table-column label="来源机构" align="center" width="195">
				<template slot-scope="{ row }">
					<span v-if="row.OrgName">{{ row.OrgName }}</span>
                    <span v-else>--</span>
				</template>
			</el-table-column>
			<el-table-column label="操作用户" align="center" width="110">
				<template slot-scope="{ row }">
					<span v-if="row.UserName">{{ row.UserName }}</span>
                    <span v-else>--</span>
				</template>
			</el-table-column>
			<el-table-column label="日期和时间" align="center" width="160">
				<template slot-scope="{ row }">
                    <span>{{
                        $moment(row.CreateTime).format("YYYY-MM-DD HH:mm:ss")
                    }}</span>
				</template>
			</el-table-column>
			<el-table-column label="状态" align="center" width="75">
				<template>
					<el-tag type="success">
						已拦截
					</el-tag>
				</template>
			</el-table-column>
			<el-table-column
				label="操作"
				align="center"
				width="75"
				fixed="right"
			>
				<template slot-scope="{ row }">
                    <el-link
                        v-if="$visible('defenselog_detail')"
                        type="primary"
                        :underline="false"
                        @click="showLogDetail(row)"
                        >
                        详情
                    </el-link>
					<div v-else>--</div>
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

        <el-dialog
			v-el-drag-dialog
			:title="'日志详情'"
			fullscreen
			center
			:visible.sync="detail.shownig"
		>
			<div
				v-if="detail.currRow && detail.data"
				v-loading="detail.loading"
				class="log-detail-container"
			>
				<div class="log-detail-row">
					<div class="log-detail-lab">来源IP：</div>
					<div class="log-detail-value">{{ detail.data.ClientIP }}</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">来源平台：</div>
					<div class="log-detail-value">{{ detail.data.Platform }}</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">来源机构：</div>
					<div class="log-detail-value">{{ detail.currRow.OrgName }}（{{ detail.data.Org }}）</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">操作用户：</div>
					<div class="log-detail-value">{{ detail.currRow.UserName }}（{{ detail.data.User }}）</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">功能模块：</div>
					<div class="log-detail-value">{{ detail.data.User != '--' ? detail.currRow.ModuleName : "（--）" }}</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">Path：</div>
					<div class="log-detail-value">{{ detail.data.Path }}</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">Header：</div>
					<div class="log-detail-value">{{ detail.data.Headers }}</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">Query：</div>
					<div class="log-detail-value">{{ detail.data.QueryParams }}</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">Body：</div>
					<div class="log-detail-value">
						<json-viewer
							v-if="isValidJson(detail.data.PostBody)"
							:value="JSON.parse(detail.data.PostBody)"
							:show-array-index="false"
							:preview-mode="true"
							:copyable="true"
							:theme="'json-viewer-response-theme'"
						/>
						<span v-else>{{ detail.data.PostBody }}</span>
                    </div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">响应时间：</div>
					<div class="log-detail-value">{{ detail.data.ExecuteTime }} 毫秒</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">响应状态：</div>
					<div class="log-detail-value">{{ "已拦截" }}</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">状 态 码：</div>
					<div class="log-detail-value">{{ detail.data.StatusCode }}</div>
				</div>
				<div class="log-detail-row">
					<div class="log-detail-lab">响应内容：</div>
					<div class="log-detail-value">
						<json-viewer
							v-if="isValidJson(detail.data.Result)"
							:value="JSON.parse(detail.data.Result)"
							:show-array-index="false"
							:preview-mode="true"
							:copyable="true"
							:theme="'json-viewer-response-theme'"
						/>
						<span v-else>{{ detail.data.Result }}</span>
					</div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import Pagination from "@/components/Pagination";
import JsonViewer from 'vue-json-viewer'
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui
import { getLogs, getLogDetail } from "@/api/log";
import { getUserProductLicensings } from "@/api/product-licensing2user";
import moment from 'moment';

const defaultSettings = require('../../settings.js')

export default {
	name: "DefenseLog",
	components: { Pagination, JsonViewer },
	directives: { elDragDialog },
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
		this.loadData();
	},
	methods: {
		async loadProducts() {
			this.selectProducts.loading = true;

            const nowDate = moment(new Date()).format('YYYY-MM-DD');
            const userCode = this.$store.getters.account;
			var data = {
				params: {
					pageindex: 1,
					pagesize: 50,
					gettotal: false,
					sort: "id_desc",
                    source: "Id,Product.Code,Product.Name",
                    where: `expires>${nowDate} and user=${userCode} and actived=true and product!=${defaultSettings.product} and product.actived=true and product.deleted=false`
				}
			};

			return new Promise(resolve => {
				getUserProductLicensings(data)
					.then((response) => {
						var items = [];
						var list = response.data.list;
						for (var i = 0; i < list.length; i++) {
							items.push({ value: list[i].Product.Code, label: list[i].Product.Name });
						}

						this.selectProducts.list = items;
					})
					.finally(() => {
						this.selectProducts.loading = false;
						resolve();
					});
			})
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
                    source: "Id,Type,ExtType,Product.Name,Module.Name,Content,Path,ClientIP,Org.Name,User.Name,CreateTime,StatusCode"
                }
            };

            if (this.selectedDateRange != null &&
                this.selectedDateRange.length == 2) {
                const start = this.$moment(this.selectedDateRange[0]).format("YYYY-MM-DD") + " 00:00:00";
                const end = this.$moment(this.selectedDateRange[1]).format("YYYY-MM-DD") + " 23:59:59";
                data.params.where += ` and CreateTime*=${start},${end}`;
            }

            const serachStr = ("" + this.list.queryParams.search).trim();
            if (serachStr.length > 0) {
                data.params.where += ` and path~=%${serachStr}%`;
            }

            getLogs(data)
                .then((response) => {
                    this.list.data = response.data.list;
                    this.list.total = response.data.total;
                })
                .finally(() => {
                    this.list.loading = false;
                });
		},
		isValidJson(str) {
			if (str != null) {
				try {
					JSON.parse(str)
					return true;
				} catch {
					return false;
				}
			}
			return false;
		},
		showLogDetail(row) {
			this.detail.loading = true;
			this.detail.shownig = true;

			this.detail.currRow = row;

			getLogDetail(row.Id)
				.then((res) => {
					this.detail.data = res.data
				})
				.finally(() => {
					this.detail.loading = false;
				})
		}
    }
}
</script>
