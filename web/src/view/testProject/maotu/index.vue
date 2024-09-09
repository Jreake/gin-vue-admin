<template>
  <div>
    <button @click="drawRectangle">绘制矩形</button>
    <button @click="drawCircle">绘制圆</button>
    <button @click="disableDraw">关闭绘制</button>
    <button @click="drawMarker">绘制点</button>
    <div id="map" class="map"></div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.pm";
import "leaflet.pm/dist/leaflet.pm.css";
export default {
  name: "leafletPm",
  data() {
    return {
      map: null,
      OSMUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    drawRectangle() {
      this.map.pm.enableDraw("Rectangle", {
        snappable: true,
        snapDistance: 20,
      });
    },
    drawCircle() {
      this.map.pm.enableDraw("Circle", {
        snappable: true,
        snapDistance: 20,
      });
    },
    disableDraw() {
      this.map.pm.disableDraw("Rectangle");
    },
    drawMarker() {
      this.map.pm.enableDraw("Marker", {
        snappable: true,
        snapDistance: 20,
      });
    },
    initMap() {
      this.map = L.map("map", {
        zoom: 14, //缩放比列
        zoomControl: true, //禁用 + - 按钮
        doubleClickZoom: false, // 禁用双击放大
        attributionControl: false, // 移除右下角leaflet标识
      });

      this.map.setView([34.03, -118.15], 13);
      let tileLayer = L.tileLayer(this.OSMUrl);
      tileLayer.addTo(this.map);

      // 添加绘制工具
      this.map.pm.setLang("zh");
      this.map.pm.addControls({
        position: "topleft",
        drawPolygon: true, //绘制多边形
        drawMarker: true, //绘制标记点
        drawCircleMarker: true, //绘制圆形标记
        drawPolyline: true, //绘制线条
        drawRectangle: true, //绘制矩形
        drawCircle: true, //绘制圆圈
        editMode: true, //编辑多边形
        dragMode: true, //拖动多边形
        cutPolygon: true, //添加⼀个按钮以删除多边形⾥⾯的部分内容
        removalMode: true, //清除多边形
      });

      // 全局设置绘制样式
      this.map.pm.setPathOptions({
        color: "orange",
        fillColor: "green",
        fillOpacity: 0.4,
      });

      // 或者单独设置绘制样式
      var options = {
        // 连接线标记之间的线
        templineStyle: {
          color: "red",
        },
        // 提⽰线从最后⼀个标记到⿏标光标的线
        hintlineStyle: {
          color: "red",
          dashArray: [5, 5],
        },
        // 绘制完成的样式
        pathOptions: {
          color: "orange",
          fillColor: "green",
        },
      };

      // 激活绘制多边形功能-1、单独设置某个模式的样式
      this.map.pm.enableDraw("Polygon", options);

      // 启用绘制--多边形功能
      this.map.pm.enableDraw("Polygon", {
        snappable: true, //启⽤捕捉到其他绘制图形的顶点
        snapDistance: 20, //顶点捕捉距离
      });

      // 关闭绘制--注意也可以关闭其他模式的绘制功能
      this.map.pm.disableDraw("Polygon");

      // 绘制事件监听
      this.map.on("pm:drawstart", (e) => {
        console.log(e, "绘制开始第一个点");
      });

      this.map.on("pm:drawend", (e) => {
        console.log(e, "禁⽌绘制、绘制结束");
      });

      this.map.on("pm:create", (e) => {
        console.log(e, "绘制完成时调⽤");
        if (e.shape == "Circle") {
          console.log(e.layer._latlng, e.layer._radius, "绘制坐标");
        } else {
          console.log(e.layer._latlngs[0], "绘制坐标");
        }
      });

      this.map.on("pm:globalremovalmodetoggled", (e) => {
        console.log(e, "清除图层时调用");
      });
    },
  },
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 400px;
}
</style>
