<script lang="ts" setup>
const { isFetching, data, error, execute } = useAuthFetch('/api/camera/list').json()

const showBottom = ref(false)

const username = ref('admin')
const password = ref('123456')
const urnId = ref('')

function showPopup(urn) {
  showBottom.value = true
  urnId.value = urn
}

async function loginCamera() {
  const data = {
    username: username.value,
    password: password.value,
    urn: urnId.value,
  }
  const res = await useAuthFetch('/api/camera/login').post(data).json()
  showBottom.value = false
  login.value = true
}

// const data = reactive({ list: [{ hostname: '192.168.128.102', port: 2020, path: '/onvif/device_service', urn: 'uuid:3fa1fe68-b915-4053-a3e1-f46d2fb9ca76' }] })
// try {
//   const dataSocketUrl = `wss://${document.domain}:${window.location.port}/data?${authTokenQuery.value}`
//   const ws = new WebSocket(dataSocketUrl)
//   console.log(ws)
//   // Connection opened
//   ws.addEventListener('open', (event) => {
//     // ws.send('Hello Server!')
//     console.log('open')
//   })

//   // Listen for messages
//   ws.addEventListener('message', (event) => {
//     console.log('Message from server ', event.data)
//   })
// }
// catch (err) {
//   console.log(err)
// }

// const state = reactive({
//   choosed: ''
// })

const login = ref(false)

function onRefresh() { execute() }
</script>

<template>
  <van-pull-refresh v-model="isFetching" @refresh="onRefresh">
    <div w-100vw>
      <van-cell-group inset title="网络摄像头">
        <van-cell-group v-for="(info, idx) in data?.list ?? []" :key="idx">
          <van-cell is-link @click="showPopup(info.urn)">
            <template #icon>
              <span i-fluent:camera-dome-24-filled m-auto mr-0.5em text-lg />
            </template>
            <template #title>
              <span class="custom-title">{{ info.hostname }}</span>
              <van-tag type="primary" plain>
                标签
              </van-tag>
            </template>
          </van-cell>
          <van-cell v-if="login">
            <CameraMonitor />
          </van-cell>
        </van-cell-group>

        <van-cell v-if="data === null || data.list.length === 0" title="还未查找到摄像头，下拉刷新" />
      </van-cell-group>
      {{ width }} {{ height }}
      <van-popup v-model:show="showBottom" round p-1em>
        <van-cell-group inset>
          <van-field
            v-model="username"
            name="用户名"
            label="用户名"
            placeholder="用户名"
          />
          <van-field
            v-model="password"
            type="password"
            name="密码"
            label="密码"
            placeholder="密码"
          />
        </van-cell-group>

        <div style="margin: 16px;">
          <van-button round block type="primary" @click="loginCamera()">
            提交
          </van-button>
        </div>
      </van-popup>
    </div>
  </van-pull-refresh>
</template>

<style scope></style>
