<template>
    <el-select
        v-model="selectedProduct"
        :clearable="clearable"
        filterable
        remote
        :placeholder="placeholder"
        :remote-method="searchProducts"
        :loading="selectProducts.loading"
        :disabled="disabled"
        @focus="queryProducts"
        @change="valueChanged"
        @clear="valueCleared"
    >
        <el-option
            v-for="item in selectProducts.list"
            :key="item.value"
            :label="item.label"
            :aria-selected="true"
            :value="item.value"
        />
    </el-select>
</template>

<script>
import { getExtendProducts } from "@/api/extend";

export default {
    name: 'ProductSelect',
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
		user: {
			type: String,
			default: null
		},
        autoSelectFirst: {
            type: Boolean,
            default: false
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
            default: '请选择产品'
        }
    },
    data() {
        return {
            selectedProduct: null,
            selectedProductName: null,
			selectProducts: {
				loading: false,
				list: []
			}
        }
    },
    watch: {
        value: {
            handler: function(newValue, oldValue) {
                if (newValue != null) {
                    if (newValue != oldValue) {
                        let exists = false;
                        for (let i = 0; i < this.selectProducts.list.length; i++) {
                            if (this.selectProducts.list[i].value == newValue) {
                                this.selectedProduct = newValue;
                                exists = true;
                                break;
                            }
                        }

                        if (!exists) {
                            this.searchProducts(newValue)
                                .then(() => {
                                    this.selectedProduct = newValue;
                                })
                        }
                    }
                } else {
                    this.selectedProduct = null;
                }
            },
            immediate: false
        },
        org: {
            handler: function(newValue, oldValue) {
				if (newValue != oldValue &&
                    this.selectedProduct != null) {
					this.selectedProduct = null;
					this.valueChanged(null);
				}
            },
            immediate: false
        },
        user: {
            handler: function(newValue, oldValue) {
				if (newValue != oldValue &&
                    this.selectedProduct != null) {
					this.selectedProduct = null;
					this.valueChanged(null);
				}
            },
            immediate: false
        },
        selectedProduct: {
            handler: function(newValue, oldValue) {
                if (newValue != oldValue) {
                    this.selectedProductName = null;
                    if (newValue) {
                        for (let i = 0; i < this.selectProducts.list.length; i++) {
                            if (this.selectProducts.list[i].value == this.selectedProduct) {
                                this.selectedProductName = this.selectProducts.list[i].label;
                                break;
                            }
                        }
                    }
                }
            }
        }
    },
    mounted() {
        this._initData();
    },
    methods: {
        _initData() {
            if (this.value != null && this.value.length > 0) {
                this.searchProducts(this.value)
                    .then(() => {
                        this.selectedProduct = this.value;
                    })
            } else if (this.autoSelectFirst) {
                this.selectFirst();
            }
        },
        selectFirst() {
            this.queryProducts(this.value)
                .then(() => {
                    if (this.selectProducts.list.length > 0) {
                        this.selectedProduct = this.selectProducts.list[0].value;
                        this.valueChanged(this.selectProducts.list[0].value);
                    }
                })
        },
		queryProducts() {
            return new Promise((resolve, reject) => {
                this.selectProducts.loading = true;

                var data = {
                    params: {
                        pageindex: 1,
                        pagesize: 50
                    }
                };

                if (this.user != null && this.user.length > 0) {
                    data.params.scense = 2;
                    data.params.user = this.user;
                } else if (this.org != null && this.org.length > 0) {
                    data.params.scense = 1;
                    data.params.org = this.org;
                } else {
                    data.params.scense = 0;
                }

                getExtendProducts(data)
                    .then((response) => {
                        var items = [];
                        var list = response.data.list;
                        for (var i = 0; i < list.length; i++) {
                            items.push({ value: list[i].Code, label: list[i].Name });
                        }

                        this.selectProducts.list = items;
                    })
                    .finally(() => {
                        this.selectProducts.loading = false;
                        resolve();
                    });
            });
		},
		searchProducts(queryStr) {
            return new Promise((resolve) => {
                this.selectProducts.loading = true;

                if (queryStr == null || typeof queryStr === "undefined") {
                    queryStr = "";
                }

                var data = {
                    params: {
                        pageindex: 1,
                        pagesize: 50,
                        search: queryStr.trim()
                    }
                };

                if (this.user != null && this.user.length > 0) {
                    data.params.scense = 2;
                    data.params.user = this.user;
                } else if (this.org != null && this.org.length > 0) {
                    data.params.scense = 1;
                    data.params.org = this.org;
                } else {
                    data.params.scense = 0;
                }

                getExtendProducts(data)
                    .then((response) => {
                        var items = [];
                        var list = response.data.list;
                        for (var i = 0; i < list.length; i++) {
                            items.push({ value: list[i].Code, label: list[i].Name });
                        }

                        this.selectProducts.list = items;
                    })
                    .finally(() => {
                        this.selectProducts.loading = false;
                        resolve();
                    });
            });
        },
        valueChanged(newValue) {
            this.$emit("input", newValue);
            this.$emit('changed', newValue);
        },
        valueCleared() {
            this.$emit("clear");
        },
        getCurrentProduct() {
            return this.selectedProduct;
        },
        getCurrentProductName() {
            return this.selectedProductName;
        },
        setCurrentProduct(newValue) {
            this.selectedProduct = newValue;
        }
    }
}
</script>
