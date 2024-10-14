import store from "./../pinia/index"


export class WebSockets {
  ws = null
  config = {
    url: "",
    sendBeatInterval: 3 * 1000, // 发送心跳间隔
    getBeatInterval: 2 * 1000, // 判断心跳间隔
    timeout: 3 * 1000, // 连接超时时间
    reconnectionInterval: 4 * 1000, // 断开后重新连接的间隔
    reconnectionCount: 10, // 断开后重新连接的次数
    msgCallback: (data) => {
      console.log("msgCallback")
    },
    closeCallback: (data) => {
      console.log("closeCallback")
    },
    openCallback: (data) => {
      console.log("openCallback")
    },
    errorCallback: (data) => {
      console.log("openCallback")
    },
    delayCallback: (data) => {
      console.log("openCallback")
    },
  }
  isHandleClose = false // 是否手动关闭，手动关闭不会进行重连
  reconnectionCount = 0 // 已重试次数
  connection = false // 当前连接状态
  heartbeat! // 心跳的setTimeout

  waitSendData = [] // 待消费的请求，在建立连接后消费并清空，关闭连接后会直接清空
  constructor(config) {
    Object.assign(this.config, config)
    this.reconnectionCount = this.config.reconnectionCount
    this.connect()
    window.onbeforeunload = () => {
      this.ws?.close()
    }
  }
  // 建立连接，监听连接成功事件和关闭连接事件
  connect() {
    if (!localStorage.getItem("Admin-Token")) return
    if (this.connection) return
    try {
      this.ws = new WebSocket(this.config.url)
      this.ws.binaryType = "arraybuffer"
      this.ws.onopen = () => {
        // this.getHeartbeat()
        this.connection = true
        this.reconnectionCount = this.config.reconnectionCount
        this.config.openCallback()
        this.waitSendData.forEach((item) => {
          this.ws?.send(JSON.stringify(item))
        })
        this.waitSendData = []
        this.sendHeartbeat()
      }
      this.ws.onclose = () => {
        // console.log(`websocket 断开:${e.code} ${e.reason} ${e.wasClean}`, e)
        this.waitSendData = []
        this.connection = false
        this.ws = null
        if (this.isHandleClose) return
        --this.reconnectionCount
        if (this.reconnectionCount > 0) {
          setTimeout(() => {
            this.connect()
          }, this.config.reconnectionInterval)
        } else {
          this.config.errorCallback()
        }
        setTimeout(() => {
          if (!this.connection) {
            this.config.closeCallback()
          }
        }, this.config.reconnectionInterval + 4 * 1000)
      }
      this.ws.onmessage = (e) => {
        this.getHeartbeat()
        this.config.msgCallback(JSON.parse(e.data))
      }
      setTimeout(() => {
        if (this.connection) return
        this.ws?.close()
      }, this.config.timeout)
    } catch (error) {
      console.log(error)
    }
  }
  // 发送心跳
  sendHeartbeat() {
    if (!this.connection) return
    this.ws?.send(
      JSON.stringify({
        robotId: store?.robotDataStore?.state?.robotId,
      })
    )
    setTimeout(() => {
      this.sendHeartbeat()
    }, this.config.sendBeatInterval)
  }
  // 接收心跳
  getHeartbeat() {
    this.connection = true
    if (this.heartbeat) {
      this.config.delayCallback(false)
      clearTimeout(this.heartbeat)
    }
    this.heartbeat = setTimeout(() => {
      this.ws?.close()
      this.config.delayCallback(true)
    }, this.config.getBeatInterval)
  }
  // 关闭连接
  closeSocket() {
    this.isHandleClose = true
    this.ws?.close()
  }
  // 发送请求,当连接未建立时保存请求，当连接建立后消费所有请求
  sendData(data) {
    if (!this.connection) {
      this.waitSendData.push(data)
    } else {
      this.ws?.send(JSON.stringify(data))
    }
  }
}
