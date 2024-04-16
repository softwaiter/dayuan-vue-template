# 大圆VUE前端开发模板

## 一、框架概览

### 1.1 简介

&emsp;&emsp;大圆VUE前端快速开发框架（以下简称大圆VUE）是基于[vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)框架二次开发的一个前端快速开发框架。

首先，vue-elemnet-admin是一个很优秀的前端后台解决方案。它基于vue和element-ui实现；使用了最新的前端技术栈，内置了 i18n 国际化解决方案，动态路由，权限验证，提炼了典型的业务模型，提供了丰富的功能组件；可以帮助用户快速搭建企业级中后台产品原型。

&emsp;&emsp;既然vue-element-admin已经这么优秀，为什么还要进行二次开发呢？vue-element-admin提供的是基础的开发框架，不包含具体的业务逻辑，用户需要将所有业务需求逐一实现；大圆VUE解决的就是这类需求：<b>一是抽取并实现通用的页面功能逻辑，用户在其业务中可直接使用；二是进一步封装前后台的交互逻辑；让页面交互和响应更标准和商业化；三是增加了子模块加载模式，方便了团队分散开发、集中发布。</b>

### 1.2 功能特点

#### 1.2.1 通用页面功能

* ###### 登录页面和逻辑（账号密码登录/手机验证码登录）

* ###### 找回密码页面和逻辑（通过手机号找回/通过邮箱找回）

* ###### 账户注册页面和逻辑

* ###### 验证码功能（图形验证码和短信验证码）

* ###### 修改密码页面和逻辑

* ###### 个人信息页面和逻辑（头像上传、手机绑定、邮箱绑定、微信绑定）

* ###### 扩展业务组件（机构选择器、用户选择器、产品选择器）

#### 1.2.2 交互逻辑

* ###### 统一请求错误处理逻辑

* ###### 统一登录检查处理逻辑

* ###### 首次登录密码必须修改逻辑

#### 1.2.3 子模块模式

&emsp;&emsp;框架在src目录下增加了submodules目录，和views目录并列，用于存放各个业务子模块。使用子模块的方式能够将不同的业务模块很好的隔离，每个子模块都可以作为一个独立前端项目开发和运行（拥有独立的路由定义和功能页面）；极大的方便了开发、维护和升级。

&emsp;&emsp;submodules目录中的子模块中必须包含一个router.js路由定义文件以及若干其他相关文件（页面文件、资源文件等）。

&emsp;&emsp;**财务子模块案例目录结构：**

&emsp;&emsp;submodules<br/>
&emsp;&emsp;&emsp;└─ finance&emsp;// 财务子模块<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;├─ api&emsp;&emsp;// 接口目录<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;│&emsp;├─ goods.js	// 商品接口定义<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;│&emsp;└─ order.js	 // 订单接口定义<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;├─ svg&emsp;&emsp;// svg图片目录<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;│&emsp;└─ finance.svg	 // 财务管理图标<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;├─ views&emsp;// 页面目录<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;│&emsp;&emsp;├─ goods    // 商品管理<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;│&emsp;&emsp;│&emsp;&emsp;└─ index.vue	// 商品管理页面文件<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;│&emsp;&emsp;└─ order	// 订单管理<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;│&emsp;&emsp;&emsp;&emsp;&emsp;└─ index.vue	// 订单管理页面文件<br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;└─ router.js	// 路由定义文件<br/>

&emsp;&emsp;router.js文件内容只包含constantRoutes、asyncRoutes两个数组，用于定义常量路由和动态路由。

&emsp;&emsp;router.js路由定义方法和vue-element-admin框架中的路由定义相同；在此基础上，大圆VUE扩展了position属性，用于定义路由的显示位置，不指定的话将按顺序显示。

&emsp;&emsp;**财务子模块案例路由定义：**

```vue
import Layout from '@/layout'

export const constantRoutes = []

export const asyncRoutes = [
    {
        position: 5,
        path: '/finance',
        component: Layout,
        alwaysShow: true,
        redirect: 'noRedirect',
        name: 'finance-manage',
        meta: {
            title: '财务管理',
            icon: 'finance',
            roles: ['goods', 'order']
        },
        children: [
            {
                path: 'goods',
                component: () => import('@/submodules/finance/views/goods/index'),
                name: 'GoodsList',
                meta: {
                    title: '商品定义',
                    roles: ['goods']
                }
            },            
            {
                path: 'order',
                component: () => import('@/submodules/finance/views/order/index'),
                name: 'OrderList',
                meta: {
                    title: '订单列表',
                    roles: ['order']
                }
            }
        ]
    }
]
```



## 二、截图预览

![](http://res.dayuan.tech/images/dy_vue_template1.jpg)

![](http://res.dayuan.tech/images/dy_vue_template2.jpg)

![](http://res.dayuan.tech/images/dy_vue_template3.jpg)

![](http://res.dayuan.tech/images/dy_vue_template4.jpg)

![](http://res.dayuan.tech/images/dy_vue_template5.jpg)



## 三、演示地址

<a href="http://vue-template.dayuan.tech" target="_blank" style="text-decoration: none;">【VUE前端开发框架演示】</a>

&emsp;&emsp;项目演示既包含前端的页面布局，也包含后台接口逻辑，用户能够体验到完整真实的效果。本项目的后端接口逻辑全部调用的大圆Admin产品的接口服务，用户也可根据需要自行替换。

<a href="http://demo.dayuan.tech" target="_blank" style="text-decoration: none;">【大圆Admin产品演示】</a>



## 四、快速开始

### 4.1 环境准备

#### 4.1.1 安装Git

* 下载[Git for Windows](https://gitforwindows.org/)安装包。
* 运行下载的安装包，一路Next，直到完成。

#### 4.1.2 安装node&npm

* 下载[Node.js](https://nodejs.org/en/download/)安装包（新版node安装包已包含npm）。

* 运行下载的安装包，一路Next，直到完成。

<div style="font-style: italic; font-weight: 600; color:#f56c6c;">*注意*：</div>安装步骤说明全部以Windows环境为基础，其他操作系统可自行百度。

### 4.2 安装运行

#### 4.2.1 下载

```shell
git clone https://github.com/softwaiter/dayuan-vue-template.git
```

#### 4.2.2 安装

```shell
npm install
```

#### 4.2.3 运行

```shell
npm run dev
```

#### 4.2.4 发布

```shell
npm run build:prod
```



## 五、扩展组件

&emsp;&emsp;大圆VUE提供了4个自定义组件，分别是图形验证码、机构选择器、用户选择器和产品选择器；扩展组件都极强的业务属性，用户可根据需要选用；在演示环境的日志页面中，可以体验实际使用效果。

### 5.1 图形验证码

#### 5.1.1 常规用法

##### 1. 引入组件

   ```vue
<script>
	import DayuanCaptcha from 'dayuan-captcha';

	export default {
		components: { DayuanCaptcha },
        // 省略...
    }
</script>
   ```

##### 2. 使用组件

```vue
<dayuan-captcha
    :captcha-required-url="_getCaptchaRequiredUrl()"
    :captcha-url="_getCaptchaUrl()"
    :headers="_getDayuanCaptchaRequestHeaders()"
    @error="onCaptchaError"
    @submit="onCaptchaPassed"
/>
```

#### 5.1.2 属性

| 参数               | 说明                                         | 类型   | 可选值 | 默认值 |
| ------------------ | -------------------------------------------- | ------ | ------ | ------ |
| CaptchaRequiredUrl | 指定判断接口请求是否需要图形验证码的接口地址 | string | —      | —      |
| CaptchaUrl         | 指定获取图形验证码的接口地址                 | string | —      | —      |
| Headers            | 接口请求需要携带的Headers                    | string | —      | —      |

#### 5.1.3 方法

| 方法名  | 说明                                               | 参数                                                         |
| ------- | -------------------------------------------------- | ------------------------------------------------------------ |
| tryShow | 判断指定接口是否需要图形验证码，需要的话请求并显示 | action：指定接口，格式为“接口请求方式_接口路径”；如：post\_/account/changepass |
| hide    | 隐藏显示的图形验证码                               | —                                                            |

#### 5.1.4 事件

| 事件名称 | 说明                           | 回调参数                   |
| -------- | ------------------------------ | -------------------------- |
| error    | 报错时触发                     | error：错误信息            |
| submit   | 用户输入或拖动验证码完成时触发 | data：用户输入的验证码数据 |

### 5.2 机构选择器

#### 5.2.1 常规用法

##### 1. 引入组件

   ```vue
<script>
	import OrgSelect from "@/components/OrgSelect";

	export default {
		components: { OrgSelect },
        // 省略...
    }
</script>
   ```

##### 2. 使用组件

```vue
<org-select
    v-model="selectedOrg"
    style="width: 280px; margin: 0 10px 0 0;"
    @changed="orgSelectChanged"
/>	
```

#### 5.2.2 属性

| 参数          | 说明             | 类型    | 可选值 | 默认值         |
| ------------- | ---------------- | ------- | ------ | -------------- |
| value/v-model | 绑定值           | string  | —      | —              |
| clearable     | 是否可以清空选项 | boolean | —      | true           |
| disabled      | 是否禁用         | boolean | —      | false          |
| placeholder   | 占位符           | string  | —      | 请选择所属机构 |

#### 5.2.3 事件

| 事件名称 | 说明                 | 回调参数     |
| -------- | -------------------- | ------------ |
| changed  | 选中值发生变化时触发 | 目前的选中值 |

### 5.3 用户选择器

#### 5.3.1 常规用法

##### 1. 引入组件

   ```vue
<script>
	import UserSelect from "@/components/UserSelect";

	export default {
		components: { UserSelect },
        // 省略...
    }
</script>
   ```

##### 2. 使用组件

```vue
<user-select
    v-model="selectedUser"
    :org="selectedOrg"
    style="width: 160px; margin: 0 10px 0 0;"
    @changed="userSelectChanged"
/>
```

#### 5.3.2 属性

| 参数          | 说明                                         | 类型    | 可选值 | 默认值     |
| ------------- | -------------------------------------------- | ------- | ------ | ---------- |
| value/v-model | 绑定值                                       | string  | —      | —          |
| org           | 用户下拉选项过滤器（只显示选中机构下的用户） | string  | —      | —          |
| clearable     | 是否可以清空选项                             | boolean | —      | true       |
| disabled      | 是否禁用                                     | boolean | —      | false      |
| placeholder   | 占位符                                       | string  | —      | 请选择用户 |

#### 5.3.3 事件

| 事件名称 | 说明                 | 回调参数     |
| -------- | -------------------- | ------------ |
| changed  | 选中值发生变化时触发 | 目前的选中值 |

### 5.4 产品选择器

#### 5.4.1 常规用法

##### 1. 引入组件

   ```vue
<script>
	import ProductSelect from "@/components/ProductSelect";

	export default {
		components: { ProductSelect },
        // 省略...
    }
</script>
   ```

##### 2. 使用组件

```vue
<product-select
    v-model="selectedProduct"
    :org="selectedOrg"
    :user="selectedUser"
    style="width: 250px; margin: 0 10px 0 0;"
    @changed="doSearch"
/>
```

#### 5.4.2 属性

| 参数          | 说明                                               | 类型    | 可选值 | 默认值     |
| ------------- | -------------------------------------------------- | ------- | ------ | ---------- |
| value/v-model | 绑定值                                             | string  | —      | —          |
| org           | 产品下拉选项过滤器（只显示选中机构获得授权的产品） | string  | —      | —          |
| user          | 产品下拉选项过滤器（只显示选中用户获得授权的产品） |         |        |            |
| clearable     | 是否可以清空选项                                   | boolean | —      | true       |
| disabled      | 是否禁用                                           | boolean | —      | false      |
| placeholder   | 占位符                                             | string  | —      | 请选择用户 |

#### 5.4.3 事件

| 事件名称 | 说明                 | 回调参数     |
| -------- | -------------------- | ------------ |
| changed  | 选中值发生变化时触发 | 目前的选中值 |

## 六、扩展功能

### 6.1 扩展配置

| 配置项                  | 说明                                                    | 所在文件    |
| ----------------------- | ------------------------------------------------------- | ----------- |
| shortTitle              | 项目简称                                                | settings.js |
| showBindWechatInProfile | 个人信息页是否显示绑定微信                              | settings.js |
| platform                | 平台类型，默认请求参数（不使用大圆Admin接口服务可忽略） | settings.js |
| product                 | 产品编码，默认请求参数（不使用大圆Admin接口服务可忽略） | settings.js |

### 6.2 扩展Store存储项

| 存储项  | 说明                         | 所在文件         |
| ------- | ---------------------------- | ---------------- |
| userid  | 当前登录用户的ID             | store/getters.js |
| account | 当前登录用户的账户名         | store/getters.js |
| name    | 当前登录用户的账户名称       | store/getters.js |
| avatar  | 当前登录用户的头像数据       | store/getters.js |
| roles   | 当前登录用户功能模块授权数据 | store/getters.js |
| orgCode | 当前登录用户所属机构编码     | store/getters.js |
| orgName | 当前登录用户所属机构名称     | store/getters.js |

### 6.3 扩展方法

| 方法名             | 说明                                   | 全局别名 | 所在文件      |
| ------------------ | -------------------------------------- | -------- | ------------- |
| isNullOrWhiteSpace | 判断变量是否为null或由空格组成         | —        | utils/util.js |
| hasModule          | 判断当前用户是否具备指定的功能模块授权 | $visible | utils/auth.js |
| setToken           | 保存用户登录Token                      | —        | utils/auth.js |
| getToken           | 获取当前登录用户Token                  | —        | utils/auth.js |
| removeToken        | 移除当前登录用户Token                  | —        | utils/auth.js |