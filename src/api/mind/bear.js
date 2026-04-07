import request from '@/utils/request'

// 查询熊熊合作商管理列表
export function listBear(query) {
  return request({
    url: '/mind/bear/list',
    method: 'get',
    params: query
  })
}

// 查询熊熊合作商管理详细
export function getBear(id) {
  return request({
    url: '/mind/bear/' + id,
    method: 'get'
  })
}

// 新增熊熊合作商管理
export function addBear(data) {
  return request({
    url: '/mind/bear',
    method: 'post',
    data: data
  })
}

// 修改熊熊合作商管理
export function updateBear(data) {
  return request({
    url: '/mind/bear',
    method: 'put',
    data: data
  })
}

// 删除熊熊合作商管理
export function delBear(id) {
  return request({
    url: '/mind/bear/' + id,
    method: 'delete'
  })
}

//重置熊熊合作商密码
export function resetBearPwd(id) {
  return request({
    url: '/mind/bear/resetPwd/' + id,
    method: 'put'
  })
}