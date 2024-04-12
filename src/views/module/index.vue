<template>
	<div :key="forceRefresh" class="app-container">
		<el-container>
			<el-aside
				v-if="showProductList"
				width="366px"
				style="background: #fff; padding: 0 15px 0 0px;"
			>
				<div class="filter-container">
					<el-input
						v-model="productList.queryParams.search"
						style="margin-bottom: 10px"
						placeholder="产品编码、产品名称，支持模糊搜索"
						clearable
						@keyup.enter.native="doProductSearch()"
						@clear="doProductSearch()"
					>
						<el-button
							slot="append"
							icon="el-icon-search"
							@click="doProductSearch()"
						/>
					</el-input>
				</div>

				<el-table
					v-loading="productList.loading"
					:data="productList.data"
					:row-key="getProductRowKey"
					:current-row-key="
						productList.currentRow != null
							? productList.currentRow.Code
							: null
					"
					:row-class-name="getProductRowClass"
					border
					fit
					stripe
					style="width: 100%; line-height: normal"
					@current-change="productListCurrentRowChanged"
				>
					<el-table-column
						label="产品编码"
						align="center"
						width="150"
					>
						<template slot-scope="{ row }">
							<span>{{ row.Code }}</span>
						</template>
					</el-table-column>
					<el-table-column
						label="产品名称"
						align="center"
						width="200"
					>
						<template slot-scope="{ row }">
							<span>{{ row.Name }}</span>
						</template>
					</el-table-column>
				</el-table>

				<pagination
					v-show="productList.total > 0"
					:total="productList.total"
					:page.sync="productList.queryParams.pageindex"
					:limit.sync="productList.queryParams.pagesize"
					layout="total,prev,pager,next"
					@pagination="loadProductData"
				/>
			</el-aside>
			<el-container direction="vertical">
				<div>
					<div class="filter-container">
						<div class="filter-container-left">
							<div class="filter-input">
								<el-input
									v-model="moduleList.queryParams.search"
									placeholder="功能编码、功能名称，支持模糊搜索"
									clearable
									@keyup.enter.native="doModuleSearch()"
									@clear="doModuleSearch()"
								>
									<el-button
										slot="append"
										icon="el-icon-search"
										@click="doModuleSearch()"
									/>
								</el-input>
							</div>
							<el-button
								v-if="$visible('module_new')"
								class="filter-item"
								type="primary"
								style="margin-left: 15px;"
								:disabled="productList.currentRow == null"
								:title="productList.currentRow == null ? '请先添加产品' : ''"
								@click="openNewModuleDialog()"
							>
								添加
							</el-button>
						</div>
					</div>

                    <vxe-table
                        ref="treeTable"
                        border
                        stripe
						round
                        row-id="Code"
                        :loading="moduleList.loading"
                        :tree-config="{transform: true, rowField: 'Code', parentField: 'Parent', lazy: true, hasChild: 'hasChildren', loadMethod: loadModuleChildData}"
                        :column-config="{resizable: true}"
                        :data="moduleList.data"
                    >
                        <vxe-column field="Code" title="编码" width="200" />
                        <vxe-column field="Name" title="名称" tree-node min-width="200" />
						<vxe-column title="必备功能" width="80" align="center">
							<template #default="{ row }">
								<svg-icon v-if="row.Necessary" icon-class="checkmark" class-name="checkmark" :class="_getCheckMarkFontClass()" />
							</template>
						</vxe-column>
                        <vxe-column title="状态" width="80">
                            <template #default="{ row }">
                                <el-tag v-if="row.Actived && !row.Deleted" type="success">
                                    启用中
                                </el-tag>
                                <el-tag v-if="!row.Actived && !row.Deleted" type="info">
                                    已停用
                                </el-tag>
                                <el-tag v-if="row.Deleted" type="warning">
                                    已删除
                                </el-tag>
                            </template>
                        </vxe-column>
                        <vxe-column title="创建时间" width="150">
							<template #default="{ row }">
								<span>{{
									$moment(row.CreateTime).format(
										"YYYY-MM-DD HH:mm:ss"
									)
								}}</span>
							</template>
                        </vxe-column>
                        <vxe-column title="更新时间" width="150">
							<template #default="{ row }">
								<span>{{
									$moment(row.UpdateTime).format(
										"YYYY-MM-DD HH:mm:ss"
									)
								}}</span>
							</template>
                        </vxe-column>
                        <vxe-column title="操作" width="100" align="center" fixed="right">
                            <template #default="{ row }">
								<el-link
									v-if="$visible('permission_setting')"
									type="primary"
									:underline="false"
									@click="setPermission(row)"
									>分配权限
                                </el-link>
								<br v-if="$visible('permission_setting')">
								<el-link
									v-if="$visible('module_edit')"
									type="primary"
									:underline="false"
									@click="openModuleEditDialog(row)"
									>
                                    编辑
                                </el-link>
								<div
									v-if="$visible('module_edit') && $visible('module_delete')"
									style="width: 15px; display: inline-block"
								/>
								<el-link
									v-if="$visible('module_delete')"
									type="primary"
									:underline="false"
									@click="confirmDeleteModule(row)"
									>
                                    删除
                                </el-link>
								<br v-if="$visible('module_edit') && $visible('module_delete')">
                                <el-link
									v-if="$visible('add_child_module')"
									type="primary"
									:underline="false"
									@click="openNewSubModuleDialog(row)"
									>添加子功能
                                </el-link>
								<div v-if="!$visible('permission_setting') && !$visible('module_edit') && !$visible('module_delete') && !$visible('add_child_module')">--</div>
                            </template>
                        </vxe-column>
                    </vxe-table>
				</div>
			</el-container>
		</el-container>

        <el-dialog
			ref="dlgSelectPermissions"
			v-el-drag-dialog
			:title="'分配权限'"
			width="646px"
			center
			:show-close="!permissionList.loading"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="permissionDialogShowning"
            :destroy-on-close="true"
            class="permission-selector-dialog"
            @open="$dialogReposition($refs['dlgSelectPermissions'])"
            @opened="$dialogReposition($refs['dlgSelectPermissions'])"
		>
			<div slot="title">
				分配权限 -
				<el-select
					v-model="proxyList.selected"
					:size="'mini'"
					placeholder="请选择微服务"
					style="width: 200px;"
					@change="proxySelectChanged"
				>
					<el-option
						v-for="item in proxyList.data"
						:key="item.Code"
						:label="item.Name"
						:value="item.Code"
					/>
				</el-select>
			</div>
            <el-transfer
                v-model="permissionList.selected"
                v-loading="permissionList.loading"
                :data="permissionList.data"
				:filterable="true"
                :props="{
                    key: 'Code',
                    label: 'Description'
                }"
                :titles="['待选权限', '已选权限']"
                :target-order="'push'"
				:render-content="renderFunc"
                class="permission-transfer"
                @change="permissionSelectChanged"
            />
			<div slot="footer" class="dialog-footer">
				<el-button
					style="width: 180px; margin-top: 6px;"
					:disabled="permissionList.loading"
					@click="permissionDialogShowning = false"
				>
				    关&nbsp;闭
				</el-button>
			</div>
        </el-dialog>

		<el-dialog
			ref="dlgModule"
			v-el-drag-dialog
			:title="isModuleCreateState ? '添加功能模块' : '修改功能模块'"
			width="420px"
			center
			:show-close="!moduleForm.submiting"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="moduleDialogShowing"
            @open="$dialogReposition($refs['dlgModule'])"
            @opened="$dialogReposition($refs['dlgModule'])"
		>
			<el-form
				ref="moduleForm"
				:model="moduleForm.data"
				:rules="moduleForm.rules"
				:disabled="moduleForm.submiting"
				label-position="right"
				label-width="96px"
				style="margin: 0 0px"
			>
                <el-form-item v-if="moduleList.currentRow != null" label="父 功 能">
					<div class="parent-item-readonly-info">
						【{{ moduleList.currentRow.Code }}】{{ moduleList.currentRow.Name }}
					</div>
                </el-form-item>
				<el-form-item label="功能编码" prop="Code">
					<el-input
						v-model="moduleForm.data.Code"
						placeholder="请输入功能模块编码"
						:disabled="!isModuleCreateState"
					/>
				</el-form-item>
				<el-form-item label="功能名称" prop="Name">
					<el-input
						v-model="moduleForm.data.Name"
						placeholder="请输入功能模块名称"
					/>
				</el-form-item>
				<el-form-item>
					<template slot="label">
						<el-tooltip class="question-tooltip" effect="light" placement="top" content="指使用相应产品必须拥有授权的基础功能；否则将无法使用该产品。">
							<i class="el-icon-question" />
						</el-tooltip>
						<span>必备功能</span>
					</template>
					<template>
						<el-switch v-model="moduleForm.data.Necessary" />
					</template>
				</el-form-item>
				<el-form-item label="是否启用">
					<el-switch v-model="moduleForm.data.Actived" />
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button
					style="width: 100px"
					:disabled="moduleForm.submiting"
					@click="moduleDialogShowing = false"
				>
					取消
				</el-button>
				<el-button
					type="primary"
					icon="el-icon-check"
					style="width: 150px"
					:loading="moduleForm.submiting"
					@click="isModuleCreateState ? createModule() : modifyModule()"
				>
					保存
				</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui
import { getExtendProducts } from "@/api/extend";
import {
	getModules,
    getModuleChildCount,
	saveModule,
	updateModule,
	deleteModule
} from "@/api/module";
import { getProxys } from '@/api/proxy'
import { getPermissions } from '@/api/permission'
import {
	getModulePermissions,
	saveModulePermissions,
	deleteModulePermissions
} from '@/api/permission2module'
import { Message } from "element-ui";
import { getSize } from '../../utils/globalsize'

export default {
	name: "Module",
	components: { Pagination },
	directives: { elDragDialog },
	data() {
		return {
			showProductList: false,
			forceRefresh: this.$store.getters.size,
			moduleDialogShowing: false,
			isModuleCreateState: true,
			productList: {
				loading: true,
				currentRow: null,
				queryParams: {
					search: "",
					pageindex: 1,
					pagesize: 20
				},
				data: [],
				total: 0
			},
			moduleList: {
				loading: false,
				currentRow: null,
				queryParams: {
					search: ""
				},
				data: []
			},
			moduleForm: {
				submiting: false,
				data: {
					Id: null,
					Code: null,
					Name: null,
					Necessary: false,
					Actived: true
				},
				rules: {
					Code: [
						{ required: true, message: "功能编码不能为空。" },
						{ pattern: "^[A-Za-z][\\w]{3,29}$", message: "4~30个字符，字母、数字、下划线，以字母开头。" }
					],
					Name: [{ required: true, message: "功能名称不能为空。" }]
				}
			},
            permissionDialogShowning: false,
            permissionList: {
                loadingNum: 0,
                loading: false,
                data: [],
                selected: [],
                selectedMaps: {}
            },
			proxyList: {
				loading: false,
				selected: '',
				data: []
			},
			renderFunc(h, option) {
				if (option.Description.length > 8) {
					return <span title={option.Description}>{option.Description}</span>
				} else {
					return <span>{option.Description}</span>
				}
			}
		};
	},
	watch: {
		$route(route) {
		  	this.forceRefresh = this.$store.getters.size;
		}
	},
	beforeMount() {
		this.loadProductData();
	},
	methods: {
		_updateBreadcrumb() {
			if (this.productList.currentRow) {
				this.$store.dispatch('app/setRouteSubtitle', '（' + this.productList.currentRow.Name + '）');
			} else {
				this.$store.dispatch('app/setRouteSubtitle', '');
			}
		},
		_getCheckMarkFontClass() {
			return 'checkmark-' + getSize();
		},
		doProductSearch() {
			this.productList.queryParams.pageindex = 1;
			this.loadProductData();
		},
		loadProductData() {
			this.productList.loading = true;

			var data = {
				params: {
					pageindex: this.productList.queryParams.pageindex,
					pagesize: this.productList.queryParams.pagesize,
					gettotal: true,
					search: ("" + this.productList.queryParams.search).trim()
				}
			};

			getExtendProducts(data)
				.then((response) => {
					this.productList.data = response.data.list;
					this.productList.total = response.data.total;

					if (this.productList.data.length > 0) {
						this.productList.currentRow = this.productList.data[0];
					} else {
						this.productList.currentRow = null;
					}

					this.loadModuleData();
				})
				.finally(() => {
					this.showProductList = this.productList.total > 1 ||
						(this.productList.queryParams.search + '').length > 0;
					this._updateBreadcrumb();
					this.productList.loading = false;
				})
		},
		getProductRowKey(row) {
			return row.Code;
		},
		getProductRowClass(item) {
			if (
				this.productList.currentRow != null &&
				item != null &&
				item.row != null
			) {
				if (this.productList.currentRow.Code == item.row.Code) {
					return "table-row-highlight-color";
				}
			}
		},
		productListCurrentRowChanged(currentRow, oldCurrentRow) {
			this.productList.currentRow = currentRow;
			this._updateBreadcrumb();
			this.loadModuleData();
		},
		doModuleSearch() {
			this.loadModuleData();
		},
        loadModuleChildrenState(children) {
            let moduleCodes = "";
            children.forEach(child => {
                moduleCodes += (child.Code + ",");
            });
            if (moduleCodes.length <= 0) {
                return;
            }

            var data = {
                params: {
                    modules: moduleCodes
                }
            }

            getModuleChildCount(data)
                .then((resp) => {
                    if (resp.code == 0) {
                        children.forEach(child => {
                            const childItem = resp.data.find(item => item.code == child.Code);
                            if (childItem) {
                                this.$set(child, "hasChildren", childItem.childCount > 0);
                            } else {
                                child.hasChildren = false;
                            }
                        });
                    }
                })
        },
        loadModuleChildData(vxeTable) {
			if (this.productList.currentRow != null) {
				var data = {
					params: {
						sort: "id_asc",
						where: "parent=" + vxeTable.row.Code
					}
				};

				const serachStr = ("" + this.moduleList.queryParams.search).trim();
				if (serachStr.length > 0) {
					data.params.where += ` and (code~=%${serachStr}% or name~=%${serachStr}%)`;
				}

				if (data.params.where != null && data.params.where.length > 0) {
					data.params.where =
						"(" +
						data.params.where +
						`) and product=${this.productList.currentRow.Code}`;
				} else {
					data.params.where = `product=${this.productList.currentRow.Code}`;
				}

                return new Promise(resolve => {
                    getModules(data)
                        .then((response) => {
                            setTimeout(() => {
                                this.loadModuleChildrenState(vxeTable.row.children);
                            }, 66)
                            resolve(response.data.list);
                        })
                });
            }
        },
		loadModuleData() {
			if (this.productList.currentRow != null) {
				this.moduleList.loading = true;

				var data = {
					params: {
						sort: "id_asc",
						where: "parent=$"
					}
				};

				const serachStr = ("" + this.moduleList.queryParams.search).trim();
				if (serachStr.length > 0) {
					data.params.where += ` and (code~=%${serachStr}% or name~=%${serachStr}%)`;
				}

				if (data.params.where != null && data.params.where.length > 0) {
					data.params.where =
						"(" +
						data.params.where +
						`) and product=${this.productList.currentRow.Code}`;
				} else {
					data.params.where = `product=${this.productList.currentRow.Code}`;
				}

                getModules(data)
                    .then((response) => {
                        if (response.code == 0) {
                            this.moduleList.data = response.data.list;
                            this.$refs.treeTable.reloadData(response.data.list);
                            this.loadModuleChildrenState(response.data.list);
                        } else {
                            this.$refs.treeTable.reloadData([]);
                        }
                    })
                    .finally(() => {
                        this.moduleList.loading = false;
                    });
			} else {
				this.moduleList.data = [];
			}
		},
		resetPermissionTransfer() {
			this.permissionList.data = [];
			this.permissionList.selected = [];
			this.permissionList.selectedMaps = {};
		},
		loadProxysData() {
			this.proxyList.loading = true;

			this.resetPermissionTransfer();

			const data = {
				params: {
					source: "Id,Code,Name",
					where: `actived=true and deleted=false`,
					sort: 'id_desc'
				}
			}

			getProxys(data)
				.then((response) => {
					this.proxyList.data = response.data.list;
					if (this.proxyList.data && this.proxyList.data.length > 0) {
						this.proxyList.selected = this.proxyList.data[0].Code;
						this.proxySelectChanged();
					}
				})
				.finally(() => {
					this.proxyList.loading = false;
				});
		},
		proxySelectChanged() {
            this.loadProxyPermissionsData();
			this.loadModulePermissionsData();
		},
		loadProxyPermissionsData() {
			if (this.proxyList.selected) {
				this.permissionList.loading = true;
				this.permissionList.loadingNum += 1;

				const data = {
					params: {
						source: "Code,Method,Path,Description",
						where: `proxy=${this.proxyList.selected} and actived=true and deleted=false`,
						pagesize: 200,
						sort: 'id_asc'
					}
				}

				getPermissions(data)
					.then((response) => {
						this.permissionList.data = response.data.list;
					})
					.finally(() => {
						this.permissionList.loadingNum -= 1;
						if (this.permissionList.loadingNum == 0) {
							this.permissionList.loading = false;
						}
					});
			}
		},
		loadModulePermissionsData() {
			if (this.proxyList.selected) {
				this.permissionList.loading = true;
				this.permissionList.loadingNum += 1;

				const data = {
					params: {
						source: '',
						where: `module.product=${this.productList.currentRow.Code} and module=${this.moduleList.currentRow.Code} and proxy=${this.proxyList.selected}`,
						pagesize: 200,
						sort: 'permission.id_asc'
					}
				};

				getModulePermissions(data)
					.then((response) => {
						var selected = [];
						var selectedMaps = {};
						for (var i = 0; i < response.data.list.length; i++) {
							const item = response.data.list[i];
							selectedMaps[item.Permission] = item.Id;
							selected.push(item.Permission);
						}
						this.permissionList.selected = selected;
						this.permissionList.selectedMaps = selectedMaps;
					})
					.finally(() => {
						this.permissionList.loadingNum -= 1;
						if (this.permissionList.loadingNum == 0) {
							this.permissionList.loading = false;
						}
					})
			}
		},
		resetModuleDialogForm() {
			this.moduleForm.data.Id = null;
			this.moduleForm.data.Code = null;
			this.moduleForm.data.Name = null;
			this.moduleForm.data.Necessary = false;
			this.moduleForm.data.Actived = true;
		},
		openNewModuleDialog() {
			this.moduleList.currentRow = null;

            this.resetModuleDialogForm();
			this.isModuleCreateState = true;
			this.moduleDialogShowing = true;
			this.$nextTick(() => {
				this.$refs["moduleForm"].clearValidate();
			});
		},
		openNewSubModuleDialog(row) {
            this.moduleList.currentRow = row;

			this.resetModuleDialogForm();
			this.isModuleCreateState = true;
			this.moduleDialogShowing = true;
			this.$nextTick(() => {
				this.$refs["moduleForm"].clearValidate();
			});
		},
		createModule() {
			this.$refs["moduleForm"].validate((valid) => {
				if (valid) {
					this.moduleForm.submiting = true;

					const newData = Object.assign({}, this.moduleForm.data);
					newData.Product = this.productList.currentRow.Code;
                    if (this.moduleList.currentRow != null) {
                        newData.Parent = this.moduleList.currentRow.Code;
                    }
					saveModule(newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("添加功能模块成功");
								this.moduleDialogShowing = false;
                                if (this.moduleList.currentRow == null) {
                                    this.loadModuleData();
                                } else {
                                    const row = this.moduleList.currentRow;
                                    this.$set(row, "hasChildren", true);
                                    if (this.$refs.treeTable.isTreeExpandByRow(row)) {
                                        this.$refs.treeTable.reloadTreeChilds(row)
                                    } else {
                                        this.$refs.treeTable.setTreeExpand(row, true);
                                    }
                                }
							}
						})
						.finally(() => {
							this.moduleForm.submiting = false;
						});
				}
			});
		},
		setPermission(row) {
            this.moduleList.currentRow = row;
			this.loadProxysData();
            this.permissionDialogShowning = true;
		},
        addModulePermissions(values) {
            this.permissionList.loading = true;

            const data = {
                _items: []
            };

            const moduleCode = this.moduleList.currentRow.Code;
			const proxyCode = this.proxyList.selected;
            for (var i = 0; i < values.length; i++) {
                data._items.push({
                    Module: moduleCode,
					Proxy: proxyCode,
                    Permission: values[i]
                });
            }

            saveModulePermissions(data)
                .then((response) => {
                    this.loadModulePermissionsData();
                    Message({
                        message: "添加权限成功！",
                        type: 'success'
                    });
                })
                .finally(() => {
                    this.permissionList.loading = false;
                });
        },
        removeModulePermissions(values) {
            this.permissionList.loading = true;

            var ids = [];
            for (var i = 0; i < values.length; i++) {
                ids.push(this.permissionList.selectedMaps[values[i]]);
            }

            deleteModulePermissions(ids)
                .then((response) => {
                    Message({
                        message: "移除权限成功！",
                        type: 'success'
                    });
                })
                .finally(() => {
                    this.permissionList.loading = false;
                });
        },
		permissionSelectChanged(current, direct, values) {
            if (direct == "left") { // 取消
                this.removeModulePermissions(values);
            } else if (direct == "right") { // 选中
                this.addModulePermissions(values);
            }
		},
		openModuleEditDialog(row) {
			this.resetModuleDialogForm();
			this.moduleForm.data = Object.assign({}, row);

			delete this.moduleForm.data.CreateTime;
			delete this.moduleForm.data.UpdateTime;

			this.isModuleCreateState = false;
			this.moduleDialogShowing = true;
			this.$nextTick(() => {
				this.$refs["moduleForm"].clearValidate();
			});
		},
		modifyModule() {
			this.$refs["moduleForm"].validate((valid) => {
				if (valid) {
					this.moduleForm.submiting = true;

					const newData = Object.assign({}, this.moduleForm.data);
					const modId = newData.Id;
					updateModule(modId, newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("更新功能模块成功");
								this.moduleDialogShowing = false;

                                const parent = this.getRowParent(newData);
                                if (parent) {
                                    this.$refs.treeTable.reloadTreeChilds(parent);
                                } else {
                                    const editRow = this.moduleList.data.find(item => item.Code == newData.Code);
                                    if (editRow) {
                                        editRow.Name = newData.Name;
                                        editRow.Necessary = newData.Necessary;
                                        editRow.Actived = newData.Actived;
                                    }
                                }
							}
						})
						.finally(() => {
							this.moduleForm.submiting = false;
						});
				}
			});
        },
        _getRowParent(row, node) {
            let children = this.moduleList.data;
            if (node != null) {
                children = node.children;
            }
            if (children && children.length >= 0) {
                const rowNode = children.find(item => item.Code == row.Code);
                if (!rowNode) {
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        if (child) {
                            const _parent = this._getRowParent(row, child);
                            if (_parent) {
                                return _parent;
                            }
                        }
                    }
                } else {
                    return node;
                }
            }
            return null;
        },
        getRowParent(row) {
            return this._getRowParent(row, null);
        },
		confirmDeleteModule(row) {
            const moduleName = `【${row.Code}】${row.Name}`
            if (row.hasChildren) {
                Message.error(`功能模块“${moduleName}”不为空。`)
                return;
            }

			this.$confirm(
				`确认要删除功能模块“${moduleName}”吗？<br/><div style='color: red;'>对应的关联数据将一并删除，请谨慎操作!</div>`, '删除', {
                dangerouslyUseHTMLString: true,
                confirmButtonText: '删除'
            }).then(() => {
				deleteModule(row.Id).then((response) => {
					if (response.code == 0) {
						Message.success("删除功能模块成功");

                        const parent = this.getRowParent(row);
                        this.$refs.treeTable.remove(row);
                        if (parent) {
                            if (parent.children.length == 0) {
                                parent.hasChildren = false;
                            }
                        }
					}
				});
			});
		}
	}
};
</script>

<style>
.checkmark {
	color: #686868;
}

.checkmark-default,
.checkmark-medium {
	font-size: 20px;
}

.checkmark-small {
	font-size: 18px;
}

.checkmark-mini {
	font-size: 16px;
}

.permission-selector-dialog .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 0px;
}

.permission-transfer .el-transfer-panel {
    width: 260px;
}

.permission-transfer .el-transfer-panel .el-transfer-panel__body {
    height: 350px;
}

.permission-transfer .el-transfer-panel .el-transfer-panel__body .el-transfer-panel__list {
    height: 310px;
}

.permission-transfer .el-transfer__buttons {
    padding: 0 10px;
}

.permission-transfer .el-transfer__buttons button:first-of-type {
    display: block;
}

.permission-transfer .el-transfer__buttons button {
    margin-left: 0px;
}

.permission-transfer .el-transfer-panel__filter {
	margin: 8px 13px !important;
	width: 89% !important;
}

.permission-transfer .el-transfer-panel__filter .el-input__inner {
	border-radius: 5px !important;
}

.permission-transfer .el-transfer-panel__filter .el-input__icon {
	margin-left: 0 !important;
	padding-top: 1px !important;
}

.parent-item-readonly-info {
	background: #f9f9f9;
	padding: 0 11px;
}
</style>
