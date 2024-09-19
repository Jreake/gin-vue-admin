<template>
  <div class="sound-playerback-view">
    <!-- 时间线容器 -->
    <div id="timeline" ref="timeline" />
    <!-- 音频容器 -->
    <div id="waveform" ref="waveform" class="waveform-container"></div>

    <!-- 操作 -->
    <div class="player-tools">
      <!-- <el-button class="cancel-button el-button--default-green">取消</el-button> -->
    </div>
  </div>
</template>

<script setup>
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import { reactive, ref, nextTick, onMounted } from "vue";

const timeline = ref(null);
const waveSurfer = ref(WaveSurfer);
const timelinePlugin = ref(TimelinePlugin);

const state = reactive({
  speed: 1,
  topTimeline: null,
  bottomTimeline: null,
});

const initTimeline = () => {
  state.topTimeline = timelinePlugin.value.create({
    height: 20,
    insertPosition: "beforebegin",
    timeInterval: 0.2,
    primaryLabelInterval: 5,
    secondaryLabelInterval: 1,
    style: {
      fontSize: "20px",
      color: "#2D5B88",
    },
  });

  // Create a second timeline
  state.bottomTimeline = timelinePlugin.value.create({
    height: 10,
    timeInterval: 0.1,
    primaryLabelInterval: 1,
    style: {
      fontSize: "10px",
      color: "#6A3274",
    },
  });
};
const initPlayerback = () => {
  state.wavesurfer = waveSurfer.value.create({
    container: timeline.value, //绑定容器
    audioRate: state.speed, //控制播放速度
    forceDecode: true,
    waveColor: "#A8DBA8",
    progressColor: "#3B8686",
    height: 180,
    backend: "MediaElement",
    plugins: [state.topTimeline, state.bottomTimeline],
  });
  state.wavesurfer.load(
    "https://wavesurfer.xyz/wavesurfer-code/examples/audio/demo.wav"
  ); //加载音频
  if (state.wavesurfer) {
    initFun();
  }
};
// 播放
const initFun = () => {
  // 点击时播放
  state.wavesurfer.on("click", () => {
    state.wavesurfer.play();
  });
  // 音频加载完后播放
  // state.wavesurfer.on('ready', () => {
  //   state.wavesurfer.play()
  // })
};
// 播放时暂停，播放时暂停
const plays = () => {
  state.wavesurfer.playPause();
};
// 后退，
const rew = () => {
  state.wavesurfer.skip(-3);
};
// 前进，
const forward = () => {
  state.wavesurfer.skip(3);
};
// 重放
const replay = () => {
  state.wavesurfer.stop();
};
// 设置音量：
const setVolume = (val) => {
  state.wavesurfer.setVolume(val / 100);
};
// 指定播放
const appointPlay = () => {
  state.wavesurfer.play([state.appointTime]);
};
//倍速播放
const doubleSpeed = (rate) => {
  state.wavesurfer.setPlaybackRate(rate);
};

onMounted(() => {
  nextTick(() => {
    initTimeline();
    initPlayerback();
  });
});
</script>
