<template>
	<div class="app-container" :class="_getContainerClass()">
        <div class="getpass-header">
            <div class="getpass-title">
                <span class="sbutitle">账号安全中心</span>
                <span class="sbutitle2">找回密码</span>

                <div class="getpass-title-right">
                    <svg-icon icon-class="fastapi-home" class="backhome-icon" @click="goHome()" />
                    <el-link class="backhome-label" :underline="false" :href="'/#/'">返回首页</el-link>
                </div>
            </div>
        </div>
        <div class="getpass-body">
            <div class="getpass-caption">
                找回密码
            </div>
            <div class="getpass-form">
                <div v-show="step == 1" class="getpass-form-padding">
                    <p class="getpass-hint">验证码将会发送至你的注册邮箱或手机</p>

                    <el-form ref="firstForm" :model="stepData.first.data" :rules="stepData.first.rules">
                        <el-form-item prop="account">
                            <el-input
                                v-model="stepData.first.data.account"
                                :disabled="stepData.first.submiting"
                                placeholder="手机号或邮箱"
                                class="getpass-input"
                            />
                        </el-form-item>
                    </el-form>

                    <div style="height: 50px;" />

                    <el-button
                        :loading="stepData.first.submiting"
                        type="primary"
                        style="width: 296px;"
                        @click="tryGetCaptcha()"
                    >
                        下一步
                    </el-button>
                </div>
                <div v-show="step == 2" class="getpass-form-padding2">
                    <p class="getpass-hint2">验证码将会发送至你的注册邮箱或手机</p>

                    <el-form ref="secondForm" :model="stepData.second.data" :rules="stepData.second.rules">
                        <el-form-item class="getpass-secondform-item">
                            <el-input
                                v-model="stepData.first.data.account"
                                :disabled="true"
                                placeholder="手机号或邮箱"
                                class="getpass-input"
                            >
                                <template slot="append">
                                    <el-link :underline="false" @click="gotoFirst()">修改</el-link>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item class="getpass-secondform-item" prop="password">
                            <el-input
                                v-model="stepData.second.data.password"
                                :type="'password'"
                                :disabled="stepData.second.submiting"
                                show-password
                                placeholder="请输入新密码"
                                class="getpass-input"
                            />
                        </el-form-item>
                        <el-form-item class="getpass-secondform-item" prop="password2">
                            <el-input
                                v-model="stepData.second.data.password2"
                                :type="'password'"
                                :disabled="stepData.second.submiting"
                                show-password
                                placeholder="请再次输入新密码"
                                class="getpass-input"
                            />
                        </el-form-item>
                        <el-form-item class="getpass-secondform-item" prop="verifycode">
                            <el-input
                                v-model="stepData.second.data.verifycode"
                                :disabled="stepData.second.submiting"
                                maxlength="6"
                                placeholder="请输入验证码"
                                class="getpass-input"
                            >
                                <template slot="append">
                                    <el-link v-show="!stepData.second.countdowning" :underline="false" @click="tryGetCaptcha()">重新发送验证码</el-link>
                                    <div v-show="stepData.second.countdowning">{{ stepData.second.currSecond }}s后可重新获取</div>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-form>

                    <div class="getpass-second-space" />

                    <el-button
                        :loading="stepData.first.submiting"
                        type="primary"
                        style="width: 296px;"
                        @click="submit()"
                    >
                        提 交
                    </el-button>
                </div>
                <div v-show="step == 3" class="getpass-form-padding3">
                    <img src="@/assets/common_images/succ.png" width="100px">
                    <div class="getpass-succ-message">恭喜你，密码重置已经成功！</div>
                    <div class="getpass-succ-redirect">
                        <div>{{ stepData.third.currSecond }}s后跳转到登录页进行登录，</div>
                        <el-link :underline="false" href="/#/login" style="font-size: 16px;">点击立即跳转</el-link>
                    </div>
                </div>
            </div>
        </div>

        <dayuan-captcha
            ref="getPassCaptcha"
            :captcha-required-url="_getCaptchaRequiredUrl()"
            :captcha-url="_getCaptchaUrl()"
            :headers="_getDayuanCaptchaRequestHeaders()"
            @error="onCaptchaError"
            @submit="onCaptchaPassed"
        />
    </div>
</template>

<script>
import DayuanCaptcha from 'dayuan-captcha'
import { getVerifyCode, setPassByMobile, setPassByEmail } from "@/api/getpass";
import md5 from 'js-md5';
import { getSize } from '../../utils/globalsize'
import { Message } from 'element-ui'

import 'dayuan-captcha/lib/dayuan-captcha.css'

const defaultSettings = require('@/settings.js')

export default {
	name: "GetPass",
    components: { DayuanCaptcha },
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
            if (value != this.stepData.second.data.password) {
                callback(new Error("两次输入密码不一致。"));
            } else {
                callback();
            }
        };

        return {
            step: 1,
            stepData: {
                first: {
                    submiting: false,
                    data: {
                        account: ''
                    },
                    rules: {
                        account: [
                            { required: true, message: "手机号或邮箱不能为空" },
                            {
                                pattern: "^(1[0-9]{10})|(([a-z0-9A-Z]+[-|\\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-zA-Z]{2,})$",
                                message: "请输入正确的手机号码或邮箱地址"
                            }
                        ]
                    }
                },
                second: {
                    submiting: false,
                    data: {
                        password: '',
                        password2: '',
                        verifycode: ''
                    },
                    countdowning: false,
                    currSecond: 60,
                    countdownRound: 0,
                    rules: {
                        account: [
                            { required: true, message: "手机号或邮箱不能为空" },
                            {
                                pattern: "^(1[0-9]{10})|(([a-z0-9A-Z]+[-|\\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-zA-Z]{2,})$",
                                message: "请输入正确的手机号码或邮箱地址"
                            }
                        ],
                        password: [
                            { required: true, message: "请输入新的密码。" },
                            { trigger: "blur", validator: validateNewPass }
                        ],
                        password2: [
                            { required: true, message: "请再次输入新的密码。" },
                            { trigger: "blur", validator: validateNewPassAgain }
                        ],
                        verifycode: [
                            { required: true, message: "请输入验证码。" }
                        ]
                    }
                },
                third: {
                    countdownRound: 1,
                    currSecond: 5
                }
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
        _getContainerClass() {
            return 'getpass-container-' + getSize();
        },
        _getCaptchaRequiredUrl() {
            return (window.RELEASE_APP_BASE_URL || process.env.VUE_APP_BASE_API) + '/captcha/required';
        },
        _getCaptchaUrl() {
            return (window.RELEASE_APP_BASE_URL || process.env.VUE_APP_BASE_API) + '/captcha';
        },
        goHome() {
            this.$router.push('/');
        },
        gotoFirst() {
            this.step = 1;
        },
        secondCountdown(round) {
            if (this.stepData.second.countdowning &&
                round == this.stepData.second.countdownRound) {
                this.stepData.second.currSecond--;
                if (this.stepData.second.currSecond > 0) {
                    setTimeout(() => {
                        this.secondCountdown(round);
                    }, 1000);
                } else {
                    this.secondStopCountdown();
                }
            }
        },
        secondStartCountdown() {
            this.stepData.second.currSecond = 60;
            this.stepData.second.countdowning = true;
            this.stepData.second.countdownRound++;

            const round = this.stepData.second.countdownRound;
            setTimeout(() => {
                this.secondCountdown(round);
            }, 600);
        },
        secondStopCountdown() {
            this.stepData.second.countdowning = false;
        },
        tryGetCaptcha() {
            this.$refs.firstForm.validate((valid) => {
				if (valid) {
                    this.$refs.getPassCaptcha.tryShow("get_/setpass/verifycode");
                }
            });
        },
        thirdCountdown(round) {
            if (round == this.stepData.third.countdownRound) {
                this.stepData.third.currSecond--;
                if (this.stepData.third.currSecond > 0) {
                    setTimeout(() => {
                        this.thirdCountdown(round);
                    }, 1000);
                } else {
                    this.$router.push('/login');
                }
            }
        },
        gotoThird() {
            this.stepData.third.currSecond = 5;
            this.stepData.third.countdownRound++;

            this.step = 3;

            const round = this.stepData.third.countdownRound;
            setTimeout(() => {
                this.thirdCountdown(round);
            }, 1000);
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
        onCaptchaPassed() {
            if (this.step == 1) {
                this.stepData.first.submiting = true;
            }

            this.requestVerifycode()
                .then(() => {
                    if (this.step == 1) {
                        this.step = 2;
                    }
                })
                .finally(() => {
                    this.stepData.first.submiting = false;
                })

            this.$refs.getPassCaptcha.hide();
        },
        requestVerifycode() {
            return new Promise((resolve, reject) => {
                const data = {
                    params: {
                        account: this.stepData.first.data.account
                    }
                }

                getVerifyCode(data)
                    .then((res) => {
                        if (res.code == 0) {
                            this.secondStopCountdown();
                            this.secondStartCountdown();
                            resolve();
                        } else {
                            reject();
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    })
            });
        },
        submit() {
            this.$refs.secondForm.validate((valid) => {
				if (valid) {
                    this.stepData.second.submiting = true;

                    const account = this.stepData.first.data.account;
                    if (/^1[0-9]{10}$/.test(account)) { // 手机
                        const data = {
                            m: account,
                            p: md5(this.stepData.second.data.password),
                            p2: md5(this.stepData.second.data.password2)
                        };
                        setPassByMobile(data, this.stepData.second.data.verifycode)
                            .then((res) => {
                                if (res.code == 0) {
                                    this.gotoThird();
                                }
                            })
                            .finally(() => {
                                this.stepData.second.submiting = false;
                            })
                    } else { // 邮箱
                        const data = {
                            e: account,
                            p: md5(this.stepData.second.data.password),
                            p2: md5(this.stepData.second.data.password2),
                            c: this.stepData.second.data.verifycode
                        };
                        setPassByEmail(data)
                            .then((res) => {
                                if (res.code == 0) {
                                    this.gotoThird();
                                }
                            })
                            .finally(() => {
                                this.stepData.second.submiting = false;
                            })
                    }
                }
            });
        }
    }
}
</script>

<style lang="scss">
.getpass-title-right {
    margin: 0 0 0 520px;
    display: inline-block;
}

.backhome-icon {
    margin: 0 1px 2px 0;
    color: #606266;
    cursor: pointer;
}

.getpass-title {
    & :hover {
        .backhome-icon {
            color: #006eff;
        }

        .backhome-label {
            color: #006eff;
        }
    }
}

.getpass-input {
    width: 300px;
}

.getpass-input {
    .el-input__inner {
        border-radius: 0 !important;
        border: none !important;
        border-bottom: 1px solid #dcdfe6 !important;
        padding-left: 10px !important;
    }
}

.getpass-secondform-item {
    .el-input-group__append {
        background: #FCFCFF;
        border-radius: 0;
        border: none;
        border-bottom: 1px solid #dcdfe6;
        padding: 0 11px 0 0;
    }
}

.getpass-secondform-item {
    margin-bottom: 21px;
}

.getpass-container-default,
.getpass-container-medium {
    background: #f4f4f4;
    min-height: 100vh;
    padding: 0;

    .backhome-icon {
        height: 17px;
    }

    .getpass-header {
        margin: 0 0 20px 0;
        height: 64px;
        background: white;
        border-bottom: 1px solid #e8e8e8;
    }

    .getpass-title {
        height: 100%;
        width: 860px;
        margin: 0 auto;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: left;
        font-size: 23px;
    }

    .sbutitle {
        margin: 0 21px 0 0;
    }

    .sbutitle2 {
        padding: 0 0 0 20px;
        border-left: 1px solid #ccc;
        font-size: 18px;
        color: #006eff;
    }

    .getpass-body {
        margin: 0 auto;
        width: 860px;
        background: white;
        border-radius: 4px;
    }

    .getpass-caption {
        height: 121px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        font-size: 30px;
    }

    .getpass-form {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: baseline;
        background: white;
        border-radius: 4px;
    }

    .getpass-form-padding {
        padding: 0 0 200px 0;
    }

    .getpass-form-padding2 {
        padding: 0 0 68px 0;
    }

    .getpass-hint {
        padding: 30px 0 50px 0;
        color: #333;
    }

    .getpass-hint2 {
        padding: 30px 0 20px 0;
        color: #333;
    }

    .getpass-second-space {
        height: 30px;
    }

    .getpass-form-padding3 {
        padding: 60px 0 229px 0;
        text-align: center;
    }

    .getpass-succ-message {
        padding: 20px 0 20px 0;
        font-size: 28px;
    }

    .getpass-succ-redirect {
        display: flex;
        flex-flow: row nowrap;
    }
}

.getpass-container-small {
    background: #f4f4f4;
    min-height: 100vh;
    padding: 0;

    .backhome-icon {
        height: 17px;
    }

    .getpass-header {
        margin: 0 0 20px 0;
        height: 64px;
        background: white;
        border-bottom: 1px solid #e8e8e8;
    }

    .getpass-title {
        height: 100%;
        width: 860px;
        margin: 0 auto;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: left;
        font-size: 22px;
    }

    .sbutitle {
        margin: 0 20px 0 0;
    }

    .sbutitle2 {
        padding: 0 0 0 20px;
        border-left: 1px solid #ccc;
        font-size: 17px;
        color: #006eff;
    }

    .getpass-body {
        margin: 0 auto;
        width: 860px;
        background: white;
        border-radius: 4px;
    }

    .getpass-caption {
        height: 80px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        font-size: 27px;
    }

    .getpass-form {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: baseline;
        background: white;
        border-radius: 4px;
    }

    .getpass-form-padding {
        padding: 0 0 173px 0;
    }

    .getpass-form-padding2 {
        padding: 0 0 60px 0;
    }

    .getpass-hint {
        padding: 10px 0 60px 0;
        color: #333;
        font-size: 16px;
    }

    .getpass-hint2 {
        padding: 10px 0 10px 0;
        color: #333;
        font-size: 16px;
    }

    .getpass-second-space {
        height: 30px;
    }

    .getpass-form-padding3 {
        padding: 60px 0 191px 0;
        text-align: center;
    }

    .getpass-succ-message {
        padding: 20px 0 20px 0;
        font-size: 26px;
    }

    .getpass-succ-redirect {
        display: flex;
        flex-flow: row nowrap;
    }
}

.getpass-container-mini {
    background: #f4f4f4;
    min-height: 100vh;
    padding: 0;

    .backhome-icon {
        height: 16px;
    }

    .getpass-header {
        margin: 0 0 20px 0;
        height: 54px;
        background: white;
        border-bottom: 1px solid #e8e8e8;
    }

    .getpass-title {
        height: 100%;
        width: 860px;
        margin: 0 auto;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: left;
        font-size: 21px;
    }

    .sbutitle {
        margin: 0 19px 0 0;
    }

    .sbutitle2 {
        padding: 0 0 0 20px;
        border-left: 1px solid #ccc;
        font-size: 16px;
        color: #006eff;
    }

    .getpass-body {
        margin: 0 auto;
        width: 860px;
        background: white;
        border-radius: 4px;
    }

    .getpass-caption {
        height: 60px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        font-size: 24px;
    }

    .getpass-form {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: baseline;
        background: white;
        border-radius: 4px;
    }

    .getpass-form-padding {
        padding: 0 0 130px 0;
    }

    .getpass-form-padding2 {
        padding: 0 0 27px 0;
    }

    .getpass-hint {
        padding: 10px 0 60px 0;
        color: #333;
        font-size: 15px;
    }

    .getpass-hint2 {
        padding: 10px 0 10px 0;
        color: #333;
        font-size: 15px;
    }

    .getpass-second-space {
        height: 20px;
    }

    .getpass-form-padding3 {
        padding: 60px 0 148px 0;
        text-align: center;
    }

    .getpass-succ-message {
        padding: 20px 0 20px 0;
        font-size: 24px;
    }

    .getpass-succ-redirect {
        display: flex;
        flex-flow: row nowrap;
    }
}
</style>
