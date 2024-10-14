import { topicTypesEunm } from "@/configure/staticEnums"
import { getDiffArr } from "@/utils/utils"
import { WebSockets } from "@/utils/websocket"
import _ from "lodash"

type ICmd = "start" | "stop"
interface ISendData {
  cmd: ICmd
  param: string[]
}
type ICallbackParamsMap = Map<any, Map<number, string[]>>
let webSocketUser: WebSockets | null = null
let callbackParamsMap: ICallbackParamsMap = new Map()
const msgCallback = (result: any) => {
  const data = result
  const callbackList = Array.from(callbackParamsMap.keys())
  callbackList.forEach((callback) => {
    const callbackResult: any = {}
    const robotParams = callbackParamsMap.get(callback)
    if (!robotParams) return
    const robotIds = Array.from(robotParams.keys())
    robotIds.forEach((robotId) => {
      callbackResult[robotId] = {}

      const robotData = data[robotId]
      if (!robotData) return
      robotParams.get(robotId)?.forEach((param) => {
        if (robotData[param]) {
          callbackResult[robotId][param] = robotData[param]
        } else {
          callbackResult[robotId][param] = null
        }
      })
    })
    callback(callbackResult)
  })
}
// 连接时重新发送请求
const openCallback = (): void => {
  if (!localStorage.getItem("Admin-Token")) return
  const newRobotParams = getRobotParams(callbackParamsMap)
  sendRobotData("start", new Map(), newRobotParams)
}
// 增加回掉方法
const addCallbackList = (
  callback: any,
  robotIds: number[],
  params: string[]
) => {
  const robotParams: Map<number, string[]> =
    callbackParamsMap.get(callback) || new Map()
  robotIds.forEach((robotId) => {
    const oldParams = robotParams.get(robotId) || []
    const newParams = Array.from(new Set(params.concat(oldParams)))
    robotParams.set(robotId, newParams)
  })
  callbackParamsMap.set(callback, robotParams)
}
// 清理回掉方法
const removeCallbackList = (
  callback: any,
  robotIds: number[],
  params: string[]
) => {
  const robotParams = callbackParamsMap.get(callback)
  if (!robotParams) return
  robotIds.forEach((robotId) => {
    const oldParams = robotParams?.get(robotId) || []
    for (let i = oldParams.length - 1; i >= 0; i--) {
      if (params.includes(oldParams[i])) {
        oldParams.splice(i, 1)
      }
    }
    if (oldParams.length === 0) {
      robotParams?.delete(robotId)
    } else {
      robotParams?.set(robotId, oldParams)
    }
  })
  if (_.isEmpty(robotParams)) {
    callbackParamsMap.delete(callback)
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
}
const startWebsocket = () => {
  webSocketUser = new WebSockets(config)
}
const closeWebsocket = () => {
  callbackParamsMap = new Map()
  if (webSocketUser) {
    webSocketUser.closeSocket()
    webSocketUser = null
  }
}
const sendData = (data: ISendData, robotIds: number[], callback: any) => {
  const oldRobotParams = getRobotParams(_.cloneDeep(callbackParamsMap))
  if (data.cmd === "start") {
    addCallbackList(callback, robotIds, data.param)
  } else if (data.cmd === "stop") {
    removeCallbackList(callback, robotIds, data.param)
  }
  const newRobotParams = getRobotParams(callbackParamsMap)
  sendRobotData(data.cmd, oldRobotParams, newRobotParams)
}
const getRobotParams = (
  callbackParamsMap: ICallbackParamsMap
): Map<number, string[]> => {
  const globalRobotParams: Map<number, string[]> = new Map()
  const keys = Array.from(callbackParamsMap.keys())
  keys.forEach((key) => {
    const robotParams = callbackParamsMap.get(key)
    if (!robotParams) return
    const robotIds = Array.from(robotParams.keys())
    robotIds.forEach((robotId) => {
      const params = globalRobotParams.get(robotId) || []
      const thisParams = robotParams.get(robotId) || []
      const newParams = Array.from(new Set(params.concat(thisParams)))
      globalRobotParams.set(robotId, newParams)
    })
  })
  return globalRobotParams
}
const sendRobotData = (
  cmd: ICmd,
  oldRobotParams: Map<number, string[]>,
  newRobotParams: Map<number, string[]>
) => {
  if (!webSocketUser) return
  const oldRobotIds = Array.from(oldRobotParams.keys())
  const newRobotIds = Array.from(newRobotParams.keys())
  const robotIds = Array.from(new Set(oldRobotIds.concat(newRobotIds)))
  robotIds.forEach((robotId) => {
    const oldParams = oldRobotParams.get(robotId) || []
    const newParams = newRobotParams.get(robotId) || []
    const diffParams = getDiffArr(oldParams, newParams)
    webSocketUser!.sendData({
      cmd: cmd,
      param: diffParams,
      robotId,
    })
  })
}
const wsApi = {
  robotStatusStart: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "start",
      param: ["robotStatus"],
    }
    sendData(data, robotIds, callback)
  },
  robotStatusStop: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "stop",
      param: ["robotStatus"],
    }
    sendData(data, robotIds, callback)
  },
  // 机器人路径
  globalPathStart: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "start",
      param: [`path-${topicTypesEunm["路径"]}-/routing/plan`],
    }
    sendData(data, robotIds, callback)
  },
  globalPathStop: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "stop",
      param: [`path-${topicTypesEunm["路径"]}-/routing/plan`],
    }
    sendData(data, robotIds, callback)
  },
  localPathStart: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "start",
      param: [`path-${topicTypesEunm["路径"]}-/planning/plan`],
    }
    sendData(data, robotIds, callback)
  },
  localPathStop: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "stop",
      param: [`path-${topicTypesEunm["路径"]}-/planning/plan`],
    }
    sendData(data, robotIds, callback)
  },
  //获取多边形
  startVisionAera: (
    topicName: string,
    callback: any,
    robotIds: number[]
  ): void => {
    const data: ISendData = {
      cmd: "start",
      param: [`vision-${topicTypesEunm["多边形"]}-${topicName}`],
    }
    sendData(data, robotIds, callback)
  },
  stopVisionAera: (
    topicName: string,
    callback: any,
    robotIds: number[]
  ): void => {
    const data: ISendData = {
      cmd: "stop",
      param: [`vision-${topicTypesEunm["多边形"]}-${topicName}`],
    }
    sendData(data, robotIds, callback)
  },
  envelopeStart: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "start",
      param: [
        `polygon-${topicTypesEunm["多边形"]}-/routing/scheduler/spatial_envelope`,
      ],
    }
    sendData(data, robotIds, callback)
  },
  envelopeStop: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "stop",
      param: [
        `polygon-${topicTypesEunm["多边形"]}-/routing/scheduler/spatial_envelope`,
      ],
    }
    sendData(data, robotIds, callback)
  },
  modelTaskStatusStart: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "start",
      param: ["modelTaskStatus"],
    }
    sendData(data, robotIds, callback)
  },
  modelTaskStatusStop: (callback: any, robotIds: number[]): void => {
    const data: ISendData = {
      cmd: "stop",
      param: ["modelTaskStatus"],
    }
    sendData(data, robotIds, callback)
  },
}

export { wsApi, startWebsocket, closeWebsocket }
