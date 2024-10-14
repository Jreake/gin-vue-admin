import { WebSockets } from "@/utils/websocket";
import { ElMessageBox } from "element-plus";
import { robotDataStore } from "@/pinia/modules/robotData";

// let delayMsg = null
// 回调函数与其params的映射，用来储存订阅事件
const callbackParamsMap = new Map();
// 获取响应信息
const msgCallback = (result) => {
  const data = result.data[robotDataStore.state.robotId];
  if (!data) return;
  const callbackList = Array.from(callbackParamsMap.keys());
  robotDataStore.setRobotTime(data?.robotStatus?.time || 0);
  callbackList.forEach((callback) => {
    try {
      const params = Array.from(callbackParamsMap.get(callback) || []);
      const resList = {};
      params.forEach((paramItem) => {
        resList[paramItem] = data[paramItem];
      });
      if (
        Object.values(resList).every((item) => {
          return item === undefined;
        })
      ) {
        return;
      }
      if (Object.keys(resList).length === 1) {
        callback(Promise.resolve(Object.values(resList)[0]));
      } else {
        callback(Promise.resolve(resList));
      }
    } catch (error) {
      callback(Promise.reject(error));
    }
  });
};
// 清空所有的websocket响应项目
const clearSocket = (robotId) => {
  if (!webSocketUser) return;
  webSocketUser.sendData({
    cmd: "stopAll",
    robotId: robotId,
  });
};
// 连接时重新发送请求
const openCallback = () => {
  if (!localStorage.getItem("Admin-Token")) return;
  robotDataStore.setSystemConnection(true);
  const params = getListeningParams();
  webSocketUser.sendData({
    cmd: "start",
    param: params,
    robotId: robotDataStore.state.robotId,
  });
};
// 连接断开时回调
const closeCallback = () => {
  robotDataStore.setSystemConnection(false);
};
// 连接异常回调
const errorCallback = () => {
  ElMessageBox.alert(
    `${"重新连接机器人失败，请确认机器人状态后点击刷新按钮"}`,
    `${"提示"}`,
    {
      confirmButtonText: `${"刷新"}`,
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      closeOnHashChange: false,
      callback: () => {
        window.location.reload();
      },
    }
  );
};
// 增加回掉方法
const addCallbackList = (callback, params) => {
  const callbackParams = callbackParamsMap.get(callback) || new Set();
  params.forEach((param) => {
    callbackParams.add(param);
  });
  callbackParamsMap.set(callback, callbackParams);
};
// 清除回掉方法
const removeCallbackList = (callback, params) => {
  const callbackParams = callbackParamsMap.get(callback);
  if (!callbackParams) return;
  params.forEach((param) => {
    callbackParams?.delete(param);
  });
  if (callbackParams.size === 0) {
    callbackParamsMap.delete(callback);
  } else {
    callbackParamsMap.set(callback, callbackParams);
  }
};
// 响应延迟回调
const delayCallback = (isDelay) => {
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
};

// 获取正在监听的params
const getListeningParams = () => {
  let params = [];
  const callbackParams = Array.from(callbackParamsMap.values());
  callbackParams.forEach((callbackParam) => {
    params = params.concat([...callbackParam]);
  });
  return Array.from(new Set(params));
};
// 发送请求
const sendData = (data, callback) => {
  if (!robotDataStore.state.robotId) return;
  if (!localStorage.getItem("Admin-Token")) return;

  if (data.cmd === "start") {
    addCallbackList(callback, data.param);
    data.param = Array.from(callbackParamsMap.get(callback) || []);
    webSocketUser.sendData({
      ...data,
      robotId: robotDataStore.state.robotId,
    });
  } else if (data.cmd === "stop") {
    if (callbackParamsMap.has(callback)) {
      const oldCallbackParams = getListeningParams();
      removeCallbackList(callback, data.param);
      const newCallbackParams = getListeningParams();
      const diffArr = getDiffArr(oldCallbackParams, newCallbackParams);
      webSocketUser.sendData({
        cmd: "stop",
        param: diffArr,
        robotId: robotDataStore.state.robotId,
      });
    }
  } else {
    return;
  }
};

const config = {
  url: `${
    process.env.NODE_ENV === "production"
      ? "ws://" + window.location.hostname + ":5001/"
      : process.env.VUE_APP_BASE_WS
  }websocket`,
  msgCallback,
  openCallback,
  // closeCallback,
  // errorCallback,
  // delayCallback,
};

let webSocketUser = {};

const startWebsocket = () => {
  if (localStorage.getItem("Admin-Token")) {
    webSocketUser = new WebSockets(config);
  } else {
    webSocketUser = null;
  }
};

// startWebsocket()

const wsApi = {
  /** 通用--
   * @param callback
   * @param params 必须是 string[] 类型，必传
   * @param 需要保证启动的socket都能够stop掉
   */
  startWebSocketTopic: (callback, params) => {
    const data = {
      cmd: "start",
      param: [...params],
    };
    sendData(data, callback);
  },
  stopWebSocketTopic: (callback, params) => {
    const data = {
      cmd: "stop",
      param: [...params],
    };
    sendData(data, callback);
  },

  robotStatusStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["robotStatus"],
    };
    sendData(data, callback);
  },
  robotStatusStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["robotStatus"],
    };
    sendData(data, callback);
  },
  activeMapStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["activeMap"],
    };
    sendData(data, callback);
  },
  activeMapStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["activeMap"],
    };
    sendData(data, callback);
  },
  missionStatusStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["missionStatus"],
    };
    sendData(data, callback);
  },
  missionStatusStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["missionStatus"],
    };
    sendData(data, callback);
  },
  robotsAllInfo: (callback) => {
    const data = {
      cmd: "start",
      param: ["hardware"],
    };
    sendData(data, callback);
  },
  robotsAllInfoStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["hardware"],
    };
    sendData(data, callback);
  },
  lidarStart: (callback) => {
    const data = {
      cmd: "start",
      param: [`visionPointCloud-${["激光"]}-/perception/lidar/filtered_front`],
    };
    sendData(data, callback);
  },
  lidarStop: (callback) => {
    const data = {
      cmd: "stop",
      param: [`visionPointCloud-${["激光"]}-/perception/lidar/filtered_front`],
    };
    sendData(data, callback);
  },
  // 机器人路径
  globalPathStart: (callback) => {
    const data = {
      cmd: "start",
      param: [`path-${["路径"]}-/routing/plan`],
    };
    sendData(data, callback);
  },
  globalPathStop: (callback) => {
    const data = {
      cmd: "stop",
      param: [`path-${["路径"]}-/routing/plan`],
    };
    sendData(data, callback);
  },
  localPathStart: (callback) => {
    const data = {
      cmd: "start",
      param: [`path-${["路径"]}-/planning/plan`],
    };
    sendData(data, callback);
  },
  localPathStop: (callback) => {
    const data = {
      cmd: "stop",
      param: [`path-${["路径"]}-/planning/plan`],
    };
    sendData(data, callback);
  },
  envelopeStart: (callback) => {
    const data = {
      cmd: "start",
      param: [`polygon-${["多边形"]}-/routing/scheduler/spatial_envelope`],
    };
    sendData(data, callback);
  },
  envelopeStop: (callback) => {
    const data = {
      cmd: "stop",
      param: [`polygon-${["多边形"]}-/routing/scheduler/spatial_envelope`],
    };
    sendData(data, callback);
  },
  robotsErrorMSG: (callback) => {
    const data = {
      cmd: "start",
      param: ["alarm", "systemInfoAlarm", "healthyKeepMsg"],
    };
    sendData(data, callback);
  },
  upBarcStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["upBarc"],
    };
    sendData(data, callback);
  },
  upBarcStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["upBarc"],
    };
    sendData(data, callback);
  },
  // 获取标定相机图像
  getGoodsDetectionCameraImgStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["goodsDetectionCamera"],
    };
    sendData(data, callback);
  },
  getGoodsDetectionCameraImgStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["goodsDetectionCamera"],
    };
    sendData(data, callback);
  },
  // 获取标定相机图像
  getGoodsObstacleCameraImgStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["goodsObstacleCamera"],
    };
    sendData(data, callback);
  },
  getGoodsObstacleCameraImgStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["goodsObstacleCamera"],
    };
    sendData(data, callback);
  },
  // 获取标定相机图像
  getDepthCameraImgStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["depthCamera"],
    };
    sendData(data, callback);
  },
  getDepthCameraImgStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["depthCamera"],
    };
    sendData(data, callback);
  },
  // 获取相机标定状态
  getCarameraStatusStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["forkLiftStatus"],
    };
    sendData(data, callback);
  },
  getCarameraStatusStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["forkLiftStatus"],
    };
    sendData(data, callback);
  },
  forkliftMonitorDataStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["forkliftMonitor"],
    };
    sendData(data, callback);
  },
  forkliftMonitorDataStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["forkliftMonitor"],
    };
    sendData(data, callback);
  },
  modelTaskStatusStart: (callback) => {
    const data = {
      cmd: "start",
      param: ["modelTaskStatus"],
    };
    sendData(data, callback);
  },
  modelTaskStatusStop: (callback) => {
    const data = {
      cmd: "stop",
      param: ["modelTaskStatus"],
    };
    sendData(data, callback);
  },
  //vslam
  getVslamTable: (callback) => {
    const data = {
      cmd: "start",
      param: ["vslamTable"],
    };
    sendData(data, callback);
  },
  getVslamCameraDataStart: (cameraName, callback) => {
    const data = {
      cmd: "start",
      param: [`vslamCamera-${cameraName}`],
    };
    sendData(data, callback);
  },
  getVslamCameraDataStop: (cameraName, callback) => {
    const data = {
      cmd: "stop",
      param: [`vslamCamera-${cameraName}`],
    };
    sendData(data, callback);
  },
  getCameraDataStart: (cameraName, callback) => {
    const name = `visionPointCloud-${["点云"]}-${cameraName}`;
    const data = {
      cmd: "start",
      param: [name],
    };
    sendData(data, callback);
  },
  getCameraDataStop: (cameraName, callback) => {
    const name = `visionPointCloud-${["点云"]}-${cameraName}`;
    const data = {
      cmd: "stop",
      param: [name],
    };
    sendData(data, callback);
  },
  getMarkerDataStart: (topiicName, callback) => {
    const name = `visualmarker-${["marker"]}-${topiicName}`;
    const data = {
      cmd: "start",
      param: [name],
    };
    sendData(data, callback);
  },
  getMarkerDataStop: (topiicName, callback) => {
    const name = `visualmarker-${["marker"]}-${topiicName}`;
    const data = {
      cmd: "stop",
      param: [name],
    };
    sendData(data, callback);
  },

  // 获取3d地图建图过程运动轨迹
  getMappingTrack: (callback) => {
    const data = {
      cmd: "start",
      param: ["mappingTrack"],
    };
    sendData(data, callback);
  },
  stopMappingTrack: (callback) => {
    const data = {
      cmd: "stop",
      param: ["mappingTrack"],
    };
    sendData(data, callback);
  },
  //获取避障区域点位
  startObstacleAera: (topicName, callback) => {
    const data = {
      cmd: "start",
      param: [`visualfootprint-${["多边形"]}-${topicName}`],
    };
    sendData(data, callback);
  },
  stopObstacleAera: (topicName, callback) => {
    const data = {
      cmd: "stop",
      param: [`visualfootprint-${["多边形"]}-${topicName}`],
    };
    sendData(data, callback);
  },
  //  获取rms任务
  startGetRmsTaskList: (callback) => {
    const data = {
      cmd: "start",
      param: ["robotTaskList"],
    };
    sendData(data, callback);
  },
  stopGetRmsTaskList: (callback) => {
    const data = {
      cmd: "stop",
      param: ["robotTaskList"],
    };
    sendData(data, callback);
  },
};

export { wsApi, clearSocket, openCallback, startWebsocket };
