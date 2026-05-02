<template>
  <div class="box bgc3 sku-sale-rank">
    <!-- TODO: 分辨大怎么展示问UI -->
    <div class="header">
      <div class="title">
        商品热榜<span class="sub-title">{{ start }} ~ {{ end }}</span>
      </div>
    </div>
    <div class="body">
      <el-row v-for="(item, index) in skuSaleRank" :key="index">
        <el-col :span="5">
          <div :class="'top top' + (index + 1)">
            {{ index + 1 }}
          </div>
        </el-col>
        <el-col :span="13">
          <div class="sku-name" :title="item.skuName">
            {{ item.skuName }}
          </div>
        </el-col>
        <el-col :span="6">
          <div class="count">{{ item.count }}单</div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script setup>
import dayjs from 'dayjs';
// 定义变量
const skuSaleRank = ref([
    {
        "skuId": "0",
        "skuName": "高不高级",
        "count": 820,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "这对吗",
        "count": 762,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "一手情报",
        "count": 749,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "何意味",
        "count": 742,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "快哉快哉",
        "count": 718,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "硬撑",
        "count": 714,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "每天",
        "count": 700,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "捏爆魔丸",
        "count": 673,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "享福",
        "count": 422,
        "amount": 0
    },
    {
        "skuId": "0",
        "skuName": "格调",
        "count": 348,
        "amount": 0
    }
])
const start = dayjs().startOf('month').format('YYYY.MM.DD');
const end = dayjs().endOf('day').format('YYYY.MM.DD');
</script>
<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.sku-sale-rank {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.6);
  min-height: 538px;
  background: #FFFFFF;
  border-radius: 20px;

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 20px;

    .top {
      display: inline-block;
      width: 16px;
      height: 20px;
      margin-left: 10px;
      background: url('@/assets/user-task-stats/top.png');
      text-align: center;
      font-size: 12px;
      font-weight: normal;
      color: #E9B499;
      line-height: 14px;
    }

    .top1 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top1.png');
      color: #8E5900;
    }

    .top2 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top2.png');
      color: #494949;
    }

    .top3 {
      width: 21px;
      height: 20px;
      background: url('@/assets/user-task-stats/top3.png');
      color: #CF6D3D;
    }

    .sku-name {
      height: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      line-height: 20px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .count {
      height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #737589;
      line-height: 20px;
      text-align: right;
    }
  }
}
</style>