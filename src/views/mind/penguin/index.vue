<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企鹅名称" prop="penguinName">
        <el-input
          v-model="queryParams.penguinName"
          placeholder="请输入企鹅名称"
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
          v-hasPermi="['mind:penguin:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['mind:penguin:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['mind:penguin:remove']"
        >删除</el-button>
      </el-col>
      <!--权限跟新增保持一致即可-->
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Upload"
            @click="handleImport"
            v-hasPermi="['mind:penguin:add']"
        > 导入 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['mind:penguin:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="penguinList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" type="index" align="center" prop="penguinId" width="50"/>
      <el-table-column label="企鹅名称" align="center" prop="penguinName" />
      <el-table-column label="企鹅图片" align="center" prop="penguinImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.penguinImage" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="品牌" align="center" prop="brandName" />
      <el-table-column label="规格" align="center" prop="unit" />
      <el-table-column label="企鹅价格" align="center" prop="price" >
        <template #default="scope">
          <span>{{ scope.row.price /100 }} 元</span>
        </template>
      </el-table-column>
      <el-table-column label="企鹅类型" align="center" prop="classId" >
        <template #default="scope">
          <div v-for="item in penguinClassList" :key="item.classId">
            <span v-if="item.classId === scope.row.classId">{{ item.className }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <el-tag>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary"  @click="handleUpdate(scope.row)" v-hasPermi="['mind:penguin:edit']">修改</el-button>
          <el-button link type="primary"  @click="handleDelete(scope.row)" v-hasPermi="['mind:penguin:remove']">删除</el-button>
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

    <!-- 添加或修改企鹅盲盒管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="penguinRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="企鹅名称" prop="penguinName">
          <el-input v-model="form.penguinName" placeholder="请输入企鹅名称" />
        </el-form-item>
        <el-form-item label="企鹅图片" prop="penguinImage">
          <image-upload v-model="form.penguinImage"/>
        </el-form-item>
        <el-form-item label="品牌" prop="brandName">
          <el-input v-model="form.brandName" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="规格" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入规格(净含量)" />
        </el-form-item>
        <el-form-item label="企鹅价格" prop="price">
          <el-input-number :min=0.01 :max="999.99" :precision="2" :step="0.5" v-model="form.price"  />元
        </el-form-item>
        <el-form-item label="企鹅类型" prop="classId">
<!--          <el-input v-model="form.classId" placeholder="请输入企鹅类型id" />-->
          <el-select v-model="form.classId" placeholder="请选择企鹅类型">
            <el-option v-for="item in penguinClassList" :key="item.classId" :label="item.className" :value="item.classId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
<!--    数据导入对话框-->
          <el-dialog title="导入企鹅" v-model="excelOpen" width="400px" append-to-body>
            <el-upload
                ref="uploadRef"
                class="upload-demo"
                :action="uploadExcelUrl"
                :headers="headers"
                :auto-upload="false"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                :before-upload="handleBeforeUpload"
                :limit="1"
            >
<!--              关闭自动上传-->


            <template #trigger>
              <el-button type="primary">上传文件</el-button></template>
            <el-button class="ml-3" type="success"@click="submitUpload" style="margin-left: 10px;">
                上传
            </el-button>
            <template #tip>
              <div class="el-upload_tip">
                文件仅支持xls/xlsx格式，文件大小不得超过1M
              </div>
            </template></el-upload>
    </el-dialog>
  </div>
</template>

<script setup name="Penguin">
import { listPenguin, getPenguin, delPenguin, addPenguin, updatePenguin } from "@/api/mind/penguin"
import {parseTime} from "../../../utils/ruoyi.js";
import {listPenguinClass} from "@/api/mind/penguinClass.js";
import {loadAllParams} from "@/api/page.js";
import {getToken} from "@/utils/auth.js";

const { proxy } = getCurrentInstance()

const penguinList = ref([])
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
    penguinName: null,
    classId: null,
  },
  rules: {
    penguinName: [
      { required: true, message: "企鹅名称不能为空", trigger: "blur" }
    ],
    penguinImage: [
      { required: true, message: "企鹅图片不能为空", trigger: "blur" }
    ],
    brandName: [
      { required: true, message: "品牌不能为空", trigger: "blur" }
    ],
    unit: [
      { required: true, message: "规格(净含量)不能为空", trigger: "blur" }
    ],
    price: [
      { required: true, message: "企鹅价格，单位分不能为空", trigger: "blur" }
    ],
    classId: [
      { required: true, message: "企鹅类型id不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    proxy.$modal.msgSuccess("上传成功")
    excelOpen.value = false
    getList()
  } else {
    proxy.$modal.msgError(res.msg)
  }
  uploadRef.value.clearFiles()
  proxy.$modal.closeLoading()
}

// 上传失败
function handleUploadError() {
  proxy.$modal.msgError("上传Excel失败")
  uploadRef.value.clearFiles()
  proxy.$modal.closeLoading()
}


//上传前校验
const props = defineProps({
  modelValue: [String, Object, Array],

  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 1
  },
  // 文件类型, 例如['xls', 'xlsx']
  fileType: {
    type: Array,
    default: () => ['xls', 'xlsx']
  },

})


// 上传前loading加载
function handleBeforeUpload(file) {
  let isExcel = false
  if (props.fileType.length) {
    let fileExtension = ""
    if (file.name.lastIndexOf(".") > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1)
    }
    isExcel = props.fileType.some(type => {
      if (file.type.indexOf(type) > -1) return true
      if (fileExtension && fileExtension.indexOf(type) > -1) return true
      return false
    })
  }
  if (!isExcel) {
    proxy.$modal.msgError(`文件格式不正确，请上传${props.fileType.join("/")}图片格式文件!`)
    return false
  }
  if (file.name.includes(',')) {
    proxy.$modal.msgError('文件名不正确，不能包含英文逗号!')
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传excel大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  proxy.$modal.loading("正在上传excel，请稍候...")
}


/** 查询企鹅盲盒管理列表 */
function getList() {
  loading.value = true
  listPenguin(queryParams.value).then(response => {
    penguinList.value = response.rows
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
    penguinId: null,
    penguinName: null,
    penguinImage: null,
    brandName: null,
    unit: null,
    price: null,
    classId: null,
    isDiscount: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("penguinRef")
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
  ids.value = selection.map(item => item.penguinId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加企鹅盲盒管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _penguinId = row.penguinId || ids.value
  getPenguin(_penguinId).then(response => {
    form.value = response.data
    form.value.price /= 100;
    open.value = true
    title.value = "修改企鹅盲盒管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["penguinRef"].validate(valid => {
    if (valid) {
      //将价格从元转换为分
      form.value.price *= 100;
      if (form.value.penguinId != null) {
        updatePenguin(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPenguin(form.value).then(response => {
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
  const _penguinIds = row.penguinId || ids.value
  proxy.$modal.confirm('是否确认删除企鹅盲盒管理编号为"' + _penguinIds + '"的数据项？').then(function() {
    return delPenguin(_penguinIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('mind/penguin/export', {
    ...queryParams.value
  }, `penguin_${new Date().getTime()}.xlsx`)
}

//导入按钮操作
const excelOpen = ref(false)
function handleImport() {
  excelOpen.value = true
}

//上传地址
const uploadExcelUrl = ref(import.meta.env.VITE_APP_BASE_API + "mind/penguin/import")
//上传请求头
const headers = ref({ Authorization: "Bearer " + getToken() })

const uploadRef = ref({})
//上传excel文件
function submitUpload() {
  uploadRef.value.submit()
}




const penguinClassList = ref([])
function getPenguinClassList() {
  listPenguinClass(loadAllParams).then(response => {
    penguinClassList.value = response.rows
  })
}

getPenguinClassList()
getList()
</script>
