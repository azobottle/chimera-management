<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { getAllOrders, getAllProductsShop, getNewUsers } from '../client/services.gen';
import type { Order, Product, UserDTO } from '../client/types.gen';
import {
  ElMessage,
  ElRow,
  ElCol,
  ElRadioGroup,
  ElRadioButton,
  ElDatePicker,
} from 'element-plus';
import * as echarts from 'echarts';

// Selected view type: 'daily', 'weekly', 'monthly', 'custom'
const selectedViewType = ref('daily');
const dateRange = ref<[Date | null, Date | null]>([null, null]);

// Statistics data
const orderCount = ref(0);
const turnover = ref(0);
const newUserCount = ref(0);

// Product sales data
const productSalesData = ref<{ name: string; sales: number }[]>([]);

// Order statistics by scene and customer type
const sceneOrderStats = ref<{ scene: string; count: number }[]>([]);
const customerTypeOrderStats = ref<{ customerType: string; count: number }[]>([]);

// Fetch data based on selected view type and date range
const fetchData = async () => {
  let startDate: Date;
  let endDate: Date = new Date();

  if (selectedViewType.value === 'daily') {
    // Today
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
  } else if (selectedViewType.value === 'weekly') {
    // Last 7 days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (selectedViewType.value === 'monthly') {
    // Last 30 days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
  } else if (selectedViewType.value === 'custom') {
    if (dateRange.value[0] && dateRange.value[1]) {
      startDate = dateRange.value[0];
      endDate = dateRange.value[1];
    } else {
      ElMessage.error('请选择有效的日期范围');
      return;
    }
  } else {
    ElMessage.error('选择的视图类型无效');
    return;
  }

  try {
    // Fetch orders
    const orderResponse = await getAllOrders({
      query: {
        startTime: formatDate(startDate),
        endTime: formatDate(endDate),
      },
    });
    const orders: Order[] = orderResponse.data;

    // Calculate order count and turnover
    orderCount.value = orders.length;
    turnover.value = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / 100;

    // Fetch new users
    const userResponse = await getNewUsers({
      query: {
        startTime: formatDate(startDate),
        endTime: formatDate(endDate),
      },
    });
    const users: UserDTO[] = userResponse.data;
    newUserCount.value = users.length;

    // Fetch product sales data
    fetchProductSalesData(orders);

    // Fetch order statistics
    fetchOrderStats(orders);

    // Initialize charts after data is ready
    await nextTick();
    initCharts();
  } catch (error) {
    console.error('获取数据时出错:', error);
    ElMessage.error('获取数据时出错:' + error);
  }
};

// Format date to 'yyyy-MM-ddTHH:mm:ss'
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Fetch product sales data
const fetchProductSalesData = (orders: Order[]) => {
  const productSalesMap: Record<string, { name: string; sales: number }> = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (item.productId) {
        const key = item.productId;
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: item.name || '未知商品',
            sales: 1,
          };
        } else {
          productSalesMap[key].sales += 1;
        }
      }
    });
  });

  productSalesData.value = Object.values(productSalesMap);
};

// Fetch order statistics
const fetchOrderStats = (orders: Order[]) => {
  // Statistics by scene
  const sceneStatsMap: Record<string, number> = {};

  orders.forEach((order) => {
    const scene = order.scene || '未知场景';
    if (!sceneStatsMap[scene]) {
      sceneStatsMap[scene] = 1;
    } else {
      sceneStatsMap[scene] += 1;
    }
  });

  sceneOrderStats.value = Object.entries(sceneStatsMap).map(([scene, count]) => ({
    scene,
    count,
  }));

  // Statistics by customer type
  const customerTypeStatsMap: Record<string, number> = {};

  orders.forEach((order) => {
    const customerType = order.customerType || '未知客户类型';
    if (!customerTypeStatsMap[customerType]) {
      customerTypeStatsMap[customerType] = 1;
    } else {
      customerTypeStatsMap[customerType] += 1;
    }
  });

  customerTypeOrderStats.value = Object.entries(customerTypeStatsMap).map(
    ([customerType, count]) => ({
      customerType,
      count,
    })
  );
};

// Initialize charts
const initCharts = () => {
  // Product sales chart
  const productSalesChart = echarts.init(
    document.getElementById('product-sales-chart') as HTMLDivElement
  );

  const productSalesOption = {
    title: {
      text: '商品售卖情况',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: productSalesData.value.map((item) => item.name),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: productSalesData.value.map((item) => item.sales),
        type: 'bar',
      },
    ],
  };
  productSalesChart.setOption(productSalesOption);

  // Scene order statistics chart
  const sceneOrderStatsChart = echarts.init(
    document.getElementById('scene-order-stats-chart') as HTMLDivElement
  );

  const sceneOrderOption = {
    title: {
      text: '不同场景订单统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        name: '订单数',
        type: 'pie',
        radius: '50%',
        data: sceneOrderStats.value.map((item) => ({
          value: item.count,
          name: item.scene,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
  sceneOrderStatsChart.setOption(sceneOrderOption);

  // Customer type order statistics chart
  const customerTypeOrderStatsChart = echarts.init(
    document.getElementById('customer-type-order-stats-chart') as HTMLDivElement
  );

  const customerTypeOrderOption = {
    title: {
      text: '不同客户类型订单统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        name: '订单数',
        type: 'pie',
        radius: '50%',
        data: customerTypeOrderStats.value.map((item) => ({
          value: item.count,
          name: item.customerType,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
  customerTypeOrderStatsChart.setOption(customerTypeOrderOption);
};

// Watch for changes in selected view type and date range
watch(
  [selectedViewType, dateRange],
  () => {
    fetchData();
  },
  { immediate: true }
);

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <!-- View type selection -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="12">
        <el-radio-group v-model="selectedViewType">
          <el-radio-button label="daily">日</el-radio-button>
          <el-radio-button label="weekly">周</el-radio-button>
          <el-radio-button label="monthly">月</el-radio-button>
          <el-radio-button label="custom">自定义</el-radio-button>
        </el-radio-group>
      </el-col>
      <el-col :span="12">
        <!-- Date range picker for custom date range -->
        <el-date-picker
          v-if="selectedViewType === 'custom'"
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-col>
    </el-row>

    <!-- Display statistics -->
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="stat-card">
          <h3>订单量</h3>
          <p>{{ orderCount }}</p>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card">
          <h3>营业额</h3>
          <p>{{ turnover }} 元</p>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card">
          <h3>新增用户</h3>
          <p>{{ newUserCount }}</p>
        </div>
      </el-col>
    </el-row>

    <!-- Product sales and scene order charts -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div id="product-sales-chart" style="width: 100%; height: 400px;"></div>
      </el-col>
      <el-col :span="12">
        <div id="scene-order-stats-chart" style="width: 100%; height: 400px;"></div>
      </el-col>
    </el-row>

    <!-- Customer type order stats chart -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div id="customer-type-order-stats-chart" style="width: 100%; height: 400px;"></div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stat-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ebeef5;
}
.stat-card h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}
.stat-card p {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}
</style>
