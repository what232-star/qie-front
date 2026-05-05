<p align="center">
	<img src="src/assets/logo/1.png">
</p>
<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">企鹅！！！！！</h1>
<h4 align="center">企鹅盲盒智能售货机全链路管理系统前端</h4>

## 项目简介
本项目是**智能售货机全链路管理系统的前端项目**，基于 Vue 3 + Element Plus 构建，采用组件化、模块化开发模式，实现了可视化数据看板、商品管理、订单中心、AI 智能客服、用户权限管理等页面，与后端 RESTful API 无缝对接，提供流畅、易用的管理端交互体验。

> 本项目为个人全栈开发项目，面向前端/全栈开发求职场景打造，完整复现了企业级前端项目的工程化实践、组件化封装与交互设计，适配暑期实习校招的能力展示需求。
>
> 配套后端仓库：[企鹅Penguin - 后端服务](https://github.com/what232-star/qie-behind)

## 项目核心亮点（求职加分项）
1.  **Vue 3 现代化开发**：基于 Composition API 开发，代码逻辑复用性强，符合 Vue 最新的开发规范与最佳实践
2.  **工程化配套完善**：基于 Vite 构建，实现极速热更新；封装 Axios 请求拦截器、响应拦截器，统一处理 Token 刷新、异常提示、权限控制
3.  **组件化封装能力**：对通用表格、弹窗、表单、导航等组件进行二次封装，降低代码冗余，提升可维护性
4.  **完整的业务闭环**：覆盖从登录鉴权、数据可视化、业务流程操作到智能交互的完整页面链路，贴合真实商用管理系统场景
5.  **用户体验优化**：响应式布局适配不同尺寸屏幕，添加加载状态、操作反馈、权限路由拦截，符合企业级产品的交互规范
6.  **规范的开发流程**：Git 提交采用 Conventional Commits 规范，代码结构清晰，注释完整，无冗余代码与无效文件

## 技术选型
| 技术/框架 | 版本 | 核心用途 |
|-----------|------|----------|
| Vue | 3.3.4 | 前端核心框架，响应式数据驱动视图渲染 |
| Vue Router | 4.2.4 | 前端路由管理，实现页面跳转与权限路由控制 |
| Element Plus | 2.3.8 | 企业级 UI 组件库，提供表单、表格、弹窗等通用组件 |
| Axios | 1.4.0 | HTTP 请求库，封装前后端数据交互，实现请求/响应拦截 |
| ECharts | 5.4.2 | 数据可视化库，实现订单数据、销售数据的图表展示 |
| Vite | 4.4.0 | 前端构建工具，实现极速开发构建与热更新 |
| Sass | 1.64.0 | CSS 预处理器，实现样式复用与模块化管理 |

## 核心页面与功能
| 页面 | 功能说明 |
|------|----------|
| 登录/注册页 | 用户账号密码登录、注册；JWT Token 本地存储与自动刷新；表单校验、错误提示 |
| 系统首页/数据看板 | 基于 ECharts 实现销售数据、订单数据、库存数据的可视化展示；核心指标卡片、趋势图表 |
| 商品管理页 | 商品列表展示、新增/编辑/删除商品、商品上下架、分类筛选、库存数量修改 |
| 订单管理页 | 订单列表、订单详情查看、订单状态筛选、订单历史记录查询、订单数据导出 |
| 库存预警页 | 库存不足商品列表展示、预警阈值设置、预警通知查看 |
| AI 智能客服页 | 基于大模型的智能对话界面、常见问题快捷提问、对话历史记录 |
| 个人中心页 | 用户信息修改、密码修改、操作日志查看 |
| 系统管理页 | 用户管理、角色权限管理、菜单配置（管理员权限） |

## 快速开始
### 1. 环境要求
| 环境 | 版本要求 |
|------|----------|
| Node.js | 16.0.0 及以上 |
| npm / yarn / pnpm | npm 8.0.0 及以上 |

### 2. 克隆项目
```bash
git clone git@github.com:what232-star/qie-front.git
cd qie-front

3. 安装依赖
# npm 安装
npm install

# 或 yarn 安装
yarn install

4. 环境配置
编辑 src/utils/request.js，修改后端接口基础地址，与后端服务对应

// 后端接口基础地址
const baseURL = 'http://localhost:8081/api'

// 创建 Axios 实例
const request = axios.create({
  baseURL,
  timeout: 10000
})

5. 启动项目
# 开发环境启动
npm run dev

# 或 yarn 启动
yarn dev

6. 生产环境构建
# 构建生产环境产物
npm run build

# 预览构建产物
npm run preview

项目结构
qie-front
├── public                  # 静态公共资源
├── src
│   ├── api                 # API 请求封装，按业务模块划分
│   │   ├── user.js         # 用户相关接口
│   │   ├── goods.js        # 商品相关接口
│   │   ├── order.js        # 订单相关接口
│   │   └── ai.js           # AI 客服相关接口
│   ├── assets              # 静态资源（图片、字体、全局样式）
│   ├── components          # 全局通用组件
│   │   ├── CommonTable     # 通用表格组件
│   │   ├── CommonForm      # 通用表单组件
│   │   └── Navbar          # 导航栏组件
│   ├── router              # 路由配置
│   │   ├── index.js        # 路由定义
│   │   └── permission.js   # 路由权限拦截
│   ├── store               # Pinia 全局状态管理
│   │   ├── user.js         # 用户状态管理
│   │   └── app.js          # 全局配置状态管理
│   ├── utils               # 通用工具函数
│   │   ├── request.js      # Axios 封装
│   │   ├── auth.js         # Token 操作工具
│   │   └── common.js       # 通用工具函数
│   ├── views               # 页面组件
│   │   ├── Login           # 登录页
│   │   ├── Dashboard       # 数据看板页
│   │   ├── Goods           # 商品管理页
│   │   ├── Order           # 订单管理页
│   │   ├── Stock           # 库存预警页
│   │   ├── AiChat          # AI 客服页
│   │   └── UserCenter      # 个人中心页
│   ├── App.vue             # 根组件
│   └── main.js             # 项目入口文件
├── .gitignore              # Git 忽略文件
├── package.json            # 项目依赖与脚本配置
├── vite.config.js          # Vite 构建配置
└── README.md

配套仓库
后端项目仓库：https://github.com/what232-star/qie-behind
前端项目仓库：https://github.com/what232-star/qie-front
关于作者
GitHub：@what232-star
邮箱：你的个人邮箱
求职意向：前端开发 / 全栈开发 暑期实习

