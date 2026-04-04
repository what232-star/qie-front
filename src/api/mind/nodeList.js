import request from '@/utils/request'

// 查询点位管理列表
export function listNodeList(query) {
  return request({
    url: '/mind/node/list',
    method: 'get',
    params: query
  })
}

// 查询点位管理详细
export function getNodeList(id) {
  return request({
    url: '/mind/node/' + id,
    method: 'get'
  })
}

// 新增点位管理
export function addNodeList(data) {
  return request({
    url: '/mind/node',
    method: 'post',
    data: data
  })
}

// 修改点位管理
export function updateNodeList(data) {
  return request({
    url: '/mind/node',
    method: 'put',
    data: data
  })
}

// 删除点位管理
export function delNodeList(id) {
  return request({
    url: '/mind/node/' + id,
    method: 'delete'
  })
}
