
import request from '@/utils/request'

// AI 对话接口
export function chat(data) {
    return request({
        url: '/mind/ai/chat',
        method: 'post',
        params: data
    })
}

// AI 导航接口
export function navigate(data) {
    return request({
        url: '/mind/ai/navigate',
        method: 'post',
        params: data
    })
}
