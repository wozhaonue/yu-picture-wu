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
  const hexText = parseInt(beforeHexText, 16).toString().padStart(6, '0')
  return `#${hexText}`
}
