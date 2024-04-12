<template>
	<div class="app-container">
		<div class="filter-container">
			<div class="filter-container-left">
				<el-radio-group
					v-if="$visible('product_edit') && $visible('product_delete')"
					v-model="currentDataSource"
					class="filter-data-status"
					@input="doSearch"
				>
					<el-radio-button label="0">工作区</el-radio-button>
					<el-radio-button label="2">回收站</el-radio-button>
				</el-radio-group>
				<div class="filter-input">
					<el-input
						v-model="list.queryParams.search"
						placeholder="产品编码、产品名称，支持模糊搜索"
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
				<el-button
					v-if="$visible('product_new')"
					class="filter-item"
					style="margin-left: 20px;"
					type="primary"
					@click="openNewDialog()"
				>
					添加
				</el-button>
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
			<el-table-column label="编码" align="center" width="130">
				<template slot-scope="{ row }">
					<span>{{ row.Code }}</span>
				</template>
			</el-table-column>
			<el-table-column label="名称" align="center" width="200">
				<template slot-scope="{ row }">
					<span>{{ row.Name }}</span>
				</template>
			</el-table-column>
			<el-table-column label="链接" align="left" width="250">
				<template slot-scope="{ row }">
					<el-link
						:underline="false"
						target="_blank"
						:href="row.Url"
						>
                        {{ row.Url }}
                    </el-link>
				</template>
			</el-table-column>
			<el-table-column label="描述" align="left" min-width="330">
				<template slot-scope="{ row }">
					<span>{{ row.Desc }}</span>
				</template>
			</el-table-column>
			<el-table-column label="状态" align="center" width="100">
				<template slot-scope="{ row }">
					<el-tag v-if="row.Actived && !row.Deleted" type="success">
						启用中
					</el-tag>
					<el-tag v-else-if="!row.Actived && !row.Deleted" type="info">
						已停用
					</el-tag>
					<el-tag v-else-if="row.Deleted" type="warning">
						已删除
					</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="创建时间" align="center" width="170">
				<template slot-scope="{ row }">
					<span>{{
						$moment(row.CreateTime).format("YYYY-DD-MM HH:mm:ss")
					}}</span>
				</template>
			</el-table-column>
			<el-table-column label="更新时间" align="center" width="170">
				<template slot-scope="{ row }">
					<span>{{
						$moment(row.UpdateTime).format("YYYY-DD-MM HH:mm:ss")
					}}</span>
				</template>
			</el-table-column>
			<el-table-column
				label="操作"
				align="center"
				width="110"
				fixed="right"
			>
				<template slot-scope="{ row }">
					<div v-if="row.Code != productCode">
						<el-link
							v-if="$visible('product_setting') && currentDataSource == 0"
							type="primary"
							:underline="false"
							@click="openSettingDialog(row)"
							>
							高级配置
						</el-link>
						<br v-if="$visible('product_setting') && currentDataSource == 0">
						<el-link
							v-if="$visible('product_edit') && currentDataSource == 0"
							type="primary"
							:underline="false"
							@click="openEditDialog(row)"
							>
							编辑
						</el-link>
						<el-link
							v-if="$visible('product_edit') && currentDataSource != 0"
							type="primary"
							:underline="false"
							@click="recoveryDeletedProduct(row)"
							>
							恢复
						</el-link>
						<div v-if="$visible('product_edit')" style="width: 15px; display: inline-block" />
						<el-link
							v-if="$visible('product_edit') && currentDataSource == 0"
							type="primary"
							:underline="false"
							@click="markDeleteProduct(row)"
							>
							移除
						</el-link>
						<el-link
							v-if="$visible('product_delete') && currentDataSource != 0"
							type="primary"
							:underline="false"
							@click="confirmDeleteProduct(row)"
							>
							删除
						</el-link>
						<div v-if="!$visible('product_edit') && !$visible('product_delete')">--</div>
					</div>
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
			ref="dlgProduct"
			v-el-drag-dialog
			:title="isCreate ? '添加产品' : '修改产品'"
			width="500px"
			center
			:show-close="!form.submiting"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="dialogShowing"
            @open="$dialogReposition($refs['dlgProduct'])"
            @opened="$dialogReposition($refs['dlgProduct'])"
		>
			<el-form
				ref="dataForm"
				:model="form.data"
				:rules="form.rules"
				:disabled="form.submiting"
				label-position="right"
				label-width="80px"
				style="margin: 0 0px"
			>
				<el-form-item label="产品编码" prop="Code">
					<el-input
						v-model="form.data.Code"
						placeholder="请输入产品编码"
						:disabled="!isCreate"
					/>
				</el-form-item>
				<el-form-item label="产品名称" prop="Name">
					<el-input
						v-model="form.data.Name"
						placeholder="请输入产品名称"
					/>
				</el-form-item>
				<el-form-item label="访问链接" prop="Url">
					<el-input
						v-model="form.data.Url"
						placeholder="请输入产品访问链接"
					/>
				</el-form-item>
				<el-form-item label="产品描述">
					<el-input
						v-model="form.data.Desc"
						placeholder="请输入产品描述"
					/>
				</el-form-item>
				<el-form-item label="是否启用">
					<el-switch v-model="form.data.Actived" />
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button
					style="width: 100px"
					:disabled="form.submiting"
					@click="dialogShowing = false"
				>
					取消
				</el-button>
				<el-button
					type="primary"
					icon="el-icon-check"
					style="width: 150px"
					:loading="form.submiting"
					@click="isCreate ? createProduct() : modifyProduct()"
				>
					保存
				</el-button>
			</div>
		</el-dialog>

		<el-dialog
			ref="dlgProductConfig"
			v-el-drag-dialog
			:title="'高级配置'"
			width="400px"
			center
			:show-close="!form2.submiting"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="dialogShowing2"
			:destroy-on-close="true"
            @open="$dialogReposition($refs['dlgProductConfig'])"
            @opened="$dialogReposition($refs['dlgProductConfig'])"
		>
			<el-form
				ref="dataForm2"
				:model="form2.data"
				:rules="form2.rules"
				:disabled="form2.submiting"
				label-position="right"
				label-width="85px"
				style="margin: 0 0px"
			>
				<el-form-item>
					<template slot="label">
						<el-tooltip class="question-tooltip" effect="light" placement="top" content="指是否允许用户自主进行账号注册；否则，只能通过管理员在后台进行账号的创建。">
							<i class="el-icon-question" />
						</el-tooltip>
						<span>开放注册</span>
					</template>
					<template>
						<el-switch v-model="form2.data.OpenRegistry" />
					</template>
				</el-form-item>
				<el-form-item>
					<template slot="label">
						<el-tooltip class="question-tooltip" effect="light" placement="top" content="用户进行账户注册时，默认赋予新注册账户的角色身份。">
							<i class="el-icon-question" />
						</el-tooltip>
						<span>默认角色</span>
					</template>
					<template>
						<el-select
							v-model="form2.data.AdminRole"
							style="width: 100%"
							clearable
							filterable
							remote
							placeholder="请选择管理员角色"
							:remote-method="searchRoles"
							:loading="form2.selectRoles.loading"
							:disabled="!form2.data.OpenRegistry"
							@focus="queryRoles"
						>
							<el-option
								v-for="item in form2.selectRoles.list"
								:key="item.value"
								:label="item.label"
								:aria-selected="true"
								:value="item.value"
							/>
						</el-select>
					</template>
				</el-form-item>
				<el-form-item>
					<template slot="label">
						<el-tooltip class="question-tooltip" effect="light" placement="top" content="用户进行账户注册时，账户默认所属的机构；如果未设置，则需要注册时显示指定。">
							<i class="el-icon-question" />
						</el-tooltip>
						<span>默认机构</span>
					</template>
					<template>
						<org-select
							v-model="form2.data.JoinOrgWhenRegister"
							:disabled="!form2.data.OpenRegistry"
							placeholder="请选择用户注册时所属机构"
							style="width: 100%;"
						/>
					</template>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button
					style="width: 100px"
					:disabled="form2.submiting"
					@click="dialogShowing2 = false"
				>
					取消
				</el-button>
				<el-button
					type="primary"
					icon="el-icon-check"
					style="width: 150px"
					:loading="form2.submiting"
					@click="modifyProduct2()"
				>
					保存
				</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import Pagination from "@/components/Pagination";
import OrgSelect from "@/components/OrgSelect";
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui
import {
	getProducts,
	saveProduct,
	updateProduct,
	deleteProduct
} from "@/api/product";
import { getRoles } from '@/api/role'
import { Message } from "element-ui";

const defaultSettings = require('../../settings.js')

export default {
	name: "Product",
	components: { Pagination, OrgSelect },
	directives: { elDragDialog },
	data() {
		return {
            dataSources: {
                0: "工作台",
                2: "回收站"
            },
            currentDataSource: "0",
			dialogShowing: false,
			dialogShowing2: false,
			isCreate: true,
			list: {
				currentRow: null,
				loading: true,
				queryParams: {
					search: "",
					pageindex: 1,
					pagesize: 20
				},
				data: [],
				total: 0
			},
			form: {
				submiting: false,
				data: {
					Id: null,
					Code: null,
					Name: null,
					Desc: "",
					Url: "",
					Actived: true
				},
				rules: {
					Code: [
						{ required: true, message: "产品编码不能为空。" },
						{ pattern: "^[A-Za-z][\\w]{3,17}$", message: "4~18个字符，可使用字母、数字、下划线，必须以字母开头。" }
					],
					Name: [{ required: true, message: "产品名称不能为空。" }],
					Url: [
						{
							type: "url",
							message: "访问链接必须是合法的URL格式，如：http://www.baidu.com"
						}
					]
				}
			},
			form2: {
				selectRoles: {
					loading: false,
					list: []
				},
				submiting: false,
				data: {
					Id: null,
					AdminRole: null,
					OpenRegistry: false,
					JoinOrgWhenRegister: null
				}
			}
		};
	},
	computed: {
		productCode: {
			get() {
				return defaultSettings.product
			}
		}
	},
	beforeMount() {
		this.loadData();
	},
	methods: {
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
					source: "Id,Code,Name,Url,Desc,Actived,Deleted,IsBasic,FreeDays,FreeUsers,Price,IsBizSystem,AdminRole.Code,AdminRole.Name,OpenRegistry,JoinOrgWhenRegister",
                    sort: "id_desc",
                    where: this.currentDataSource == 2 ? "deleted=true" : "deleted=false"
				}
			};

			const serachStr = ("" + this.list.queryParams.search).trim();
			if (serachStr.length > 0) {
				data.params.where += ` and (code~=%${serachStr}% or name~=%${serachStr}%)`;
            }

			getProducts(data)
				.then((response) => {
					this.list.data = response.data.list;
					this.list.total = response.data.total;
				})
				.finally(() => {
					this.list.loading = false;
				});
		},
		resetDialogForm() {
			this.form.data.Id = null;
			this.form.data.Code = null;
			this.form.data.Name = null;
			this.form.data.Desc = "";
			this.form.data.Url = "";
			this.form.data.Actived = true;
		},
		openNewDialog() {
			this.resetDialogForm();
			this.isCreate = true;
			this.dialogShowing = true;
			this.$nextTick(() => {
				this.$refs["dataForm"].clearValidate();
			});
		},
		createProduct() {
			this.$refs["dataForm"].validate((valid) => {
				if (valid) {
					this.form.submiting = true;

					const newData = Object.assign({}, this.form.data);
					newData.IsBizSystem = true;

                    delete newData.CreateTime;
                    delete newData.UpdateTime;
                    delete newData.AdminRole;
                    delete newData.OpenRegistry;
                    delete newData.JoinOrgWhenRegister;

					saveProduct(newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("添加产品成功");
								this.dialogShowing = false;
								this.list.queryParams.pageindex = 1;
								this.loadData();
							}
						})
						.finally(() => {
							this.form.submiting = false;
						});
				}
			});
		},
		openEditDialog(row) {
			this.list.currentRow = row;

			this.resetDialogForm();
			this.form.data = Object.assign({}, row);

			this.isCreate = false;
			this.dialogShowing = true;
			this.$nextTick(() => {
				this.$refs["dataForm"].clearValidate();
			});
		},
		modifyProduct() {
			this.$refs["dataForm"].validate((valid) => {
				if (valid) {
					this.form.submiting = true;

					const newData = Object.assign({}, this.form.data);
					const prodId = newData.Id;

                    delete newData.CreateTime;
                    delete newData.UpdateTime;
                    delete newData.AdminRole;
                    delete newData.OpenRegistry;
                    delete newData.JoinOrgWhenRegister;

					updateProduct(prodId, newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("更新产品成功");
								this.dialogShowing = false;
								this.loadData();
							}
						})
						.finally(() => {
							this.form.submiting = false;
						});
				}
			});
        },
		searchRoles(queryStr) {
			this.form2.selectRoles.loading = true;

			var data = {
				params: {
					pageindex: 1,
					pagesize: 50,
					gettotal: false,
					sort: "id_desc",
                    source: "Id,Code,Name",
                    where: `actived=true and deleted=false and product=${this.list.currentRow.Code}`
				}
			};

			if (queryStr == null || typeof queryStr === "undefined") {
				queryStr = "";
			}

			const serachStr = queryStr.trim();
			if (serachStr.length > 0) {
				data.params.where += ` and (code~=%${serachStr}% or name~=%${serachStr}%)`;
			}

			getRoles(data)
				.then((response) => {
					var items = [];
					var list = response.data.list;
					for (var i = 0; i < list.length; i++) {
						items.push({ value: list[i].Code, label: list[i].Name });
					}

					this.form2.selectRoles.list = items;
				})
				.finally(() => {
					this.form2.selectRoles.loading = false;
				});
        },
		queryRoles() {
			this.form2.selectRoles.loading = true;

			var data = {
				params: {
					pageindex: 1,
					pagesize: 50,
					gettotal: false,
					sort: "id_desc",
                    source: "Id,Code,Name",
                    where: `actived=true and deleted=false and product=${this.list.currentRow.Code}`
				}
			};

			getRoles(data)
				.then((response) => {
					var items = [];
					var list = response.data.list;
					for (var i = 0; i < list.length; i++) {
						items.push({ value: list[i].Code, label: list[i].Name });
					}

					this.form2.selectRoles.list = items;
				})
				.finally(() => {
					this.form2.selectRoles.loading = false;
				});
		},
		resetDialogForm2() {
			this.form2.data.Id = null;
			this.form2.data.AdminRole = null;
			this.form2.data.OpenRegistry = false;
			this.form2.data.JoinOrgWhenRegister = null;
		},
		openSettingDialog(row) {
			this.list.currentRow = row;

			this.resetDialogForm2();
			this.form2.data = Object.assign({}, row);

			this.form2.selectRoles.list = [
				{ value: row.AdminRole.Code, label: row.AdminRole.Name }
			];
			this.form2.data.AdminRole = row.AdminRole.Code;

			delete this.form2.data.CreateTime;
			delete this.form2.data.UpdateTime;

			this.isCreate = false;
			this.dialogShowing2 = true;
			this.$nextTick(() => {
				this.$refs["dataForm2"].clearValidate();
			});
		},
		modifyProduct2() {
			this.$refs["dataForm2"].validate((valid) => {
				if (valid) {
					this.form2.submiting = true;

					const newData = Object.assign({}, this.form2.data);
					const prodId = newData.Id;

					delete newData.Code
					delete newData.Name
					delete newData.Url
					delete newData.Desc
					delete newData.Actived
					delete newData.IsBasic
					delete newData.FreeDays
					delete newData.FreeUsers
					delete newData.IsBizSystem
					delete newData.Price

					updateProduct(prodId, newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("高级配置更新成功。");
								this.dialogShowing2 = false;
								this.loadData();
							}
						})
						.finally(() => {
							this.form2.submiting = false;
						});
				}
			});
        },
		markDeleteProduct(row) {
			this.$confirm(`确认要将产品“${row.Code}-${row.Name}”移动到回收站吗？`, '移除', {
                confirmButtonText: '移动'
            }).then(
				() => {
					this.form.submiting = true;

                    const prodId = row.Id;
					const newData = {
                        Deleted: true
                    };
					updateProduct(prodId, newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("产品已移动到回收站");
								this.loadData();
							}
						})
						.finally(() => {
							this.form.submiting = false;
						});
				}
			);
        },
        recoveryDeletedProduct(row) {
            this.form.submiting = true;

            const prodId = row.Id;
            const newData = {
                Deleted: false
            };
            updateProduct(prodId, newData)
                .then((response) => {
                    if (response.code == 0) {
                        Message.success("产品已恢复");
                        this.loadData();
                    }
                })
                .finally(() => {
                    this.form.submiting = false;
                });
        },
		confirmDeleteProduct(row) {
			this.$confirm(`确认要删除产品“${row.Code}-${row.Name}”吗？<br/><div style='color: red;'>相关功能模块、角色及其关联关系将一并删除，请谨慎操作!</div>`, '删除', {
                dangerouslyUseHTMLString: true,
                confirmButtonText: '删除'
            }).then(
				() => {
					deleteProduct(row.Id).then((response) => {
						if (response.code == 0) {
							Message.success("删除产品成功");
							this.loadData();
						}
					});
				}
			);
		}
	}
};
</script>
