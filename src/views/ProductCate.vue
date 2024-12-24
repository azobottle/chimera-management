<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getAllProductCatesShop, updateProductCate, createProductCate, existsByCateId } from '../client/services.gen'; // Update services as needed
import type { ProductCate } from '../client/types.gen';
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElPagination } from 'element-plus';

const categories = ref<ProductCate[]>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const categoryToDelete = ref<ProductCate | null>(null);
const editableCategory = ref<ProductCate | null>(null);
const isCreating = ref(false);

const fetchCategories = async () => {
  try {
    const response = await getAllProductCatesShop();
    categories.value = response.data
      .filter((category: ProductCate) => category.delete === 0) // Filter out deleted categories
      .sort((a: ProductCate, b: ProductCate) => b.priority - a.priority); // Sort by priority
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};



const openEditDialog = (category: ProductCate) => {
  editableCategory.value = { ...category };
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const openCreateDialog = () => {
  editableCategory.value = {
    title: '',
    status: 1,
    priority: 0,
    delete: 0
  };
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const saveCategoryChanges = async () => {
  if (!editableCategory.value) return;

  isSaving.value = true;
  try {
    if (isCreating.value) {
      // Create new category
      await createProductCate({
        body: editableCategory.value,
        method: 'POST'
      });
      ElMessage.success('分类创建成功');
    } else {
      // Update existing category
      await updateProductCate({
        body: editableCategory.value,
        method: 'PUT'
      });
      ElMessage.success('分类修改成功');
    }

    await fetchCategories();
    isEditDialogVisible.value = false;
  } catch (error) {
    console.error('Error saving category:', error);
    ElMessage.error('保存失败！');
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (category: ProductCate) => {
  categoryToDelete.value = category;
  isDeleteDialogVisible.value = true;
};

const deleteCategory = async () => {
  if (!categoryToDelete.value) return;

  isDeleting.value = true;
  try {

    const cannotDelete = await existsByCateId({
      query: {
        cateId: categoryToDelete.value.id
      }
    });
    
    if (cannotDelete.data) {
      alert('无法删除：该分类下仍有未删除的商品。');
      return;
    }

    const updatedProductCate = { ...categoryToDelete.value, delete: 1};
    await updateProductCate({ body: updatedProductCate });

    await fetchCategories();
    isDeleteDialogVisible.value = false;
  } catch (error) {
    console.error('Error deleting category:', error);
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  await fetchCategories();
});

const getStatusLabel = (status: number) => {
  return status === 1 ? '上线' : '下线';
};

</script>

<template>
  <div>
    <el-button type="primary" @click="openCreateDialog">新建商品分类</el-button>

    <h1>商品分类列表</h1>

    <el-table :data="categories" stripe>
      <el-table-column prop="title" label="分类名称"></el-table-column>

      <el-table-column label="状态">
        <template #default="{ row }">
          <span>{{ getStatusLabel(row.status) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="统计">
        <!-- Add relevant statistics display here if needed -->
        <template #default="{ row }">
          <span></span>
        </template>
      </el-table-column>
      
      <el-table-column prop="priority" label="排序（越大在菜单排得越前）"></el-table-column>

      <el-table-column label="">
        <template #default="{ row }">
          <el-button type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Delete Confirmation Dialog -->
    <el-dialog v-model="isDeleteDialogVisible" width="30%" title="删除确认">
      <span>确定要删除该分类吗？删除分类请确保没有商品处于该分类下。</span>
      <template #footer>
        <el-button type="primary" @click="deleteCategory" :loading="isDeleting">确认</el-button>
        <el-button @click="isDeleteDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit Category Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" title="编辑分类">
      <el-form v-if="editableCategory" :model="editableCategory">
        <el-form-item label="名称">
          <el-input v-model="editableCategory.title"></el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="editableCategory.status">
            <el-radio :label="1">上线</el-radio>
            <el-radio :label="0">下线</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input type="number" v-model.number="editableCategory.priority" />
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button type="primary" @click="saveCategoryChanges" :loading="isSaving">保存</el-button>
        <el-button @click="isEditDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Add any additional styles here */
</style>
