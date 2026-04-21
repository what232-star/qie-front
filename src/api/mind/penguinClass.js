import request from '@/utils/request'

// 查询企鹅类型列表
export function listPenguinClass(query) {
  return request({
    url: '/mind/penguinClass/list',
    method: 'get',
    params: query
  })
}

// 查询企鹅类型详细
export function getPenguinClass(classId) {
  return request({
    url: '/mind/penguinClass/' + classId,
    method: 'get'
  })
}

// 新增企鹅类型
export function addPenguinClass(data) {
  return request({
    url: '/mind/penguinClass',
    method: 'post',
    data: data
  })
}

// 修改企鹅类型
export function updatePenguinClass(data) {
  return request({
    url: '/mind/penguinClass',
    method: 'put',
    data: data
  })
}

// 删除企鹅类型
export function delPenguinClass(classId) {
  return request({
    url: '/mind/penguinClass/' + classId,
    method: 'delete'
  })
}
