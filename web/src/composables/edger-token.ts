import { edger } from '@edgeros/web-sdk'

// let isTokenInit = false

const edgerToken = {
  token: '',
  srand: ''
}

export async function initEdgerToken() {
  edger.onAction('token', (data) => {
    console.log('token changed:', data)
      ; ({ token: edgerToken.token, srand: edgerToken.srand } = data)
  })
  try {
    const data = await edger.token()
      ; ({ token: edgerToken.token, srand: edgerToken.srand } = data)
    // isTokenInit = true
    // edgerToken.token = data.token ?? ''
    // edgerToken.srand = data.srand ?? ''
  }
  catch (err) {
    throw err
  }
}

export async function getEdgerToken() {
  // if (!isTokenInit) await initEdgerToken()
  return edgerToken
}

