<template>
	<div
        class="app-container"
        style="display: flex; flex-direction: column; align-items: center; margin: 10vh 50px 0 0;"
    >
        <el-form
            ref="changePassForm"
            :model="passForm.data"
            :rules="passForm.rules"
            :disabled="passForm.submiting"
            label-position="right"
            label-width="95px"
            style="width: 400px;"
        >
            <el-form-item label="当前密码" prop="oldPass">
                <el-input
                    v-model="passForm.data.oldPass"
                    :type="oldPassInputType"
                    auto-complete="new-password"
                    placeholder="请输入当前密码"
                >
                    <template slot="suffix">
                        <div v-if="oldPassInputType == 'password'" class="password-input-suffix" @click="oldPassInputType = 'text'">
                            <svg-icon icon-class="eye" style="width: 17px; height: 17px;" />
                        </div>
                        <div v-if="oldPassInputType == 'text'" class="password-input-suffix" @click="oldPassInputType = 'password'">
                            <svg-icon icon-class="eye-open" style="width: 17px; height: 17px;" />
                        </div>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPass">
                <el-input
                    v-model="passForm.data.newPass"
                    :type="newPassInputType"
                    auto-complete="new-password"
                    placeholder="请输入新密码"
                >
                    <template slot="suffix">
                        <div v-if="newPassInputType == 'password'" class="password-input-suffix" @click="newPassInputType = 'text'">
                            <svg-icon icon-class="eye" style="width: 17px; height: 17px;" />
                        </div>
                        <div v-if="newPassInputType == 'text'" class="password-input-suffix" @click="newPassInputType = 'password'">
                            <svg-icon icon-class="eye-open" style="width: 17px; height: 17px;" />
                        </div>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="确认新密码" prop="newPass2">
                <el-input
                    v-model="passForm.data.newPass2"
                    :type="secondPassInputType"
                    auto-complete="new-password"
                    placeholder="请再次输入新密码"
                >
                    <template slot="suffix">
                        <div v-if="secondPassInputType == 'password'" class="password-input-suffix" @click="secondPassInputType = 'text'">
                            <svg-icon icon-class="eye" style="width: 17px; height: 17px;" />
                        </div>
                        <div v-if="secondPassInputType == 'text'" class="password-input-suffix" @click="secondPassInputType = 'password'">
                            <svg-icon icon-class="eye-open" style="width: 17px; height: 17px;" />
                        </div>
                    </template>
                </el-input>
            </el-form-item>
        </el-form>
        <div style="display: block; padding: 0 0 0 55px;">
            <el-button
                type="primary"
                style="width: 150px"
                :loading="passForm.submiting"
                @click="doChangePass()"
>
                提交
            </el-button>
        </div>
    </div>
</template>

<script>
import { MessageBox, Message } from "element-ui";
import md5 from 'js-md5';
import { changePass } from '@/api/login'

export default {
    name: "ChangePass",
    data() {
        const validateNewPass = (rule, value, callback) => {
            if (!/[A-Z]/.test(value)) {
                callback(new Error("密码须包含大写字母、小写字母和数字。"));
            } else if (!/[a-z]/.test(value)) {
                callback(new Error("密码须包含大写字母、小写字母和数字。"));
            } else if (!/\d/.test(value)) {
                callback(new Error("密码须包含大写字母、小写字母和数字。"));
            } else if (value.length < 6 || value.length > 20) {
                callback(new Error("密码长度范围必须为6~20位。"));
            } else {
                callback();
            }
        };

        const validateNewPassAgain = (rule, value, callback) => {
            if (value != this.passForm.data.newPass) {
                callback(new Error("两次输入密码不一致。"));
            } else {
                callback();
            }
        };

		return {
            oldPassInputType: 'password',
            newPassInputType: 'password',
            secondPassInputType: 'password',
            passForm: {
                submiting: false,
                data: {
                    oldPass: null,
                    newPass: null,
                    newPass2: null
                },
                rules: {
                    oldPass: [
                        { required: true, message: "请输入当前密码。" },
                        { trigger: "blur", validator: validateNewPass }
                    ],
                    newPass: [
                        { required: true, message: "请输入新的密码。" },
                        { trigger: "blur", validator: validateNewPass }
                    ],
                    newPass2: [
                        { required: true, message: "请再次输入新的密码。" },
                        { trigger: "blur", validator: validateNewPassAgain }
                    ]
                }
            }
        }
    },
    mounted() {
        if (this.$route.path.toLowerCase().startsWith("/setpass")) {
            Message({
                message: '请先修改密码，再继续其他操作。',
                type: 'warning',
                duration: 3 * 1000
            })
        }
    },
    methods: {
        doChangePass() {
			this.$refs["changePassForm"].validate((valid) => {
				if (valid) {
					this.passForm.submiting = true;

					const data = {
                        oldPass: md5(this.passForm.data.oldPass),
                        newPass: md5(this.passForm.data.newPass),
                        newPass2: md5(this.passForm.data.newPass2)
                    };
					changePass(data)
						.then((response) => {
							if (response.code == 0) {
                                MessageBox.confirm('您的密码已经修改成功，请牢记您的新密码！', '提示', {
                                    confirmButtonText: '我记住了',
                                    showCancelButton: false,
                                    iconClass: '',
                                    type: 'info'
                                }).finally(() => {
                                    if (this.$route.path.toLowerCase().startsWith("/setpass")) {
                                        this.$router.push("/dashboard")
                                    } else {
                                        this.passForm.data.oldPass = null;
                                        this.passForm.data.newPass = null;
                                        this.passForm.data.newPass2 = null;
                                        setTimeout(() => {
                                            this.$refs["changePassForm"].clearValidate();
                                        });
                                    }
                                });
							}
						})
						.finally(() => {
							this.passForm.submiting = false;
						});
				}
			});
        }
    }
}
</script>
