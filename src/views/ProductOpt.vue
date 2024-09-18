<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllProductOptions, createProductOption, updateProductOption } from '../client/services.gen'; // 更新服务路径
import type { ProductOption } from '../client/types.gen';
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElPagination, ElInputNumber } from 'element-plus';

const options = ref<ProductOption[]>([]);
const isEditDialogVisible = ref(false);
const isSaving = ref(false);
const editableOption = ref<ProductOption | null>(null);
const isCreating = ref(false);

const fetchOptions = async () => {
  try {
    const response = await getAllProductOptions();
    options.value = response.data;
  } catch (error) {
    console.error('获取商品选项时出错:', error);
  }
};

const openEditDialog = (option: ProductOption) => {
  editableOption.value = { ...option };
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const openCreateDialog = () => {
  editableOption.value = {
    name: '',
    values: [{ uuid: '', value: '', priceAdjustment: 0 }] // 初始化可选值
  };
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const saveOptionChanges = async () => {
  if (!editableOption.value) return;

  isSaving.value = true;
  try {
    if (isCreating.value) {
      // 创建新的商品选项
      await createProductOption({
        body: editableOption.value,
        method: 'POST'
      });
      ElMessage.success('商品选项创建成功');
    } else {
      // 更新已有的商品选项
      await updateProductOption({
        body: editableOption.value,
        method: 'PUT'
      });
      ElMessage.success('商品选项修改成功');
    }

    await fetchOptions();
    isEditDialogVisible.value = false;
  } catch (error) {
    console.error('保存商品选项时出错:', error);
    ElMessage.error('保存失败！');
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  await fetchOptions();
});

</script>

<template>
  <div>
    <el-button type="primary" @click="openCreateDialog">新建商品选项</el-button>

    <h1>商品选项列表</h1>

    <el-table :data="options" stripe>
      <el-table-column prop="name" label="选项名称"></el-table-column>

      <el-table-column label="可选值">
        <template #default="{ row }">
          <div v-for="value in row.values" :key="value.uuid">
            {{ value.value }}: {{ value.priceAdjustment }} 元
          </div>
        </template>
      </el-table-column>

      <el-table-column label="">
        <template #default="{ row }">
          <el-button type="primary" @click="openEditDialog(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑商品选项对话框 -->
    <el-dialog v-model="isEditDialogVisible" width="50%" title="编辑商品选项">
      <el-form v-if="editableOption" :model="editableOption">
        <el-form-item label="名称">
          <el-input v-model="editableOption.name"></el-input>
        </el-form-item>

        <el-form-item label="可选值">
          <div v-for="(value, index) in editableOption.values" :key="index" class="option-value-row">
            <el-input v-model="value.value" placeholder="值名称"></el-input>
            <el-input-number v-model="value.priceAdjustment" :min="0" placeholder="价格调整" />
          </div>
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button type="primary" @click="saveOptionChanges" :loading="isSaving">保存</el-button>
        <el-button @click="isEditDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.option-value-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-value-row .el-input,
.option-value-row .el-input-number {
  margin-right: 10px;
}
</style>
