<template>
    <el-select
        v-model="selectedOrg"
        clearable
        filterable
        remote
        :placeholder="placeholder"
        :remote-method="searchOrgs"
        :loading="selectOrgs.loading"
        :disabled="disabled"
        @focus="queryOrgs"
        @change="valueChanged"
    >
        <el-option
            v-for="item in selectOrgs.list"
            :key="item.value"
            :label="item.label"
            :aria-selected="true"
            :value="item.value"
        />
    </el-select>
</template>

<script>
import { getOrgs } from "@/api/organization";

export default {
    name: 'OrgSelect',
    emits: ['changed'],
    props: {
        value: {
            type: String,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: '请选择所属机构'
        }
    },
    data() {
        return {
            selectedOrg: null,
			selectOrgs: {
				loading: false,
				list: []
			}
        }
    },
    watch: {
        value: {
            handler: function(newVal, oldVal) {
                if (newVal != null && newVal.length > 0) {
                    if (newVal != oldVal) {
                        this.searchOrgs(newVal)
                            .then(() => {
                                this.selectedOrg = newVal;
                            })
                    }
                } else {
                    this.selectedOrg = null;
                }
            },
            immediate: false
        }
    },
    mounted() {
        if (this.value != null && this.value.length > 0) {
            this.searchOrgs(this.value)
                .then(() => {
                    this.selectedOrg = this.value;
                })
        }
    },
    methods: {
		queryOrgs() {
            this.selectOrgs.loading = true;

            var data = {
                params: {
                    pageindex: 1,
                    pagesize: 50,
                    gettotal: false,
                    sort: "id_desc",
                    source: "Id,Code,Name"
                }
            };

            getOrgs(data)
                .then((response) => {
                    var items = [];
                    var list = response.data.list;
                    for (var i = 0; i < list.length; i++) {
                        items.push({ value: list[i].Code, label: list[i].Name });
                    }

                    this.selectOrgs.list = items;
                })
                .finally(() => {
                    this.selectOrgs.loading = false;
                });
		},
		searchOrgs(queryStr) {
            return new Promise((resolve, reject) => {
                this.selectOrgs.loading = true;

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
                    data.params.where += ` and (code~=%${serachStr}% or name~=%${serachStr}%)`;
                }

                getOrgs(data)
                    .then((response) => {
                        var items = [];
                        var list = response.data.list;
                        for (var i = 0; i < list.length; i++) {
                            items.push({ value: list[i].Code, label: list[i].Name });
                        }

                        this.selectOrgs.list = items;
                    })
                    .finally(() => {
                        this.selectOrgs.loading = false;
                        resolve();
                    });
            });
        },
        valueChanged(newValue) {
            this.$emit("input", newValue);
            this.$emit('changed', newValue);
        },
        getCurrentOrg() {
            return this.selectedOrg;
        },
        setCurrentOrg(newValue) {
            this.selectedOrg = newValue;
        }
    }
}
</script>
