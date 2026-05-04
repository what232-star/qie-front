<template>
  <div class="ai-chat-container">
    <!-- 对话历史区域 -->
    <div class="chat-history" ref="chatHistory">
      <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-message', msg.role === 'user' ? 'user-message' : 'ai-message']"
      >
        <div class="avatar">
          <el-avatar v-if="msg.role === 'user'" :size="40" icon="el-icon-user-solid" />
          <el-avatar v-else :size="40" icon="el-icon-chat-dot-round" style="background-color: #409eff" />
        </div>
        <div class="message-content">
          <div class="message-text">{{ msg.content }}</div>
          <div class="message-time">{{ msg.time }}</div>
        </div>
      </div>
    </div>

    <!-- 输入框区域 -->
    <div class="chat-input-wrapper">
      <el-input
          v-model="userInput"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题，例如：我要查看订单管理页面"
          @keydown.ctrl.enter="sendMessage"
          :disabled="loading"
      />
      <div class="input-actions">
        <span class="tip">按 Ctrl + Enter 发送</span>
        <el-button
            type="primary"
            :loading="loading"
            @click="sendMessage"
            :disabled="!userInput.trim()"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup name="AiChat">
import { chat, navigate } from '@/api/mind/ai'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { ref, nextTick, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const chatHistory = ref(null)
const userInput = ref('')
const messages = ref([
  {
    role: 'ai',
    content: '你好！我是 AI 智能助手，可以帮你快速导航到系统各个功能页面，也可以回答你的问题。',
    time: getCurrentTime()
  }
])
const loading = ref(false)

// 获取当前时间
function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  })
}

// 发送消息
async function sendMessage() {
  if (!userInput.value.trim() || loading.value) return

  const userMessage = userInput.value.trim()

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userMessage,
    time: getCurrentTime()
  })

  userInput.value = ''
  loading.value = true
  scrollToBottom()

  try {
    // 先调用导航接口，判断是否要跳转页面
    const menuList = getMenuList()
    const navResult = await navigate({
      message: userMessage,
      menuList: JSON.stringify(menuList)
    })

    // 解析返回结果
    let navData
    try {
      navData = typeof navResult.data === 'string' ? JSON.parse(navResult.data) : navResult.data
    } catch (e) {
      navData = navResult.data
    }

    if (navData && navData.route) {
      // AI 返回了路由，跳转页面
      messages.value.push({
        role: 'ai',
        content: `好的，正在为您跳转到【${navData.name}】页面...`,
        time: getCurrentTime()
      })
      scrollToBottom()

      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        router.push({
          path: navData.route,
          query: navData.params || {}
        })
      }, 800)
    } else {
      // 没有匹配到路由，使用普通对话
      const chatResult = await chat({ message: userMessage })
      messages.value.push({
        role: 'ai',
        content: chatResult.data || chatResult.msg || '抱歉，我暂时无法回答这个问题。',
        time: getCurrentTime()
      })
      scrollToBottom()
    }
  } catch (error) {
    console.error('AI 服务异常:', error)
    messages.value.push({
      role: 'ai',
      content: '抱歉，我遇到了一些问题，请稍后再试。',
      time: getCurrentTime()
    })
    scrollToBottom()
  } finally {
    loading.value = false
  }
}

// 获取菜单列表（用于导航判断）
function getMenuList() {
  // 从权限路由中获取菜单列表
  const permissions = userStore.permissions || []
  return [
    { name: '订单管理', route: '/mind/order/index', desc: '查看和管理订单信息' },
    { name: '设备管理', route: '/mind/machine/index', desc: '管理售货机设备' },
    { name: '点位管理', route: '/mind/nodeList/index', desc: '管理设备点位信息' },
    { name: '工单管理', route: '/mind/task/business', desc: '处理运营工单' },
    { name: '运维工单', route: '/mind/task/operation', desc: '处理运维工单' },
    { name: '企鹅管理', route: '/mind/penguin/index', desc: '管理企鹅商品' },
    { name: '区域管理', route: '/mind/region/index', desc: '管理区域信息' },
    { name: '合作商管理', route: '/mind/bear/index', desc: '管理合作商信息' },
    { name: '策略管理', route: '/mind/policy/index', desc: '管理设备策略' },
    { name: '首页', route: '/index', desc: '系统首页' },
  ]
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped lang="scss">
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  background: #f5f7fa;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  .chat-message {
    display: flex;
    margin-bottom: 20px;

    .avatar {
      flex-shrink: 0;
      margin-right: 12px;
    }

    .message-content {
      flex: 1;
      max-width: 70%;

      .message-text {
        padding: 12px 16px;
        border-radius: 8px;
        line-height: 1.6;
        word-break: break-word;
      }

      .message-time {
        margin-top: 4px;
        font-size: 12px;
        color: #999;
      }
    }

    &.user-message {
      flex-direction: row-reverse;

      .avatar {
        margin-right: 0;
        margin-left: 12px;
      }

      .message-content {
        .message-text {
          background: #409eff;
          color: #fff;
        }
      }
    }

    &.ai-message {
      .message-content {
        .message-text {
          background: #fff;
          color: #333;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
      }
    }
  }
}

.chat-input-wrapper {
  background: #fff;
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;

  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;

    .tip {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
