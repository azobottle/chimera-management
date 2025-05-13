<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { getAllOrders, getNewUsers } from '../client/services.gen'
import type { Order, UserDTO } from '../client/types.gen'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx' // 导入 xlsx

// 选择的视图类型：'daily'、'weekly'、'monthly'、'custom'
const selectedViewType = ref('daily')

// 日期选择器的值
const dateValue = ref<Date | null>(new Date())
const dateRange = ref<[Date | null, Date | null]>([null, null])

// 统计数据
const orderCount = ref(0)
const turnover = ref(0)
const newUserCount = ref(0)

// 商品销售数据
const productSalesData = ref<{ name: string; sales: number }[]>([])

// 订单统计数据（改为场景表格 + 学校表格）
// 场景统计
const sceneOrderStats = ref<{ scene: string; count: number; turnover: number }[]>([])
// 学校统计（原“不同客户类型”需求改为根据 deliveryInfo.school 分类）
const schoolOrderStats = ref<{ school: string; count: number; turnover: number }[]>([])

// 获取数据
const fetchData = async () => {
  let startDate: Date
  let endDate: Date

  if (selectedViewType.value === 'daily') {
    if (dateValue.value) {
      startDate = new Date(dateValue.value)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(dateValue.value)
      endDate.setHours(23, 59, 59, 999)
    } else {
      ElMessage.error('请选择日期')
      return
    }
  } else if (selectedViewType.value === 'weekly') {
    if (dateValue.value) {
      const selectedDate = new Date(dateValue.value)
      const day = selectedDate.getDay()
      startDate = new Date(selectedDate)
      // 设置为周日到周六 或者周一到周日，视需求而定，这里假设周日是第0天
      startDate.setDate(selectedDate.getDate() - day)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
    } else {
      ElMessage.error('请选择周')
      return
    }
  } else if (selectedViewType.value === 'monthly') {
    if (dateValue.value) {
      const selectedDate = new Date(dateValue.value)
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth()
      startDate = new Date(year, month, 1)
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
    } else {
      ElMessage.error('请选择月份')
      return
    }
  } else if (selectedViewType.value === 'custom') {
    if (dateRange.value[0] && dateRange.value[1]) {
      startDate = new Date(dateRange.value[0])
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(dateRange.value[1])
      endDate.setHours(23, 59, 59, 999)
    } else {
      ElMessage.error('请选择有效的日期范围')
      return
    }
  } else {
    ElMessage.error('选择的视图类型无效')
    return
  }

  try {
    // 获取订单数据
    const orderResponse = await getAllOrders({
      query: {
        startTime: formatDate(startDate),
        endTime: formatDate(endDate),
      },
    })
    const orders: Order[] = orderResponse.data as unknown as Order[]

    // 计算订单量和营业额
    orderCount.value = orders.length
    turnover.value = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / 100

    // 获取新用户数据
    const userResponse = await getNewUsers({
      query: {
        startTime: formatDate(startDate),
        endTime: formatDate(endDate),
      },
    })
    const users: UserDTO[] = userResponse.data as unknown as UserDTO[]
    newUserCount.value = users.length

    // 获取商品销售数据
    fetchProductSalesData(orders)

    // 获取订单统计数据（改为场景 + 学校）
    fetchOrderStats(orders)

    // 等待 DOM 更新后初始化图表（这里仅商品销售图）
    await nextTick()
    initProductSalesChart()
  } catch (error) {
    console.error('获取数据时出错:', error)
    ElMessage.error('获取数据时出错:' + error)
  }
}

// 格式化日期
const formatDate = (date: Date) => {
  return date.toISOString()
}

// 获取商品销售数据
const fetchProductSalesData = (orders: Order[]) => {
  const productSalesMap: Record<string, { name: string; sales: number }> = {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (item.productId) {
        const key = item.productId
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: item.name || '未知商品',
            sales: 1,
          }
        } else {
          productSalesMap[key].sales += 1
        }
      }
    })
  })

  // 对商品销售数据按照销售量从高到低排序
  productSalesData.value = Object.values(productSalesMap).sort((a, b) => b.sales - a.sales)
}

// 获取订单统计数据（这里把场景和学校分别聚合出订单数及营业额）
const fetchOrderStats = (orders: Order[]) => {
  // 场景统计
  const sceneStatsMap: Record<string, { count: number; turnover: number }> = {}

  // 学校统计
  const schoolStatsMap: Record<string, { count: number; turnover: number }> = {}

  orders.forEach((order) => {
    // 1) 场景统计
    const scene = order.scene || '未知场景'
    if (!sceneStatsMap[scene]) {
      sceneStatsMap[scene] = { count: 0, turnover: 0 }
    }
    sceneStatsMap[scene].count++
    sceneStatsMap[scene].turnover += order.totalPrice ?? 0

    // 2) 学校统计
    // 根据定时达客户类型需求，分类依据为 order.deliveryInfo.school
    if (order.deliveryInfo?.school) {
      
      const school = order.deliveryInfo?.school
      if (!schoolStatsMap[school]) {
        schoolStatsMap[school] = { count: 0, turnover: 0 }
      }
      schoolStatsMap[school].count++
      schoolStatsMap[school].turnover += order.totalPrice ?? 0

    }
  })

  // 整理为数组
  sceneOrderStats.value = Object.entries(sceneStatsMap).map(([scene, data]) => ({
    scene,
    count: data.count,
    turnover: data.turnover / 100, // 分转元
  }))

  schoolOrderStats.value = Object.entries(schoolStatsMap).map(([school, data]) => ({
    school,
    count: data.count,
    turnover: data.turnover / 100, // 分转元
  }))
}

// 初始化「商品售卖情况」图表
const initProductSalesChart = () => {
  const productSalesElement = document.getElementById('product-sales-chart')
  if (productSalesElement) {
    const productSalesChart = echarts.init(productSalesElement)

    const productSalesOption = {
      title: {
        text: '商品售卖情况',
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 16,
        },
      },
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
          barWidth: '50%',
        },
      ],
    }
    productSalesChart.setOption(productSalesOption)
  } else {
    console.warn('商品售卖情况图表的 DOM 元素未找到')
  }
}

// 导出到 Excel 的函数
const exportToExcel = () => {
  const workbook = XLSX.utils.book_new()

  // 创建 Summary 工作表
  const summaryData = [
    ['经营统计概要'],
    ['订单量', orderCount.value],
    ['营业额', `${turnover.value} 元`],
    ['新增用户', newUserCount.value],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, '概要')

  // 创建商品销售数据工作表
  const productSalesHeader = ['商品名称', '销售量']
  const productSalesRows = productSalesData.value.map((item) => [item.name, item.sales])
  const productSalesDataArray = [productSalesHeader, ...productSalesRows]
  const productSalesSheet = XLSX.utils.aoa_to_sheet(productSalesDataArray)
  XLSX.utils.book_append_sheet(workbook, productSalesSheet, '商品销售')

  // 场景订单统计工作表
  const sceneOrderHeader = ['场景', '订单数', '营业额（元）']
  const sceneOrderRows = sceneOrderStats.value.map((item) => [item.scene, item.count, item.turnover])
  const sceneOrderDataArray = [sceneOrderHeader, ...sceneOrderRows]
  const sceneOrderSheet = XLSX.utils.aoa_to_sheet(sceneOrderDataArray)
  XLSX.utils.book_append_sheet(workbook, sceneOrderSheet, '场景统计')

  // 学校订单统计工作表（定时达客户类型）
  const schoolOrderHeader = ['学校', '订单数', '营业额（元）']
  const schoolOrderRows = schoolOrderStats.value.map((item) => [
    item.school,
    item.count,
    item.turnover,
  ])
  const schoolOrderDataArray = [schoolOrderHeader, ...schoolOrderRows]
  const schoolOrderSheet = XLSX.utils.aoa_to_sheet(schoolOrderDataArray)
  XLSX.utils.book_append_sheet(workbook, schoolOrderSheet, '学校统计')

  // 生成 Excel 文件并下载
  const fileName = `经营统计_${getFormattedDateRange()}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// 辅助函数：获取格式化后的日期范围，用于文件命名
const getFormattedDateRange = () => {
  let startDate: Date
  let endDate: Date

  if (selectedViewType.value === 'daily') {
    startDate = new Date(dateValue.value!)
    endDate = new Date(dateValue.value!)
  } else if (selectedViewType.value === 'weekly') {
    const selectedDate = new Date(dateValue.value!)
    const day = selectedDate.getDay()
    startDate = new Date(selectedDate)
    startDate.setDate(selectedDate.getDate() - day)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
  } else if (selectedViewType.value === 'monthly') {
    const selectedDate = new Date(dateValue.value!)
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    startDate = new Date(year, month, 1)
    endDate = new Date(year, month + 1, 0)
  } else if (selectedViewType.value === 'custom') {
    startDate = new Date(dateRange.value[0]!)
    endDate = new Date(dateRange.value[1]!)
  } else {
    return '未知日期'
  }

  const format = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = (`0${date.getMonth() + 1}`).slice(-2)
    const dd = (`0${date.getDate()}`).slice(-2)
    return `${yyyy}-${mm}-${dd}`
  }

  return `${format(startDate)}_至_${format(endDate)}`
}

// 监听视图类型和日期的变化
watch(
  [selectedViewType, dateValue, dateRange],
  () => {
    fetchData()
  },
  { immediate: true }
)

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <!-- 视图类型选择和日期选择器 -->
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
        ></el-date-picker>
        <el-date-picker
          v-else-if="selectedViewType === 'weekly'"
          v-model="dateValue"
          type="week"
          placeholder="选择周"
        ></el-date-picker>
        <el-date-picker
          v-else-if="selectedViewType === 'monthly'"
          v-model="dateValue"
          type="month"
          placeholder="选择月"
        ></el-date-picker>
        <el-date-picker
          v-else-if="selectedViewType === 'custom'"
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-col>
    </el-row>

    <!-- 导出按钮 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="24" style="text-align: right;">
        <el-button type="primary" @click="exportToExcel">导出Excel</el-button>
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

    <!-- 场景订单统计：表格 -->
    <div style="margin-top: 20px;">
      <h3>不同场景订单统计</h3>
      <el-table :data="sceneOrderStats" style="width: 100%;">
        <el-table-column prop="scene" label="场景" />
        <el-table-column prop="count" label="订单数" />
        <el-table-column prop="turnover" label="营业额" />
      </el-table>
    </div>

    <!-- 学校订单统计：表格 -->
    <div style="margin-top: 20px;">
      <h3>定时达客户类型（按学校分类）</h3>
      <el-table :data="schoolOrderStats" style="width: 100%;">
        <el-table-column prop="school" label="学校" />
        <el-table-column prop="count" label="订单数" />
        <el-table-column prop="turnover" label="营业额" />
      </el-table>
    </div>

    <!-- 商品销售图表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <div id="product-sales-chart" style="width: 100%; height: 600px;"></div>
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
