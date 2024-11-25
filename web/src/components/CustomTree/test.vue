<template>
  <div class="container" @dragover="onDragOver" @drop="onDrop">
    <el-card>
      <el-tree
        ref="tree"
        :data="data"
        node-key="id"
        draggable
        :virtual-scroll="true"
        :default-expanded-keys="defaultExpandIdList"
        :expand-on-click-node="true"
        :default-expand-all="true"
        :allow-drop="handleAllowDrop"
        :allow-drag="handleAllowDrag"
        style="max-width: 600px"
        @node-drag-start="handleDragStart"
        @node-drag-over="handleDragOver"
      />
    </el-card>
    <el-card
      :body-style="{
        padding: '15px',
        height: '100%',
      }"
    >
      <div class="folder_grid">
        <div
          v-for="(item, index) in folder"
          :key="index + 'folder'"
          :id="item.id"
          ref="folder"
          class="folder"
          :class="checkTreeData.id === item.id ? 'active' : ''"
          @click="handleClickDrawArea(item, index)"
        >
          数据 {{ item }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      folder: [
        { name: "111", id: 1, domData: {}, treeInfo: {} },
        { name: "222", id: 2, domData: {}, treeInfo: {} },
        { name: "333", id: 3, domData: {}, treeInfo: {} },
        { name: "444", id: 4, domData: {}, treeInfo: {} },
      ],
      customDragImage: null,
      moveData: {},
      data: [
        {
          label: "节点1",
          id: 1,
          children: [
            {
              label: "节点1-1",
              id: 2,
            },
          ],
        },
        {
          label: "节点2",
          id: 3,
          children: [
            {
              label: "节点2-1",
              id: 4,
            },
            {
              label: "节点2-2",
              id: 5,
            },
          ],
        },
        {
          label: "节点3",
          id: 5,
          children: [
            {
              label: "节点3-1",
              id: 7,
            },
            {
              label: "节点3-2",
              id: 8,
            },
          ],
        },
      ],
      checkTreeData: {},
      defaultExpandIdList: [],
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      //生成一个div，用户替换拖拽框
      const div = document.createElement("div");
      div.style.width = "250px";
      div.style.height = "50px";
      div.style.borderRadius = "6px";
      div.style.border = "2px solid #dbe6ff";
      div.style.backgroundColor = "#585c71";
      div.style.position = "absolute";
      div.style.top = "-9999px";
      document.body.appendChild(div);
      this.customDragImage = div;
      this.$nextTick(() => {
        this._filterElement();
      });
    },
    _filterElement() {
      const elList = this.$refs.folder ? this.$refs.folder : [];
      for (let i = 0; i < elList.length; i++) {
        this.folder[i].domData = elList[i];
      }
    },
    // 处理拖放事件,阻止默认行为，关闭禁止图标
    onDragOver(event) {
      event.preventDefault();
    },

    //处理拖拽结束
    onDrop(event) {
      event.preventDefault();
      this.folder.forEach((element) => {
        if (event.target === element.domData) {
          element.domData.innerText = this.moveData.label;
          element.treeInfo = this.moveData;
        }
      });
    },

    // 只允许叶子节点拖动
    handleAllowDrag(node) {
      return node.isLeaf;
    },

    // 不允许放置
    handleAllowDrop() {
      return false;
    },

    // 拖拽开始
    handleDragStart(node, event) {
      if (this.customDragImage) {
        //储存被拖拽的数据
        this.moveData = node.data;
        //修改拖拽框样式
        this.customDragImage.innerHTML = `
        <div style="color: white; padding:0 10px; font-size: 16px;line-height:50px">
            <div>${node.data.label}</div>
        </div>`;
        //setDragImage方法的三个参数，第一个是替换的dom，第二三个参数是拖动时鼠标在替换dom中的位置
        event.dataTransfer.setDragImage(this.customDragImage, 125, 25);
      }
    },

    // 拖拽过程中修改鼠标样式，使其不出现禁止图标
    handleDragOver(draggingNode, dropNode, event) {
      event.dataTransfer.dropEffect = "move";
    },
    // 反向选中效果
    handleClickDrawArea(row, index) {
      console.log(row.treeInfo, index);
      this.checkTreeData = { ...row };
      this.defaultExpandIdList = [];
      if (row.treeInfo.id) {
        this.defaultExpandIdList.push(row.treeInfo.id);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.el-tree {
  --el-tree-node-content-height: 50px;
}
:deep(.el-tree-node__expand-icon) {
  font-size: 16px !important;
}
.container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 15px;
  height: 89vh;
}
.folder_grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  height: 95%;
  border-radius: 8px;
  padding: 10px;
  .active {
    border: 1px solid red;
  }
}
.folder {
  border: 2px dashed #585c72;
  border-radius: 8px;
  text-align: center;
}
</style>
