<template>
	<div
        v-loading="loading"
        class="app-container"
        style="display: flex; flex-direction: column; align-items: center; margin: 10vh 50px 0 0;"
    >
        <div style="width: 400px;">
            <el-upload
                class="avatar-uploader"
                :action="avatarUploadUrl"
                :show-file-list="false"
                :with-credentials="true"
                :headers="uploadHeaders"
                :on-success="refreshAvatar"
            >
                <img v-if="avatarData" :src="avatarData" class="avatar">
                <img v-else :src="avatar" class="avatar">
            </el-upload>
        </div>

        <el-form
            :model="profile"
            label-position="right"
            label-width="95px"
            style="width: 400px;"
        >
            <el-form-item label="用户账号：">
                {{ profile.Code }}
            </el-form-item>
            <el-form-item label="用户名称：">
                {{ profile.Name }}
            </el-form-item>
            <el-form-item label="手机号码：" class="action-item">
                <span v-if="profile.Mobile == null || profile.Mobile.replace(/(^s*)|(s*$)/g, '').length == 0">
                    <el-link type="primary" :underline="false" @click="showBindPhoneDlg">绑定</el-link>
                </span>
                <span v-else>
                    {{ profile.Mobile }}
                    <el-link type="primary" style="margin: 0 0 0 10px;" :underline="false" @click="showBindPhoneDlg">变更</el-link>
                </span>
            </el-form-item>
            <el-form-item label="电子邮箱：" class="action-item">
                <span v-if="profile.Email == null || profile.Email.replace(/(^s*)|(s*$)/g, '').length == 0">
                    <el-link type="primary" :underline="false" @click="showBindEmailDlg">绑定</el-link>
                </span>
                <span v-else>
                    {{ profile.Email }}
                    <el-link type="primary" style="margin: 0 0 0 10px;" :underline="false" @click="showBindEmailDlg">变更</el-link>
                </span>
            </el-form-item>
            <el-form-item v-if="showBindWechat" label="微信账户：" class="action-item">
                <span v-if="profile.Wechat == null || profile.Wechat.replace(/(^s*)|(s*$)/g, '').length == 0">
                    <el-link type="primary" :underline="false" @click="showBindWechatDlg">绑定</el-link>
                </span>
                <span v-else>
                    <span style="color: #13ce66;">已绑定</span>
                    <el-link type="primary" style="margin: 0 0 0 10px;" :underline="false" @click="showBindWechatDlg">变更</el-link>
                </span>
            </el-form-item>
            <el-form-item label="所属机构：">
                {{ profile.Org && profile.Org.Name ? profile.Org.Name : "未设置" }}
            </el-form-item>
            <el-form-item label="有效期限：">
                {{ getExpires() }}
            </el-form-item>
        </el-form>

		<el-dialog
			ref="dlgBindPhone"
			v-el-drag-dialog
			title="绑定手机"
			width="360px"
			center
			:show-close="!phoneDialog.form.submiting"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="phoneDialog.showing"
            @open="$dialogReposition($refs['dlgBindPhone'])"
            @opened="$dialogReposition($refs['dlgBindPhone'])"
		>
			<el-form
				ref="phoneForm"
				:model="phoneDialog.form.data"
				:rules="phoneDialog.form.rules"
				:disabled="phoneDialog.form.submiting"
				label-position="right"
				label-width="80px"
				style="margin: 0 0px"
			>
				<el-form-item label="手机号码" prop="mobile">
					<el-input
						v-model="phoneDialog.form.data.mobile"
						placeholder="请输入常用手机号码"
					/>
				</el-form-item>
				<el-form-item label="验 证 码" prop="code">
					<el-input
                        ref="smscode"
                        v-model="phoneDialog.form.data.code"
                        placeholder="请输入验证码"
                        class="profile-verifycode"
                        :class="phoneDialog.form.smscodeInputFocused ? 'is-focus' : ''"
                        @focus="phoneDialog.form.smscodeInputFocused = true"
                        @blur="phoneDialog.form.smscodeInputFocused = false"
					>
                        <template slot="append">
                            <el-link v-show="!phoneDialog.form.countdowning" :underline="false" @click="getSmsCode()">发送验证码</el-link>
                            <div v-show="phoneDialog.form.countdowning">{{ phoneDialog.form.currSecond }}s后可重新获取</div>
                        </template>
                    </el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button
					style="width: 100px"
					:disabled="phoneDialog.form.submiting"
					@click="phoneDialog.showing = false"
				>
					取消
				</el-button>
				<el-button
					type="primary"
					icon="el-icon-check"
					style="width: 150px"
					:loading="phoneDialog.form.submiting"
					@click="bindPhone"
				>
					提交
				</el-button>
			</div>
		</el-dialog>

        <dayuan-captcha
            ref="getSmsCaptcha"
            :captcha-required-url="_getCaptchaRequiredUrl()"
            :captcha-url="_getCaptchaUrl()"
            :headers="_getDayuanCaptchaRequestHeaders()"
            @error="onCaptchaError"
            @submit="sendSmsCodeRequest"
        />

		<el-dialog
			ref="dlgBindEmail"
			v-el-drag-dialog
			title="绑定电子邮箱"
			width="360px"
			center
			:show-close="!emailDialog.form.submiting"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="emailDialog.showing"
            @open="$dialogReposition($refs['dlgBindEmail'])"
            @opened="$dialogReposition($refs['dlgBindEmail'])"
		>
			<el-form
				ref="emailForm"
				:model="emailDialog.form.data"
				:rules="emailDialog.form.rules"
				:disabled="emailDialog.form.submiting"
				label-position="right"
				label-width="80px"
				style="margin: 0 0px"
			>
				<el-form-item label="电子邮箱" prop="email">
					<el-input
						v-model="emailDialog.form.data.email"
						placeholder="请输入常用电子邮箱"
					/>
				</el-form-item>
				<el-form-item label="验 证 码" prop="code">
					<el-input
                        ref="emailcode"
                        v-model="emailDialog.form.data.code"
                        placeholder="请输入验证码"
                        class="profile-verifycode"
                        :class="emailDialog.form.emailcodeInputFocused ? 'is-focus' : ''"
                        @focus="emailDialog.form.emailcodeInputFocused = true"
                        @blur="emailDialog.form.emailcodeInputFocused = false"
					>
                        <template slot="append">
                            <el-link v-show="!emailDialog.form.countdowning" :underline="false" @click="getEmailVerifyCode()">发送验证码</el-link>
                            <div v-show="emailDialog.form.countdowning">{{ emailDialog.form.currSecond }}s后可重新获取</div>
                        </template>
                    </el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button
					style="width: 100px"
					:disabled="emailDialog.form.submiting"
					@click="emailDialog.showing = false"
				>
					取消
				</el-button>
				<el-button
					type="primary"
					icon="el-icon-check"
					style="width: 150px"
					:loading="emailDialog.form.submiting"
					@click="bindEmail"
				>
					提交
				</el-button>
			</div>
		</el-dialog>

        <dayuan-captcha
            ref="getBindEmailCaptcha"
            :captcha-required-url="_getCaptchaRequiredUrl()"
            :captcha-url="_getCaptchaUrl()"
            :headers="_getDayuanCaptchaRequestHeaders()"
            @error="onCaptchaError"
            @submit="sendEmailRequest"
        />

		<el-dialog
			ref="dlgBindWechat"
			v-el-drag-dialog
			title="绑定微信"
			width="360px"
			center
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:visible.sync="wechatDialog.showing"
            @open="$dialogReposition($refs['dlgBindWechat'])"
            @opened="$dialogReposition($refs['dlgBindWechat'])"
		>
            <div id="wechatQRCode" style="height: 400px;" />
        </el-dialog>
    </div>
</template>

<script>
import store from '@/store'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'
import { getUserDetail } from "@/api/user";
import moment from 'moment';
import { getSmsCode } from "@/api/sms"
import { getUploadAvatarUrl, getAvatar, bindPhone, getBindEmailVerifycode, bindEmail, showWechatQRCode, getBindWechatState } from "@/api/account"
import { MessageBox, Message } from 'element-ui'
import DayuanCaptcha from 'dayuan-captcha'
import elDragDialog from "@/directive/el-drag-dialog"; // base on element-ui

import 'dayuan-captcha/lib/dayuan-captcha.css'

const defaultSettings = require('../../settings.js')

export default {
    name: "Profile",
    components: { DayuanCaptcha },
    directives: { elDragDialog },
    data() {
        return {
            loading: false,
            avatarData: null,
            profile: {
                Id: null,
                Code: null,
                Name: null,
                Mobile: null,
                Email: null,
                Wechat: null,
                Expires: null
            },
            phoneDialog: {
                showing: false,
                form: {
                    submiting: false,
                    countdowning: false,
                    countdownRound: 1,
                    currSecond: 60,
                    smscodeInputFocused: false,
                    data: {
                        mobile: null,
                        code: null
                    },
                    rules: {
                        mobile: [
                            { required: true, message: "手机号不能为空" },
                            {
                                pattern: "^1[0-9]{10}$",
                                message: "请输入正确的手机号码。"
                            }
                        ],
                        code: [
                            { required: true, message: "验证码不能为空" }
                        ]
                    }
                }
            },
            emailDialog: {
                showing: false,
                form: {
                    submiting: false,
                    countdowning: false,
                    countdownRound: 1,
                    currSecond: 60,
                    emailcodeInputFocused: false,
                    data: {
                        email: null,
                        code: null
                    },
                    rules: {
                        email: [
                            { required: true, message: "电子邮箱不能为空" },
                            { type: "email", message: "请输入正确的邮箱地址。" }
                        ],
                        code: [
                            { required: true, message: "验证码不能为空" }
                        ]
                    }
                }
            },
            wechatDialog: {
                showing: false
            }
        }
    },
    computed: {
        ...mapGetters([
            'avatar'
        ]),
        avatarUploadUrl() {
            return getUploadAvatarUrl();
        },
        uploadHeaders() {
            const headers = {
                'Platform': defaultSettings.platform,
                'Product': defaultSettings.product
            }

            const token = getToken();
            if (token) {
                headers['Authorization'] = token
            }

            return headers;
        },
        showBindWechat() {
            return defaultSettings.showBindWechatInProfile;
        }
    },
    beforeMount() {
        if (defaultSettings.showBindWechatInProfile) {
            this._loadWecahtJsFile();
        }

        this.loadData();
    },
    methods: {
        _loadWecahtJsFile() {
            const elScript = document.createElement("SCRIPT");
            elScript.setAttribute('async', true);
            elScript.src = 'http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
            document.head.appendChild(elScript);
        },
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
        getExpires() {
            const expires = moment(this.profile.Expires).format(
                "YYYY-MM-DD"
            );
            return expires == '9999-12-31' ? '永久有效' : expires;
        },
        refreshAvatar(res) {
            if (res.code == 0) {
                this.loading = true;
                Message({
                    message: '头像上传成功！',
                    type: 'success',
                    duration: 5 * 1000
                });

                getAvatar()
                    .then(res => {
                        if (res.code == 0) {
                            this.avatarData = res.data;
                            this.$store.dispatch('user/setAvatar', res.data)
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    })
            } else {
                Message({
                    message: res.error,
                    type: 'error',
                    duration: 5 * 1000
                })

                if (res.code === 1001 || res.code === 1002 ||
                    res.code === 1003 || res.code === 2001) {
                    setTimeout(() => {
                        // to re-login
                        MessageBox.confirm('　　当前账户即将退出登录状态，可能是您长时间未进行操作登录状态过期或其他原因；您可以选择取消留在当前页面或重新登录进入系统。', '退出提示', {
                            confirmButtonText: '重新登录',
                            cancelButtonText: '取消',
                            type: 'confirm'
                        }).then(() => {
                            store.dispatch('user/resetToken').then(() => {
                                location.reload()
                            })
                        })
                    }, 50);
                }
            }
        },
        loadData() {
            let num = 2;
            this.loading = true;

            getAvatar()
                .then(res => {
                    if (res.code == 0) {
                        this.avatarData = res.data;
                    }
                })
                .finally(() => {
                    num--;
                    if (num == 0) {
                        this.loading = false;
                    }
                })

            const id = this.$store.getters.userid;
            getUserDetail(id)
                .then(res => {
                    if (res.code == 0) {
                        this.profile = res.data;
                    }
                })
                .finally(() => {
                    num--;
                    if (num == 0) {
                        this.loading = false;
                    }
                })
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
        resetPhoneDialogForm() {
            this.phoneDialog.form.data.mobile = null;
            this.phoneDialog.form.data.code = null;
        },
        showBindPhoneDlg() {
			this.resetPhoneDialogForm();
			this.phoneDialog.showing = true;
            this.$nextTick(() => {
				this.$refs["phoneForm"].clearValidate();
			});
        },
        getSmsCode() {
            this.$refs.phoneForm.validateField("mobile", (error) => {
                if (!error) {
                    this.$refs.getSmsCaptcha.tryShow("get_/sms");
                }
            });
        },
        smscodeCountdown(round) {
            if (this.phoneDialog.form.countdowning &&
                round == this.phoneDialog.form.countdownRound) {
                this.phoneDialog.form.currSecond--;

                if (this.phoneDialog.form.currSecond > 0) {
                    setTimeout(() => {
                        this.smscodeCountdown(round);
                    }, 1000);
                } else {
                    this.stopSmscodeCountdown();
                }
            }
        },
        startSmscodeCountdown() {
            this.phoneDialog.form.currSecond = 60;
            this.phoneDialog.form.countdowning = true;
            this.phoneDialog.form.countdownRound++;

            const round = this.phoneDialog.form.countdownRound;
            setTimeout(() => {
                this.smscodeCountdown(round);
            }, 1000);
        },
        stopSmscodeCountdown() {
            this.phoneDialog.form.countdowning = false;
        },
        sendSmsCodeRequest(captchaData) {
            this.$refs.phoneForm.validateField("mobile", (error) => {
                if (!error) {
                    const data = {
                        params: {
                            action: 'post_/account/bind/phone',
                            phone: this.phoneDialog.form.data.mobile
                        }
                    }
                    getSmsCode(data)
                        .then((res) => {
                            if (res.code == 0) {
                                this.startSmscodeCountdown();
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
        bindPhone() {
			this.$refs.phoneForm.validate((valid) => {
				if (valid) {
                    this.phoneDialog.form.submiting = true;

                    const data = {
                        m: this.phoneDialog.form.data.mobile
                    }

                    bindPhone(data, this.phoneDialog.form.data.code)
                        .then(res => {
                            if (res.code == 0) {
                                this.stopSmscodeCountdown();

                                Message({ message: '绑定成功。', type: 'success' });
                                this.phoneDialog.showing = false;

                                this.loadData();
                            }
                        }).finally(() => {
                            this.phoneDialog.form.submiting = false;
                        })
                }
            })
        },
        resetEmailDialogForm() {
            this.emailDialog.form.data.email = null;
            this.emailDialog.form.data.code = null;
        },
        showBindEmailDlg() {
			this.resetEmailDialogForm();
			this.emailDialog.showing = true;
            this.$nextTick(() => {
				this.$refs["emailForm"].clearValidate();
			});
        },
        getEmailVerifyCode() {
            this.$refs.emailForm.validateField("email", (error) => {
                if (!error) {
                    this.$refs.getBindEmailCaptcha.tryShow("get_/account/bind/email/verifycode");
                }
            });
        },
        emailcodeCountdown(round) {
            if (this.emailDialog.form.countdowning &&
                round == this.emailDialog.form.countdownRound) {
                this.emailDialog.form.currSecond--;

                if (this.emailDialog.form.currSecond > 0) {
                    setTimeout(() => {
                        this.emailcodeCountdown(round);
                    }, 1000);
                } else {
                    this.stopEmailcodeCountdown();
                }
            }
        },
        startEmailcodeCountdown() {
            this.emailDialog.form.currSecond = 60;
            this.emailDialog.form.countdowning = true;
            this.emailDialog.form.countdownRound++;

            const round = this.emailDialog.form.countdownRound;
            setTimeout(() => {
                this.emailcodeCountdown(round);
            }, 1000);
        },
        stopEmailcodeCountdown() {
            this.emailDialog.form.countdowning = false;
        },
        sendEmailRequest() {
            this.$refs.emailForm.validateField("email", (error) => {
                if (!error) {
                    const data = {
                        params: {
                            email: this.emailDialog.form.data.email
                        }
                    }
                    getBindEmailVerifycode(data)
                        .then((res) => {
                            if (res.code == 0) {
                                this.startEmailcodeCountdown();
                                this.$refs.getBindEmailCaptcha.hide();
                            }
                        }).catch((err) => {
                            if (err.code == 2004) {
                                this.$refs.getBindEmailCaptcha.refresh();
                            } else if (err.code == -1) {
                                this.$refs.getBindEmailCaptcha.hide();
                            }
                        })
                }
            });
        },
        bindEmail() {
			this.$refs.emailForm.validate((valid) => {
				if (valid) {
                    this.emailDialog.form.submiting = true;

                    const data = {
                        email: this.emailDialog.form.data.email,
                        code: this.emailDialog.form.data.code
                    }

                    bindEmail(data)
                        .then(res => {
                            if (res.code == 0) {
                                this.stopEmailcodeCountdown();

                                Message({ message: '绑定成功。', type: 'success' });
                                this.emailDialog.showing = false;

                                this.loadData();
                            }
                        }).finally(() => {
                            this.emailDialog.form.submiting = false;
                        })
                }
            })
        },
        refreshBindWechatState() {
            getBindWechatState()
                .then(res => {
                    if (res.code == 0) {
                        if (res.data == 1) {
                            Message({ message: '绑定成功。', type: 'success' });
                            this.wechatDialog.showing = false;

                            this.loadData();
                        } else if (res.data == -1) {
                            Message({ message: '绑定失败，请重试。', type: 'error' });
                            this.showBindWechatDlg();
                        } else {
                            if (this.wechatDialog.showing) {
                                setTimeout(() => {
                                    this.refreshBindWechatState();
                                }, 1000);
                            }
                        }
                    }
                })
        },
        showBindWechatDlg() {
            this.wechatDialog.showing = true;

            setTimeout(() => {
                showWechatQRCode("wechatQRCode");
                this.refreshBindWechatState();
            }, 500);
        }
    }
}
</script>

<style scope>
.avatar-uploader .el-upload {
    margin: 0 0 15px 30px;
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.avatar {
    width: 100px;
    height: 100px;
    display: block;
}

.action-item .el-form-item__content span {
    line-height: normal;
    margin: -3px 0 0 0;
}

.action-item .el-form-item__content a {
    line-height: normal;
}

.profile-verifycode .el-input__inner {
    border-right: none;
}

.profile-verifycode .el-input-group__append {
    background: #fff;
    padding: 0 8px 0 0;
}

.profile-verifycode:hover .el-input__inner {
    border-color: #bfc4cd;
}

.profile-verifycode:hover .el-input-group__append {
    border-color: #bfc4cd;
}

.el-form-item.is-error .profile-verifycode .el-input__inner {
    border-color: #ff4949 !important;
}

.el-form-item.is-error .profile-verifycode .el-input-group__append {
    border-color: #ff4949;
}

.profile-verifycode.is-focus .el-input__inner {
    border-color: #1890ff !important;
}

.profile-verifycode.is-focus .el-input-group__append {
    border-color: #1890ff;
}
</style>
