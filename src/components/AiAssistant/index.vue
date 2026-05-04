<template>
  <div class="ai-assistant">
    <!-- AI 助手浮动按钮 -->
    <el-button
      class="ai-float-btn"
      type="primary"
      circle
      @click="showDialog = true"
    >
      <el-icon :size="24"><ChatDotRound /></el-icon>
    </el-button>

    <!-- AI 对话弹窗 -->
    <el-dialog
      title="AI 智能助手"
      v-model="showDialog"
      width="650px"
      :close-on-click-modal="false"
      class="ai-dialog"
    >
      <!-- 对话历史 -->
      <div class="chat-history" ref="chatHistory">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-message', msg.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-content">{{ msg.content }}</div>

          <div v-if="msg.role === 'ai' && msg.actions && msg.actions.length" class="message-actions">
            <el-button
              v-for="(action, idx) in msg.actions"
              :key="idx"
              size="small"
              :type="action.type || 'primary'"
              @click="handleAction(action)"
            >
              {{ action.icon }} {{ action.label }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <div class="quick-title">快捷操作：</div>
        <el-button size="small" @click="quickAction('navigate', '订单管理')">📋 订单管理</el-button>
        <el-button size="small" @click="quickAction('navigate', '设备管理')">💻 设备管理</el-button>
        <el-button size="small" @click="quickAction('navigate', '设备类型管理')"> 设备类型</el-button>
        <el-button size="small" @click="quickAction('help', '')">❓ 使用帮助</el-button>
      </div>

      <div class="chat-input">
        <el-input
          v-model="userInput"
          placeholder="例如：带我去订单管理 / 帮我查一下设备类型 / 设备类型管理有什么用？"
          @keyup.enter="sendMessage"
          clearable
          :disabled="loading"
        >
          <template #append>
            <el-button
              :icon="Promotion"
              @click="sendMessage"
              :loading="loading"
            >
              发送
            </el-button>
          </template>
        </el-input>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChatDotRound, Promotion } from '@element-plus/icons-vue'
import { chat, navigate } from '@/api/mind/ai'

const router = useRouter()

const showDialog = ref(false)
const userInput = ref('')
const chatHistory = ref(null)
const messages = ref([
  {
    role: 'ai',
    content: '你好！我是 AI 智能助手，可以帮您：\n\n📌 快速跳转到系统各个功能页面\n💡 介绍系统功能和使用方法\n🔍 指导您完成具体操作\n\n您可以直接告诉我您的需求，或者点击下方快捷按钮。',
    actions: [
      { label: '查看订单', type: 'primary', action: 'navigate', target: '订单管理', icon: '' },
      { label: '管理设备', type: 'primary', action: 'navigate', target: '设备管理', icon: '💻' },
      { label: '使用帮助', type: 'info', action: 'help', target: '', icon: '❓' }
    ]
  }
])
const loading = ref(false)

// 用户偏好记忆（方案 B：前端记忆功能）
const userPreferences = ref({
  favoritePages: [],
  recentSearches: [],
  commonActions: [],
  lastIntent: null,
  lastMessage: null,
  pendingAction: null,
  hasPendingConfirm: false
})

// 加载用户偏好
onMounted(() => {
  const saved = localStorage.getItem('ai_assistant_preferences')
  if (saved) {
    try {
      userPreferences.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载用户偏好失败:', e)
    }
  }
})

// 保存用户偏好
function saveUserPreferences() {
  localStorage.setItem('ai_assistant_preferences', JSON.stringify(userPreferences.value))
}

// 更新用户偏好
function updateUserPreferences(action, target) {
  if (action === 'navigate' && target) {
    if (!userPreferences.value.favoritePages.includes(target)) {
      userPreferences.value.favoritePages.unshift(target)
      if (userPreferences.value.favoritePages.length > 5) {
        userPreferences.value.favoritePages.pop()
      }
    }
  } else if (action === 'search' && target) {
    // 优化：只记录关键词，而不是完整句子
    const keywords = extractSearchKeywords(target)
    keywords.forEach(keyword => {
      if (!userPreferences.value.recentSearches.includes(keyword)) {
        userPreferences.value.recentSearches.unshift(keyword)
      }
    })
    if (userPreferences.value.recentSearches.length > 10) {
      userPreferences.value.recentSearches.splice(10)
    }
  }
  saveUserPreferences()
}

// 提取搜索关键词
function extractSearchKeywords(message) {
  const keywords = []
  // 提取可能的搜索词（简单规则：提取"搜索/查找/查询"后面的内容）
  const patterns = [/搜索(.{1,20})/, /查找(.{1,20})/, /查询(.{1,20})/]
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      keywords.push(match[1].trim())
    }
  }
  return keywords.length > 0 ? keywords : [message.substring(0, 20)]
}

function quickAction(type, target) {
  if (type === 'navigate') {
    userInput.value = `带我去${target}`
    sendMessage()
  } else if (type === 'help') {
    userInput.value = '你能帮我做什么？'
    sendMessage()
  }
}

function handleAction(action) {
  if (action.action === 'navigate') {
    // 处理 target 可能是对象或字符串的情况
    const target = typeof action.target === 'object' ? action.target.route : action.target

    if (target && target.startsWith('/')) {
      router.push({ path: target, query: action.params || {} })
      showDialog.value = false
      updateUserPreferences('navigate', action.label || target)
    } else if (target) {
      userInput.value = `带我去${target}`
      sendMessage()
    }
  }
}

async function sendMessage() {
  if (!userInput.value.trim() || loading.value) return

  // 添加用户消息
  messages.value.push({ role: 'user', content: userInput.value })
  const userMessage = userInput.value.trim()
  userInput.value = ''
  loading.value = true

  // 修复：记录最后一条消息
  userPreferences.value.lastMessage = userMessage

  try {
    // 检查是否是确认式回复（需要/不需要/是的/不用了等）
    const confirmResult = checkConfirmResponse(userMessage)
    if (confirmResult.isConfirm) {
      handleConfirmResponse(confirmResult)
      return
    }

    const intentResult = detectIntent(userMessage)

    if (intentResult.intent === 'navigate') {
      // 导航意图：调用导航接口
      const menuList = getMenuList()
      const navResult = await navigate({
        message: userMessage,
        menuList: JSON.stringify(menuList),
        currentPage: router.currentRoute.value.path,
        userContext: {
          recentPages: userPreferences.value.favoritePages.slice(0, 3),
          searchHistory: userPreferences.value.recentSearches.slice(0, 5)
        }
      })

      let navData
      try {
        navData = typeof navResult.data === 'string' ? JSON.parse(navResult.data) : navResult.data
      } catch (e) {
        navData = navResult.data
      }

      if (navData && navData.route) {
        messages.value.push({
          role: 'ai',
          content: `好的，正在为您跳转到【${navData.name}】页面...`,
          actions: [
            { label: '立即跳转', type: 'primary', action: 'navigate', target: navData.route, icon: '🚀' }
          ]
        })
        setTimeout(() => {
          router.push({ path: navData.route, query: navData.params || {} })
          showDialog.value = false
          updateUserPreferences('navigate', navData.name)
        }, 1500)
      } else {
        messages.value.push({
          role: 'ai',
          content: navData?.reply || '抱歉，我不太理解您想去哪个页面，请描述得更具体一些。'
        })
      }
    } else if (intentResult.intent === 'search' || intentResult.intent === 'query' || intentResult.intent === 'help') {
      // 修复：合并搜索、查询、帮助意图
      const chatResult = await chat({ message: userMessage })
      const replyContent = chatResult.data || chatResult.msg || '抱歉，我暂时无法回答这个问题。'

      const targetPage = extractTargetPage(userMessage)
      let actions = []
      if (targetPage) {
        actions = [
          {
            label: `跳转到${targetPage.name}`,
            type: 'primary',
            action: 'navigate',
            target: targetPage.route,
            icon: '📍'
          }
        ]
        // 记录待确认操作
        userPreferences.value.pendingAction = {
          type: 'navigate',
          target: targetPage.route,
          name: targetPage.name
        }
        userPreferences.value.hasPendingConfirm = true
      }

      messages.value.push({
        role: 'ai',
        content: replyContent,
        actions: actions
      })
      updateUserPreferences('search', userMessage)
    } else {
      // 普通对话
      const chatResult = await chat({ message: userMessage })
      const replyContent = chatResult.data || chatResult.msg || '抱歉，我暂时无法回答这个问题。'

      // 提取目标页面，设置待确认操作
      const targetPage = extractTargetPage(userMessage)
      let actions = []
      if (targetPage) {
        actions = [
          {
            label: `跳转到${targetPage.name}`,
            type: 'primary',
            action: 'navigate',
            target: targetPage.route,
            icon: '📍'
          }
        ]
        userPreferences.value.pendingAction = {
          type: 'navigate',
          target: targetPage.route,
          name: targetPage.name
        }
        userPreferences.value.hasPendingConfirm = true
      }

      messages.value.push({
        role: 'ai',
        content: replyContent,
        actions: actions
      })
    }

  } catch (error) {
    messages.value.push({
      role: 'ai',
      content: '抱歉，我遇到了一些问题，请稍后再试。'
    })
    console.error('AI 服务异常:', error)
  } finally {
    loading.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 检查是否是确认式回复
function checkConfirmResponse(message) {
  // 修复：只有在有待确认操作时才识别确认词
  if (!userPreferences.value.hasPendingConfirm) {
    return { isConfirm: false }
  }

  // 独立的确认词和拒绝词
  const confirmWords = ['需要', '是的', '对', '要', '好的', '行', '可以', '确定', '确认', '跳转', '去']
  const rejectWords = ['不需要', '不用了', '算了', '不要', '不了', '取消', '放弃', '算了']

  // 先检查拒绝词（优先级更高）
  for (const word of rejectWords) {
    if (message.includes(word)) {
      return { isConfirm: true, type: 'reject' }
    }
  }

  // 再检查确认词
  for (const word of confirmWords) {
    if (message.includes(word)) {
      return { isConfirm: true, type: 'confirm' }
    }
  }

  return { isConfirm: false }
}

// 处理确认式回复
function handleConfirmResponse(confirmResult) {
  if (confirmResult.type === 'reject') {
    messages.value.push({
      role: 'ai',
      content: '好的，如果您有其他需要随时告诉我！',
      actions: [
        { label: '查看订单', type: 'primary', action: 'navigate', target: '订单管理', icon: '📋' },
        { label: '管理设备', type: 'primary', action: 'navigate', target: '设备管理', icon: '💻' }
      ]
    })
    userPreferences.value.pendingAction = null
    userPreferences.value.hasPendingConfirm = false
    return
  }

  // 用户说"需要"，执行待确认的操作
  if (userPreferences.value.pendingAction) {
    const action = userPreferences.value.pendingAction
    messages.value.push({
      role: 'ai',
      content: `好的，正在为您跳转到【${action.name}】页面...`,
      actions: [
        { label: '立即跳转', type: 'primary', action: 'navigate', target: action.target, icon: '🚀' }
      ]
    })
    setTimeout(() => {
      router.push({ path: action.target })
      showDialog.value = false
      updateUserPreferences('navigate', action.name)
      userPreferences.value.pendingAction = null
      userPreferences.value.hasPendingConfirm = false
    }, 1000)
  } else {
    // 没有待确认操作，基于上一次的意图提供建议
    const lastIntent = userPreferences.value.lastIntent || 'chat'
    if (lastIntent === 'navigate') {
      messages.value.push({
        role: 'ai',
        content: '好的，请告诉我您想去哪个页面？',
        actions: [
          { label: '订单管理', type: 'primary', action: 'navigate', target: '订单管理', icon: '📋' },
          { label: '设备管理', type: 'primary', action: 'navigate', target: '设备管理', icon: '💻' },
          { label: '设备类型', type: 'primary', action: 'navigate', target: '设备类型管理', icon: '🔧' }
        ]
      })
    } else {
      messages.value.push({
        role: 'ai',
        content: '好的，请告诉我您需要什么帮助？',
        actions: [
          { label: '使用帮助', type: 'info', action: 'help', target: '', icon: '❓' }
        ]
      })
    }
    userPreferences.value.hasPendingConfirm = false
  }
}

function detectIntent(message) {
  // 修复：使用更精确的正则表达式
  const navigatePatterns = [
    /带我去/, /帮我打开/, /跳转到/, /进入/, /导航到/,
    /切换到/, /访问/, /去.+管理/, /去.+列表/, /打开.+页面/
  ]
  const searchPatterns = [
    /搜索/, /查找/, /查询/, /帮我找/, /统计/, /有多少/,
    /查一下/, /找一下/, /看看.+数量/, /检查/, /筛选/
  ]
  const helpPatterns = [
    /帮助/, /怎么用/, /如何使用/, /有什么用/, /能做什么/,
    /功能/, /说明/, /介绍/, /什么是/
  ]

  for (const pattern of navigatePatterns) {
    if (pattern.test(message)) {
      userPreferences.value.lastIntent = 'navigate'
      return { intent: 'navigate' }
    }
  }

  for (const pattern of helpPatterns) {
    if (pattern.test(message)) {
      userPreferences.value.lastIntent = 'help'
      return { intent: 'help' }
    }
  }

  for (const pattern of searchPatterns) {
    if (pattern.test(message)) {
      userPreferences.value.lastIntent = 'search'
      return { intent: 'search' }
    }
  }

  userPreferences.value.lastIntent = 'chat'
  return { intent: 'chat' }
}

function extractTargetPage(message) {
  const pageMap = [
    { keywords: ['设备类型管理', '设备类型', '型号'], name: '设备类型管理', route: '/vm/vmtype' },
    { keywords: ['设备管理', '添加设备', '新增设备', '管理设备', '创建设备'], name: '设备管理', route: '/vm/machine' },
    { keywords: ['订单管理', '订单'], name: '订单管理', route: '/order' },
    { keywords: ['点位管理', '点位'], name: '点位管理', route: '/node/nodeList' },
    { keywords: ['策略管理', '策略'], name: '策略管理', route: '/policy/policyList' },
    { keywords: ['企鹅管理', '企鹅'], name: '企鹅管理', route: '/penguins/penguin' },
    { keywords: ['人员管理', '人员'], name: '人员管理', route: '/emp/empList' }
  ]

  // 优先匹配更精确的关键词
  for (const page of pageMap) {
    for (const keyword of page.keywords) {
      if (message.includes(keyword)) {
        return { name: page.name, route: page.route }
      }
    }
  }
  return null
}

function getMenuList() {
  return [
    { name: '订单管理', route: '/order', desc: '查看和管理订单信息' },
    { name: '设备管理', route: '/vm/machine', desc: '管理售货机设备' },
    { name: '设备类型管理', route: '/vm/vmtype', desc: '管理设备类型' },
    { name: '点位管理', route: '/node/nodeList', desc: '管理设备点位信息' },
    { name: '区域管理', route: '/node/region', desc: '管理区域信息' },
    { name: '企鹅管理', route: '/penguins/penguin', desc: '管理企鹅商品' },
    { name: '企鹅类型', route: '/penguins/penguinClass', desc: '管理企鹅类型' },
    { name: '策略管理', route: '/policy/policyList', desc: '管理策略信息' },
    { name: '运营工单', route: '/tasks/business', desc: '处理运营工单' },
    { name: '运维工单', route: '/tasks/operation', desc: '处理运维工单' },
    { name: '熊商管理', route: '/node/bear', desc: '管理熊商信息' },
    { name: '人员管理', route: '/emp/empList', desc: '管理人员信息' },
    { name: '角色管理', route: '/system/role', desc: '管理角色权限' },
    { name: '首页', route: '/index', desc: '系统首页' },
    { name: 'AI导航', route: '/ai/navigate', desc: 'AI智能导航' },
  ]
}

function scrollToBottom() {
  if (chatHistory.value) {
    chatHistory.value.scrollTop = chatHistory.value.scrollHeight
  }
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 100px;
  right: 30px;
  z-index: 999;
}

.ai-float-btn {
  width: 60px;
  height: 60px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ai-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.chat-history {
  height: 400px;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.chat-message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.user-message {
  align-items: flex-end;
}

.ai-message {
  align-items: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 8px;
  word-break: break-word;
  white-space: pre-line;
}

.user-message .message-content {
  background: #409eff;
  color: white;
}

.ai-message .message-content {
  background: white;
  color: #333;
}

.message-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-actions {
  padding: 12px 20px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-title {
  font-size: 12px;
  color: #909399;
  margin-right: 4px;
}

.chat-input {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}
</style>
