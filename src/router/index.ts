import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // 使用 type-only 导入
import Order from '../views/Order.vue'
import OrderRefund from '../views/OrderRefund.vue'
import OrderPrint from '../views/OrderPrint.vue'
import Product from '../views/Product.vue'
import ProductCate from '../views/ProductCate.vue'
import ProductOpt from '../views/ProductOpt.vue'
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
  { path: '/productOpt', component: ProductOpt },
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
  const token = localStorage.getItem('token'); 
  if (!token && to.path !== '/login') {  // 如果用户未登录，且目标路由不是登录页
    next('/login');
  } else {    // 允许继续访问
    next();
  }
});
export default router
