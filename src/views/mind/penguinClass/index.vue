<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企鹅类型" prop="className">
        <el-input
          v-model="queryParams.className"
          placeholder="请输入企鹅类型"
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
          v-hasPermi="['mind:penguinClass:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['mind:penguinClass:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['mind:penguinClass:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['mind:penguinClass:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="penguinClassList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="classId" />
      <el-table-column label="企鹅类型" align="center" prop="className" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary"  @click="handleUpdate(scope.row)" v-hasPermi="['mind:penguinClass:edit']">修改</el-button>
          <el-button link type="primary"  @click="handleDelete(scope.row)" v-hasPermi="['mind:penguinClass:remove']">删除</el-button>
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

    <!-- 添加或修改企鹅类型对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="penguinClassRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="企鹅类型" prop="className">
          <el-input v-model="form.className" placeholder="请输入企鹅类型" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PenguinClass">
import { listPenguinClass, getPenguinClass, delPenguinClass, addPenguinClass, updatePenguinClass } from "@/api/mind/penguinClass"

const { proxy } = getCurrentInstance()

const penguinClassList = ref([])
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
    className: null,
  },
  rules: {
    className: [
      { required: true, message: "企鹅类型不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询企鹅类型列表 */
function getList() {
  loading.value = true
  listPenguinClass(queryParams.value).then(response => {
    penguinClassList.value = response.rows
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
    classId: null,
    className: null,
    parentId: null
  }
  proxy.resetForm("penguinClassRef")
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
  ids.value = selection.map(item => item.classId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加企鹅类型"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _classId = row.classId || ids.value
  getPenguinClass(_classId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改企鹅类型"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["penguinClassRef"].validate(valid => {
    if (valid) {
      if (form.value.classId != null) {
        updatePenguinClass(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPenguinClass(form.value).then(response => {
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
  const _classIds = row.classId || ids.value
  proxy.$modal.confirm('是否确认删除企鹅类型编号为"' + _classIds + '"的数据项？').then(function() {
    return delPenguinClass(_classIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('mind/penguinClass/export', {
    ...queryParams.value
  }, `penguinClass_${new Date().getTime()}.xlsx`)
}

getList()
</script>
