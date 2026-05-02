<template>
  <div class="box abnormal-equipment">
    <div class="header">
      <div class="title">异常设备监控</div>
      <el-icon @click="handleMore"><MoreFilled /></el-icon>
    </div>
    <el-scrollbar v-if="listData.length" class="scrollbar body">
      <el-table
        :data="listData"
        fit
        highlight-current-row
        style="width: 100%"
        :header-cell-style="{
          padding: '7px 0 6px',
          background: '#EFF0F2',
          'font-weight': '400',
          'text-align': 'left',
          color: '#333333',
        }"
        :cell-style="{
          padding: '15px 0',
          'text-align': 'left',
          color: '#999999',
        }"
      >
        <el-table-column label="故障时间" width="160px">
          <template #default="scope">
            <span>{{ scope.row.updateTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备地址" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.addr }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备编号" width="120px">
          <template #default="scope">
            <span>{{ scope.row.innerCode }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>
    <!-- TODO：一开始显示加载中 -->
    <div v-else class="empty">
      <img src="@/assets/images/empty.png" />
      <div class="tips">暂无数据</div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
// 定义变量
const router = useRouter();
const listData = ref([
        {
            "createBy": null,
            "createTime": "2020-12-18 15:49:03",
            "updateBy": null,
            "updateTime": "2026-05-14 09:21:58",
            "remark": null,
            "id": 80,
            "innerCode": "tNrPa1M0",
            "vmTypeId": 1,
            "vmTypeName": "马桶",
            "channelMaxCapacity": 10,
            "nodeId": 6,
            "addr": "东北农业大学阿城校区一食堂一楼",
            "lastSupplyTime": "2023-03-22",
            "businessId": 1,
            "regionId": 3,
            "regionName": "B城校区",
            "ownerId": 28,
            "longitudes": 0,
            "vmStatus": 1,
            "clientId": "70122567fcc13e7615e7239812c20448",
            "ownerName": "东农超市",
            "latitude": 0,
            "runningStatus": "{\"key\": \"10001\",\"value\":\"正常\" }",
            "policyId": 1
        },
        {
            "createBy": null,
            "createTime": "2020-12-18 10:39:22",
            "updateBy": null,
            "updateTime": "2026-05-14 09:22:11",
            "remark": null,
            "id": 81,
            "innerCode": "amhNDPS7",
            "vmTypeId": 1,
            "vmTypeName": "马桶",
            "channelMaxCapacity": 10,
            "nodeId": 2,
            "addr": "东北农业大学二食堂一楼",
            "lastSupplyTime": "2000-01-01",
            "businessId": 2,
            "regionId": 1,
            "regionName": "香坊主校区",
            "ownerId": 1,
            "longitudes": 0,
            "vmStatus": 1,
            "clientId": "3792e9c9b390e291514fd4f9b8fe95bb",
            "ownerName": "东农超市\n",
            "latitude": 0,
            "runningStatus": "{\"key\": \"10001\",\"value\":\"正常\" }",
            "policyId": 2
        },
        {
            "createBy": null,
            "createTime": "2020-12-18 11:45:28",
            "updateBy": null,
            "updateTime": "2026-05-16 12:25:30",
            "remark": null,
            "id": 82,
            "innerCode": "VJhKYmDy",
            "vmTypeId": 1,
            "vmTypeName": "毛巾",
            "channelMaxCapacity": 10,
            "nodeId": 3,
            "addr": "东北农业大学阿城校区食堂门口 ",
            "lastSupplyTime": "2000-01-01",
            "businessId": 1,
            "regionId": 2,
            "regionName": "B城校区",
            "ownerId": 1,
            "longitudes": 0,
            "vmStatus": 1,
            "clientId": "1b9e4df47a4c55124b54a4cb00b62123",
            "ownerName": "蜜雪冰城(东农店)",
            "latitude": 0,
            "runningStatus": "{\"key\": \"10001\",\"value\":\"正常\" }",
            "policyId": 2
        },
        {
            "createBy": null,
            "createTime": "2020-12-18 11:46:19",
            "updateBy": null,
            "updateTime": "2026-05-14 09:24:44",
            "remark": null,
            "id": 83,
            "innerCode": "mwqRUGkx",
            "vmTypeId": 1,
            "vmTypeName": "废墟",
            "channelMaxCapacity": 10,
            "nodeId": 4,
            "addr": "东北农业大学二食堂一楼",
            "lastSupplyTime": "2022-11-29",
            "businessId": 2,
            "regionId": 2,
            "regionName": "香坊主校区",
            "ownerId": 1,
            "longitudes": 0,
            "vmStatus": 1,
            "clientId": "d764e5e764db441de0ed5dbf68d48f90",
            "ownerName": "东农超市",
            "latitude": 0,
            "runningStatus": "{\"key\": \"10001\",\"value\":\"正常\" }",
            "policyId": 1
        }
    ]);

// 点击更多
const handleMore = () => {
  router.push({ path: 'vm/machine' });
};
</script>
<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.abnormal-equipment {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.4);
  min-height: 353px;
  background: #ffffff;
  border-radius: 20px;

  .more {
    color: $--color-primary;
    cursor: pointer;
  }

  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .tips {
      margin-top: 25px;
      color: #20232a;
      font-size: 14px;
    }
  }

  .body {
    flex: 1;
    margin-top: 20px;
  }
}
</style>