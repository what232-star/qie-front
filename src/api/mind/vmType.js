import request from '@/utils/request'

// 查询设备类型管理列表
export function listVmType(query) {
  return request({
    url: '/mind/vmType/list',
    method: 'get',
    params: query
  })
}

// 查询设备类型管理详细
export function getVmType(id) {
  return request({
    url: '/mind/vmType/' + id,
    method: 'get'
  })
}

// 新增设备类型管理
export function addVmType(data) {
  return request({
    url: '/mind/vmType',
    method: 'post',
    data: data
  })
}

// 修改设备类型管理
export function updateVmType(data) {
  return request({
    url: '/mind/vmType',
    method: 'put',
    data: data
  })
}

// 删除设备类型管理
export function delVmType(id) {
  return request({
    url: '/mind/vmType/' + id,
    method: 'delete'
  })
}
