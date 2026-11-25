import os from 'node:os'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { qrcode } from 'vite-plugin-qrcode'

/**
 * 找出手机该连的那个局域网地址。
 * 虚拟网卡（VMware / Hyper-V / Docker）也会被 Vite 当成局域网地址，
 * 但它们绑在虚拟交换机上，手机连不进去，所以要按网卡类型挑。
 * 优先 WLAN / Wi-Fi，其次以太网，最后退回第一个非回环地址。
 * 特殊情况可以用 VITE_LAN_IP=192.168.x.x 强制指定。
 */
function findLanIp(): string | null {
  const override = process.env.VITE_LAN_IP
  if (override) {
    return override
  }
  const candidates: { name: string; address: string }[] = []
  for (const [name, infos] of Object.entries(os.networkInterfaces())) {
    for (const info of infos ?? []) {
      if (info.family === 'IPv4' && !info.internal) {
        candidates.push({ name, address: info.address })
      }
    }
  }
  const pick = (re: RegExp) => candidates.find((c) => re.test(c.name))?.address ?? null
  return pick(/wlan|wi-?fi|无线/i) ?? pick(/ethernet|以太网/i) ?? candidates[0]?.address ?? null
}

const lanIp = findLanIp()

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
    // 只在网卡地址不是本机回环时才生成二维码；找不到就不过滤
    qrcode({ filter: (url) => !lanIp || url.includes(lanIp) }),
  ],
  server: { host: true },
})
