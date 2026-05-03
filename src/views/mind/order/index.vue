<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <el-table v-loading="loading" :data="orderList">
      <el-table-column label="序号" type="index" align="center" prop="id" width="80"/>
      <el-table-column label="订单编号" align="center" prop="orderNo" show-overflow-tooltip="" />
      <el-table-column label="商品名称" align="center" prop="penguinName" />
      <el-table-column label="订单状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" align="center" prop="amount">
        <template #default="scope">
          <span>{{ (scope.row.amount / 100).toFixed(2) }} 元</span>
        </template>
      </el-table-column>
      <el-table-column label="订单时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary"  @click="handleUpdate(scope.row)" v-hasPermi="['mind:order:query']">查看详情</el-button>
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

    <!-- 查看详情对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <div v-if="orderDetailList.length > 0">
        <el-descriptions :column="1" border size="large">
          <el-descriptions-item label="订单编号">{{ orderDetailList[0].orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <dict-tag :options="order_status" :value="orderDetailList[0].status"/>
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span style="color: #f56c6c; font-weight: bold;">{{ (orderDetailList[0].amount / 100).toFixed(2) }} 元</span>
          </el-descriptions-item>
          <el-descriptions-item label="商品价格">{{ (orderDetailList[0].price / 100).toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="支付状态">
            <el-tag :type="orderDetailList[0].payStatus === 0 ? 'warning' : 'success'">
              {{ orderDetailList[0].payStatus === 0 ? '未支付' : '已支付' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ orderDetailList[0].payType === '2' ? '支付宝' : orderDetailList[0].payType === '1' ? '微信' : '其他' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品编码">{{ orderDetailList[0].innerCode }}</el-descriptions-item>
          <el-descriptions-item label="节点ID">{{ orderDetailList[0].nodeId }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ orderDetailList[0].addr }}</el-descriptions-item>
          <el-descriptions-item label="订单时间">{{ parseTime(orderDetailList[0].createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ orderDetailList[0].remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/mind/order";
import { loadAllParams } from "@/api/page.js";
import {parseTime} from "../../../utils/ruoyi.js";

const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict('order_status');

const orderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: null,
    createTime: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

const orderDetailList = ref([]);

/** 查询订单列表 */
function getList() {
  loading.value = true;
  listOrder(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    orderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
}


/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}


/** 查看详情操作 */
function handleUpdate(row) {
  const _id = row.id;
  if (!_id) {
    proxy.$modal.msgError("订单ID不存在");
    return;
  }
  listOrder(loadAllParams).then(response => {
    orderDetailList.value = response.rows.filter(item => item.id === _id);
    open.value = true;
    title.value = "订单详情";
  }).catch(error => {
    proxy.$modal.msgError("获取订单详情失败");
  });
}


getList();
</script>
