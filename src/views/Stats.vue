<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { getAllOrders, getNewUsers } from '../client/services.gen';
import type { Order, UserDTO } from '../client/types.gen';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';

// 选择的视图类型：'daily'、'weekly'、'monthly'、'custom'
const selectedViewType = ref('daily');

// 日期选择器的值
const dateValue = ref<Date | null>(new Date());
const dateRange = ref<[Date | null, Date | null]>([null, null]);

// 统计数据
const orderCount = ref(0);
const turnover = ref(0);
const newUserCount = ref(0);

// 商品销售数据
const productSalesData = ref<{ name: string; sales: number }[]>([]);

// 订单统计数据
const sceneOrderStats = ref<{ scene: string; count: number }[]>([]);
const customerTypeOrderStats = ref<{ customerType: string; count: number }[]>([]);

// 获取数据
const fetchData = async () => {
  let startDate: Date;
  let endDate: Date;

  if (selectedViewType.value === 'daily') {
    if (dateValue.value) {
      startDate = new Date(dateValue.value);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateValue.value);
      endDate.setHours(23, 59, 59, 999);
    } else {
      ElMessage.error('请选择日期');
      return;
    }
  } else if (selectedViewType.value === 'weekly') {
    if (dateValue.value) {
      const selectedDate = new Date(dateValue.value);
      const day = selectedDate.getDay() || 7;
      startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      ElMessage.error('请选择周');
      return;
    }
  } else if (selectedViewType.value === 'monthly') {
    if (dateValue.value) {
      const selectedDate = new Date(dateValue.value);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else {
      ElMessage.error('请选择月份');
      return;
    }
  } else if (selectedViewType.value === 'custom') {
    if (dateRange.value[0] && dateRange.value[1]) {
      startDate = new Date(dateRange.value[0]);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateRange.value[1]);
      endDate.setHours(23, 59, 59, 999);
    } else {
      ElMessage.error('请选择有效的日期范围');
      return;
    }
  } else {
    ElMessage.error('选择的视图类型无效');
    return;
  }

  try {
    // 获取订单数据
    const orderResponse = await getAllOrders({
      query: {
        startTime: formatDate(startDate),
        endTime: formatDate(endDate),
      },
    });
    const orders: Order[] = orderResponse.data as unknown as Order[];

    // 计算订单量和营业额
    orderCount.value = orders.length;
    turnover.value = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / 100;

    // 获取新用户数据
    const userResponse = await getNewUsers({
      query: {
        startTime: formatDate(startDate),
        endTime: formatDate(endDate),
      },
    });
    const users: UserDTO[] = userResponse.data as unknown as UserDTO[];
    newUserCount.value = users.length;

    // 获取商品销售数据
    fetchProductSalesData(orders);

    // 获取订单统计数据
    fetchOrderStats(orders);

    // 等待 DOM 更新后初始化图表
    await nextTick(); // 确保 DOM 更新完成
    initCharts(); // 在 DOM 更新后初始化图表
  } catch (error) {
    console.error('获取数据时出错:', error);
    ElMessage.error('获取数据时出错:' + error);
  }
};

// 格式化日期
const formatDate = (date: Date) => {
  return date.toISOString();
};

// 获取商品销售数据
const fetchProductSalesData = (orders: Order[]) => {
  const productSalesMap: Record<string, { name: string; sales: number }> = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (item.productId) {
        const key = item.productId;
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: item.name || '未知商品',
            sales: 1, // 确保统计正确的销售量
          };
        } else {
          productSalesMap[key].sales += 1;
        }
      }
    });
  });

  // 对商品销售数据按照销售量从高到低排序
  productSalesData.value = Object.values(productSalesMap).sort((a, b) => b.sales - a.sales);
};

// 获取订单统计数据
const fetchOrderStats = (orders: Order[]) => {
  // 场景统计
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

  // 客户类型统计
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

// 初始化图表
const initCharts = () => {
  // 商品售卖情况图表
  const productSalesElement = document.getElementById('product-sales-chart');
  if (productSalesElement) {
    const productSalesChart = echarts.init(productSalesElement);

    const productSalesOption = {
      title: {
        text: '商品售卖情况',
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 16,
        },
      },
      color: ['#409EFF'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '6%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: productSalesData.value.map((item) => item.name),
        axisLabel: {
          interval: 0,
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          start: 0,
          end:
            productSalesData.value.length > 10
              ? (10 / productSalesData.value.length) * 100
              : 100,
          zoomLock: false,
        },
      ],
      series: [
        {
          name: '销售量',
          type: 'bar',
          data: productSalesData.value.map((item) => item.sales),
          itemStyle: {
            color: '#409EFF',
          },
          barWidth: '50%',
        },
      ],
    };
    productSalesChart.setOption(productSalesOption);
  } else {
    console.warn('商品售卖情况图表的 DOM 元素未找到');
  }

  // 场景订单统计图表
  const sceneOrderStatsElement = document.getElementById('scene-order-stats-chart');
  if (sceneOrderStatsElement) {
    const sceneOrderStatsChart = echarts.init(sceneOrderStatsElement);
    const sceneOrderOption = {
      title: {
        text: '不同场景订单统计',
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 16,
        },
      },
      color: ['#67C23A', '#E6A23C', '#F56C6C', '#909399'],
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
          label: {
            formatter: '{b}: {d}%',
            fontSize: 14,
            fontWeight: 'bold',
          },
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
  } else {
    console.warn('场景订单统计图表的 DOM 元素未找到');
  }

  // 客户类型订单统计图表
  const customerTypeOrderStatsElement = document.getElementById('customer-type-order-stats-chart');
  if (customerTypeOrderStatsElement) {
    const customerTypeOrderStatsChart = echarts.init(customerTypeOrderStatsElement);
    const customerTypeOrderOption = {
      title: {
        text: '不同客户类型订单统计',
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 16,
        },
      },
      color: ['#67C23A', '#E6A23C', '#F56C6C', '#909399'],
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
          label: {
            formatter: '{b}: {d}%',
            fontSize: 14,
            fontWeight: 'bold',
          },
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
  } else {
    console.warn('客户类型订单统计图表的 DOM 元素未找到');
  }
};

// 监听视图类型和日期的变化
watch(
  [selectedViewType, dateValue, dateRange],
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
    <!-- 视图类型选择 -->
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
        <!-- 日期选择器 -->
        <el-date-picker
          v-if="selectedViewType === 'daily'"
          v-model="dateValue"
          type="date"
          placeholder="选择日期"
          @change="fetchData"
        ></el-date-picker>
        <el-date-picker
          v-else-if="selectedViewType === 'weekly'"
          v-model="dateValue"
          type="week"
          placeholder="选择周"
          @change="fetchData"
        ></el-date-picker>
        <el-date-picker
          v-else-if="selectedViewType === 'monthly'"
          v-model="dateValue"
          type="month"
          placeholder="选择月"
          @change="fetchData"
        ></el-date-picker>
        <el-date-picker
          v-else-if="selectedViewType === 'custom'"
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="fetchData"
        ></el-date-picker>
      </el-col>
    </el-row>

    <!-- 显示统计数据 -->
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

    <!-- 图表展示 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div id="scene-order-stats-chart" style="width: 100%; height: 400px;"></div>
        <div
          id="customer-type-order-stats-chart"
          style="width: 100%; height: 400px; margin-top: 20px;"
        ></div>
      </el-col>
      <el-col :span="12">
        <div id="product-sales-chart" style="width: 100%; height: 820px;"></div>
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