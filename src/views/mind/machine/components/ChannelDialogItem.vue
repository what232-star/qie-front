<template>
  <div v-if="channel" class="item">
    <div class="code">
      {{ channel.channelCode }}
    </div>
    <div class="penguin">
      <img
        class="img"
        :src="channel.penguin&&channel.penguin.penguinImage
            ? channel.penguin.penguinImage
            : defaultImage"
      />
      <div class="name" :title="channel.penguin ? channel.penguin.penguinName : '暂无商品'">
        {{ channel.penguin ? channel.penguin.penguinName : '暂无商品' }}
      </div>
    </div>
    <div>
      <el-button
        link
        class="el-button--primary-text"
        @click="handleSetClick"
      >
        添加
      </el-button>
      <el-button
        link
        class="el-button--danger-text"
        :disabled="!channel.penguin"
        @click="handleRemoveClick"
      >
        删除
      </el-button>
    </div>
  </div>
</template>
<script setup>
import defaultImage from '@/assets/logo/logo.png';
const props = defineProps({
  currentIndex: {
    type: Number,
    default: 0,
  },
  channel: {
    type: Object,
    default: () => {},
  },
});
const emit = defineEmits(['openSetPenguinDialog','openRemovePenguinDialog']);
// 添加商品
const handleSetClick = () => {
  emit('openSetPenguinDialog', props.currentIndex, props.channel.channelCode);
};
// 删除产品
const handleRemoveClick = () => {
  emit('openRemovePenguinDialog', props.currentIndex, props.channel.channelCode);
};
</script>
<style scoped lang="scss">
@import '@/assets/styles/variables.module.scss';
.item {
  position: relative;
  width: 150px;
  height: 180px;
  background: #ffffff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  text-align: center;

  .code {
    position: absolute;
    top: 10px;
    left: 0;
    width: 43px;
    height: 23px;
    line-height: 23px;
    background: #829bed;
    border-radius: 0px 10px 10px 0px;
    font-size: 12px;
    color: #ffffff;
  }

  .penguin {
    height: 135px;
    padding-top: 16px;
    background-color: #f6f7fb;
    border-radius: 4px;

    .img {
      display: inline-block;
      width: 84px;
      height: 78px;
      margin-bottom: 10px;
      object-fit: contain;
    }

    .name {
      padding: 0 16px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  // 按钮颜色样式
  :deep(.el-button--primary-text) {
    color: #409eff;
    
    &:hover {
      color: #66b1ff;
    }
  }

  :deep(.el-button--danger-text) {
    color: #f56c6c;
    
    &:hover {
      color: #f78989;
    }
    
    &.is-disabled {
      color: #c0c4cc;
    }
  }
}
</style>
