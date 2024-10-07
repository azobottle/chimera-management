<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  getAllOrders,
  getAllProducts,
  createOrderInStore,
  getAllProductOptions,
  supplyOrder,
  refundOrder,
} from '../client/services.gen';
import type { Order, Product, OptionValue, ProductOption } from '../client/types.gen';
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElPagination,
  ElDatePicker,
  ElRadioGroup,
  ElRadio,
  ElRow,
  ElCol,
} from 'element-plus';

// 订单数据
const orders = ref<Order[]>([]);
const productOptions = ref<Map<string, ProductOption>>(new Map());

// 分页相关的变量
const currentPage = ref(1); // 当前页码
const pageSize = ref(5); // 每页展示的订单数量

// 定义枚举选项
const stateOptions = [
  { label: '已支付', value: '已支付' },
  { label: '待出餐', value: '待出餐' },
  { label: '正常结束', value: '正常结束' },
  { label: '异常结束', value: '异常结束' },
];

const customerTypeOptions = [
  { label: '北大学生业务', value: '北大学生业务' },
  { label: '清华学生业务', value: '清华学生业务' },
  { label: '未认证为学生身份的用户业务', value: '未认证为学生身份的用户业务' },
];

const sceneOptionsSearch = [
  { label: '堂食', value: '堂食' },
  { label: '外带', value: '外带' },
  { label: '定时达', value: '定时达' },
];

const sceneOptions = [
  { label: '堂食', value: '堂食' },
  { label: '外带', value: '外带' },
];

const getDefaultStartTime = () => {
  const date = new Date();
  date.setDate(date.getDate() - 3);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDefaultEndTime = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};


// 搜索相关
const searchQuery = ref({
  orderId: '',
  userId: '',
  orderNum: '',
  startTime: getDefaultStartTime(),
  endTime: getDefaultEndTime(),
  state: '',
  customerType: '',
  scene: '',
  school: '',
  address: '',
  time: '',
});


// 重置搜索条件
const resetFilters = () => {
  searchQuery.value = {
    orderId: '',
    userId: '',
    orderNum: '',
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
    state: '',
    customerType: '',
    scene: '',
    school: '',
    address: '',
    time: '',
  };
  currentPage.value = 1; // 重置为第一页
  fetchOrders(); // 重新获取订单数据
};


// 过滤后的订单列表
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesOrderNum =
      searchQuery.value.orderNum === '' ||
      order.orderNum?.toString().includes(searchQuery.value.orderNum);
    const matchesOrderId =
      searchQuery.value.orderId === '' ||
      order.id?.toString().includes(searchQuery.value.orderId);
    const matchesUserId =
      searchQuery.value.userId === '' ||
      order.userId?.toString().includes(searchQuery.value.userId);

    const matchesState =
      searchQuery.value.state === '' || order.state === searchQuery.value.state;
    const matchesCustomerType =
      searchQuery.value.customerType === '' ||
      order.customerType === searchQuery.value.customerType;
    const matchesScene =
      searchQuery.value.scene === '' || order.scene === searchQuery.value.scene;

    return (
      matchesOrderNum &&
      matchesOrderId &&
      matchesUserId &&
      matchesState &&
      matchesCustomerType &&
      matchesScene
    );
  });
});

// 计算分页后的订单列表
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

// 获取订单数据
const fetchOrders = async () => {
  try {
    let startTime = searchQuery.value.startTime || getDefaultStartTime();
    let endTime = searchQuery.value.endTime || getDefaultEndTime();

    // 确保开始时间为当天的 00:00:00，结束时间为当天的 23:59:59
    startTime = new Date(startTime);
    startTime.setHours(0, 0, 0, 0);

    endTime = new Date(endTime);
    endTime.setHours(23, 59, 59, 999);

    const response = await getAllOrders({
      query: {
        startTime: formatDate(startTime),
        endTime: formatDate(endTime),
      },
    });
    orders.value = response.data;

    console.log("Orders:", orders.value)

    // 处理订单数据（如添加商品名称等）
    orders.value.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.productId) {
          const product = productOptionsList.value.find((p) => p.id === item.productId);
          if (product) {
            item.name = product.name || '未知产品';
          } else {
            item.name = '未知产品';
          }
        }
      });
    });
  } catch (error) {
    console.error('获取订单数据时出错:', error);
    ElMessage.error('获取订单数据时出错'+error);
  }
};

const fetchAllProductOptions = async () => {
  try {
    const response = await getAllProductOptions();
    const options: ProductOption[] = response.data;
    const optionMap = new Map<string, ProductOption>();
    options.forEach((option) => {
      if (option.id) {
        optionMap.set(option.id.toString(), option);
      }
    });
    productOptions.value = optionMap;
  } catch (error) {
    console.error('Error fetching product options:', error);
    ElMessage.error('Error fetching product options:'+error);
  }
};

// 页面挂载时获取订单数据
onMounted(async () => {
  try {
    await fetchProducts();
    await fetchOrders();
    await fetchAllProductOptions();
  } catch (error) {
    console.error('获取订单数据时出错:', error);
    ElMessage.error('获取订单数据时出错:'+error);
  }
});

// 日期格式化函数
const formatDate = (date: Date) => {
  // 格式化日期为 'yyyy-MM-ddTHH:mm:ss'
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const showDate = (row: any): string => {
    const cellValue = row.createdAt;
    if (!cellValue) return '';

    try {
        // 解析ISO字符串到Date对象
        const date = new Date(cellValue);
        if (isNaN(date.getTime())) {
            // 无效日期，返回空字符串
            return '';
        }

        // 提取日期组件
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        // 返回格式化后的日期
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        // 捕获异常并返回空字符串
        return '';
    }
};




// 新建订单对话框状态
const newOrderDialogVisible = ref(false);

// 新建订单表单数据
interface NewOrderProduct {
  productId: string | null;
  selectedOptions: Record<string, string | null>;
  availableOptions: Record<string, OptionValue[]>;
  name: string | null;
}

const newOrderForm = ref({
  products: [] as NewOrderProduct[],
  scene: '',
});

// 所有产品列表
const productOptionsList = ref<Product[]>([]);

// 获取所有产品
const fetchProducts = async () => {
  try {
    const productResponse = await getAllProducts();
    productOptionsList.value = productResponse.data;
  } catch (error) {
    console.error('获取产品数据时出错:', error);
    ElMessage.error('获取产品数据时出错'+ error);
  }
};

// 打开新建订单对话框时获取产品数据
const openNewOrderDialog = async () => {
  try {
    // 初始化新订单表单
    newOrderForm.value = {
      products: [],
      scene: '',
    };
    newOrderDialogVisible.value = true;
  } catch (error) {
    console.error('打开新建订单对话框时出错:', error);
    ElMessage.error('打开新建订单对话框时出错:'+ error);
  }
};

// 添加一个新的产品到订单中
const addProduct = () => {
  newOrderForm.value.products.push({
    productId: null,
    selectedOptions: {},
    availableOptions: {},
    name: null,
  });
};

// 删除订单中的某个产品
const removeProduct = (index: number) => {
  newOrderForm.value.products.splice(index, 1);
};

// 处理产品选择变化
const handleProductChange = (product: NewOrderProduct) => {
  const selectedProduct = productOptionsList.value.find((p) => p.id === product.productId);
  if (selectedProduct) {
    product.name = selectedProduct.name || '未知产品';
  }

  if (selectedProduct && selectedProduct.productOptions) {
    const availableOptionsByName: { [key: string]: Array<OptionValue> } = {};

    for (const id in selectedProduct.productOptions) {
      if (selectedProduct.productOptions.hasOwnProperty(id)) {
        const option = productOptions.value.get(id);
        if (option && option.name) {
          availableOptionsByName[option.name] = selectedProduct.productOptions[id];
        } else {
          console.warn(`找不到 id 为 ${id} 的 ProductOption 或缺少 name 属性`);
        }
      }
    }

    product.availableOptions = availableOptionsByName;

    // 初始化 selectedOptions，使用 name 作为键
    product.selectedOptions = {};
    for (const name in availableOptionsByName) {
      if (availableOptionsByName.hasOwnProperty(name)) {
        product.selectedOptions[name] = null;
      }
    }
  } else {
    product.availableOptions = {};
    product.selectedOptions = {};
  }
};

// 搜索产品的方法
const fetchProductOptions = (query: string) => {
  if (query !== '') {
    productOptionsList.value = productOptionsList.value.filter((product) =>
      product.name?.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// 提交新订单
const submitNewOrder = async () => {
  // 验证表单
  if (!newOrderForm.value.scene) {
    ElMessage.error('请选择场景');
    return;
  }

  if (newOrderForm.value.products.length === 0) {
    ElMessage.error('请至少添加一个商品');
    return;
  }

  for (const [index, product] of newOrderForm.value.products.entries()) {
    if (!product.productId) {
      ElMessage.error(`第 ${index + 1} 个商品未选择`);
      return;
    }
    // 验证所有选项是否已选择
    for (const key in product.availableOptions) {
      if (product.availableOptions.hasOwnProperty(key)) {
        if (!product.selectedOptions[key]) {
          ElMessage.error(`第 ${index + 1} 个商品的选项 "${key}" 未选择`);
          return;
        }
      }
    }
  }

  // 构建符合 Order 类型的订单数据
  const orderData: Order = {
    userId: '66f157e249b56d25d48bf329', // 设置固定的用户ID
    scene: newOrderForm.value.scene,
    customerType: '未认证为学生身份的用户业务',
    items: newOrderForm.value.products.map((product) => {
      const selectedOptions: Record<string, string> = {};
      for (const key in product.selectedOptions) {
        if (product.selectedOptions.hasOwnProperty(key)) {
          selectedOptions[key] = product.selectedOptions[key] as string;
        }
      }
      return {
        productId: product.productId,
        optionValues: selectedOptions,
        name: product.name, // 添加 name 字段
      };
    }),
  };

  // 替换 optionValues 中的 uuid 为 OptionValue 对象
  for (const item of orderData.items || []) {
    const optionValuesWithDetails: Record<string, OptionValue> = {};
    for (const optionKey in item.optionValues) {
      if (item.optionValues.hasOwnProperty(optionKey)) {
        const uuid = item.optionValues[optionKey];
        // 在 productOptions 中找到对应的 OptionValue 对象
        for (const [optionId, option] of productOptions.value) {
          const optionValue = option.values.find((v) => v.uuid === uuid);
          if (optionValue) {
            optionValuesWithDetails[optionKey] = optionValue;
            break;
          }
        }
      }
    }
    // 将 optionValues 替换为完整的 OptionValue 对象
    item.optionValues = optionValuesWithDetails;
  }

  try {
    await createOrderInStore({
      body: orderData,
    });
    ElMessage.success('订单创建成功');
    newOrderDialogVisible.value = false;
    await fetchOrders(); // 刷新订单列表
  } catch (error) {
    console.error('创建订单时出错:', error);
    ElMessage.error('创建订单时出错'+ error);
  }
};

// 新增供餐和退款处理函数
const handleSupplyOrder = async (order: Order) => {
  try {
    await supplyOrder({ body: order });
    ElMessage.success('供餐成功');
    await fetchOrders(); // 刷新订单列表
  } catch (error) {
    console.error('供餐时出错:', error);
    ElMessage.error('供餐时出错' + error);
  }
};

const handleRefundOrder = async (order: Order) => {
  try {
    await refundOrder({ body: order });
    ElMessage.success('退款成功');
    await fetchOrders(); // 刷新订单列表
  } catch (error) {
    console.error('退款时出错:', error);
    ElMessage.error('退款时出错'+ error);
  }
};

const refundDialogVisible = ref(false);
const currentOrder = ref<Order | null>(null);
const merchantNote = ref('');

// Open the refund confirmation dialog
const openRefundDialog = (order: Order) => {
  currentOrder.value = order;
  merchantNote.value = ''; // Clear the note input
  refundDialogVisible.value = true;
};

// Confirm the refund action
const confirmRefund = async () => {
  if (!currentOrder.value) return;
  
  try {
    currentOrder.value.merchantNote = merchantNote.value; // Add the merchant note to the order
    await refundOrder({ body: currentOrder.value });
    ElMessage.success('退款成功');
    refundDialogVisible.value = false;
    await fetchOrders(); // Refresh the order list
  } catch (error) {
    console.error('退款时出错:', error);
    ElMessage.error('退款时出错'+error);
  }
};



</script>


<template>
  <div>
    <h3>搜索订单</h3>

    <el-form :inline="false" :model="searchQuery" class="search-form">
      <!-- 第一行：订单ID、用户ID、开始时间、结束时间 -->
      <div class="form-row">
        <el-form-item label="订单ID">
          <el-input v-model="searchQuery.orderId" placeholder="输入订单ID"></el-input>
        </el-form-item>

        <el-form-item label="用户ID">
          <el-input v-model="searchQuery.userId" placeholder="输入用户ID"></el-input>
        </el-form-item>

        <el-form-item label="开始时间">
          <el-date-picker
            v-model="searchQuery.startTime"
            type="date"
            placeholder="选择开始日期"
            clearable
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="结束时间">
          <el-date-picker
            v-model="searchQuery.endTime"
            type="date"
            placeholder="选择结束日期"
            clearable
          ></el-date-picker>
        </el-form-item>
      </div>

      <!-- 第二行：订单号、状态、客户类型、场景、重置、新建订单 -->
      <div class="form-row">
        <el-form-item label="订单号">
          <el-input v-model="searchQuery.orderNum" placeholder="输入订单号"></el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchQuery.state" placeholder="选择状态" clearable style="width: 150px;">
            <el-option
              v-for="option in stateOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="客户类型">
          <el-select
            v-model="searchQuery.customerType"
            placeholder="选择客户类型"
            clearable
            style="width: 200px;"
          >
            <el-option
              v-for="option in customerTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="场景">
          <el-select v-model="searchQuery.scene" placeholder="选择场景" clearable style="width: 150px;">
            <el-option
              v-for="option in sceneOptionsSearch"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>

        <!-- 新增“新建订单”按钮 -->
        <el-form-item>
          <el-button type="primary" @click="openNewOrderDialog">新建订单</el-button>
        </el-form-item>
      </div>

      <!-- 第三行：定时达学校、地址、时间 -->
      <div class="form-row">
        <el-form-item label="定时达学校">
          <el-input v-model="searchQuery.school" placeholder="输入定时达学校"></el-input>
        </el-form-item>

        <el-form-item label="定时达地址">
          <el-input v-model="searchQuery.address" placeholder="输入定时达地址"></el-input>
        </el-form-item>

        <el-form-item label="定时达时间">
          <el-input v-model="searchQuery.time" placeholder="输入定时达时间"></el-input>
        </el-form-item>
      </div>
    </el-form>

    <h1>订单列表</h1>

    <el-table :data="paginatedOrders" stripe>
      <el-table-column prop="orderNum" label="订单号" width="70" />
      <el-table-column prop="state" label="状态" width="70px" />
      <el-table-column type="expand" label="商品" width="70px">
        <template #default="props">
          <el-table :data="props.row.items" size="small" border>
            <el-table-column prop="name" label="商品名称" width="180px" />
            <el-table-column label="选项" width="300px">
              <template #default="itemScope">
                <div v-for="(option, key) in itemScope.row.optionValues" :key="option.uuid">
                  <strong>{{ key }}:</strong> {{ option.value }}
                  ({{ option.priceAdjustment ? '+' + option.priceAdjustment : '0' }})
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="100px" />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="customerType" label="客户类型" width="210px" />
      <el-table-column prop="scene" label="场景" width="70px" />

      <el-table-column prop="deliveryInfo.school" label="定时达学校" width="100px" />
      <el-table-column prop="deliveryInfo.address" label="定时达地址" width="200px" />
      <el-table-column prop="deliveryInfo.time" label="定时达时间" width="200px" />

      <el-table-column prop="createdAt" label="创建时间" width="200px" :formatter="showDate" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
            v-if="scope.row.state === '待出餐'"
            type="primary"
            size="small"
            @click="handleSupplyOrder(scope.row)"
          >
            供餐
          </el-button>
          <!-- Show the refund button only if the order is not already refunded -->
          <el-button 
            v-if="scope.row.state !== '已退款'"
            type="danger" 
            size="small" 
            @click="openRefundDialog(scope.row)"
          >
            退款
          </el-button>
        </template>
    </el-table-column>

    </el-table>

    <!-- Refund Confirmation Dialog -->
    <el-dialog title="确认退款" v-model="refundDialogVisible">
      <span>请输入商家备注进行确认：</span>
      <el-input type="textarea" v-model="merchantNote" placeholder="请输入商家备注"></el-input>
      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRefund">确认</el-button>
      </template>
    </el-dialog>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredOrders.length"
      layout="prev, pager, next, jumper, ->, total"
      style="margin-top: 20px; text-align: right;"
    />

    <!-- 新建订单对话框 -->
    <el-dialog title="新建订单" v-model="newOrderDialogVisible" width="60%">
      <el-form :model="newOrderForm" label-width="120px">
        <!-- 产品选择部分 -->
        <el-form-item label="商品">
          <el-button type="primary" @click="addProduct">添加商品</el-button>
        </el-form-item>

        <!-- 动态添加的商品列表 -->
        <div
          v-for="(product, index) in newOrderForm.products"
          :key="index"
          class="product-item"
        >
          <el-row :gutter="20" align="middle">
            <el-col :span="7">
              <el-form-item label="选择商品">
                <el-select
                  v-model="product.productId"
                  filterable
                  remote
                  remote-method="fetchProductOptions"
                  placeholder="请选择商品"
                  @change="handleProductChange(product)"
                  style="width: 150px;"
                >
                  <el-option
                    v-for="item in productOptionsList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="选择选项">
                <div
                  v-for="(options, key) in product.availableOptions"
                  :key="key"
                  class="option-group"
                  style="width: 100%;"
                >
                  <span>{{ key }}:</span>
                  <el-radio-group v-model="product.selectedOptions[key]">
                    <el-radio v-for="option in options" :key="option.value" :label="option.uuid">
                      {{ option.value }}
                      ({{ option.priceAdjustment ? '+' + option.priceAdjustment + '￥' : '0' }})
                    </el-radio>
                  </el-radio-group>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-button type="danger" @click="removeProduct(index)">删除</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 场景选择 -->
        <el-form-item label="场景">
          <el-select v-model="newOrderForm.scene" placeholder="选择场景" clearable style="width: 150px;">
            <el-option
              v-for="option in sceneOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="newOrderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNewOrder">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>


<style scoped>
.search-form {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 10px;
}

.form-row .el-form-item {
  flex: 1;
  min-width: 200px;
}

.product-item {
  border: 1px solid #ebeef5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.option-group {
  margin-bottom: 10px;
}
</style>
