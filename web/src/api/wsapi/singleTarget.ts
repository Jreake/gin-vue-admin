import { topicTypesEunm } from "@/configure/staticEnums"
import { i18n } from "@/lang/index"
import store from "@/store/index"
import { IBaseObj } from "@/types"
import { getDiffArr } from "@/utils/utils"
import { WebSockets } from "@/utils/websocket"
import { ElMessageBox } from "element-plus"
const { t }: any = i18n.global

interface ISendData {
  cmd: string
  param: string[]
}

// let delayMsg: any = null
// 回调函数与其params的映射，用来储存订阅事件
const callbackParamsMap: Map<any, Set<string>> = new Map()
// 获取响应信息
const msgCallback = (result: any) => {
  const data: IBaseObj = result[store.robotDataStore.state.robotId]
  if (!data) return
  const callbackList = Array.from(callbackParamsMap.keys())
  store.robotDataStore.setRobotTime(data?.robotStatus?.robotTime || 0)
  callbackList.forEach((callback) => {
    try {
      const params = Array.from(callbackParamsMap.get(callback) || [])
      const resList: any = {}
      params.forEach((paramItem) => {
        resList[paramItem] = data[paramItem]
      })
      if (
        Object.values(resList).every((item) => {
          return item === undefined
        })
      ) {
        return
      }
      if (Object.keys(resList).length === 1) {
        callback(Promise.resolve(Object.values(resList)[0]))
      } else {
        callback(Promise.resolve(resList))
      }
    } catch (error) {
      callback(Promise.reject(error))
    }
  })
}
// 清空所有的websocket响应项目
const clearSocket = (robotId?: number): void => {
  if (!webSocketUser) return
  callbackParamsMap.clear()
  webSocketUser.sendData({
    cmd: "stopAll",
    robotId: robotId,
  })
}
// 连接时重新发送请求
const openCallback = (): void => {
  if (!localStorage.getItem("Admin-Token")) return
  store.robotDataStore.setSystemConnection(true)
  const params = getListeningParams()
  webSocketUser.sendData({
    cmd: "start",
    param: params,
    robotId: store.robotDataStore.state.robotId,
  })
}
// 连接断开时回调
const closeCallback = () => {
  store.robotDataStore.setSystemConnection(false)
}
// 连接异常回调
const errorCallback = () => {
  ElMessageBox.alert(
    `${t("重新连接机器人失败，请确认机器人状态后点击刷新按钮")}`,
    `${t("提示")}`,
    {
      confirmButtonText: `${t("刷新")}`,
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      closeOnHashChange: false,
      callback: () => {
        window.location.reload()
      },
    }
  )
}
// 增加回掉方法
const addCallbackList = (callback: any, params: string[]) => {
  const callbackParams = callbackParamsMap.get(callback) || new Set()
  params.forEach((param: string) => {
    callbackParams.add(param)
  })
  callbackParamsMap.set(callback, callbackParams)
}
// 清除回掉方法
const removeCallbackList = (callback: any, params: string[]) => {
  const callbackParams = callbackParamsMap.get(callback)
  if (!callbackParams) return
  params.forEach((param: string) => {
    callbackParams?.delete(param)
  })
  if (callbackParams.size === 0) {
    callbackParamsMap.delete(callback)
  } else {
    callbackParamsMap.set(callback, callbackParams)
  }
}
// 响应延迟回调
const delayCallback = (isDelay: boolean) => {
  // if (isDelay) {
  //   if (!delayMsg) {
  //     delayMsg = ElMessage({
  //       showClose: true,
  //       message: "检测到当前网络延迟高，请谨慎操作",
  //       type: "warning",
  //       duration: 0,
  //       onClose: () => {
  //         setTimeout(() => {
  //           delayMsg = null
  //         }, 1000 * 60 * 5)
  //       },
  //     })
  //   }
  // } else {
  //   delayMsg?.close()
  //   delayMsg = null
  // }
}

// 获取正在监听的params
const getListeningParams = (): string[] => {
  let params: string[] = []
  const callbackParams = Array.from(callbackParamsMap.values())
  callbackParams.forEach((callbackParam) => {
    params = params.concat([...callbackParam])
  })
  return Array.from(new Set(params))
}
// 发送请求
const sendData = (data: ISendData, callback: any) => {
  if (!store.robotDataStore.state.robotId) return
  if (!localStorage.getItem("Admin-Token")) return

  if (data.cmd === "start") {
    addCallbackList(callback, data.param)
    data.param = Array.from(callbackParamsMap.get(callback) || [])
    webSocketUser.sendData({
      ...data,
      robotId: store.robotDataStore.state.robotId,
    })
  } else if (data.cmd === "stop") {
    if (callbackParamsMap.has(callback)) {
      const oldCallbackParams = getListeningParams()
      removeCallbackList(callback, data.param)
      const newCallbackParams = getListeningParams()
      const diffArr = getDiffArr(oldCallbackParams, newCallbackParams)
      webSocketUser.sendData({
        cmd: "stop",
        param: diffArr,
        robotId: store.robotDataStore.state.robotId,
      })
    }
  } else {
    return
  }
}

const config = {
  url: `${
    process.env.NODE_ENV === "production"
      ? "ws://" + window.location.hostname + ":5000/"
      : `${process.env.VUE_APP_BASE_WS_V1}`
  }websocket`,
  msgCallback,
  openCallback,
  closeCallback,
  errorCallback,
  delayCallback,
}

let webSocketUser: WebSockets
// 打开websocket
const startWebsocket = () => {
  if (localStorage.getItem("Admin-Token")) {
    webSocketUser = new WebSockets(config)
  }
}
// 关闭websocket
const closeWebsocket = (robotId?: number) => {
  if (webSocketUser) {
    clearSocket(robotId)
    webSocketUser.closeSocket()
  }
}
const singleWsApi = {
  /** 通用--
   * @param callback
   * @param params 必须是 string[] 类型，必传
   * @param 需要保证启动的socket都能够stop掉
   */
  startWebSocketTopic: (callback: any, params: string[]): void => {
    const data = {
      cmd: "start",
      param: [...params],
    }
    sendData(data, callback)
  },
  stopWebSocketTopic: (callback: any, params: string[]): void => {
    const data = {
      cmd: "stop",
      param: [...params],
    }
    sendData(data, callback)
  },
  // 获取机器人基本信息相关
  robotStatusStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["robotStatus"],
    }
    sendData(data, callback)
  },
  robotStatusStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: ["robotStatus"],
    }
    sendData(data, callback)
  },
  // 获取激光点相关
  lidarStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: [
        `vision-${topicTypesEunm["激光"]}-/perception/lidar/filtered_front`,
      ],
    }
    sendData(data, callback)
  },
  lidarStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: [
        `vision-${topicTypesEunm["激光"]}-/perception/lidar/filtered_front`,
      ],
    }
    sendData(data, callback)
  },
  // 获取相机点云相关
  getCameraDataStart: (cameraName: string, callback: any): void => {
    const name = `vision-${topicTypesEunm["点云"]}-${cameraName}`
    const data = {
      cmd: "start",
      param: [name],
    }
    sendData(data, callback)
  },
  getCameraDataStop: (cameraName: string, callback: any): void => {
    const name = `vision-${topicTypesEunm["点云"]}-${cameraName}`
    const data = {
      cmd: "stop",
      param: [name],
    }
    sendData(data, callback)
  },
  // 机器人全局路径相关
  globalPathStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: [`vision-${topicTypesEunm["路径"]}-/routing/plan`],
    }
    sendData(data, callback)
  },
  globalPathStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: [`vision-${topicTypesEunm["路径"]}-/routing/plan`],
    }
    sendData(data, callback)
  },
  // 机器人局部路径相关
  localPathStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: [`vision-${topicTypesEunm["路径"]}-/planning/plan`],
    }
    sendData(data, callback)
  },
  localPathStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: [`vision-${topicTypesEunm["路径"]}-/planning/plan`],
    }
    sendData(data, callback)
  },
  // 机器人路径包络相关
  envelopeStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: [
        `vision-${topicTypesEunm["多边形"]}-/routing/scheduler/spatial_envelope`,
      ],
    }
    sendData(data, callback)
  },
  envelopeStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: [
        `vision-${topicTypesEunm["多边形"]}-/routing/scheduler/spatial_envelope`,
      ],
    }
    sendData(data, callback)
  },
  // 机器人Marker相关
  getMarkerDataStart: (topiicName: string, callback: any): void => {
    const name = `vision-${topicTypesEunm["marker"]}-${topiicName}`
    const data = {
      cmd: "start",
      param: [name],
    }
    sendData(data, callback)
  },
  getMarkerDataStop: (topiicName: string, callback: any): void => {
    const name = `vision-${topicTypesEunm["marker"]}-${topiicName}`
    const data = {
      cmd: "stop",
      param: [name],
    }
    sendData(data, callback)
  },
  //获取多边形
  startVisionAera: (topicName: string, callback: any): void => {
    const data = {
      cmd: "start",
      param: [`vision-${topicTypesEunm["多边形"]}-${topicName}`],
    }
    sendData(data, callback)
  },
  stopVisionAera: (topicName: string, callback: any): void => {
    const data = {
      cmd: "stop",
      param: [`vision-${topicTypesEunm["多边形"]}-${topicName}`],
    }
    sendData(data, callback)
  },
  modelTaskStatusStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["modelTaskStatus"],
    }
    sendData(data, callback)
  },
  modelTaskStatusStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: ["modelTaskStatus"],
    }
    sendData(data, callback)
  },
  monitorDataStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["monitorData"],
    }
    sendData(data, callback)
  },
  monitorDataStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: ["monitorData"],
    }
    sendData(data, callback)
  },
  monitorFoldDataStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["monitorFoldData"],
    }
    sendData(data, callback)
  },
  //系统监控实时数据
  monitorFoldDataStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: ["monitorFoldData"],
    }
    sendData(data, callback)
  },
  forkliftMonitorStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["forkliftMonitor"],
    }
    sendData(data, callback)
  },
  forkliftMonitorStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: ["forkliftMonitor"],
    }
    sendData(data, callback)
  },
  //获取相机图片
  getVslamCameraDataStart: (cameraName: string, callback: any): void => {
    const data = {
      cmd: "start",
      param: [`vision-${cameraName}`],
    }
    sendData(data, callback)
  },
  getVslamCameraDataStop: (cameraName: string, callback: any): void => {
    const data = {
      cmd: "stop",
      param: [`vision-${cameraName}`],
    }
    sendData(data, callback)
  },
  robotsErrorMSG: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["robotStatus", "healthyKeepMsg"],
    }
    sendData(data, callback)
  },
  //  获取rms任务
  startGetRmsTaskList: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["robotTaskList"],
    }
    sendData(data, callback)
  },
  stopGetRmsTaskList: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: ["robotTaskList"],
    }
    sendData(data, callback)
  },
  activeMapStart: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["activeMap"],
    }
    sendData(data, callback)
  },
  activeMapStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: ["activeMap"],
    }
    sendData(data, callback)
  },
  // 废弃
  robotsAllInfo: (callback: any): void => {
    const data = {
      cmd: "start",
      param: ["hardware"],
    }
    sendData(data, callback)
  },
  robotsAllInfoStop: (callback: any): void => {
    const data = {
      cmd: "stop",
      param: ["hardware"],
    }
    sendData(data, callback)
  },
}

export {
  clearSocket,
  openCallback,
  startWebsocket,
  closeWebsocket,
  singleWsApi,
}
