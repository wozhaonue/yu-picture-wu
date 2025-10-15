import { saveAs } from 'file-saver'

/**
 * 格式化文件大小
 * @param size
 */
export const formatSize = (size?: number) => {
  if (!size) return '未知'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}
// 设置文件大小单位的枚举数组
const FILE_SIZE_ENUM = {
  B: 1,
  KB: 2,
  MB: 3,
}
const FILE_SIZE_MAP: Record<string, string> = {
  1: 'B',
  2: 'KB',
  3: 'MB',
}
/**
 * 判断文件大小数组中最大的占用内存的单位
 * @param sizeList
 * @returns
 */
export const MaxSize = (sizeList?: number[]) => {
  let size = FILE_SIZE_ENUM.KB
  sizeList?.map((item) => {
    if (item < 1024) {
      size = size <= FILE_SIZE_ENUM.B ? FILE_SIZE_ENUM.B : size
      return
    }
    if (item < 1024 * 1024) {
      size = size !== FILE_SIZE_ENUM.KB ? FILE_SIZE_ENUM.KB : size
      return
    }
    size = FILE_SIZE_ENUM.MB
  })
  return FILE_SIZE_MAP[size]
}
/**
 * 返回最大的占用内存的单位下的size
 * @param sizeName
 * @returns
 */
export const whatSize = (size:number, sizeName: string) => {
  if (sizeName === FILE_SIZE_MAP[1]) {
    return size
  } else if (sizeName === FILE_SIZE_MAP[2]) {
    return (size / 1024).toFixed(2)
  }
  return (size / (1024 * 1024)).toFixed(2)
}

/**
 * 下载图片文件
 * @param url 图片URL
 * @param name 文件名（可选）
 * @returns Promise<boolean> 返回下载是否成功启动
 */
export const downloadFile = async (url?: string, name?: string): Promise<boolean> => {
  if (!url) {
    console.error('下载失败：图片URL为空')
    return false
  }

  try {
    // 首先检查图片是否可访问
    const response = await fetch(url, { method: 'HEAD' })

    if (!response.ok) {
      console.error('下载失败：图片资源不可访问', response.status)
      return false
    }

    // 如果图片可访问，则开始下载
    saveAs(url, name)

    // 由于saveAs是同步的，我们假设下载已经开始
    console.log('下载已开始：', url)
    return true
  } catch (error) {
    console.error('下载失败：', error)
    return false
  }
}

/**
 * 返回标准十六进制颜色hex
 */
export const toTextColor = (color: string) => {
  const beforeHexText = color.startsWith('0x') ? color.slice(2) : color
  const hexText = beforeHexText.toString().padStart(6, '0')
  return `#${hexText}`
}

/**
 * 图片编辑连接WebSocket的工具类
 */
export default class PictureEditWebSocket {
  private pictureId: number
  private socket: WebSocket | null
  private eventHandlers: any
  // 自动重连相关状态
  private reconnectAttempts: number
  private maxReconnectAttempts: number
  private baseReconnectDelay: number
  private maxReconnectDelay: number
  private reconnectTimer: any
  private manuallyClosed: boolean
  private connecting: boolean

  constructor(pictureId: number) {
    this.pictureId = pictureId // 当前编辑的图片 ID
    this.socket = null // WebSocket 实例
    this.eventHandlers = {} // 自定义事件处理器
    // 初始化自动重连参数
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = Infinity // 如需限制最大重连次数，可改为具体数值
    this.baseReconnectDelay = 1000 // 初始重连延迟 1s
    this.maxReconnectDelay = 10000 // 最大重连延迟 10s
    this.reconnectTimer = null
    this.manuallyClosed = false
    this.connecting = false
  }

  /**
   * 初始化 WebSocket 连接
   */
  connect() {
    // 避免重复连接
    if (this.connecting) {
      return
    }
    this.connecting = true
    this.manuallyClosed = false
    // 若存在已安排的重连定时器，清除之
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    const DEV_BASE_URL=  'ws://localhost:8123'
    const PROD_BASE_URL = 'ws://106.53.8.134'
    const url = DEV_BASE_URL + `/api/ws/picture/edit?pictureId=${this.pictureId}`
    this.socket = new WebSocket(url)

    // 设置携带 cookie
    this.socket.binaryType = 'blob'

    // 监听连接成功事件
    this.socket.onopen = () => {
      console.log('WebSocket 连接已建立')
      // 重置重连状态
      this.connecting = false
      this.reconnectAttempts = 0
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
      this.triggerEvent('open')
    }

    // 监听消息事件
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('收到消息:', message)

      // 根据消息类型触发对应事件
      const type = message.type
      this.triggerEvent(type, message)
    }

    // 监听连接关闭事件
    this.socket.onclose = (event) => {
      console.log('WebSocket 连接已关闭:', event)
      this.connecting = false
      this.triggerEvent('close', event)
      // 非手动关闭则触发自动重连
      if (!this.manuallyClosed) {
        this.scheduleReconnect()
      }
    }

    // 监听错误事件
    this.socket.onerror = (error) => {
      console.error('WebSocket 发生错误:', error)
      this.triggerEvent('error', error)
      // 发生错误时也尝试重连（避免某些环境下不触发 close）
      if (!this.manuallyClosed) {
        this.scheduleReconnect()
      }
    }
  }

  /**
   * 关闭 WebSocket 连接
   */
  disconnect() {
    if (this.socket) {
      // 标记为手动关闭，避免自动重连
      this.manuallyClosed = true
      // 取消已有的重连计划
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
      try {
        this.socket.close()
      } catch (e) {
        // ignore
      }
      this.socket = null
      console.log('WebSocket 连接已手动关闭')
    }
  }

  /**
   * 发送消息到后端
   * @param {Object} message 消息对象
   */
  sendMessage(message: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
      console.log('消息已发送:', message)
    } else {
      console.error('WebSocket 未连接，无法发送消息:', message)
    }
  }

  /**
   * 添加自定义事件监听
   * @param {string} type 消息类型
   * @param {Function} handler 消息处理函数
   */
  on(type: string, handler: (data?: any) => void) {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = []
    }
    this.eventHandlers[type].push(handler)
  }

  /**
   * 触发事件
   * @param {string} type 消息类型
   * @param {Object} data 消息数据
   */
  triggerEvent(type: string, data?: any) {
    const handlers = this.eventHandlers[type]
    if (handlers) {
      handlers.forEach((handler: any) => handler(data))
    }
  }

  /**
   * 计算当前重连延迟（指数退避 + 随机抖动）
   */
  private getReconnectDelay(): number {
    const exp = Math.min(this.reconnectAttempts, 6)
    const base = this.baseReconnectDelay * Math.pow(2, exp)
    const delay = Math.min(base, this.maxReconnectDelay)
    const jitter = Math.random() * 0.3 * delay // 30% 抖动
    return delay + jitter
  }

  /**
   * 安排一次自动重连
   */
  private scheduleReconnect() {
    // 已安排重连，或超过最大次数，则跳过
    if (this.reconnectTimer) {
      return
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.triggerEvent('reconnect_failed', { attempts: this.reconnectAttempts })
      return
    }
    const delay = this.getReconnectDelay()
    this.reconnectAttempts += 1
    this.triggerEvent('reconnecting', { attempt: this.reconnectAttempts, delay })
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      console.log(`尝试第 ${this.reconnectAttempts} 次重连...`)
      this.connect()
    }, delay)
  }
}

