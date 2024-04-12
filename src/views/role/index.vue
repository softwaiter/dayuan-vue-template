<template>
	<div class="app-container">
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
							<el-radio-group
								v-if="$visible('role_edit') && $visible('role_delete')"
								v-model="currentDataSource"
								class="filter-data-status"
								@input="loadRoleData"
							>
								<el-radio-button label="0">工作区</el-radio-button>
								<el-radio-button label="2">回收站</el-radio-button>
							</el-radio-group>
							<div class="filter-input">
								<el-input
									v-model="roleList.queryParams.search"
									placeholder="角色编码、角色名称，支持模糊搜索"
									clearable
									@keyup.enter.native="doRoleSearch()"
									@clear="doRoleSearch()"
								>
									<el-button
										slot="append"
										icon="el-icon-search"
										@click="doRoleSearch()"
									/>
								</el-input>
							</div>
							<el-button
								v-if="$visible('role_new')"
								class="filter-item"
								type="primary"
								style="margin-left: 15px;"
								:disabled="productList.currentRow == null"
								:title="productList.currentRow == null ? '请先添加产品' : ''"
								@click="openNewDialog()"
							>
								添加
							</el-button>
						</div>
					</div>

					<el-table
						v-loading="roleList.loading"
						:data="roleList.data"
						border
						fit
						stripe
						style="width: 100%"
					>
						<el-table-column
							label="编码"
							align="center"
							width="160"
						>
							<template slot-scope="{ row }">
								<span>{{ row.Code }}</span>
							</template>
						</el-table-column>
						<el-table-column label="名称" align="center" min-width="180">
							<template slot-scope="{ row }">
								<span>{{ row.Name }}</span>
							</template>
						</el-table-column>
						<el-table-column
							label="状态"
							align="center"
							width="100"
						>
							<template slot-scope="{ row }">
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
						</el-table-column>
						<el-table-column
							label="创建时间"
							align="center"
							width="170"
						>
							<template slot-scope="{ row }">
								<span>{{
									$moment(row.CreateTime).format(
										"YYYY-MM-DD HH:mm:ss"
									)
								}}</span>
							</template>
						</el-table-column>
						<el-table-column
							label="更新时间"
							align="center"
							width="170"
						>
							<template slot-scope="{ row }">
								<span>{{
									$moment(row.UpdateTime).format(
										"YYYY-MM-DD HH:mm:ss"
									)
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
								<el-link
                                    v-if="$visible('role_set_module') && currentDataSource == 0"
									type="primary"
									:underline="false"
									@click="showSelectModuleDialog(row)"
									>分配功能
                                </el-link>
								<br v-if="$visible('role_set_module') && currentDataSource == 0">
								<el-link
                                    v-if="$visible('role_edit') && currentDataSource == 0"
									type="primary"
									:underline="false"
									@click="openEditDialog(row)"
									>
                                    编辑
                                </el-link>
                                <el-link
                                    v-if="$visible('role_edit') && currentDataSource != 0"
                                    type="primary"
                                    :underline="false"
                                    @click="recoveryDeletedRole(row)"
                                    >
                                    恢复
                                </el-link>
								<div
									v-if="$visible('role_edit')"
									style="width: 15px; display: inline-block"
								/>
								<el-link
                                    v-if="$visible('role_edit') && currentDataSource == 0"
									type="primary"
									:underline="false"
									@click="markDeleteRole(row)"
									>
                                    移除
                                </el-link>
                                <el-link
                                    v-if="$visible('role_delete') && currentDataSource != 0"
                                    type="primary"
                                    :underline="false"
                                    @click="confirmDeleteRole(row)"
                                    >
                                    删除
                                </el-link>
								<div v-if="!$visible('role_set_module') && !$visible('role_edit') && !$visible('role_delete')">--</div>
							</template>
						</el-table-column>
					</el-table>

					<pagination
						v-show="roleList.total > 0"
						:total="roleList.total"
						:page.sync="roleList.queryParams.pageindex"
						:limit.sync="roleList.queryParams.pagesize"
						@pagination="loadRoleData"
					/>
				</div>
			</el-container>
		</el-container>

		<el-dialog
			ref="dlgRole"
			v-el-drag-dialog
			:title="isCreate ? '新增角色' : '修改角色'"
			width="400px"
			center
			:show-close="!form.submiting"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="roleDialogShowning"
            @open="$dialogReposition($refs['dlgRole'])"
            @opened="$dialogReposition($refs['dlgRole'])"
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
				<el-form-item label="角色编码" prop="Code">
					<el-input
						v-model="form.data.Code"
						placeholder="请输入角色编码"
						:disabled="!isCreate"
					/>
				</el-form-item>
				<el-form-item label="角色名称" prop="Name">
					<el-input
						v-model="form.data.Name"
						placeholder="请输入角色名称"
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
					@click="roleDialogShowning = false"
				>
					取消
				</el-button>
				<el-button
					type="primary"
					icon="el-icon-check"
					style="width: 150px"
					:loading="form.submiting"
					@click="isCreate ? createRole() : modifyRole()"
				>
					保存
				</el-button>
			</div>
		</el-dialog>

        <el-dialog
			ref="dlgSetModules"
			v-loading="moduleList.loading"
			v-el-drag-dialog
			:title="'分配功能'"
			width="444px"
			center
			:show-close="!moduleList.loading"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="moduleDialogShowning"
            class="module-selector-dialog"
            @open="$dialogReposition($refs['dlgSetModules'])"
            @opened="onSetModulesDlgOpened()"
		>
            <el-container
                class="module-tree-container"
            >
                <el-main>
                    <div style="min-height: 300px; max-height: 450px;">
                        <el-tree
                            ref="matt"
                            :data="moduleList.data.source"
                            :default-checked-keys="moduleList.data.checked"
                            :default-expand-all="true"
                            show-checkbox
                            :expand-on-click-node="false"
                            :check-on-click-node="true"
                            :check-strictly="true"
                            :node-key="'Code'"
                            :props="moduleList.treeProps"
                            :disabled="true"
                            class="module-tree"
                            @check-change="checkChanged"
                        />
                    </div>
                </el-main>
                <el-aside width="100px">
                    <div style="padding: 0 0 0 20px;">
                        <el-button
                            style="width: 100%;"
                            type="primary"
                            @click="submitChangedRoleModules"
                        >
                            保存
                        </el-button>
                        <div style="height: 10px;" />
                        <el-button
                            style="width: 100%;"
                            @click="moduleDialogShowning = false"
                        >
                            取消
                        </el-button>
                    </div>
                </el-aside>
            </el-container>
        </el-dialog>
	</div>
</template>

<script>
import Pagination from "@/components/Pagination";
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui
import { getExtendProducts, getExtendModules } from "@/api/extend";
import { getRoleModules, saveRoleModules, deleteRoleModules } from "@/api/module2role";
import {
	getRoles,
	saveRole,
	updateRole,
	deleteRole
} from "@/api/role";
import { Message } from "element-ui";

export default {
	name: "Role",
	components: { Pagination },
	directives: { elDragDialog },
	data() {
		return {
			showProductList: false,
            dataSources: {
                0: "工作台",
                2: "回收站"
            },
            currentDataSource: "0",
			roleDialogShowning: false,
			isCreate: true,
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
			roleList: {
				loading: false,
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
					Actived: true
				},
				rules: {
					Code: [
						{ required: true, message: "角色编码不能为空。" },
						{ pattern: "^[A-Za-z][\\w]{3,29}$", message: "4~30个字符，字母、数字、下划线，以字母开头。" }
					],
					Name: [{ required: true, message: "角色名称不能为空。" }]
				}
			},
            moduleDialogShowning: false,
			moduleDialogOpened: false,
            moduleList: {
                currentRole: null,
                loadingNum: 0,
                loading: false,
                treeProps: {
                    children: 'children',
                    label: 'Name'
                },
                data: {
                    source: [],
                    oldChecked: [],
                    checked: []
                }
            }
		};
	},
	beforeMount() {
		this.loadProductData();
	},
	methods: {
		onSetModulesDlgOpened() {
			this.$dialogReposition(this.$refs['dlgSetModules'])
			this.moduleDialogOpened = true;
		},
		_updateBreadcrumb() {
			if (this.productList.currentRow) {
				this.$store.dispatch('app/setRouteSubtitle', '（' + this.productList.currentRow.Name + '）');
			} else {
				this.$store.dispatch('app/setRouteSubtitle', '');
			}
		},
        checkParent(data, keys) {
            if (this.moduleDialogOpened && data && data.Parent && keys) {
                if (keys.findIndex(item => item === data.Parent) === -1) {
                    keys.push(data.Parent)
                }
            }
        },
        uncheckChildren(data, keys) {
            if (this.moduleDialogOpened && data && data.children) {
                data.children.forEach(child => {
                    const childIndex = keys.findIndex(key => key === child.Code)
                    if (childIndex >= 0) {
                        keys.splice(childIndex, 1)
                    }
                })
            }
        },
        checkChanged(refData, checked) {
			if (this.moduleDialogOpened) {
				const checkedKeys = this.$refs.matt.getCheckedKeys()
				if (checked) {
					this.checkParent(refData, checkedKeys)
				} else {
					this.uncheckChildren(refData, checkedKeys)
				}
				this.$refs.matt.setCheckedKeys(checkedKeys)
			}
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

					this.loadRoleData();
				})
				.finally(() => {
					this.showProductList = this.productList.total > 1 ||
						(this.productList.queryParams.search + '').length > 0;
					this._updateBreadcrumb();
					this.productList.loading = false;
				});
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
			this.loadRoleData();
		},
        loadProductModulesData() {
            this.moduleList.loading = true;
            this.moduleList.loadingNum += 1;

            const data = {
                params: {
                    prod: this.productList.currentRow.Code
                }
            }

			getExtendModules(data)
				.then(response => {
					this.moduleList.data.source = this.buildModuleChoices(response.data.list);
				})
				.finally(() => {
                    this.moduleList.loadingNum -= 1;
                    if (this.moduleList.loadingNum == 0) {
						this.moduleList.data.checked = this.buildModuleChecked(this.moduleList.data.oldChecked);
					    this.moduleList.loading = false;
                    }
				})
        },
        loadRoleModulesData() {
            this.moduleList.loading = true;
            this.moduleList.loadingNum += 1;

            const data = {
                params: {
                    source: "Id, Module.Code,Module.Name,Module.Parent",
                    where: `role=${this.moduleList.currentRole.Code}`,
					pagesize: 200,
					sort: 'module.id_asc'
                }
            }

            getRoleModules(data)
                .then((response) => {
                    this.moduleList.data.oldChecked = response.data.list;
                })
                .finally(() => {
                    this.moduleList.loadingNum -= 1;
                    if (this.moduleList.loadingNum == 0) {
						this.moduleList.data.checked = this.buildModuleChecked(this.moduleList.data.oldChecked);
					    this.moduleList.loading = false;
                    }
                });
        },
        buildModuleChoices(modules) {
            var result = [];

            modules.forEach(item => {
				item.disabled = item.Necessary;

                if (!item.Parent) {
                    item.Parent = 0
                    result.push(item);
                } else {
                    var parentItem = modules.find(item2 => {
                        return item2.Code == item.Parent;
                    });
                    if (parentItem) {
                        if (!parentItem.children) {
                            parentItem.children = [];
                        }
                        parentItem.children.push(item);
                    }
                }
            });

            return result;
        },
        buildModuleChecked(modules) {
            var result = [];

			this.moduleList.data.source.forEach(item => {
				if (item.Necessary) {
					result.push(item.Code)
				}
			})

            modules.forEach(item => {
                result.push(item.Module.Code)
            });

            return result;
        },
		doRoleSearch() {
			this.roleList.queryParams.pageindex = 1;
			this.loadRoleData();
		},
		loadRoleData() {
			if (this.productList.currentRow != null) {
				this.roleList.loading = true;

				var data = {
					params: {
						pageindex: this.roleList.queryParams.pageindex,
						pagesize: this.roleList.queryParams.pagesize,
						gettotal: true,
						sort: "id_desc",
						where: this.currentDataSource == 2 ? "deleted=true" : "deleted=false"
					}
				};

				const serachStr = ("" + this.roleList.queryParams.search).trim();
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

				getRoles(data)
					.then((response) => {
						this.roleList.data = response.data.list;
						this.roleList.total = response.data.total;
					})
					.finally(() => {
						this.roleList.loading = false;
					});
			} else {
				this.roleList.data = [];
				this.roleList.total = 0;
			}
		},
		resetDialogForm() {
			this.form.data.Id = null;
			this.form.data.Code = null;
			this.form.data.Name = null;
			this.form.data.Actived = true;
		},
		openNewDialog() {
			this.resetDialogForm();
			this.isCreate = true;
			this.roleDialogShowning = true;
			this.$nextTick(() => {
				this.$refs["dataForm"].clearValidate();
			});
		},
		createRole() {
			this.$refs["dataForm"].validate((valid) => {
				if (valid) {
					this.form.submiting = true;

					const newData = Object.assign({}, this.form.data);
					newData.Product = this.productList.currentRow.Code;
					saveRole(newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("新增角色成功");
								this.roleDialogShowning = false;
								this.roleList.queryParams.pageindex = 1;
								this.loadRoleData();
							}
						})
						.finally(() => {
							this.form.submiting = false;
						});
				}
			});
		},
        showSelectModuleDialog(row) {
			this.moduleList.currentRole = row;

			this.moduleDialogOpened = false;

			this.moduleList.data.source = [];
			this.moduleList.data.oldChecked = [];
			this.moduleList.data.checked = [];

            this.loadProductModulesData();
            this.loadRoleModulesData();
            this.moduleDialogShowning = true;
        },
        async submitChangedRoleModules() {
            this.moduleList.loading = true;

            const oldCheckedKeys = this.moduleList.data.oldChecked;
            const checkedKeys = this.$refs.matt.getCheckedKeys()

            const removedKeys = [];
            oldCheckedKeys.forEach(item => {
                const idx = checkedKeys.findIndex(key => item.Module.Code == key);
                if (idx == -1) {
                    removedKeys.push(item.Module.Code)
                }
            });

            const addedKeys = [];
            checkedKeys.forEach(key => {
                const idx = oldCheckedKeys.findIndex(item => item.Module.Code == key);
                if (idx == -1) {
                    addedKeys.push(key)
                }
            });

			try {
				if (await this.removeRoleModules(removedKeys)) {
					if (await this.addRoleModules(addedKeys)) {
						Message({
							message: "更新角色权限成功！",
							type: 'success'
						});

						this.moduleDialogShowning = false
					} else {
						Message({
							message: "更新角色权限失败。",
							type: 'error'
						});
					}
				} else {
					Message({
						message: "更新角色权限失败。",
						type: 'error'
					});
				}
			} finally {
				this.moduleList.loading = false;
			}
        },
        async addRoleModules(values) {
            const data = {
                _items: []
            };

            const roleCode = this.moduleList.currentRole.Code;
            for (var i = 0; i < values.length; i++) {
                data._items.push({
                    Role: roleCode,
                    Module: values[i]
                });
            }

            if (data._items.length > 0) {
                return new Promise((resolve, reject) => {
                    saveRoleModules(data)
                        .then((resp) => {
                            resolve(resp.code == 0);
                        })
                        .catch(() => {
                            reject(false);
                        });
                });
            } else {
                return true;
            }
        },
        async removeRoleModules(values) {
            const ids = [];
            if (values && values.length > 0) {
                values.forEach(key => {
                    const roleModule = this.moduleList.data.oldChecked.find(item => item.Module.Code == key);
                    if (roleModule) {
                        ids.push(roleModule.Id);
                    }
                });
            }

            if (ids.length > 0) {
                return new Promise((resolve, reject) => {
                    deleteRoleModules(ids)
                        .then((resp) => {
                            resolve(resp.code == 0);
                        })
                        .catch(() => {
                            reject(false);
                        });
                });
            } else {
                return true;
            }
        },
		openEditDialog(row) {
			this.resetDialogForm();
			this.form.data = Object.assign({}, row);

			delete this.form.data.CreateTime;
			delete this.form.data.UpdateTime;

			this.isCreate = false;
			this.roleDialogShowning = true;
			this.$nextTick(() => {
				this.$refs["dataForm"].clearValidate();
			});
		},
		modifyRole() {
			this.$refs["dataForm"].validate((valid) => {
				if (valid) {
					this.form.submiting = true;

					const newData = Object.assign({}, this.form.data);
					const roleId = newData.Id;
					updateRole(roleId, newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("更新角色成功");
								this.roleDialogShowning = false;
								this.loadRoleData();
							}
						})
						.finally(() => {
							this.form.submiting = false;
						});
				}
			});
        },
		markDeleteRole(row) {
			this.$confirm(`确认要将角色“${row.Code}-${row.Name}”移动到回收站吗？`, '移除', {
                confirmButtonText: '移动'
            }).then(
				() => {
					this.form.submiting = true;

                    const roleId = row.Id;
					const newData = {
                        Deleted: true
                    };
					updateRole(roleId, newData)
						.then((response) => {
							if (response.code == 0) {
								Message.success("角色已移动到回收站");
								this.loadRoleData();
							}
						})
						.finally(() => {
							this.form.submiting = false;
						});
				}
			);
        },
        recoveryDeletedRole(row) {
            this.form.submiting = true;

            const roleId = row.Id;
            const newData = {
                Deleted: false
            };
            updateRole(roleId, newData)
                .then((response) => {
                    if (response.code == 0) {
                        Message.success("角色已恢复");
                        this.loadRoleData();
                    }
                })
                .finally(() => {
                    this.form.submiting = false;
                });
        },
		confirmDeleteRole(row) {
			this.$confirm(
				`确认要删除角色“${row.Code}-${row.Name}”吗？<br/><div style='color: red;'>对应的关联数据将一并删除，请谨慎操作!</div>`, '删除', {
                dangerouslyUseHTMLString: true,
                confirmButtonText: '删除'
            }).then(() => {
				deleteRole(row.Id).then((response) => {
					if (response.code == 0) {
						Message.success("删除角色成功");
						this.loadRoleData();
					}
				});
			});
		}
	}
};
</script>

<style>
.module-selector-dialog .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 0px;
}

.module-tree-container {
	padding: 0 0 15px 0 !important;
}

.module-tree-container .el-main {
    padding: 0 10px 20px 0 !important;
	border: 1px solid #e6ebf5;
	border-radius: 4px;
}

.module-tree-container .el-aside {
    background: transparent !important;
    padding: 0 !important;
}

.module-tree .el-tree {
    background-color: #F5F7FA !important;
}
</style>
