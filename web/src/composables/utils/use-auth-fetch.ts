import { createFetch } from '@vueuse/core'
import { authTokenHeader } from './edger-auth-token'

export const useAuthFetch = createFetch({
  // baseUrl: '/',
  combination: 'overwrite',
  options: {
    async beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
        ...authTokenHeader.value,
      }
      return { options }
    },
  },
})
