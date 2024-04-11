<template>
	<div class="login-page">
        <div class="login-container">
            <div class="left-area">
                <el-carousel arrow="never" height="400px">
                    <el-carousel-item>
                        <div class="carousel-item-container">
                            <img src="@/assets/login/box.svg" width="70%">
                            <span class="title">开箱即用</span>
                            <span class="subtitle">功能齐全、逻辑完整，下载即可运行</span>
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div class="carousel-item-container">
                            <img src="@/assets/login/beautiful.svg" width="70%">
                            <span class="title">美观大方</span>
                            <span class="subtitle">布局大气、配色高端，支持自定义</span>
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div class="carousel-item-container">
                            <img src="@/assets/login/easy.svg" width="70%">
                            <span class="title">易学易用</span>
                            <span class="subtitle">教程清晰、配置简单，新人轻松上手</span>
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
            <div class="right-area">
                <div class="right-area-title">
                    <img src="@/assets/logo/dayuan_mini.png" class="right-area-title-logo">
                    <div style="margin: 0 0 0 15px;">
                        <div class="right-area-title-main" style="color: #2F3950;">欢迎登录</div>
                        <div class="right-area-title-sub" style="color: #687089;">大圆Admin前端开发框架</div>
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
                            :class="mobileLoginForm.verifycodeInputFocused ? 'is-focus' : ''"
                            @focus="mobileLoginForm.verifycodeInputFocused = true"
                            @blur="mobileLoginForm.verifycodeInputFocused = false"
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
                            验证码登录
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
                        <el-link type="primary" :underline="false" :href="'/#/register'" :class="_getLoginFormLabelFontClass()">
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
import { getSizeFontClass } from '../../utils/globalsize'
import { Message } from 'element-ui'

import 'dayuan-captcha/lib/dayuan-captcha.css'

const defaultSettings = require('../../settings.js')

export default {
	name: "Login",
    components: { DayuanCaptcha },
	data() {
		return {
            loginType: 0, // 0: 密码登录，1: 手机验证码
            passwordInputType: 'password',
			passLoginForm: {
				username: null,
				password: null
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
                verifycode: "",
                verifycodeInputFocused: false
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
		}
	},
	mounted() {
		if (this.passLoginForm.username === "") {
			this.$refs.username.focus();
		} else if (this.passLoginForm.password === "") {
			this.$refs.password.focus();
		}
	},
	methods: {
        _getDayuanCaptchaRequestHeaders() {
            return {
                "Platform": defaultSettings.platform,
                "Product": defaultSettings.product
            }
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
    background: url('~@/assets/login/default.png');
    background-size: cover;
    background-repeat: no-repeat;
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

.login-container {
    display: flex;
    flex-flow: row nowrap;
    width: 720px;
    height: 400px;
    border-radius: 5px;
    box-shadow: 0px 0px 7px #d6d7d8;
}

.login-container .left-area {
    height: 100%;
    width: 50%;
    border-top-left-radius: 11px;
    border-bottom-left-radius: 11px;
    background-color: #ebebeb;
}

.login-container .left-area .carousel-item-container {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.login-container .left-area .carousel-item-container .title {
    margin: 25px 0 0 0;
    font-size: 19px;
    font-weight: bold;
    color: #515151;
}

.login-container .left-area .carousel-item-container .subtitle {
    margin: 10px 0 0 0;
    font-size: 14px;
    color: #666666;
}

.login-container .right-area {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 50%;
    border-top-right-radius: 11px;
    border-bottom-right-radius: 11px;
    background: white;
}

.login-container .right-area .right-area-title {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin: 0 0 35px 0;
    width: 320px;
}

.login-container .right-area .right-area-title .right-area-title-logo {
    width: 61px;
    height: 61px;
}

.login-container .right-area .right-area-title .right-area-title-main {
    font-size: 25px;
    font-weight: 500;
    line-height: 39px;
}

.login-container .right-area .right-area-title .right-area-title-sub {
    font-size: 13px;
    line-height: 21px;
}

.login-container .right-area .login-form {
    width: 270px;
}

.login-container .login-form .el-input__inner {
    border-radius: 0;
    border-top-width: 0;
    border-right-width: 0;
    border-left-width: 0;
}

.login-container .right-area .login-form .eye-size {
    width: 16px;
    height: 16px;
}

.login-container .login-panel {
    width: 270px;
}

.login-container .login-button {
    width: 270px;
    height: 41px;
    margin: 25px 0 15px 0;
    font-size: 17px;
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

.verifycode-input:hover .el-input__inner {
    border-color: #bfc4cd;
}

.verifycode-input:hover .el-input-group__append {
    border-color: #bfc4cd;
}

.el-form-item.is-error .verifycode-input .el-input__inner {
    border-color: #ff4949 !important;
}

.el-form-item.is-error .verifycode-input .el-input-group__append {
    border-color: #ff4949;
}

.verifycode-input.is-focus .el-input__inner {
    border-color: #1890ff !important;
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
