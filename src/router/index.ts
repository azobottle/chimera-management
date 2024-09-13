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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
