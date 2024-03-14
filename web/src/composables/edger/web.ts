import { edger } from '@edgeros/web-sdk'
import type { EdgerEnv, EdgerOrientationValue, SafeArea } from '@edgeros/web-sdk'

export function useEdgerOsOrientation() {
  const orientation = ref<EdgerOrientationValue>()
  const handler = (data: any) => { orientation.value = data.orientation }
  edger.orientation.state().then()
  edger.onAction('orientation', handler)
  return orientation
}

export function useEdgerOsSafeArea() {
  const safeAreaInsets = ref<SafeArea>()
  const handler = (data: any) => { safeAreaInsets.value = data.safeAreaInsets }
  edger.layout.safeArea().then(handler)
  edger.onAction('orientation', handler)
  return safeAreaInsets
}

export function useEdgerOsEnv() {
  const envInfo = ref<EdgerEnv>()
  edger.env().then((data: any) => { envInfo.value = data })
  return envInfo
}

export function useEdgerOsTheme() {
  const theme = ref()
  const handler = (data: any) => { theme.value = data.theme }
  edger.theme().then(handler)
  edger.onAction('theme', handler)
  return theme
}

export const edgerOrientation = useEdgerOsOrientation()
export const edgerSafeAreaInsets = useEdgerOsSafeArea()
export const edgerEnvInfo = useEdgerOsEnv()
export const edgerTheme = useEdgerOsTheme()
