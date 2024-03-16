import { edger } from '@edgeros/web-sdk'
import { computed, ref } from 'vue'
import queryString from 'query-string'

// export async function useEdgerOsAuthToken() {
//   const edgerToken = ref({
//     token: '',
//     srand: '',
//   })
//   const { token, srand } = await edger.token()
//   edgerToken.value = { token, srand }
//   const authTokenHeader = computed(() => {
//     return {
//       'edger-token': edgerToken.value.token,
//       'edger-srand': edgerToken.value.srand,
//     }
//   })
//   const authTokenQuery = computed(() => {
//     return queryString.stringify(edgerToken.value)
//   })

//   edger.onAction('token', (data) => {
//     const { token, srand } = data
//     token.value = { token, srand }
//   })

//   return { authToken: edgerToken, authTokenHeader, authTokenQuery }
// }

export const authToken = ref({
  token: '',
  srand: '',
})

export const authTokenHeader = computed(() => {
  return {
    'edger-token': authToken.value.token,
    'edger-srand': authToken.value.srand,
  }
})

export const authTokenQuery = computed(() => {
  return queryString.stringify(authTokenHeader.value)
})

export async function initToken() {
  edger.onAction('token', (data) => {
    const { token, srand } = data
    authToken.value = { token, srand }
  })
  const { token, srand } = await edger.token()
  authToken.value = { token, srand }
}
