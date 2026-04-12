import request from '@/utils/request'

// 查询自动售货机设备管理列表
export function listMachine(query) {
  return request({
    url: '/mind/machine/list',
    method: 'get',
    params: query
  })
}

// 查询自动售货机设备管理详细
export function getMachine(id) {
  return request({
    url: '/mind/machine/' + id,
    method: 'get'
  })
}

// 新增自动售货机设备管理
export function addMachine(data) {
  return request({
    url: '/mind/machine',
    method: 'post',
    data: data
  })
}

// 修改自动售货机设备管理
export function updateMachine(data) {
  return request({
    url: '/mind/machine',
    method: 'put',
    data: data
  })
}

// 删除自动售货机设备管理
export function delMachine(id) {
  return request({
    url: '/mind/machine/' + id,
    method: 'delete'
  })
}
