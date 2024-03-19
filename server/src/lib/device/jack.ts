type JackState = 'on' | 'off' | 'sw' | 'init'
type JackStateInitial = 'on' | 'off' | 'nor'

// {
// "method": "get",
// "data" : ["state","initial"]
// }
// {
// "method": "get",
// "data": {
// "state": "on",
// "initial": "off"
// }
// }

// {
// "method": "report",
// "data": {
// "state": "on",
// "initial": "off",
// }
// }

// {
// "method": "set",
// "data": {
// "state": "on", //设备控制：off 关闭,on 打开,sw 开/关,init 恢复出厂设置
// "initial": "off" //上电状态：off 关闭,on 打开,nor 记忆
// }
// }

// {
// "method": "report",
// "data": {
// "power": 100.00,
// "energy": 15.30
// }
// }
