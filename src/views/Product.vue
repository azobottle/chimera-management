<script setup lang="ts">
import { defineComponent, ref, onMounted, computed} from 'vue';
import { getAllProducts, getAllProductCates, getAllProductOptions, updateProduct } from '../client/services.gen';
import type { Product, ProductOption } from '../client/types.gen';
import type { ProductCate } from '../client/types.gen';
import { ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';
const products = ref<Product[]>([]);
const productCategories = ref<Map<string, string>>(new Map());
const productOptions = ref<Map<string, ProductOption>>(new Map());
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const productToDelete = ref<Product | null>(null);
const editableProduct = ref<Product | null>(null);
const test = ref(1111)
const fetchProducts = async () => {
  console.log(test)
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

const openEditDialog = (product: Product) => {
  editableProduct.value = {
    ...product,
    cateId: productCategories.value.get(product.cateId) || '' // 显示对应的 title
  };
  isEditDialogVisible.value = true;
};


const saveProductChanges = async () => {
  if (!editableProduct.value) return;
  isSaving.value = true;
  try {
    console.log(editableProduct.value.cateId)
    // Find the cateId by matching the selected title (second value)
    // const cateId = Array.from(productCategories.value.entries())
    //   .find(([_, title]) => title[1] === editableProduct.value.cateId)?.[0] || '';
    const updatedProduct = { ...editableProduct.value};
    console.log(updatedProduct)
    // Save the updated product with the found cateId
    await updateProduct({
      body: updatedProduct
    });

    // Refresh product list
    await fetchProducts();
    isEditDialogVisible.value = false;
  } catch (error) {
    console.error('Error updating product:', error);
  } finally {
    isSaving.value = false;
  }
};



</script>


<template>
  <div>
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

    <!-- Edit Product Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" title="编辑商品">
      <el-form :model="editableProduct" label-width="120px">
        <el-form-item label="名称">
          <el-input v-model="editableProduct.name" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input type="number" v-model.number="editableProduct.price" />
        </el-form-item>



        <el-form-item label="分类">
          <el-select v-model="editableProduct.cateId" placeholder="请选择分类">
            <el-option v-for="(title, id) in productCategories" :key="id" :label="title[1]" :value="title[0]" />
          </el-select>
        </el-form-item>



        <el-form-item label="简介">
          <el-input v-model="editableProduct.short_desc" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="editableProduct.describe" />
        </el-form-item>
        <!-- Add other fields as necessary -->
      </el-form>
      <template #footer>
        <el-button type="primary" @click="saveProductChanges" :loading="isSaving">编辑</el-button>
        <el-button @click="isEditDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>



<style scoped>
/* Add any additional styles here */
</style>
