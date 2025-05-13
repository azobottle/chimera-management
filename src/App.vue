<template>
  <el-container style="height: 100vh;">
    <!-- 固定侧边栏 -->
    <el-aside
      v-show="isSidebarVisible"
      width="200px"
      class="aside-fixed"
    >
      <el-menu
        :default-openeds="['1']"
        background-color="#2d3a4b"
        text-color="#ffffff"
        active-text-color="#ffd04b"
        router
        class="custom-menu"
      >
        <!-- 一级菜单项：经营统计 -->
        <el-menu-item index="/login">
          <i class="el-icon-menu"></i>
          <span>登录</span>
        </el-menu-item>

        <!-- 订单 -->
        <el-sub-menu index="1">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>订单</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/orderShop">订单列表</el-menu-item>
            <!-- <el-menu-item index="/deliveryShop">送达管理</el-menu-item> -->
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 商品 -->
        <el-sub-menu index="2">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>商品</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/productShop">商品管理</el-menu-item>
            <el-menu-item index="/productCateShop">商品分类</el-menu-item>
            <el-menu-item index="/productOptShop">商品选项</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 用户 -->
        <el-sub-menu index="3">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>用户</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/userShop">用户列表</el-menu-item>
            <el-menu-item index="/userAddressShop">定时达信息</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 优惠活动 -->
        <el-sub-menu index="4">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>优惠活动</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/couponShop">优惠券</el-menu-item>
            <el-menu-item index="/pointMallShop">积分商城</el-menu-item>
            <el-menu-item index="/activityShop">活动管理</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/statsShop">经营统计</el-menu-item>
            <el-menu-item index="/inventoryShop">出入库</el-menu-item>
            <el-menu-item index="/appConfigurationShop">配置表</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

      </el-menu>
    </el-aside>

    <!-- 主内容区部分 -->
    <el-main
      :style="{ marginLeft: isSidebarVisible ? '200px' : '0' }"
      class="main-scroll"
    >
      <router-view />
    </el-main>

    <!-- 控制侧边栏显示的按钮 -->
    <el-button
      @click="toggleSidebar"
      icon="el-icon-menu"
      class="sidebar-toggle-btn"
    >
      侧边栏
    </el-button>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'App',
  setup() {
    const isSidebarVisible = ref(true)

    const toggleSidebar = () => {
      isSidebarVisible.value = !isSidebarVisible.value
    }

    return {
      isSidebarVisible,
      toggleSidebar
    }
  }
})
</script>

<style scoped>
/* 固定侧边栏并调整样式 */
.aside-fixed {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background-color: #2d3a4b; /* 统一的蓝黑色背景 */
  color: white;
  z-index: 1000; /* 确保侧边栏处于顶层 */
  padding-top: 20px;
}

/* 自定义 el-menu 样式，使得选项和未选项部分一致 */
.custom-menu {
  background-color: #2d3a4b; /* 设置整个菜单的背景色 */
  border-right: none; /* 去掉菜单右侧的边框 */
}

/* 主内容区让它能滚动 */
.main-scroll {
  padding: 20px;
  height: 100vh;
  overflow-y: auto; /* 使主内容区可滚动 */
  background-color: #f5f5f5;
}

/* 控制菜单按钮的样式 */
/* .sidebar-toggle-btn {
  position: fixed;
  bottom: 20px;
  left: 10px;
  z-index: 1001;
  background-color: #539ad1;
} */

/* 控制菜单按钮的样式 */
.sidebar-toggle-btn {
  position: fixed;
  bottom: 20px;
  left: 10px;
  z-index: 1001;
  background-color: #539ad1; /* 按钮背景色 */
  color: white; /* 按钮文字颜色 */
  padding: 8px 16px; /* 按钮内边距，减少空隙，使按钮更紧凑 */
  border-radius: 30px; /* 圆角样式 */
  font-size: 16px; /* 设置文字大小 */
  font-weight: bold; /* 加粗文字 */
  text-align: center; /* 使文字居中 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 添加阴影效果，提升按钮的层次感 */
  transition: background-color 0.3s, box-shadow 0.3s; /* 动画效果 */
}

.sidebar-toggle-btn:hover {
  background-color: #ffffff; /* 悬停时的背景色 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* 悬停时的阴影效果 */
}

/* 调整子菜单标题的样式 */
.el-sub-menu__title {
  color: #ffffff;
}

/* 自定义菜单项的颜色和间距 */
.custom-menu .el-menu-item {
  color: #ffffff;
  padding-left: 20px;
}

/* 高亮显示选中菜单项 */
.custom-menu .el-menu-item.is-active {
  background-color: #1f2937; /* 选中项的背景色 */
  color: #ffd04b; /* 选中项的文本颜色 */
}

/* 鼠标悬停时菜单项高亮 */
.custom-menu .el-menu-item:hover {
  background-color: #1f2937; /* 悬停时改变背景色 */
}

/* 设置菜单项的图标样式 */
.el-menu-item i {
  margin-right: 8px;
}

/* 调整菜单项的字体大小 */
.el-menu-item span {
  font-size: 14px;
}
</style>
