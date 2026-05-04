<template>
  <div class="ai-navigate-container">
    <div class="page-header">
      <h2>AI 智能导航</h2>
      <p>描述您想去的功能页面，AI 将为您快速跳转</p>
    </div>

    <div class="navigate-input-wrapper">
      <el-input
          v-model="userInput"
          placeholder="例如：我要查看今天的订单、带我去设备管理页面..."
          size="large"
          @keydown.enter="handleNavigate"
          :disabled="loading"
      >
        <template #append>
          <el-button
              type="primary"
              :loading="loading"
              @click="handleNavigate"
              :disabled="!userInput.trim()"
          >
            <el-icon><Position /></el-icon>
            导航
          </el-button>
        </template>
      </el-input>
    </div>

    <div class="quick-links">
      <h3>快速导航</h3>
      <el-row :gutter="16">
        <el-col :span="6" v-for="(menu, index) in quickMenus" :key="index">
          <el-card shadow="hover" class="menu-card" @click="quickNavigate(menu)">
            <div class="menu-icon">
              <el-icon :size="24"><component :is="menu.icon" /></el-icon>
            </div>
            <div class="menu-name">{{ menu.name }}</div>
            <div class="menu-desc">{{ menu.desc }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="navigate-history" v-if="history.length > 0">
      <h3>导航历史</h3>
      <el-timeline>
        <el-timeline-item
            v-for="(item, index) in history"
            :key="index"
            :timestamp="item.time"
            placement="top"
        >
          <el-card>
            <div class="history-item">
              <div class="message-content">
                <div class="user-msg">
                  <el-icon><User /></el-icon>
                  <span>{{ item.message }}</span>
                </div>
                <div class="ai-msg" v-if="item.reply">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>{{ item.reply }}</span>
                </div>
              </div>
              <el-tag type="success" v-if="item.success">跳转成功</el-tag>
              <el-tag type="info" v-else>AI 回复</el-tag>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup name="AiNavigate">
import { navigate } from '@/api/mind/ai'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import {
  Position, Document, Monitor, Tickets,
  Box, Location, User, Setting, ChatDotRound,
  Management, PriceTag, Key
} from '@element-plus/icons-vue'

const router = useRouter()

const userInput = ref('')
const loading = ref(false)
const history = ref([])

const quickMenus = ref([
  { name: '订单管理', route: '/order', desc: '查看订单', icon: 'Tickets' },
  { name: '设备管理', route: '/vm/machine', desc: '管理设备', icon: 'Monitor' },
  { name: '设备类型管理', route: '/vm/vmtype', desc: '设备类型', icon: 'Box' },
  { name: '点位管理', route: '/node/nodeList', desc: '点位信息', icon: 'Location' },
  { name: '区域管理', route: '/node/region', desc: '区域信息', icon: 'Management' },
  { name: '企鹅管理', route: '/penguins/penguin', desc: '企鹅商品', icon: 'Box' },
  { name: '企鹅类型', route: '/penguins/penguinClass', desc: '企鹅分类', icon: 'PriceTag' },
  { name: '策略管理', route: '/policy/policyList', desc: '策略配置', icon: 'Setting' },
  { name: '运营工单', route: '/tasks/business', desc: '运营工单', icon: 'Document' },
  { name: '运维工单', route: '/tasks/operation', desc: '运维工单', icon: 'Document' },
  { name: '熊商管理', route: '/node/bear', desc: '熊商信息', icon: 'User' },
  { name: '人员管理', route: '/emp/empList', desc: '人员信息', icon: 'User' },
  { name: '角色管理', route: '/system/role', desc: '角色权限', icon: 'Key' },
  { name: '首页', route: '/index', desc: '系统首页', icon: 'Monitor' },
  { name: 'AI导航', route: '/ai/navigate', desc: 'AI导航', icon: 'Position' },
])

// 快速导航
function quickNavigate(menu) {
  router.push(menu.route)
}

// 处理导航请求
async function handleNavigate() {
  if (!userInput.value.trim() || loading.value) return

  const message = userInput.value.trim()
  loading.value = true

  try {
    const menuList = getMenuList()
    const navResult = await navigate({
      message,
      menuList: JSON.stringify(menuList)
    })

    let navData
    try {
      navData = typeof navResult.data === 'string' ? JSON.parse(navResult.data) : navResult.data
    } catch (e) {
      navData = navResult.data
    }

    if (navData && navData.route) {
      history.value.unshift({
        message: navData.name,
        time: getCurrentTime(),
        success: true
      })
      router.push({ path: navData.route, query: navData.params || {} })
    } else {
      // AI 没返回路由，显示 AI 的回复
      history.value.unshift({
        message: message,
        reply: navData?.reply || '抱歉，我无法理解您的需求，请描述得更具体一些。',
        time: getCurrentTime(),
        success: false
      })
    }
  } catch (error) {
    console.error('导航异常:', error)
    history.value.unshift({
      message: message,
      reply: '抱歉，AI 服务暂时不可用，请稍后再试。',
      time: getCurrentTime(),
      success: false
    })
  } finally {
    loading.value = false
  }
}

function getMenuList() {
  return [
    { name: '订单管理', route: '/order', desc: '查看和管理订单信息' },
    { name: '设备管理', route: '/vm/machine', desc: '管理售货机设备' },
    { name: '点位管理', route: '/node/nodeList', desc: '管理设备点位信息' },
    { name: '运营工单', route: '/tasks/business', desc: '处理运营工单' },
    { name: '运维工单', route: '/tasks/operation', desc: '处理运维工单' },
    { name: '企鹅管理', route: '/penguins/penguin', desc: '管理企鹅商品' },
    { name: '企鹅类型', route: '/penguins/penguinClass', desc: '管理企鹅类型' },
    { name: '策略管理', route: '/policy/policyList', desc: '管理策略信息' },
    { name: '区域管理', route: '/node/region', desc: '管理区域信息' },
    { name: '人员管理', route: '/emp/empList', desc: '管理人员信息' },
    { name: '首页', route: '/index', desc: '系统首页' },
  ]
}

function getCurrentTime() {
  const now = new Date()
  return `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
}
</script>

<style scoped lang="scss">
.ai-navigate-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: #909399;
  }
}

.navigate-input-wrapper {
  margin-bottom: 32px;
}

.quick-links {
  margin-bottom: 32px;

  h3 {
    margin: 0 0 16px;
    font-size: 16px;
  }

  .menu-card {
    cursor: pointer;
    text-align: center;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .menu-icon {
      margin-bottom: 12px;
      color: #409eff;
    }

    .menu-name {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .menu-desc {
      font-size: 12px;
      color: #909399;
    }
  }
}

.navigate-history {
  h3 {
    margin: 0 0 16px;
    font-size: 16px;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;

    .message-content {
      flex: 1;

      .user-msg, .ai-msg {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;

        .user-msg {
          color: #409eff;
        }

        .ai-msg {
          color: #67c23a;
        }
      }
    }
  }
}
</style>
