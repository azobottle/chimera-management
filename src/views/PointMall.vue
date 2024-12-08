<!-- PointsProductManagement.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  uploadImagePointsProduct,
  getAllPointsProductsShop,
  updatePointsProduct,
  createPointsProduct,
  getAllPointsProductIns,
  setPointsProductAsReceived,
} from '../client/services.gen';
import type { PointsProduct, PointsProductIns } from '../client/types.gen';
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
  ElUpload,
  ElRadioGroup,
  ElRadio,
  ElTabs,
  ElTabPane,
} from 'element-plus';

const products = ref<PointsProduct[]>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const productToDelete = ref<PointsProduct | null>(null);
const editableProduct = ref<PointsProduct | null>(null);

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isCreating = ref(false);

// Pagination variables
const currentPage = ref(1);
const pageSize = ref(10);

// Computed property for paginated products
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProducts.value.slice(start, end);
});

// Search-related variables
const searchQuery = ref({
  name: '',
  status: '',
});

const resetFilters = () => {
  searchQuery.value = { name: '', status: '' };
  currentPage.value = 1; // Reset to first page after resetting
};

// Computed property for filtered products
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesName =
      searchQuery.value.name === '' ||
      product.name?.includes(searchQuery.value.name);
    const matchesStatus =
      searchQuery.value.status === '' ||
      product.status?.toString() === searchQuery.value.status;
    return matchesName && matchesStatus && product.delete !== 1;
  });
});

const openEditDialog = (product: PointsProduct) => {
  editableProduct.value = { ...product };
  imageFile.value = null;
  imagePreview.value = product.imgURL || null;
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const saveProductChanges = async () => {
  if (!editableProduct.value) return;

  isSaving.value = true;
  let imageFilename = editableProduct.value.imgURL || '';

  try {
    if (imageFile.value) {
      try {
        const imageResponse = await uploadImagePointsProduct({
          body: {
            image: imageFile.value,
          },
        });
        imageFilename = imageResponse.data;
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }

    if (imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop()!;
    }

    editableProduct.value.imgURL = imageFilename;

    if (isCreating.value) {
      await createPointsProduct({
        body: editableProduct.value,
      });
      ElMessage.success('积分商品创建成功');
    } else {
      await updatePointsProduct({
        body: editableProduct.value,
        method: 'PUT',
        throwOnError: true,
      });
      ElMessage.success('积分商品更新成功');
    }

    await fetchProducts();
    isEditDialogVisible.value = false;
  } catch (error) {
    console.error('Error saving product:', error);
    ElMessage.error('保存积分商品失败');
  } finally {
    isSaving.value = false;
  }
};

const fetchProducts = async () => {
  try {
    const response = await getAllPointsProductsShop();
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

onMounted(async () => {
  try {
    await fetchProducts();
    await fetchProductIns(); // Fetch product instances as well
  } catch (error) {
    console.error('Error during onMounted:', error);
  }
});

const getStatusLabel = (status: number) => {
  return status === 1 ? '上架' : '下架';
};

const confirmDelete = (product: PointsProduct) => {
  productToDelete.value = product;
  isDeleteDialogVisible.value = true;
};

const deleteProduct = async () => {
  if (!productToDelete.value) return;
  isDeleting.value = true;
  try {
    let imageFilename = productToDelete.value.imgURL;

    if (imageFilename && imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop();
    }
    const updatedProduct = {
      ...productToDelete.value,
      delete: 1,
      status: 0,
      imgURL: imageFilename,
    };
    await updatePointsProduct({ body: updatedProduct });
    await fetchProducts();
    isDeleteDialogVisible.value = false;
  } catch (error) {
    console.error('Error deleting product:', error);
  } finally {
    isDeleting.value = false;
  }
};

const openCreateDialog = () => {
  editableProduct.value = {
    name: '',
    describe: '',
    costPoints: 0,
    status: 1,
    imgURL: '',
    redeemedNum: 0,
  };
  imageFile.value = null;
  imagePreview.value = null;
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const onImageChange = (file: any) => {
  if (file && file.raw) {
    imageFile.value = file.raw;
    imagePreview.value = URL.createObjectURL(imageFile.value);
  } else {
    console.error('No file selected');
  }
};

// Function to format date without date-fns
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Points Product Instances Management
const productInsList = ref<PointsProductIns[]>([]);
const currentInsPage = ref(1);
const insPageSize = ref(10);

const paginatedProductIns = computed(() => {
  const start = (currentInsPage.value - 1) * insPageSize.value;
  const end = start + insPageSize.value;
  return filteredProductIns.value.slice(start, end);
});

const insSearchQuery = ref({
  name: '',
  userId: '',
  received: '',
});

const resetInsFilters = () => {
  insSearchQuery.value = { name: '', userId: '', received: '' };
  currentInsPage.value = 1; // Reset to first page after resetting
};

const filteredProductIns = computed(() => {
  return productInsList.value.filter((ins) => {
    const matchesName =
      insSearchQuery.value.name === '' ||
      ins.name?.includes(insSearchQuery.value.name);
    const matchesUserId =
      insSearchQuery.value.userId === '' ||
      ins.userId?.includes(insSearchQuery.value.userId);
    const matchesReceived =
      insSearchQuery.value.received === '' ||
      ins.received?.toString() === insSearchQuery.value.received;
    return matchesName && matchesUserId && matchesReceived;
  });
});

const fetchProductIns = async () => {
  try {
    const response = await getAllPointsProductIns();
    productInsList.value = response.data;
  } catch (error) {
    console.error('Error fetching product instances:', error);
  }
};

const setProductInsAsReceived = async (ins: PointsProductIns) => {
  try {
    await setPointsProductAsReceived({
      query: {
        uuid: ins.uuid,
        userId: ins.userId
      },
    });
    ElMessage.success('已设置为已领取');
    await fetchProductIns();
  } catch (error) {
    console.error('Error setting product instance as received:', error);
    ElMessage.error('设置领取状态失败');
  }
};

const copyMailInfo = (ins: PointsProductIns) => {
  const mailInfo = `姓名：${ins.name}\n地址：${ins.sendAddr}\n电话：${ins.number}`;
  navigator.clipboard.writeText(mailInfo).then(
    () => {
      ElMessage.success('邮寄信息已复制到剪切板');
    },
    (err) => {
      console.error('Failed to copy text: ', err);
      ElMessage.error('复制失败');
    }
  );
};

const activeTab = ref('productManagement');
</script>

<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="积分商品管理" name="productManagement">
        <!-- Existing Points Product Management code -->
        <h3>搜索</h3>

        <el-form inline>
          <el-form-item label="商品名称">
            <el-input v-model="searchQuery.name" placeholder="输入商品名称"></el-input>
          </el-form-item>

          <el-form-item label="状态">
            <el-select
              v-model="searchQuery.status"
              placeholder="选择状态"
              style="width: 100pt;"
            >
              <el-option label="上架" value="1" />
              <el-option label="下架" value="0" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>

        <el-button type="primary" @click="openCreateDialog">创建积分商品</el-button>

        <h1>积分商品列表</h1>

        <el-table :data="paginatedProducts" stripe>
          <el-table-column prop="imgURL" label="图片" width="160px">
            <template #default="{ row }">
              <img
                :src="row.imgURL"
                alt="Product Image"
                v-if="row.imgURL"
                style="width: 100px; height: auto;"
              />
            </template>
          </el-table-column>

          <el-table-column label="商品信息" width="200px">
            <template #default="{ row }">
              <div>
                <div style="font-weight: bold;">{{ row.name }}</div>
                <div>所需积分: {{ row.costPoints }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="描述">
            <template #default="{ row }">
              <div>{{ row.describe }}</div>
            </template>
          </el-table-column>

          <el-table-column label="已兑换数量">
            <template #default="{ row }">
              <div>{{ row.redeemedNum }}</div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100px">
            <template #default="{ row }">
              <span>{{ getStatusLabel(row.status) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200px">
            <template #default="{ row }">
              <el-button type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button type="danger" @click="confirmDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination Component -->
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredProducts.length"
          layout="prev, pager, next"
        />

        <!-- Delete Confirmation Dialog -->
        <el-dialog v-model="isDeleteDialogVisible" width="30%" title="确认删除">
          <span>是否确认删除该积分商品？</span>
          <template #footer>
            <el-button type="primary" @click="deleteProduct" :loading="isDeleting"
              >是</el-button
            >
            <el-button @click="isDeleteDialogVisible = false">否</el-button>
          </template>
        </el-dialog>

        <!-- Create/Edit Product Dialog -->
        <el-dialog v-model="isEditDialogVisible" width="50%" title="编辑积分商品">
          <el-form v-if="editableProduct" :model="editableProduct">
            <el-form-item label="商品名称">
              <el-input v-model="editableProduct.name"></el-input>
            </el-form-item>

            <el-form-item label="所需积分">
              <el-input type="number" v-model.number="editableProduct.costPoints" />
            </el-form-item>

            <el-form-item label="描述">
              <el-input type="textarea" v-model="editableProduct.describe" />
            </el-form-item>

            <el-form-item label="已兑换数量">
              <el-input type="number" v-model.number="editableProduct.redeemedNum" disabled />
            </el-form-item>

            <el-form-item label="商品状态">
              <el-radio-group v-model="editableProduct.status">
                <el-radio :label="1">上架</el-radio>
                <el-radio :label="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="上传图片">
              <img
                :src="imagePreview"
                v-if="imagePreview"
                style="width: 100px; height: auto; margin-right: 10px;"
              />
              <el-upload
                action=""
                :file-list="[]"
                :on-change="onImageChange"
                :show-file-list="false"
                :auto-upload="false"
              >
                <el-button type="primary">选择图片</el-button>
              </el-upload>
              <div
                style="color: #f56c6c; font-size: 12px; margin-top: 5px; width: 100%;"
              >
                图片文件名禁止使用中文
              </div>
            </el-form-item>
          </el-form>

          <template #footer>
            <el-button
              type="primary"
              @click="saveProductChanges"
              :loading="isSaving"
              >保存</el-button
            >
            <el-button @click="isEditDialogVisible = false">取消</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="积分商品发放" name="productDistribution">
        <h3>搜索</h3>

        <el-form inline>
          <el-form-item label="商品名称">
            <el-input v-model="insSearchQuery.name" placeholder="输入商品名称"></el-input>
          </el-form-item>

          <el-form-item label="用户ID">
            <el-input v-model="insSearchQuery.userId" placeholder="输入用户ID"></el-input>
          </el-form-item>

          <el-form-item label="领取状态">
            <el-select
              v-model="insSearchQuery.received"
              placeholder="选择领取状态"
              style="width: 100pt;"
            >
              <el-option label="未领取" value="0" />
              <el-option label="已领取" value="1" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button @click="resetInsFilters">重置</el-button>
          </el-form-item>
        </el-form>

        <h1>已兑换积分商品列表</h1>

        <el-table :data="paginatedProductIns" stripe>
          <el-table-column prop="uuid" label="兑换编号" width="200px" />

          <el-table-column prop="name" label="商品名称" />

          <el-table-column prop="userId" label="用户ID" />

          <el-table-column label="领取方式">
            <template #default="{ row }">
              <span>{{ row.sendType === 0 ? '自提' : '邮递' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="邮递信息">
            <template #default="{ row }">
              <div v-if="row.sendType === 1">
                <div>姓名：{{ row.sendName }}</div>
                <div>地址：{{ row.sendAddr }}</div>
                <div>电话：{{ row.sendNum }}</div>
              </div>
              <div v-else>无</div>
            </template>
          </el-table-column>

          <el-table-column label="领取状态">
            <template #default="{ row }">
              <span>{{ row.received === 1 ? '已领取' : '未领取' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200px">
            <template #default="{ row }">
              <el-button
                v-if="row.received === 0"
                type="primary"
                @click="setProductInsAsReceived(row)"
              >
                发放
              </el-button>
              <el-button
                v-if="row.sendType === 1"
                type="success"
                @click="copyMailInfo(row)"
              >
                复制邮寄信息
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination Component -->
        <el-pagination
          v-model:current-page="currentInsPage"
          :page-size="insPageSize"
          :total="filteredProductIns.length"
          layout="prev, pager, next"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
/* 可根据需要添加自定义样式 */
</style>
