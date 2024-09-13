import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // 使用 type-only 导入
import Order from '../views/Order.vue'
import OrderRefund from '../views/OrderRefund.vue'
import OrderPrint from '../views/OrderPrint.vue'
import Product from '../views/Product.vue'
import ProductCate from '../views/ProductCate.vue'
import ProductAttr from '../views/ProductAttr.vue'
import User from '../views/User.vue'
import UserAddress from '../views/UserAddress.vue'
import Stats from '../views/Stats.vue'
import Login from '../views/Login.vue'


const routes: Array<RouteRecordRaw> = [
  { path: '/order', component: Order },
  { path: '/orderRefund', component: OrderRefund },
  { path: '/orderPrint', component: OrderPrint },
  { path: '/product', component: Product },
  { path: '/productCate', component: ProductCate },
  { path: '/productAttr', component: ProductAttr },
  { path: '/user', component: User },
  { path: '/userAddress', component: UserAddress },
  { path: '/stats', component: Stats },
  { path: '/login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // 检查 JWT 是否存在
  console.log('router token :'+token)
  // 如果用户未登录，且目标路由不是登录页
  if (!token && to.path !== '/login') {
    console.log("重定向到登录页");
    next('/login'); // 重定向到登录页
  } else if (token && to.path === '/login') {
    // 如果用户已登录，但尝试访问登录页，跳转到首页或其他页面
    console.log("已登录，重定向到首页");
    next('/'); // 重定向到首页
  } else {
    // 允许继续访问
    console.log("允许访问目标页");
    next();
  }
});
export default router
