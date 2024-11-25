<template>
  <div class="container">
    <slot name="search" />
    <el-tree
      ref="tree"
      class="staff-tree"
      :class="showCheckBox ? '' : 'check-radio-tree'"
      :data="dataTree"
      :props="defaultProps"
      :show-checkbox="showCheckBox"
      :default-expand-all="isExpandAll"
      :node-key="nodeKey"
      draggable
      :virtual-scroll="true"
      :default-expanded-keys="defaultExpandIdList"
      :expand-on-click-node="true"
      :allow-drop="handleAllowDrop"
      :allow-drag="handleAllowDrag"
      style="width: 280px"
      @node-drag-start="handleDragStart"
      @node-drag-over="handleDragOver"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <!-- 区域 -->
          <div class="label" v-if="data.type === 1">
            <img v-if="data.img" :src="'/inspImage' + data.img" />
            <el-tooltip
              class="item"
              :open-delay="800"
              effect="dark"
              :content="data[defaultProps.label]"
              placement="right"
            >
              <div class="txt">
                {{ data[defaultProps.label] ? data[defaultProps.label] : "" }}
              </div>
            </el-tooltip>
          </div>
          <!-- 设备 -->
          <div class="label" v-else>
            <img v-if="data.img" :src="'/inspImage' + data.img" />
            <i
              v-if="!data.children"
              class="circular"
              :style="{ background: '#fff' }"
            ></i>
            <el-tooltip
              class="item"
              :open-delay="800"
              effect="dark"
              :content="data[defaultProps.label]"
              placement="right"
            >
              <div class="txt">
                {{ data[defaultProps.label] ? data[defaultProps.label] : "" }}
              </div>
            </el-tooltip>
          </div>
          <div class="num" v-if="isViewNum && (data.totalNum || data.children)">
            {{
              data.totalNum || data.children
                ? `(${data.totalNum || data.children.length})`
                : ""
            }}
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  props: {
    dataTree: {
      type: Array,
      default: () => {
        return [];
      },
    },
    checkType: {
      type: String,
      default: () => {
        return "checkbox";
      },
    },
    showCheckBox: {
      type: Boolean,
      default: true,
    },
    defaultProps: {
      type: Object,
      default: () => {
        return {
          children: "children",
          label: "label",
        };
      },
    },
    nodeKey: {
      type: String,
      default: "id",
    },
    isViewNum: {
      type: Boolean,
      default: true,
    },
    isExpandAll: {
      type: Boolean,
      default: false,
    },
    // 是否展示状态
    isStatus: {
      type: Boolean,
      default: true,
    },
    // 需要点击的层级
    clickLevel: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      defaultExpandIdList: [],
    };
  },
  created() {},
  methods: {
    // 默认选中
    async defaultCheck(num, isTatus = true, defaultNodes = []) {
      const list = _.cloneDeep(this.dataTree);
      if (!list.length) return;
      let checkData = [];
      if (defaultNodes && defaultNodes.length) {
        checkData = defaultNodes;
      } else {
        checkData = await this._filterDefaultList(list, num, isTatus);
      }
      console.log("checkData", checkData);

      const checkDataId = checkData.map((k) => k.id);
      this.defaultExpandIdList = this.findParentIds(isTatus, list, checkDataId);
      console.log("this.defaultExpandIdList[0]", this.defaultExpandIdList);
      if (!isTatus) {
        // 默认选中效果
        this.$refs.tree.setCurrentKey(this.defaultExpandIdList[0]);
      }
      this.$refs.tree.setCheckedKeys([]); // 删除所有选中节点
      this.$refs.tree.setCheckedNodes(checkData); // 选中已选中节点
      this.$emit("emitCheckTreeNode", checkData);
    },
    findParentIds(isTatus, dataTree, ids) {
      const matchingIds = new Set(); // 用于存储唯一的匹配 ID
      function traverse(node, path = []) {
        // 当前节点的 ID
        path.push(node.id);
        // 检查当前节点的 ID 是否在 ids 中
        if (ids && ids.length && ids.includes(node.id)) {
          // 如果是，记录路径中的所有 ID
          path.forEach((id) => matchingIds.add(id));
        }
        // 如果当前节点有子节点，继续遍历
        if (node.children) {
          for (const child of node.children) {
            traverse(child, path.slice()); // 传递当前路径的副本
          }
        }
      }
      // 遍历每个顶级节点
      for (const node of dataTree) {
        traverse(node);
      }
      const allIdList = Array.from(matchingIds);
      // 去掉最后一级的id
      let resultId = allIdList; // 返回匹配 ID 的数组
      if (isTatus) {
        resultId = allIdList.filter((id) => !ids.includes(id));
      }
      return resultId;
    },
    // 处理数据
    _filterDefaultList(list, count, isTatus) {
      const result = [];
      const traverse = (node) => {
        if (node.children) {
          for (const child of node.children) {
            traverse(child);
          }
        } else if (isTatus && node.status === 1) {
          result.push({ ...node });
        } else if (!isTatus) {
          result.push({ ...node });
        }
      };
      for (const node of list) {
        traverse(node);
      }

      return result.slice(0, count);
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
      this.$emit("handleDragStart", node.data);
    },
    // 拖拽过程中修改鼠标样式，使其不出现禁止图标
    handleDragOver(draggingNode, dropNode, event) {
      event.dataTransfer.dropEffect = "move";
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
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 15px;
  height: 89vh;
  // 去掉第一级的复选框
  :deep(.staff-tree) {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    background-color: rgba(105, 201, 245, 0);
    width: 100%;
    color: red;
    > .el-tree-node > .el-tree-node__content .el-checkbox {
      display: none;
    }
    .el-tree-node {
      .el-tree-node__content {
        .el-checkbox {
          .el-checkbox__input {
            .el-checkbox__inner {
              display: none;
            }
          }
        }

        .is-leaf + .el-checkbox {
          .el-checkbox__inner {
            display: inline-block;
          }
        }
      }
    }
    .custom-tree-node {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .label {
        width: 100%;
        font-size: 14px;
        position: relative;
        img {
          width: 10px;
          height: 10px;
          margin-right: 10px;
        }
        .circular {
          position: absolute;
          content: " ";
          width: 8px;
          height: 8px;
          border-radius: 100%;
          top: 6px;
          left: 0;
        }
        .txt {
          width: calc(100% - 40px);
          padding-left: 15px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .num {
        font-size: 12px;
        padding-right: 10px;
      }
    }
    .el-tree-node__content {
      &:hover {
        background-color: rgba(pink, 0.4);
        color: #585c72;
      }
    }
    .el-tree-node.is-current > .el-tree-node__content {
      background-color: yellow !important;
      color: #585c72;
    }
    .el-tree-node__children > .is-checked {
      color: #585c72;
      background-image: linear-gradient(90deg, blue 0%, red 120%);
      margin-top: 1px;
    }
    .el-tree-node__children > .is-expanded {
      background-image: linear-gradient(
        to right,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0)
      ) !important;
    }

    .el-checkbox__inner {
      background-color: rgba(105, 201, 245, 0);
    }
    .el-tree-node:focus > .el-tree-node__content {
      background-color: rgba(rgb(21, 240, 21), 0.4);
    }

    /* 隐藏除最后一级节点外的所有节点的高亮 */
    // .el-tree-node__content:not(:last-child):before {
    //   background-color: red !important;
    // }

    // /* 如果需要隐藏子节点的高亮，可以添加以下CSS */
    // .el-tree-node__children .el-tree-node__content:before {
    //   content: '';
    //   display: none;
    // }
  }
  :deep(.check-radio-tree) {
    .el-tree-node__children > .is-checked {
      background-image: linear-gradient(90deg, blue 0%, red 120%) !important;
    }
  }
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
