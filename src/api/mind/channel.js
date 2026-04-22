import request from '@/utils/request';

// 查询货道列表
export function getGoodsList(innerCode) {
  return request({
    url: '/mind/channel/list/' + innerCode,
    method: 'get',
  });
}
// 查询设备类型
export function getGoodsType(typeId) {
  return request({
    url: '/mind/vmType/' + typeId,
    method: 'get',
  });
}
// 提交获取的货道
export function channelConfig(data) {
  return request({
    url: '/mind/channel/config',
    method: 'put',
    data: data,
  });
}
