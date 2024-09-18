<script setup lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { uploadImage, getAllProducts, getAllProductCates, getAllProductOptions, updateProduct, createProduct } from '../client/services.gen';
import type { Product, ProductOption } from '../client/types.gen';
import type { ProductCate } from '../client/types.gen';
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElPagination } from 'element-plus';

const products = ref<Product[]>([]);
const productCategories = ref<Map<string, string>>(new Map());
const productOptions = ref<Map<string, ProductOption>>(new Map());
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const productToDelete = ref<Product | null>(null);
const editableProduct = ref<Product | null>(null);

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isCreating = ref(false);

const selectedOptions = ref<string[]>([]);
const availableOptions = computed(() => {
    const selectedIds = new Set(selectedOptions.value);
  return Array.from(productOptions.value.values()).filter(option => !selectedIds.has(option.id));
});

// 分页相关的变量
const currentPage = ref(1);   // 当前页码
const pageSize = ref(2);      // 每页展示的商品数量

// 计算分页后的商品列表
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProducts.value.slice(start, end);
});

// 搜索相关

const searchQuery = ref({
  name: '',
  cateId: '',
  status: ''
});

const filterProducts = () => {
  currentPage.value = 1; // Reset to first page when searching
};

const resetFilters = () => {
  searchQuery.value = { name: '', cateId: '', status: '' };
  currentPage.value = 1; // Reset to first page after resetting
};

// const filteredProducts = computed(() => {
//   return products.value.filter(product => product.delete !== 1);
// });

// Modify filteredProducts to apply the search criteria
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesName = searchQuery.value.name === '' || product.name.includes(searchQuery.value.name);
    const matchesCate = searchQuery.value.cateId === '' || productCategories.value.get(product.cateId) === searchQuery.value.cateId;
    const matchesStatus = searchQuery.value.status === '' || product.status === searchQuery.value.status;
    return matchesName && matchesCate && matchesStatus && product.delete !== 1;
  });
});




const openEditDialog = (product: Product) => {
  editableProduct.value = {
    ...product,
    cateId: productCategories.value.get(product.cateId) || '',
    productOptionIds: product.productOptionIds || []
  };
  selectedOptions.value = product.productOptionIds || [];
  imageFile.value = null;
  imagePreview.value = product.imgURL || null;
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const saveProductChanges = async () => {
  if (!editableProduct.value) return;

  isSaving.value = true;
  let imageFilename = editableProduct.value.imgURL;

  try {
    if (imageFile.value) {
      const formData = new FormData();
      formData.append('image', imageFile.value);

      try {
        const imageResponse = await uploadImage({
          body: formData
        });
        imageFilename = imageResponse.data;
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }

    if (imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop();
    }

    editableProduct.value.imgURL = imageFilename;
    editableProduct.value.productOptionIds = selectedOptions.value; // Update options

    const cateIdEntry = Array.from(productCategories.value.entries()).find(
      ([id, title]) => title === editableProduct.value.cateId
    );
    if (cateIdEntry) {
      editableProduct.value.cateId = cateIdEntry[0];
    }

    if (isCreating.value) {
      await createProduct({
        body: editableProduct.value
      });
      ElMessage.success('Product created successfully');
    } else {
      await updateProduct({
        body: editableProduct.value,
        method: 'PUT'
      });
      ElMessage.success('Product updated successfully');
    }

    await fetchProducts();
    isEditDialogVisible.value = false;
  } catch (error) {
    console.error('Error saving product:', error);
    ElMessage.error('Failed to save product');
  } finally {
    isSaving.value = false;
  }
};


const fetchProducts = async () => {
  try {
    const productResponse = await getAllProducts();
    products.value = productResponse.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const fetchProductCategories = async () => {
  try {
    const response = await getAllProductCates();
    const categories: ProductCate[] = response.data
      .filter((category: ProductCate) => category.delete === 0) // Filter out deleted categories
      .sort((a: ProductCate, b: ProductCate) => b.priority - a.priority); // Sort by priority
    const categoryMap = new Map<string, string>();
    categories.forEach(category => {
      if (category.id && category.title) {
        categoryMap.set(category.id.toString(), category.title);
      }
    });
    productCategories.value = categoryMap;
  } catch (error) {
    console.error('Error fetching product categories:', error);
  }
};

const fetchProductOptions = async () => {
  try {
    const response = await getAllProductOptions();
    console.log(response)
    const options: ProductOption[] = response.data;
    const optionMap = new Map<string, ProductOption>();
    options.forEach(option => {
      if (option.id) {
        optionMap.set(option.id.toString(), option);
      }
    });
    productOptions.value = optionMap;
  } catch (error) {
    console.error('Error fetching product options:', error);
  }
};

onMounted(async () => {
  try {
    await fetchProducts();
    await fetchProductCategories();
    await fetchProductOptions();
  } catch (error) {
    console.error('Error fetching products:', error);
  }
});


const getCategoryTitle = (cateId: string) => {
  return productCategories.value.get(cateId) || '未知分类';
};

const getStatusLabel = (status: number) => {
  return status === 1 ? '上架' : '下架';
};

const getProductOptionDisplay = (optionId: string) => {
  const option = productOptions.value.get(optionId);
  if (option) {
    const values = option.values?.map(value => value.value).join(', ') || '无';
    return `${option.name}: [${values}]`;
  }
  return '未知选项';
};

const confirmDelete = (product: Product) => {
  productToDelete.value = product;
  isDeleteDialogVisible.value = true;
};

const deleteProduct = async () => {
  if (!productToDelete.value) return;
  isDeleting.value = true;
  try {
    let imageFilename = productToDelete.value.imgURL;

    if (imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop();
    }
    const updatedProduct = { ...productToDelete.value, delete: 1 , imgURL: imageFilename};
    await updateProduct({ body: updatedProduct });
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
    price: 0,
    cateId: '',
    short_desc: '',
    describe: '',
    status: 1,
    imgURL: ''
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

</script>


<template>
  <div>
    <h3>搜索</h3>

    <el-form inline>
      <el-form-item label="名称">
        <el-input v-model="searchQuery.name" placeholder="输入商品名称"></el-input>
      </el-form-item>

      <el-form-item label="分类">
        <el-select v-model="searchQuery.cateId" placeholder="选择分类">
          <el-option
            v-for="(title, id) in productCategories"
            :key="id"
            :label="title[1]"
            :value="title[1]"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="searchQuery.status" placeholder="选择状态">
          <el-option :label="'上架'" :value="1" />
          <el-option :label="'下架'" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="resetFilters">重置</el-button>
      </el-form-item>
    </el-form>
    
    <el-button type="primary" @click="openCreateDialog">创建商品</el-button>

    <h1>商品列表</h1>

    <el-table :data="paginatedProducts" stripe>
      <el-table-column prop="imgURL" label="图片">
        <template #default="{ row }">
          <img :src="row.imgURL" alt="Product Image" v-if="row.imgURL" style="width: 100px; height: auto;" />
        </template>
      </el-table-column>

      <el-table-column label="名称/价格/分类">
        <template #default="{ row }">
          <div>
            <div style="font-weight: bold;">{{ row.name }}</div>
            <div>{{ row.price }}￥</div>
            <div>{{ getCategoryTitle(row.cateId) }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="简介/描述">
        <template #default="{ row }">
          <div>
            <div style="font-style: italic;">{{ row.short_desc }}</div>
            <div>{{ row.describe }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="可选项">
        <template #default="{ row }">
          <div v-if="row.productOptionIds">
            <div v-for="optionId in row.productOptionIds" :key="optionId">
              {{ getProductOptionDisplay(optionId) }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态">
        <template #default="{ row }">
          <span>{{ getStatusLabel(row.status) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="" label="统计" />

      <el-table-column label="编辑">
        <template #default="{ row }">
          <el-button type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredProducts.length"
      layout="prev, pager, next"
    />

    <!-- Delete Confirmation Dialog -->
    <el-dialog v-model="isDeleteDialogVisible" width="30%" title="确认删除">
      <span>是否确认删除该商品？</span>
      <template #footer>
        <el-button type="primary" @click="deleteProduct" :loading="isDeleting">是</el-button>
        <el-button @click="isDeleteDialogVisible = false">否</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit Product Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" title="编辑商品">
      <el-form v-if="editableProduct" :model="editableProduct">
        <el-form-item label="名称">
          <el-input v-model="editableProduct.name"></el-input>
        </el-form-item>
        <el-form-item label="价格">
          <el-input type="number" v-model.number="editableProduct.price" />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="editableProduct.cateId" placeholder="请选择分类">
            <el-option v-for="(title, id) in productCategories" :key="id" :label="title[1]" :value="title[1]" />
          </el-select>
        </el-form-item>

        <el-form-item label="简介">
          <el-input v-model="editableProduct.short_desc" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="editableProduct.describe" />
        </el-form-item>

        <el-form-item label="商品状态">
          <el-radio-group v-model="editableProduct.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="可选项">
          <el-select v-model="selectedOptions" multiple placeholder="请选择可选项">
            <el-option
              v-for="option in availableOptions"
              :key="option.id"
              :value="option.id"
              :label="getProductOptionDisplay(option.id)"
            >
            </el-option>
          </el-select>
        </el-form-item>

          <el-form-item label="上传图片">
          <el-upload action="" :file-list="[]" :on-change="onImageChange" :show-file-list="false">
            <el-button type="primary">选择图片</el-button>
          </el-upload>
            <img :src="imagePreview" v-if="imagePreview" style="width: 100px; height: auto;" />
          </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="saveProductChanges" :loading="isSaving">保存</el-button>
        <el-button @click="isEditDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>



<style scoped>
/* Add any additional styles here */
</style>
