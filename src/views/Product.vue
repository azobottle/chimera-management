<script setup lang="ts">
import { ref, onMounted, computed, Ref } from 'vue';
import { uploadImage, getAllProducts, getAllProductCates, getAllProductOptions, updateProduct, createProduct } from '../client/services.gen';
import type { Product, ProductOption, OptionValue } from '../client/types.gen';
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

const selectedOptionValues: Ref<Record<string, OptionValue[]>> = ref({});
// const selectedOptionValues = ref<{ [key: string]: OptionValue[] }>({});

const newOptionId = ref('');

const availableOptions = computed(() => {
  const selectedOptionIds = Object.keys(editableProduct.value?.productOptions || {});
  return Array.from(productOptions.value.values()).filter(
    option => !selectedOptionIds.includes(option.id!.toString())
  );
});

const getAvailableOptionValues = (optionId: string) => {
  const option = productOptions.value.get(optionId);
  if (!option) return [];
  const selectedValues = new Set(
    (editableProduct.value?.productOptions?.[optionId] || []).map(v => v.uuid)
  );
  return option.values?.filter(value => !selectedValues.has(value.uuid)) || [];
};

const getOptionName = (optionId: string) => {
  const option = productOptions.value.get(optionId);
  return option ? option.name : '未知选项';
};

const addOption = () => {
  if (!newOptionId.value) return;
  if (!editableProduct.value?.productOptions) {
    editableProduct.value!.productOptions = {};
  }
  editableProduct.value!.productOptions[newOptionId.value] = [];
  selectedOptionValues.value[newOptionId.value] = [];
  newOptionId.value = '';
};

const removeOption = (optionId: string) => {
  if (editableProduct.value?.productOptions) {
    delete editableProduct.value.productOptions[optionId];
    delete selectedOptionValues.value[optionId];
  }
};

const onOptionValuesChange = (optionId: string) => {
  if (editableProduct.value?.productOptions) {
    editableProduct.value.productOptions[optionId] = selectedOptionValues.value[optionId];
  }
};

// const selectedOptions = ref<string[]>([]);

// const availableOptions = computed(() => {
//     const selectedIds = new Set(selectedOptions.value);
//   return Array.from(productOptions.value.values()).filter(option => !selectedIds.has(option.id));
// });

// const selectedOptionValues = ref<Map<string, OptionValue[]>>(new Map());

// const availableOptionValues = computed(() => {
//     const selectedIds = new Set(selectedOptions.value);
//   return Array.from(productOptions.value.values()).filter(option => !selectedIds.has(option.id));
// });


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

const resetFilters = () => {
  searchQuery.value = { name: '', cateId: '', status: '' };
  currentPage.value = 1; // Reset to first page after resetting
};

// Modify filteredProducts to apply the search criteria
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesName = searchQuery.value.name === '' || product.name.includes(searchQuery.value.name);
    const matchesCate = searchQuery.value.cateId === '' || productCategories.value.get(product.cateId) === searchQuery.value.cateId;
    const matchesStatus = searchQuery.value.status === '' || product.status === searchQuery.value.status;
    return matchesName && matchesCate && matchesStatus && product.delete !== 1;
  });
});


// const openEditDialog = (product: Product) => {
//   editableProduct.value = {
//     ...product,
//     cateId: productCategories.value.get(product.cateId) || '',
//     productOptionIds: product.productOptionIds || []
//   };
//   selectedOptions.value = product.productOptionIds || [];
//   imageFile.value = null;
//   imagePreview.value = product.imgURL || null;
//   isCreating.value = false;
//   isEditDialogVisible.value = true;
// };

const openEditDialog = (product: Product) => {
  editableProduct.value = {
    ...product,
    cateId: productCategories.value.get(product.cateId!.toString()) || '',
    productOptions: { ...product.productOptions }
  };
  selectedOptionValues.value = {};
  if (product.productOptions) {
    for (const [optionId, values] of Object.entries(product.productOptions)) {
      selectedOptionValues.value[optionId] = [...values];
    }
  }
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
      imageFilename = imageFilename.split('/').pop()!;
    }

    editableProduct.value.imgURL = imageFilename;

    const cateIdEntry = Array.from(productCategories.value.entries()).find(
      ([id, title]) => title === editableProduct.value!.cateId
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
    console.log("products:", products.value)
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
    console.log(productOptions)
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
    const values = option.values
      ?.map(value => `${value.value}:${value.priceAdjustment}￥`)
      .join(', ') || '无';
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

// const openCreateDialog = () => {
//   editableProduct.value = {
//     name: '',
//     price: 0,
//     cateId: '',
//     short_desc: '',
//     describe: '',
//     status: 1,
//     imgURL: ''
//   };
//   imageFile.value = null;
//   imagePreview.value = null;
//   isCreating.value = true;
//   isEditDialogVisible.value = true;
// };


const openCreateDialog = () => {
  editableProduct.value = {
    name: '',
    price: 0,
    cateId: '',
    short_desc: '',
    describe: '',
    status: 1,
    imgURL: '',
    productOptions: {}
  };
  selectedOptionValues.value = {};
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
          <div v-if="row.productOptions">
            <div v-for="(values, optionId) in row.productOptions" :key="optionId">
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

        <el-form-item label="可选项" class="option-container">
          <!-- Loop through each option -->
          <div
            v-for="(values, optionId) in editableProduct.productOptions"
            :key="optionId"
            class="option-item"
          >
            <!-- Wrap each option in its own el-form-item -->
            <el-form-item>
              <!-- Option container with flexbox -->
              <div class="option-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <!-- Display option name -->
                <div style="font-weight: bold;">
                  {{ getOptionName(optionId) }}:
                </div>
                <!-- Button to remove the option, now aligned to the right -->
                <el-button
                  type="danger"
                  size="small"
                  @click="removeOption(optionId)"
                  style="margin-left: auto;"
                >
                  删除该选项
                </el-button>
              </div>

              <!-- Select and add new values -->
              <el-select
                v-model="selectedOptionValues[optionId]"
                multiple
                placeholder="选择值"
                @change="onOptionValuesChange(optionId)"
                collapse-tags
                style="width: 100%;"
              >
                <template v-slot:collapse-tags="{ selected }">
                  <span v-for="(item, index) in selected" :key="item.uuid">
                    <!-- 确保 value 和 priceAdjustment 显示正确 -->
                    {{ item.value }}: {{ item.priceAdjustment || 0 }}
                    <span v-if="index < selected.length - 1">, </span>
                  </span>
                </template>

                <el-option
                  v-for="availableValue in getAvailableOptionValues(optionId)"
                  :key="availableValue.uuid"
                  :label="availableValue.value + ':' + availableValue.priceAdjustment"
                  :value="availableValue"
                />
              </el-select>

            </el-form-item>
          </div>

          <!-- Add new options -->
          <el-form-item>
            <!-- 将标题独占一行 -->
            <div style="font-weight: bold; margin-bottom: 5px; display: block; width: 100%;">
              添加新的选项:
            </div>

            <!-- 选项选择框 -->
            <el-form-item>
              <el-select
                v-model="newOptionId"
                placeholder="选择要添加的选项"
                style="width: 100%;"
              >
                <el-option
                  v-for="option in availableOptions"
                  :key="option.id"
                  :label="option.name"
                  :value="option.id"
                />
              </el-select>
            </el-form-item>

            <!-- 添加按钮，并设置合适的 margin-left -->
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                @click="addOption"
                style="margin-left: 10px;"
              >
                添加选项
              </el-button>
            </el-form-item>
          </el-form-item>
        </el-form-item>

        <el-form-item label="上传图片">
          <img :src="imagePreview" v-if="imagePreview" style="width: 100px; height: auto; margin-right: 10px;" />
        <el-upload action="" :file-list="[]" :on-change="onImageChange" :show-file-list="false">
          <el-button type="primary">选择图片</el-button>
        </el-upload>
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
.option-item {
  display: block;
  width: 100%;
}
/* Add any additional styles here */
</style>
