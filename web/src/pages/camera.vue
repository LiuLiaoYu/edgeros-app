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

function loginCamera() {
  const data = {
    username: username.value,
    password: password.value,
    urn: urnId.value,
  }

  const login = useAuthFetch('/api/camera/login').post(data).json()
}

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
</script>

<template>
  <div mt-2em w-100vw>
    <van-cell-group inset>
      <van-cell title="192.168.128.34" />
      <van-cell>
        <CameraMonitor />
      </van-cell>
    </van-cell-group>
    <van-divider />

    <van-cell-group inset>
      <template v-for="(info, idx) in data?.list ?? []" :key="idx">
        <!-- <van-cell title="添加视频流" is-link arrow-direction="up" @click="showPopup" /> -->
        <van-cell is-link arrow-direction="up" @click="showPopup(info.urn)">
          <template #title>
            <span i-fluent:camera-dome-24-filled text-lg />
            <span class="custom-title">{{ info.hostname }}</span>
            <van-tag type="primary">
              标签
            </van-tag>
          </template>
        </van-cell>
      </template>
    </van-cell-group>

    <van-button @click="() => { execute() }">
      refresh
    </van-button>

    <van-popup v-model:show="showBottom" round :style="{ padding: '1em' }">
      <van-form @submit="loginCamera()">
        <van-cell-group inset>
          <van-field
            v-model="username"
            name="用户名"
            label="用户名"
            placeholder="用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="密码"
            label="密码"
            placeholder="密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            提交
          </van-button>
        </div>
      </van-form>
    </van-popup>
    <!-- <van-popup
      v-model:show="showBottom"
      position="bottom"
      round
      :style="{ 'height': '50%', 'padding-top': '3em' }"
    >
      <Suspense>
        <CameraLi />
        <template #fallback>
          <van-loading size="24px" vertical>
            加载中...
          </van-loading>
        </template>
      </Suspense>
    </van-popup> -->
  </div>
</template>

<style scope></style>
