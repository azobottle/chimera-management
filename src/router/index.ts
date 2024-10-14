import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // 使用 type-only 导入
import Order from '../views/Order.vue'
import OrderPrint from '../views/OrderPrint.vue'
import Product from '../views/Product.vue'
import ProductCate from '../views/ProductCate.vue'
import ProductOpt from '../views/ProductOpt.vue'
import User from '../views/User.vue'
import UserAddress from '../views/UserAddress.vue'
import Stats from '../views/Stats.vue'
import Coupon from '../views/Coupon.vue'
import Activity from '../views/Activity.vue'
import PointMall from '../views/PointMall.vue'
import Login from '../views/Login.vue'
import { validate } from '@/client'
import AppConfiguration from '@/views/AppConfiguration.vue'


const routes: Array<RouteRecordRaw> = [
  { path: '/order', component: Order },
  { path: '/orderPrint', component: OrderPrint },
  { path: '/product', component: Product },
  { path: '/productCate', component: ProductCate },
  { path: '/productOpt', component: ProductOpt },
  { path: '/user', component: User },
  { path: '/userAddress', component: UserAddress },
  { path: '/stats', component: Stats },
  { path: '/coupon', component: Coupon },
  { path: '/pointMall', component: PointMall },
  { path: '/activity', component: Activity },
  { path: '/login', component: Login },
  { path: '/appConfiguration', component: AppConfiguration }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  // 用户没有token且目标路径不是登录页
  if (!token && to.path !== '/login') {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 保存要跳转的路径
    });
  } 
  // 有token，进行校验
  else if (token) {
    validate().then((res) => {
      localStorage.setItem("userDTO", JSON.stringify(res.data?.data));
      next(); // 验证成功，允许访问目标页面
    }).catch((err) => {
      console.error('Token 验证失败:', err);
      // 验证失败，清除无效token
      localStorage.removeItem('token');
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存要跳转的路径
      });
    });
  } 
  // 已登录或当前页面为登录页，允许继续访问
  else {
    next();
  }
});
export default router
