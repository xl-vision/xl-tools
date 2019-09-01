import os from 'os'

export default () => {
  const interfaces = os.networkInterfaces()
  for(const name in interfaces) {
    const iface = interfaces[name]
    for(const info of iface) {
      if(info.family === 'IPv4' && info.address !== '127.0.0.1' && !info.internal) {
        return info.address
      }
    }
  }
}