<template>
    <el-select
        v-model="selectedUser"
        :clearable="clearable"
        filterable
        remote
        :placeholder="placeholder"
        :remote-method="searchUsers"
        :loading="selectUsers.loading"
		:disabled="disabled"
        @focus="queryUsers"
        @change="valueChanged"
    >
        <el-option
            v-for="item in selectUsers.list"
            :key="item.value"
            :label="item.label"
            :aria-selected="true"
            :value="item.value"
            :title="item.label + '（' + item.value + '）'"
        />
    </el-select>
</template>

<script>
import { getUsers } from "@/api/user";

export default {
    name: 'UserSelect',
    emits: ['changed'],
    props: {
        value: {
            type: String,
            default: null
        },
		org: {
			type: String,
			default: null
		},
        clearable: {
            type: Boolean,
            default: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: '请选择用户'
        }
    },
    data() {
        return {
			selectedUser: null,
			selectUsers: {
				loading: false,
				list: []
			}
        }
    },
	watch: {
		org: {
			handler: function(newValue, oldValue) {
				if (newValue != oldValue &&
					this.selectedUser != null) {
					this.selectedUser = null;
					this.valueChanged(null);
				}
			},
			immediate: false
		}
	},
    mounted() {
        if (this.value != null && this.value.length > 0) {
            this.searchUsers(this.value)
                .then(() => {
                    this.selectedUser = this.value;
                })
        }
    },
    methods: {
		queryUsers() {
			this.selectUsers.loading = true;

			var data = {
				params: {
					pageindex: 1,
					pagesize: 50,
					gettotal: false,
					sort: "id_desc",
                    source: "Id,Code,Name"
				}
			};

			if (this.org != null &&
				this.org.length > 0) {
				data.params.where = `org=${this.org}`;
			}

			getUsers(data)
				.then((response) => {
					var items = [];
					var list = response.data.list;
					for (var i = 0; i < list.length; i++) {
						items.push({ value: list[i].Code, label: list[i].Name });
					}

					this.selectUsers.list = items;
				})
				.finally(() => {
					this.selectUsers.loading = false;
				});
		},
		searchUsers(queryStr) {
			return new Promise((resolve, reject) => {
				this.selectUsers.loading = true;

				var data = {
					params: {
						pageindex: 1,
						pagesize: 50,
						gettotal: false,
						sort: "id_desc",
						source: "Id,Code,Name"
					}
				};

				if (queryStr == null || typeof queryStr === "undefined") {
					queryStr = "";
				}

				const serachStr = queryStr.trim();
				if (serachStr.length > 0) {
					data.params.where += `(code~=%${serachStr}% or name~=%${serachStr}%)`;
				}

				if (this.org != null &&
					this.org.length > 0) {
					data.params.where += ` and org=${this.org}`;
				}

				getUsers(data)
					.then((response) => {
						var items = [];
						var list = response.data.list;
						for (var i = 0; i < list.length; i++) {
							items.push({ value: list[i].Code, label: list[i].Name });
						}

						this.selectUsers.list = items;
					})
					.finally(() => {
						this.selectUsers.loading = false;
						resolve();
					});
			});
		},
        valueChanged(newValue) {
            this.$emit("input", newValue);
            this.$emit('changed', newValue);
        },
        getCurrentUser() {
            return this.selectedUser;
        },
        setCurrentUser(newValue) {
            this.selectedUser = newValue;
        }
    }
}
</script>
