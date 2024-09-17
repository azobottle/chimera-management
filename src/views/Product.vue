<script setup lang="ts">
import { defineComponent, ref, onMounted, computed} from 'vue';
import { uploadImage, getAllProducts, getAllProductCates, getAllProductOptions, updateProduct, createProduct } from '../client/services.gen';
import type { Product, ProductOption } from '../client/types.gen';
import type { ProductCate } from '../client/types.gen';
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';
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
    const categories: ProductCate[] = response.data;
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

const filteredProducts = computed(() => {
  return products.value.filter(product => product.delete !== 1);
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
    const updatedProduct = { ...productToDelete.value, delete: 1 };
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


const openEditDialog = (product: Product) => {
  editableProduct.value = {
    ...product,
    cateId: productCategories.value.get(product.cateId) || '' // 显示对应的 title
  };
  imageFile.value = null;
  imagePreview.value = product.imgURL || null;
  isCreating.value = false;
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

// Save Product Changes (Create or Update)
const saveProductChanges = async () => {
  if (!editableProduct.value) return;

  isSaving.value = true;
  let imageFilename = editableProduct.value.imgURL;

  try {
    if (imageFile.value) {
      const formData = new FormData();
      formData.append('image', imageFile.value);

      try {
        // 上传图片
        const imageResponse = await uploadImage({
          body: formData,
          // headers: {
          //   'Content-Type': 'multipart/form-data', // 确保请求头为 multipart/form-data
          // },
        });
        imageFilename = imageResponse.data; // 假设响应包含文件名
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }



    if (imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop(); // 取最后一个 '/' 后的部分
    }

    // 设置产品的 imgURL 为图片文件名
    editableProduct.value.imgURL = imageFilename;

    // 将 cateId 从 title 转换为对应的 id
    const cateIdEntry = Array.from(productCategories.value.entries()).find(
      ([id, title]) => title === editableProduct.value.cateId
    );
    if (cateIdEntry) {
      editableProduct.value.cateId = cateIdEntry[0]; // 转换为对应的 id
    }

    console.log(editableProduct.value);

    if (isCreating.value) {
      // 创建产品，直接发送 JSON
      console.log('create product');
      await createProduct({
        body: editableProduct.value
      });
      ElMessage.success('Product created successfully');
    } else {
      // 更新产品，直接发送 JSON
      console.log('update product');
      await updateProduct({
        body: editableProduct.value,
        method: 'PUT'
      });
      ElMessage.success('Product updated successfully');
    }

    await fetchProducts(); // 更新产品列表
    isEditDialogVisible.value = false;
  } catch (error) {
    console.error('Error saving product:', error);
    ElMessage.error('Failed to save product');
  } finally {
    isSaving.value = false;
  }
};





</script>


<template>
  <div>

    <el-button type="primary" @click="openCreateDialog">创建商品</el-button>

    <h1>商品列表</h1>

    <el-table :data="filteredProducts" stripe>
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

    <!-- Delete Confirmation Dialog -->
    <el-dialog v-model="isDeleteDialogVisible" width="30%" title="确认删除">
      <span>是否确认删除该商品？</span>
      <template #footer>
        <el-button type="primary" @click="deleteProduct" :loading="isDeleting">是</el-button>
        <el-button @click="isDeleteDialogVisible = false">否</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit Product Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" title="编辑商品" :before-close="handleDialogClose">
      <el-form v-if="editableProduct" :model="editableProduct" label-width="120px">
        <el-form-item label="名称">
          <el-input v-model="editableProduct.name" />
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
      
        <div style="display: flex; align-items: center; gap: 20px;">
          <!-- 图片上传按钮 -->
          <el-upload
            ref="uploadRef"
            list-type="picture"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onImageChange"
          >
            <el-button type="primary">选择图片</el-button>
          </el-upload>

          <!-- 图片预览 -->
          <div v-if="imagePreview" style="border: 1px solid #dcdcdc; padding: 5px; border-radius: 8px;">
            <img :src="imagePreview" alt="Image Preview" style="width: 100px; height: auto; object-fit: cover;" />
          </div>
        </div>

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
