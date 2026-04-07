<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="合作商名称" prop="bearName">
        <el-input
            v-model="queryParams.bearName"
          placeholder="请输入合作商名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['mind:bear:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['mind:bear:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['mind:bear:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['mind:bear:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bearList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号"  type="index" align="center" prop="id" />
      <el-table-column label="合作商名称" align="center" prop="bearName" show-overflow-tooltip />
      <el-table-column label="点位数" align="center" prop="nodeCount" show-overflow-tooltip />
      <el-table-column label="账号" align="center" prop="account" />

      <el-table-column label="分成比例(%)" align="center" prop="shareRatio">
        <template #default="scope">
          <span>{{ scope.row.shareRatio !== null && scope.row.shareRatio !== undefined ? scope.row.shareRatio + '%' : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" prop="contactBear" show-overflow-tooltip />
      <el-table-column label="联系电话" align="center" prop="contactPhone" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  width="280">
        <template #default="scope">
          <el-button link type="primary"  @click="resetPwd(scope.row)" v-hasPermi="['mind:bear:edit']">重置密码</el-button>
          <el-button link type="primary"  @click="getBearInfo(scope.row)" v-hasPermi="['mind:bear:query']">查看详情</el-button>
          <el-button link type="primary"  @click="handleUpdate(scope.row)" v-hasPermi="['mind:bear:edit']">修改</el-button>
          <el-button link type="primary"  @click="handleDelete(scope.row)" v-hasPermi="['mind:bear:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改熊熊合作商管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="bearRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="合作商名称" prop="bearName">
          <el-input v-model="form.bearName" placeholder="请输入合作商名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactBear">
          <el-input v-model="form.contactBear" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime" v-if="form.id!=null">
          {{form.createTime}}
        </el-form-item>
        <el-form-item label="分成比例(%)" prop="shareRatio">
          <el-input v-model="form.shareRatio" placeholder="请输入分成比例(%)" />
        </el-form-item>
        <el-form-item label="账号" prop="account" v-if="form.id==null">
          <el-input v-model="form.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="form.id==null">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="熊熊合作商详情" v-model="BearInfoOpen" width="600px" append-to-body>
      <el-descriptions :column="1" border size="large">
        <el-descriptions-item label="合作商名称" label-class-name="detail-label">
          {{ form.bearName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="账号" label-class-name="detail-label">
          {{ form.account || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="分成比例(%)" label-class-name="detail-label">
          {{ form.shareRatio !== null && form.shareRatio !== undefined ? form.shareRatio + '%' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人" label-class-name="detail-label">
          {{ form.contactBear || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话" label-class-name="detail-label">
          {{ form.contactPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" label-class-name="detail-label" v-if="form.createTime">
          {{ form.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" label-class-name="detail-label" v-if="form.updateTime">
          {{ form.updateTime }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" label-class-name="detail-label" v-if="form.remark">
          {{ form.remark }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="BearInfoOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="Bear">
import { listBear, getBear, delBear, addBear, updateBear ,resetBearPwd } from "@/api/mind/bear"

const { proxy } = getCurrentInstance()

const bearList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    bearName: null,
  },
  rules: {
    bearName: [
      { required: true, message: "合作商名称不能为空", trigger: "blur" }
    ],
    contactBear: [
      { required: true, message: "联系人不能为空", trigger: "blur" }
    ],
    contactPhone: [
      { required: true, message: "联系电话不能为空", trigger: "blur" }
    ],
    shareRatio: [
      { required: true, message: "分成比例(%)不能为空", trigger: "blur" }
    ],
    account: [
      { required: true, message: "账号不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "密码不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询熊熊合作商管理列表 */
function getList() {
  loading.value = true
  listBear(queryParams.value).then(response => {
    bearList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    bearName: null,
    contactBear: null,
    contactPhone: null,
    shareRatio: null,
    account: null,
    password: null,
    remark: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  }
  proxy.resetForm("bearRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加熊熊合作商管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getBear(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改熊熊合作商管理"
  })
}

// 查看熊熊合作商详情
const BearInfoOpen= ref(false)
function getBearInfo(row) {
  reset();
  const _id = row.id
  getBear(_id).then(response => {
    form.value = response.data
    BearInfoOpen.value = true
  })
}



/** 提交按钮 */
function submitForm() {
  proxy.$refs["bearRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateBear(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addBear(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除熊熊合作商管理编号为"' + _ids + '"的数据项？').then(function() {
    return delBear(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 重置密码 */
function resetPwd(row) {
  const _id = row.id || ids.value
  proxy.$modal.confirm('你确定要重置该熊熊合作商的密码吗？').then(function() {
    return resetBearPwd(_id)
  }).then(() => {
    proxy.$modal.msgSuccess("重置密码成功")
  }).catch(() => {})
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('mind/bear/export', {
    ...queryParams.value
  }, `bear_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped lang="scss">:deep(.detail-label) {
  color: #909399;
  font-weight: 500;
  background-color: #f5f7fa;
  width: 120px !important;
}

:deep(.el-descriptions__label) {
  background-color: #fafafa;
}
</style>
