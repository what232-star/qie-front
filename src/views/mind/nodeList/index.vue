<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="点位名称" prop="nodeName">
        <el-input
          v-model="queryParams.nodeName"
          placeholder="请输入点位名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="区域选择" prop="regionId">
        <el-select v-model="queryParams.regionId" placeholder="请选择区域" clearable style="width: 200px">
          <el-option v-for="item in regionList" :key="item.id" :label="item.regionName" :value="item.id" />
        </el-select>
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
          v-hasPermi="['mind:nodeList:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['mind:nodeList:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['mind:nodeList:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['mind:nodeList:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="nodeListList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号"  type="index" align="center" prop="id" width="60" />
      <el-table-column label="点位名称" align="center" prop="nodeName" show-overflow-tooltip min-width="120" />
      <el-table-column label="区域名称" align="center" prop="region.regionName" show-overflow-tooltip min-width="100" />
      <el-table-column label="商圈类型" align="center" prop="businessType" show-overflow-tooltip min-width="100">
        <template #default="scope">
          <span v-if="scope.row.businessType === 1">开放区</span>
          <span v-else-if="scope.row.businessType === 2">教学楼</span>
          <span v-else-if="scope.row.businessType === 3">商业区</span>
          <span v-else-if="scope.row.businessType === 4">食堂区</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="合作商名称" align="center" prop="bear.bearName" show-overflow-tooltip min-width="100" />
      <el-table-column label="详细地址" align="center" prop="address" show-overflow-tooltip min-width="200" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary"  @click="getRegionInfo(scope.row)" v-hasPermi="['mind:node:list']">查看详情</el-button>
          <el-button link type="primary"  @click="handleUpdate(scope.row)" v-hasPermi="['mind:nodeList:edit']">修改</el-button>
          <el-button link type="primary"  @click="handleDelete(scope.row)" v-hasPermi="['mind:nodeList:remove']">删除</el-button>
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

    <!-- 添加或修改点位管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form :model="form" ref="nodeListRef" :rules="rules" label-width="100px">
        <el-form-item label="点位名称" prop="nodeName">
          <el-input
              v-model="form.nodeName"
              placeholder="请输入点位名称"
              clearable
          />
        </el-form-item>
        <el-form-item label="区域选择" prop="regionId">
          <el-select v-model="form.regionId" placeholder="请选择区域" clearable>
            <el-option v-for="item in regionList" :key="item.id" :label="item.regionName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="合作商选择" prop="bearId">
          <el-select v-model="form.bearId" placeholder="请选择合作商" clearable style="width: 200px">
            <el-option v-for="item in bearList" :key="item.id" :label="item.bearName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商圈类型" prop="businessType">
          <el-select v-model="form.businessType" placeholder="请选择商圈类型" clearable style="width: 200px">
            <el-option label="开放区" :value="1" />
            <el-option label="教学楼" :value="2" />
            <el-option label="商业区" :value="3" />
            <el-option label="食堂区" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="详细地址" prop="address">
          <el-input
              v-model="form.address"
              type="textarea"
              :rows="3"
              placeholder="请输入详细地址"
          />
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

<script setup name="NodeList">
import { listNodeList, getNodeList, delNodeList, addNodeList, updateNodeList } from "@/api/mind/nodeList"
import {listRegion} from "@/api/mind/region.js";
import {listBear} from "@/api/mind/bear.js";
import  {loadAllParams} from "@/api/page.js";



const { proxy } = getCurrentInstance()

const nodeListList = ref([])
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
    nodeName: null,
    regionId: null,
    bearId: null,
  },
  rules: {
    nodeName: [
      { required: true, message: "点位名称不能为空", trigger: "blur" }
    ],
    address: [
      { required: true, message: "详细地址不能为空", trigger: "blur" }
    ],
    businessType: [
      { required: true, message: "商圈类型不能为空", trigger: "change" }
    ],
    regionId: [
      { required: true, message: "区域外键不能为空", trigger: "blur" }
    ],
    bearId: [
      { required: true, message: "合作商外键不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询点位管理列表 */
function getList() {
  loading.value = true
  listNodeList(queryParams.value).then(response => {
    nodeListList.value = response.rows
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
    nodeName: null,
    address: null,
    businessType: null,
    regionId: null,
    bearId: null,
    remark: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  }
  proxy.resetForm("nodeListRef")
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
  title.value = "添加点位管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getNodeList(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改点位管理"
  })
}




/** 提交按钮 */
function submitForm() {
  proxy.$refs["nodeListRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateNodeList(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addNodeList(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除点位管理编号为"' + _ids + '"的数据项？').then(function() {
    return delNodeList(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('mind/nodeList/export', {
    ...queryParams.value
  }, `nodeList_${new Date().getTime()}.xlsx`)
}
//
// /*查询所有条件对象 */
// const loadAllParams = reactive({
//   pageNum: 1,
//   pageSize: 10000
// })

const regionList = ref([]);

/** 查询区域列表 */
function getRegionList() {
  listRegion(loadAllParams).then(response => {
    regionList.value = response.rows;
  })
}

const bearList = ref([]);

/*查询熊熊合作商列表 */
function getBearList() {
  listBear(loadAllParams).then( response=> {
    bearList.value = response.rows;
  })
}


getBearList()
getRegionList()
getList()
</script>
