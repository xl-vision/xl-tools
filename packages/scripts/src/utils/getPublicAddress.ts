import os from 'os'

export default () => {
  const interfaces = os.networkInterfaces()
  let virtualIp = ''
  for (const name in interfaces) {
    const iface = interfaces[name]
    if (!iface) {
      continue
    }
    for (const info of iface) {
      if (
        info.family === 'IPv4' &&
        info.address !== '127.0.0.1' &&
        !info.internal
      ) {
        // 当找不到其他ip时，使用虚拟机ip
        if (name.startsWith('VMware') || name.startsWith('VirtualBox')) {
          if (!virtualIp) {
            virtualIp = info.address
          }
          continue
        }
        return info.address
      }
    }
  }
  return virtualIp
}
