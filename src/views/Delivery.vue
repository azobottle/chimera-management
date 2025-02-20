<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  getOrdersByDeliveryInfo,
  getAllFixDeliveryInfos,
  supplyOrder,
  batchSupplyOrders,
} from '../client/services.gen';
import type { Order, FixDeliveryInfo } from '../client/types.gen';
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElButton,
  ElSelect,
  ElOption,
  ElDialog,
  ElRow,
  ElCol,
  ElMessageBox, // 导入 ElMessageBox
} from 'element-plus';

// State variables
const fixDeliveryInfos = ref<FixDeliveryInfo[]>([]);
const selectedSchool = ref<string | null>(null);
const selectedAddress = ref<string | null>(null);
const selectedTime = ref<string | null>(null);

const orders = ref<Order[]>([]);
const ordersFetched = ref(false); // To track if orders have been fetched

// Fetch all fix delivery info
const fetchFixDeliveryInfos = async () => {
  try {
    const response = await getAllFixDeliveryInfos();
    fixDeliveryInfos.value = response.data;
  } catch (error) {
    console.error('Error fetching fix delivery info:', error);
    ElMessage.error('获取定时达信息时出错:' + error);
  }
};

// Fetch orders based on selected fix delivery info
const fetchOrders = async () => {
  if (!selectedSchool.value || !selectedAddress.value || !selectedTime.value) {
    ElMessage.warning('请先选择学校、地址和配送时间');
    return;
  }

  try {
    const response = await getOrdersByDeliveryInfo({
      query: {
        school: selectedSchool.value,
        address: selectedAddress.value,
        time: selectedTime.value,
      },
    });
    orders.value = response.data as unknown as Order[];
    ordersFetched.value = true; // Set to true after fetching orders
  } catch (error) {
    console.error('Error fetching orders:', error);
    ElMessage.error('获取订单数据时出错:' + error);
  }
};

// Check if all orders are in the "待配送" state
const allOrdersPendingDelivery = computed(() => {
  return orders.value.length > 0 && orders.value.every(order => order.state === '待配送');
});

// 格式化发送时间
const formatSendTime = (time: string): string => {
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    return "无效时间";
  }
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1); // 月份从0开始
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 辅助函数：补零
const padZero = (num: number): string => {
  return num < 10 ? `0${num}` : `${num}`;
};

// Handle batch delivery with confirmation dialog
const handleBatchDelivery = async () => {
  if (!allOrdersPendingDelivery.value) {
    ElMessage.warning('当前没有可供配送的订单');
    return;
  }

  try {
    await ElMessageBox.confirm(
      '操作响应较慢，点击确认后请等待一会。',
      '确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 用户确认后执行批量供餐
    const orderIds = orders.value.map(order => order.id);
    await batchSupplyOrders({ body: { orderIds } });
    ElMessage.success('所有订单已成功供餐');
    await fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量供餐时出错:', error);
      ElMessage.error('批量供餐时出错:' + error);
    }
    // 如果用户取消，不做任何操作
  }
};

// Lifecycle hook
onMounted(async () => {
  await fetchFixDeliveryInfos();
});
</script>

<template>
  <div>
    <h3>选择定时达信息</h3>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-select v-model="selectedSchool" placeholder="选择学校">
          <el-option
            v-for="info in fixDeliveryInfos"
            :key="info.school"
            :label="info.school"
            :value="info.school"
          />
        </el-select>
      </el-col>

      <el-col :span="6">
        <el-select v-model="selectedAddress" placeholder="选择地址" :disabled="!selectedSchool">
          <el-option
            v-for="address in fixDeliveryInfos.find(info => info.school === selectedSchool)?.addresses || []"
            :key="address"
            :label="address"
            :value="address"
          />
        </el-select>
      </el-col>

      <el-col :span="6">
        <el-select v-model="selectedTime" placeholder="选择时间" :disabled="!selectedAddress">
          <el-option
            v-for="time in fixDeliveryInfos.find(info => info.school === selectedSchool)?.times || []"
            :key="time"
            :label="time"
            :value="time"
          />
        </el-select>
      </el-col>

      <el-col :span="6">
        <el-button type="primary" @click="fetchOrders" :disabled="!selectedTime" style="width: 100%;">
          查找订单
        </el-button>
      </el-col>
    </el-row>

    <!-- 显示订单数量 -->
    <div v-if="ordersFetched" style="margin-top: 10px;">
      <p v-if="orders.length > 0">已查询到的订单数量: {{ orders.length }}</p>
      <p v-else>未查询到符合条件的订单</p>
    </div>

    <h3 v-if="ordersFetched" style="margin-top: 20px;">订单列表</h3>
    <el-table v-if="ordersFetched" :data="orders" stripe>
      <el-table-column prop="orderNum" label="订单号" width="150" />
      <el-table-column prop="state" label="状态" width="100" />
      <el-table-column prop="deliveryInfo.school" label="学校" width="200" />
      <el-table-column prop="deliveryInfo.address" label="地址" width="200" />
      <el-table-column label="定时达时间" width="160px">
        <template #default="props">
          {{ formatSendTime(props.row.deliveryInfo?.time) || '无' }}
        </template>
      </el-table-column>
    </el-table>

    <el-button
      v-if="ordersFetched && allOrdersPendingDelivery"
      type="primary"
      @click="handleBatchDelivery"
      style="margin-top: 20px;"
    >
      统一送达
    </el-button>
  </div>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
