<template>
    <div class="register-page">
        <div class="register-container">
            <div class="header-title">
                <img src="@/assets/logo/dayuan_mini.png" class="title-logo">
                <div style="margin: 0 0 0 15px;">
                    <div class="title-main" style="color: #2F3950;">免费注册</div>
                    <div class="title-sub" style="color: #687089;">大圆Admin前端开发框架</div>
                </div>
            </div>

            <el-form ref="registerForm" :model="form" :rules="rules" class="register-form">
                <el-form-item prop="mobile">
                    <el-input
                        ref="mobile"
                        v-model="form.mobile"
                        placeholder="请输入常用手机号码，作为登录账号"
                        maxlength="18"
                        clearable
                        :disabled="loading"
                    />
                </el-form-item>
                <el-form-item prop="verifycode">
                    <el-input
                        ref="verifycode"
                        v-model="form.verifycode"
                        placeholder="请输入手机验证码"
                        maxlength="6"
                        :disabled="loading"
                        class="verifycode-input"
                        :class="verifycodeInputFocused ? 'is-focus' : ''"
                        @focus="verifycodeInputFocused = true;"
                        @blur="verifycodeInputFocused = false;"
                    >
                        <template slot="append">
                            <el-link v-show="!countdowning" :underline="false" @click="getVerifyCode()">发送验证码</el-link>
                            <div v-show="countdowning">{{ currSecond }}s后可重新获取</div>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="pass">
                    <el-input
                        ref="pass"
                        v-model="form.pass"
                        :type="passInputType"
                        placeholder="请输入登录密码"
                        maxlength="20"
                        :disabled="loading"
                    >
                        <template slot="suffix">
                            <div v-if="passInputType == 'password'" class="password-input-suffix" @click="passInputType = 'text'">
                                <svg-icon icon-class="eye" style="width: 17px; height: 17px;" />
                            </div>
                            <div v-if="passInputType == 'text'" class="password-input-suffix" @click="passInputType = 'password'">
                                <svg-icon icon-class="eye-open" style="width: 17px; height: 17px;" />
                            </div>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="pass2">
                    <el-input
                        ref="pass2"
                        v-model="form.pass2"
                        :type="pass2InputType"
                        placeholder="请再次输入登录密码"
                        maxlength="20"
                        :disabled="loading"
                    >
                        <template slot="suffix">
                            <div v-if="pass2InputType == 'password'" class="password-input-suffix" @click="pass2InputType = 'text'">
                                <svg-icon icon-class="eye" style="width: 17px; height: 17px;" />
                            </div>
                            <div v-if="pass2InputType == 'text'" class="password-input-suffix" @click="pass2InputType = 'password'">
                                <svg-icon icon-class="eye-open" style="width: 17px; height: 17px;" />
                            </div>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>

            <el-button
                :loading="loading"
                type="primary"
                class="register-button"
                @click.native.prevent="handleRegister"
            >
                立即注册
            </el-button>

            <el-link type="primary" :underline="false" :href="'/#/login'">
                已有账户，去登录！
            </el-link>
        </div>

        <dayuan-captcha
            ref="getSmsCaptcha"
            :captcha-required-url="_getCaptchaRequiredUrl()"
            :captcha-url="_getCaptchaUrl()"
            :headers="_getDayuanCaptchaRequestHeaders()"
            @error="onCaptchaError"
            @submit="sendSmsCodeRequest"
        />
    </div>
</template>

<script>
import md5 from 'js-md5';
import { getSmsCode } from "@/api/sms"
import { register } from "@/api/account"
import { setToken } from '@/utils/auth'
import DayuanCaptcha from 'dayuan-captcha'
import { Message } from 'element-ui'

import 'dayuan-captcha/lib/dayuan-captcha.css'

const defaultSettings = require('../../settings.js')

export default {
	name: "Register",
    components: { DayuanCaptcha },
	data() {
        const validatePass = (rule, value, callback) => {
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

        const validatePass2 = (rule, value, callback) => {
            if (value != this.form.pass) {
                callback(new Error("两次输入密码不一致。"));
            } else {
                callback();
            }
        };

		return {
            loading: false,
            passInputType: 'password',
            pass2InputType: 'password',
            verifycodeInputFocused: false,
            countdowning: false,
            countdownRound: 1,
            currSecond: 60,
            form: {
                mobile: null,
                verifycode: null,
                pass: null,
                pass2: null
            },
            rules: {
				mobile: [
                    { required: true, message: "手机号不能为空" },
                    {
                        pattern: "^1[0-9]{10}$",
                        message: "请输入正确的手机号码。"
                    }
				],
                verifycode: [
                    { required: true, message: "验证码不能为空" }
                ],
                pass: [
                    { required: true, message: "请输入登录密码。" },
                    { trigger: "blur", validator: validatePass }
                ],
                pass2: [
                    { required: true, message: "请再次输入登录密码。" },
                    { trigger: "blur", validator: validatePass2 }
                ]
            }
        }
    },
    methods: {
        _getDayuanCaptchaRequestHeaders() {
            return {
                "Platform": defaultSettings.platform,
                "Product": defaultSettings.product
            }
        },
        _getCaptchaRequiredUrl() {
            return (window.RELEASE_APP_BASE_URL || process.env.VUE_APP_BASE_API) + '/captcha/required';
        },
        _getCaptchaUrl() {
            return (window.RELEASE_APP_BASE_URL || process.env.VUE_APP_BASE_API) + '/captcha';
        },
        getVerifyCode() {
            this.$refs.registerForm.validateField("mobile", (error) => {
                if (!error) {
                    this.$refs.getSmsCaptcha.tryShow("get_/sms");
                }
            });
        },
        verifycodeCountdown(round) {
            if (this.countdowning &&
                round == this.countdownRound) {
                this.currSecond--;
                if (this.currSecond > 0) {
                    setTimeout(() => {
                        this.verifycodeCountdown(round);
                    }, 1000);
                } else {
                    this.stopVerifycodeCountdown();
                }
            }
        },
        startVerifycodeCountdown() {
            this.currSecond = 60;
            this.countdowning = true;
            this.countdownRound++;

            const round = this.countdownRound;
            setTimeout(() => {
                this.verifycodeCountdown(round);
            }, 1000);
        },
        stopVerifycodeCountdown() {
            this.countdowning = false;
        },
        sendSmsCodeRequest(captchaData) {
            this.$refs.registerForm.validateField("mobile", (error) => {
                if (!error) {
                    const data = {
                        params: {
                            action: 'post_/saas/register',
                            phone: this.form.mobile
                        }
                    }
                    getSmsCode(data)
                        .then((res) => {
                            if (res.code == 0) {
                                this.startVerifycodeCountdown();
                                this.$refs.getSmsCaptcha.hide();
                            }
                        }).catch((err) => {
                            if (err.code == 2004) {
                                this.$refs.getSmsCaptcha.refresh();
                            } else if (err.code == -1) {
                                this.$refs.getSmsCaptcha.hide();
                            }
                        })
                }
            });
        },
        onCaptchaError(error) {
            let errMsg = error;
            if ((error + "").indexOf("NetworkError") >= 0) {
                errMsg = "请求发生异常，请检查网络是否正常或按F5刷新重试！";
            }
            Message({
                message: errMsg || '请求返回错误，请按F5键刷新重试。',
                type: 'error',
                duration: 5 * 1000
            })
        },
        handleRegister() {
            this.$refs.registerForm.validate((valid) => {
                if (valid) {
                    this.loading = true;

                    const data = {
                        mobile: this.form.mobile,
                        pass: md5(this.form.pass)
                    }
                    register(data, this.form.verifycode)
                        .then(res => {
                            if (res.code == 0) {
                                Message.success("注册成功！")

                                setToken(res.data.token)
                                setTimeout(() => {
                                    this.$router.push({
                                        path: this.redirect || "/",
                                        query: this.otherQuery
                                    });
                                });
                            }
                        })
                        .finally(() => {
                            this.loading = false;
                        })
                }
            })
        }
    }
}
</script>

<style>
.register-page {
    margin: 0;
    padding: 0;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: url('~@/assets/login/default2.png');
    background-size: cover;
    background-repeat: no-repeat;
}

.register-container {
    display: flex;
    flex-flow: column nowrap;
    padding: 35px 30px;
    width: 400px;
    border-radius: 5px;
    box-shadow: 0px 0px 7px #d6d7d8;
    background: white;
}

.register-container .header-title {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin: 0 0 41px 0;
}

.register-container .header-title .title-logo {
    width: 61px;
    height: 61px;
}

.register-container .header-title .title-main {
    font-size: 25px;
    font-weight: 500;
    line-height: 39px;
}

.register-container .header-title .title-sub {
    font-size: 13px;
    line-height: 21px;
}

.register-form .el-input__inner {
    font-size: 15px !important;
    height: 46px;
}

.register-form .verifycode-input .el-input__inner {
    border-right: none !important;
}

.register-form .verifycode-input .el-input-group__append {
    background: #fff;
    padding: 0 8px 0 0 !important;
    border-top-width: 1px !important;
    border-right-width: 1px !important;
    border-top-right-radius: 3px !important;
    border-bottom-right-radius: 3px !important;
}

.register-form .is-error .verifycode-input .el-input-group__append {
    border-color: #ff4949 !important;
}

.register-form .is-focus .el-input-group__append {
    border-color: #1890ff !important;
}

.register-container .register-button {
    width: 100%;
    height: 42px;
    margin: 25px 0 15px 0;
    font-size: 17px;
}
</style>
