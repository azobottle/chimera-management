<template>
  <el-container style="height: 100vh;">
    <!-- 固定侧边栏 -->
    <el-aside width="200px" class="aside-fixed">
      <el-menu
        :default-openeds="['1']"
        background-color="#2d3a4b"
        text-color="#ffffff"
        active-text-color="#ffd04b"
        router
        class="custom-menu"
      >
        <!-- 一级菜单项：经营统计 -->
        <el-menu-item index="/stats">
          <i class="el-icon-menu"></i>
          <span>经营统计</span>
        </el-menu-item>

        <!-- 商品 -->
        <el-sub-menu index="2">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>商品</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/product">商品管理</el-menu-item>
            <el-menu-item index="/productCate">商品分类</el-menu-item>
            <el-menu-item index="/productOpt">商品选项</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 订单 -->
        <el-sub-menu index="3">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>订单</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/order">订单列表</el-menu-item>
            <el-menu-item index="/orderRefund">退款订单</el-menu-item>
            <el-menu-item index="/orderPrint">打印设置</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 用户 -->
        <el-sub-menu index="4">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>用户</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/user">用户列表</el-menu-item>
            <el-menu-item index="/userAddress">定时达地址</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 优惠活动 -->
        <el-sub-menu index="5">
          <template #title>
            <i class="el-icon-menu"></i>
            <span>优惠活动</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/coupons">优惠券</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主内容区部分 -->
    <el-main class="main-scroll">
      <router-view />
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
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

/* 主内容区让它能滚动 */
.main-scroll {
  margin-left: 200px; /* 确保主内容不会被侧边栏覆盖 */
  padding: 20px;
  height: 100vh;
  overflow-y: auto; /* 使主内容区可滚动 */
  background-color: #f5f5f5;
}

/* 调整子菜单标题的样式 */
.el-sub-menu__title {
  color: #ffffff;
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
