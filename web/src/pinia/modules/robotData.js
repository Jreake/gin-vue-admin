import { defineStore } from "pinia";

export const robotDataStore = defineStore("robotDataStore", () => {
  let state = {
    systemEnv: "", // 系统环境
    systemConnection: true, // 单机ws连接状态
    robotId: 0, // 当前连接机器人id
    mapId: null, // 当前使用的地图id
    robotType: "", //机器人型号
    errorStatus: {}, // 错误码枚举
    robotData: {}, // 机器人信息详情
    robotStatus: "", // 机器人状态
    taskStatus: "", // 任务状态
    userInfo: {}, // 用户信息
    fileProgress: 0, // 上传进度
    robotModel: "",
    mapType: "slam", //机器人可建的地图类型
    robotTime: 0, //机器人时间
  };

  const setSystemConnection = (status) => {
    state.systemConnection = status;
  };

  const setRobotId = (id) => {
    state.robotId = id;
  };
  const setRobotTime = (time) => {
    state.robotTime = Number(time);
  };

  const setRobotModel = (model) => {
    state.robotModel = model;
  };

  const setMapId = (id) => {
    state.mapId = id === 0 ? null : id;
  };

  const setRobotType = (robotType) => {
    state.robotType = robotType;
  };

  const setErrorStatus = (errorStatus) => {
    state.errorStatus = errorStatus;
  };

  const setRobotData = (data) => {
    state.robotData = data;
  };

  const setRobotStatus = (robotStatus) => {
    if (state.robotStatus === robotStatus) return;
    state.robotStatus = robotStatus;
    // const { blackMenus, blackOperation } =
    //   RobotStatusMap[robotStatus as keyof typeof RobotStatusMap]
    // appStore.permissionStore.setMenusPond(blackMenus || [])
    // appStore.permissionStore.setOperationPond(blackOperation || [])
  };

  const setTaskStatus = (taskStatus) => {
    state.taskStatus = taskStatus;
  };

  const updateUserInfo = (state, userInfo) => {
    state.userInfo = userInfo;
  };

  const setProgress = (state, number) => {
    state.fileProgress = number;
  };

  const setMapType = (mapType) => {
    if (mapType === "Lidar3D") {
      state.mapType = "threeDSlam";
    } else if (mapType === "Lidar2D") {
      state.mapType = "slam";
    }
  };

  return {
    state,
    setSystemConnection,
    setRobotId,
    setRobotTime,
    setRobotModel,
    setMapId,
    setRobotType,
    setErrorStatus,
    setRobotData,
    setRobotStatus,
    setTaskStatus,
    updateUserInfo,
    setProgress,
    setMapType,
  };
});
