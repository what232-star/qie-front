import request from '@/utils/request'

// 查询企鹅盲盒管理列表
export function listPenguin(query) {
  return request({
    url: '/mind/penguin/list',
    method: 'get',
    params: query
  })
}

// 查询企鹅盲盒管理详细
export function getPenguin(penguinId) {
  return request({
    url: '/mind/penguin/' + penguinId,
    method: 'get'
  })
}

// 新增企鹅盲盒管理
export function addPenguin(data) {
  return request({
    url: '/mind/penguin',
    method: 'post',
    data: data
  })
}

// 修改企鹅盲盒管理
export function updatePenguin(data) {
  return request({
    url: '/mind/penguin',
    method: 'put',
    data: data
  })
}

// 删除企鹅盲盒管理
export function delPenguin(penguinId) {
  return request({
    url: '/mind/penguin/' + penguinId,
    method: 'delete'
  })
}
