import advnwc from 'async/advnwc'
import permission from 'async/permission'
import type { PermissionsItems } from 'permission'

function flatList2Object(list: string[]) {
  const res = {}
  for (const s of list) {
    if (!s.includes('.')) { res[s] = true }
    else {
      const [k, v] = s.split('.')
      if (res[k] === undefined)
        res[k] = {}
      res[k][v] = true
    }
  }
  return res
}

// 检查权限
export async function checkPermission(permsList: string[]) {
  const perms = flatList2Object(permsList)
  return await permission.check(perms)
}

// 网络接口名称
export async function getIfnames() {
  return {
    lan: (await advnwc.netifs(true))[0],
    wan: (await advnwc.netifs(false))[0],
  }
}
