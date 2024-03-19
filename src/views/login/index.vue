<template>
	<div class="login-page">
        <div :class="_getLoginContainerClass()" class="login-container">
            <div class="left-area" :class="{ 'el-hidden': hiddenLeftArea }">
                <div class="left-area-title">
                    <img src="@/assets/logo/dayuan_mini_white.png" class="left-area-title-logo">
                    <div style="margin: 0 0 0 15px;">
                        <div class="left-area-title-main" style="color: #f1f1f1;">大圆技术</div>
                        <div class="left-area-title-sub" style="color: #f1f1f1;">dayuan.tech</div>
                    </div>
                </div>
                <div class="slogan">
                    致力于为广大开发者提供高效、快速、全面的开发框架
                </div>
                <img src="@/assets/signin_images/coding.png" width="70%" style="opacity: 0.6;">
            </div>
            <div class="right-area" :class="{ 'right-area-only': hiddenLeftArea }">
                <div class="right-area-title">
                    <img src="@/assets/logo/dayuan_mini.png" class="right-area-title-logo">
                    <div style="margin: 0 0 0 15px;">
                        <div class="right-area-title-main" style="color: #2F3950;">欢迎登录</div>
                        <div class="right-area-title-sub" style="color: #687089;">大圆Admin前端快速开发模板</div>
                    </div>
                </div>

                <el-form v-show="loginType == 0" ref="passLoginForm" :model="passLoginForm" :rules="passLoginRules" class="login-form">
                    <el-form-item prop="username">
                        <el-input
                            ref="username"
                            v-model="passLoginForm.username"
                            placeholder="请输入用户名/手机号/邮箱地址"
                            maxlength="18"
                            :disabled="loading"
                            @keyup.enter.native="handleLogin"
                        />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            ref="password"
                            v-model="passLoginForm.password"
                            :type="passwordInputType"
                            placeholder="请输入登录密码"
                            maxlength="16"
                            :disabled="loading"
                            @keyup.enter.native="handleLogin"
                        >
                            <template slot="suffix">
                                <div v-if="passwordInputType == 'password'" class="password-input-suffix" @click="passwordInputType = 'text'">
                                    <svg-icon icon-class="eye" class="eye-size" />
                                </div>
                                <div v-if="passwordInputType == 'text'" class="password-input-suffix" @click="passwordInputType = 'password'">
                                    <svg-icon icon-class="eye-open" class="eye-size" />
                                </div>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-form v-show="loginType == 1" ref="mobileLoginForm" :model="mobileLoginForm" :rules="mobileLoginRules" class="login-form">
                    <el-form-item prop="mobile">
                        <el-input
                            ref="mobile"
                            v-model="mobileLoginForm.mobile"
                            placeholder="请输入手机号码"
                            maxlength="11"
                            :disabled="loading"
                            @keyup.enter.native="handleLogin"
                        />
                    </el-form-item>
                    <el-form-item prop="verifycode">
                        <el-input
                            ref="verifycode"
                            v-model="mobileLoginForm.verifycode"
                            placeholder="请输入手机验证码"
                            maxlength="6"
                            :disabled="loading"
                            class="verifycode-input"
                            :class="verifycodeInputFocused() ? 'is-focus' : ''"
                            @keyup.enter.native="handleLogin"
                        >
                            <template slot="append">
                                <el-link v-show="!mobileLoginForm.countdowning" :underline="false" @click="getVerifyCode()">发送验证码</el-link>
                                <div v-show="mobileLoginForm.countdowning">{{ mobileLoginForm.currSecond }}s后可重新获取</div>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>

                <el-row class="login-panel">
                    <el-col :span="12">
                        <el-checkbox v-model="keeplogined" class="checkbox-keeploign-aweek">
                            <span :class="_getLoginFormLabelFontClass()">一周免登录</span>
                        </el-checkbox>
                    </el-col>
                    <el-col :span="12" style="text-align: right;">
                        <el-link v-if="loginType == 0" type="primary" :underline="false" :class="_getLoginFormLabelFontClass()" @click="loginType = 1">
                            手机验证码登录
                        </el-link>
                        <el-link v-if="loginType == 1" type="primary" :underline="false" :class="_getLoginFormLabelFontClass()" @click="loginType = 0">
                            账户密码登录
                        </el-link>
                    </el-col>
                </el-row>

                <el-button
                    :loading="loading"
                    type="primary"
                    class="login-button"
                    @click.native.prevent="handleLogin"
                >
                    登&nbsp;&nbsp;录
                </el-button>

                <el-row class="login-panel">
                    <el-col :span="12">
                        <el-link type="primary" :underline="false" :href="'/#/getpass'" :class="_getLoginFormLabelFontClass()">
                            忘记密码？
                        </el-link>
                    </el-col>
                    <el-col :span="12" style="text-align: right;">
                        <span :class="_getLoginFormLabelFontClass()" class="label-default">还没有账号？</span>
                        <el-link type="primary" :underline="false" :href="'/#/getpass'" :class="_getLoginFormLabelFontClass()">
                            去注册
                        </el-link>
                    </el-col>
                </el-row>
            </div>
        </div>

        <dayuan-captcha
            ref="postLoginCaptcha"
            :captcha-required-url="_getCaptchaRequiredUrl()"
            :captcha-url="_getCaptchaUrl()"
            :headers="_getDayuanCaptchaRequestHeaders()"
            @error="onCaptchaError"
            @submit="loginByAccount"
        />
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
import { login, loginByMobile } from "@/api/login";
import { getSmsCode } from "@/api/sms"
import { setToken } from '@/utils/auth'
import DayuanCaptcha from 'dayuan-captcha'
import { getSize, getSizeFontClass } from '../../utils/globalsize'
import { Message } from 'element-ui'

import 'dayuan-captcha/lib/dayuan-captcha.css'

const defaultSettings = require('../../settings.js')

export default {
	name: "Login",
    components: { DayuanCaptcha },
	data() {
		return {
            screenWidth: 0,
            hiddenLeftArea: false,
            loginType: 0, // 0: 密码登录，1: 手机验证码
            passwordInputType: 'password',
			passLoginForm: {
				username: "admin",
				password: "Admin123"
			},
			passLoginRules: {
				username: [
                    { required: true, message: "用户名不能为空" },
                    { min: 4, max: 18, message: "长度应为4~18个字符" }
				],
				password: [
                    { required: true, message: "密码不能为空" },
                    { min: 6, max: 20, message: "密码长度应为6~20个字符" }
				]
			},
            mobileLoginForm: {
                countdowning: false,
                countdownRound: 1,
                currSecond: 60,
                mobile: "",
                verifycode: ""
            },
            mobileLoginRules: {
                mobile: [
                    { required: true, message: "手机号不能为空" },
                    {
                        pattern: "^1[0-9]{10}$",
                        message: "请输入正确的手机号码。"
                    }
                ],
                verifycode: [
                    { required: true, message: "验证码不能为空" }
                ]
            },
            keeplogined: false,
			loading: false,
			redirect: undefined,
			otherQuery: {}
		};
	},
	watch: {
		$route: {
			handler: function(route) {
				const query = route.query;
				if (query) {
					this.redirect = query.redirect;
					this.otherQuery = this.getOtherQuery(query);
				}
			},
			immediate: true
		},
        screenWidth: {
            handler: function(value) {
                const size = getSize();
                if (size == "mini") {
                    this.hiddenLeftArea = value < 820;
                } else if (size == "small") {
                    this.hiddenLeftArea = value < 880;
                } else {
                    this.hiddenLeftArea = value < 970;
                }
            }
        }
	},
	mounted() {
        this.screenWidth = document.body.clientWidth;
        this.hiddenLeftArea = this.screenWidth <= window.screen.width * 0.95;
        window.addEventListener('resize', this._windowResize);

		if (this.passLoginForm.username === "") {
			this.$refs.username.focus();
		} else if (this.passLoginForm.password === "") {
			this.$refs.password.focus();
		}
	},
    destroyed() {
        window.removeEventListener('resize', this._windowResize);
    },
	methods: {
        _windowResize() {
            this.screenWidth = document.body.clientWidth;
        },
        _getDayuanCaptchaRequestHeaders() {
            return {
                "Platform": defaultSettings.platform,
                "Product": defaultSettings.product
            }
        },
        _getLoginContainerClass() {
            let result = 'login-container-' + getSize();
            if (this.hiddenLeftArea) {
                result += ' login-container-only-right';
            }
            return result;
        },
        _getLoginFormWidthClass() {
            return 'login-form-' + getSize();
        },
        _getLoginFormLabelFontClass() {
            return getSizeFontClass();
        },
        _getCaptchaRequiredUrl() {
            return (window.RELEASE_APP_BASE_URL || process.env.VUE_APP_BASE_API) + '/captcha/required';
        },
        _getCaptchaUrl() {
            return (window.RELEASE_APP_BASE_URL || process.env.VUE_APP_BASE_API) + '/captcha';
        },
        verifycodeInputFocused() {
            if (this.$refs && this.$refs.verifycode) {
                return this.$refs.verifycode.focused;
            }
            return false;
        },
        getBackgroundName() {
            const ord = Math.floor(Math.random() * 10000) % defaultSettings.loginBackground.randomCount + 1;
            let backgroundImageName = "00000";
            backgroundImageName = backgroundImageName.substring(0, backgroundImageName.length - ord.toString().length);
            backgroundImageName += ord + ".jpg";
            return backgroundImageName;
        },
        sendSmsCodeRequest(captchaData) {
            this.$refs.mobileLoginForm.validateField("mobile", (error) => {
                if (!error) {
                    const data = {
                        params: {
                            action: 'post_/account/login/mobile',
                            phone: this.mobileLoginForm.mobile
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
        getVerifyCode() {
            this.$refs.mobileLoginForm.validateField("mobile", (error) => {
                if (!error) {
                    this.$refs.getSmsCaptcha.tryShow("get_/sms");
                }
            });
        },
        verifycodeCountdown(round) {
            if (this.mobileLoginForm.countdowning &&
                round == this.mobileLoginForm.countdownRound) {
                this.mobileLoginForm.currSecond--;
                if (this.mobileLoginForm.currSecond > 0) {
                    setTimeout(() => {
                        this.verifycodeCountdown(round);
                    }, 1000);
                } else {
                    this.stopVerifycodeCountdown();
                }
            }
        },
        startVerifycodeCountdown() {
            this.mobileLoginForm.currSecond = 60;
            this.mobileLoginForm.countdowning = true;
            this.mobileLoginForm.countdownRound++;

            const round = this.mobileLoginForm.countdownRound;
            setTimeout(() => {
                this.verifycodeCountdown(round);
            }, 1000);
        },
        stopVerifycodeCountdown() {
            this.mobileLoginForm.countdowning = false;
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
        loginByAccount() {
			this.$refs.passLoginForm.validate((valid) => {
				if (valid) {
					this.loading = true;

                    const data = {
                        u: this.passLoginForm.username,
                        p: md5(this.passLoginForm.password),
                        f: this.$store.state.settings.platform,
                        k: this.keeplogined
                    };
					login(data)
						.then((res) => {
                            setToken(res.data.token)
                            setTimeout(() => {
                                this.$router.push({
                                    path: this.redirect || "/",
                                    query: this.otherQuery
                                });
                            });
						})
                        .catch(() => {
                            this.$refs.postLoginCaptcha.hide();
                        })
                        .finally(() => {
                            this.loading = false;
                        });
				}
			});
        },
        loginByMobile() {
			this.$refs.mobileLoginForm.validate((valid) => {
				if (valid) {
					this.loading = true;

                    const data = {
                        m: this.mobileLoginForm.mobile,
                        k: this.keeplogined
                    };
					loginByMobile(data, this.mobileLoginForm.verifycode)
						.then((res) => {
                            setToken(res.data.token)
                            setTimeout(() => {
                                this.$router.push({
                                    path: this.redirect || "/",
                                    query: this.otherQuery
                                });
                            });
						})
                        .finally(() => {
                            this.loading = false;
                        });
                }
            });
        },
		handleLogin() {
            if (this.loginType == 0) { // 账号密码
                this.$refs.passLoginForm.validate((valid) => {
                    if (valid) {
                        this.$refs.postLoginCaptcha.tryShow("post_/account/login/password");
                    }
                });
            } else if (this.loginType == 1) { // 手机验证码
                this.loginByMobile();
            }
		},
		getOtherQuery(query) {
			return Object.keys(query).reduce((acc, cur) => {
				if (cur !== "redirect") {
					acc[cur] = query[cur];
				}
				return acc;
			}, {});
		}
	}
};
</script>

<style>
.login-page {
    margin: 0;
    padding: 0;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f7f8fa;
}

.el-hidden {
    display: none !important;
}

.login-container-only-right {
    max-width: 35%;
    min-width: 420px !important;
}

.right-area-only {
    width: 100% !important;
    border-top-left-radius: 11px;
    border-bottom-left-radius: 11px;
}

.login-form {
    margin: 0 auto;
    padding: 0;
}

.password-input-suffix {
    margin: 0 12px 0 0;
    height: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.label-default {
    font-size: 14px;
    color: #AAB0C4;
}

.login-container-default,
.login-container-medium {
    display: flex;
    flex-flow: row nowrap;
    width: 75%;
    height: 80%;
    min-height: 465px;
    min-width: 920px;
    border-radius: 11px;
    box-shadow: 0px 0px 7px #d6d7d8;
}

.login-container-default .left-area,
.login-container-medium .left-area {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 55%;
    border-top-left-radius: 11px;
    border-bottom-left-radius: 11px;
    background-color: #2a86ff;
}

.login-container-default .left-area .left-area-title,
.login-container-medium .left-area .left-area-title {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin: 50px 0 0 0;
    width: 70%;
}

.login-container-default .left-area .left-area-title .left-area-title-logo,
.login-container-medium .left-area .left-area-title .left-area-title-logo {
    width: 60px;
    opacity: 0.75;
}

.login-container-default .left-area .left-area-title .left-area-title-main,
.login-container-medium .left-area .left-area-title .left-area-title-main {
    font-size: 26px;
}

.login-container-default .left-area .left-area-title .left-area-title-sub,
.login-container-medium .left-area .left-area-title .left-area-title-sub {
    font-size: 19px;
}

.login-container-default .left-area .slogan,
.login-container-medium .left-area .slogan {
    margin: 15px 0 0 0;
    width: 70%;
    color: #dfdfdf;
    font-size: 14.5px;
}

.login-container-default .right-area,
.login-container-medium .right-area {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 45%;
    border-top-right-radius: 11px;
    border-bottom-right-radius: 11px;
    background: white;
}

.login-container-default .right-area .right-area-title,
.login-container-medium .right-area .right-area-title {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin: 0 0 50px 0;
    width: 365px;
}

.login-container-default .right-area .right-area-title .right-area-title-logo,
.login-container-medium .right-area .right-area-title .right-area-title-logo {
    width: 66px;
}

.login-container-default .right-area .right-area-title .right-area-title-main,
.login-container-medium .right-area .right-area-title .right-area-title-main {
    font-size: 26px;
    font-weight: 500;
    line-height: 39px;
}

.login-container-default .right-area .right-area-title .right-area-title-sub,
.login-container-medium .right-area .right-area-title .right-area-title-sub {
    font-size: 14px;
    line-height: 21px;
}

.login-container-default .right-area .login-form,
.login-container-medium .right-area .login-form {
    width: 365px;
}

.login-container-default .right-area .login-form .el-input__inner,
.login-container-medium .right-area .login-form .el-input__inner {
    height: 42.5px !important;
    line-height: 42.5px !important;
    border-radius: 0;
    border-top-width: 0;
    border-right-width: 0;
    border-left-width: 0;
    font-size: 15.5px;
}

.login-container-default .right-area .login-form .eye-size,
.login-container-medium .right-area .login-form .eye-size {
    width: 17px;
    height: 17px;
}

.login-container-default .right-area .login-panel,
.login-container-medium .right-area .login-panel {
    width: 360px;
}

.login-container-default .right-area .login-button,
.login-container-medium .right-area .login-button {
    width: 360px;
    height: 56px;
    margin: 25px 0 15px 0;
    font-size: 18px;
}

.login-container-small {
    display: flex;
    flex-flow: row nowrap;
    width: 70%;
    height: 75%;
    min-height: 430px;
    min-width: 850px;
    border-radius: 11px;
    box-shadow: 0px 0px 7px #d6d7d8;
}

.login-container-small .left-area {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 55%;
    border-top-left-radius: 11px;
    border-bottom-left-radius: 11px;
    background-color: #2a86ff;
}

.login-container-small .left-area .left-area-title {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin: 50px 0 0 0;
    width: 70%;
}

.login-container-small .left-area .left-area-title .left-area-title-logo {
    width: 57px;
    opacity: 0.75;
}

.login-container-small .left-area .left-area-title .left-area-title-main {
    font-size: 24px;
}

.login-container-small .left-area .left-area-title .left-area-title-sub {
    font-size: 17px;
}

.login-container-small .left-area .slogan {
    margin: 15px 0 0 0;
    width: 70%;
    color: #dfdfdf;
    font-size: 13.5px;
}

.login-container-small .right-area {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 45%;
    border-top-right-radius: 11px;
    border-bottom-right-radius: 11px;
    background: white;
}

.login-container-small .right-area .right-area-title {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin: 0 0 50px 0;
    width: 320px;
}

.login-container-small .right-area .right-area-title .right-area-title-logo {
    width: 63px;
}

.login-container-small .right-area .right-area-title .right-area-title-main {
    font-size: 25px;
    font-weight: 500;
    line-height: 39px;
}

.login-container-small .right-area .right-area-title .right-area-title-sub {
    font-size: 13px;
    line-height: 21px;
}

.login-container-small .right-area .login-form {
    width: 320px;
}

.login-container-small .login-form .el-input__inner {
    border-radius: 0;
    border-top-width: 0;
    border-right-width: 0;
    border-left-width: 0;
}

.login-container-small .right-area .login-form .eye-size {
    width: 16px;
    height: 16px;
}

.login-container-small .login-panel {
    width: 320px;
}

.login-container-small .login-button {
    width: 320px;
    height: 47px;
    margin: 25px 0 15px 0;
    font-size: 17px;
}

.login-container-mini {
    display: flex;
    flex-flow: row nowrap;
    width: 65%;
    height: 70%;
    min-height: 400px;
    min-width: 780px;
    border-radius: 11px;
    box-shadow: 0px 0px 7px #d6d7d8;
}

.login-container-mini .left-area {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 55%;
    border-top-left-radius: 11px;
    border-bottom-left-radius: 11px;
    background-color: #2a86ff;
}

.login-container-mini .left-area .left-area-title {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin: 50px 0 0 0;
    width: 70%;
}

.login-container-mini .left-area .left-area-title .left-area-title-logo {
    width: 52px;
    opacity: 0.75;
}

.login-container-mini .left-area .left-area-title .left-area-title-main {
    font-size: 22px;
}

.login-container-mini .left-area .left-area-title .left-area-title-sub {
    font-size: 15px;
}

.login-container-mini .left-area .slogan {
    margin: 15px 0 0 0;
    width: 70%;
    color: #dfdfdf;
    font-size: 12.5px;
}

.login-container-mini .right-area {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 45%;
    border-top-right-radius: 11px;
    border-bottom-right-radius: 11px;
    background: white;
}

.login-container-mini .right-area .right-area-title {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin: 0 0 50px 0;
    width: 295px;
}

.login-container-mini .right-area .right-area-title .right-area-title-logo {
    width: 60px;
}

.login-container-mini .right-area .right-area-title .right-area-title-main {
    font-size: 23px;
    font-weight: 500;
    line-height: 39px;
}

.login-container-mini .right-area .right-area-title .right-area-title-sub {
    font-size: 12px;
    line-height: 21px;
}

.login-container-mini .right-area .login-form {
    width: 295px;
}

.login-container-mini .right-area .login-form .el-input__inner {
    height: 27px !important;
    line-height: 27px !important;
    border-radius: 0;
    border-top-width: 0;
    border-right-width: 0;
    border-left-width: 0;
    font-size: 13px;
}

.login-container-mini .right-area .login-form .eye-size {
    width: 16px;
    height: 16px;
}

.login-container-mini .login-panel {
    width: 295px;
}

.login-container-mini .login-button {
    width: 295px;
    height: 40px;
    margin: 20px 0 10px 0;
    font-size: 15px;
}

.verifycode-input .el-input__inner {
    border-right: none;
}

.verifycode-input .el-input-group__append {
    background: #fff;
    padding: 0 8px 0 0;
    border-top-width: 0;
    border-right-width: 0;
    border-radius: 0;
}

.el-form-item.is-error .verifycode-input .el-input-group__append {
    border-color: #ff4949;
}

.verifycode-input.is-focus .el-input-group__append {
    border-color: #1890ff;
}

.checkbox-keeploign-aweek {
    color: #909399 !important;
}

.checkbox-keeploign-aweek .el-checkbox__label {
    padding-left: 3px !important;
}
</style>
