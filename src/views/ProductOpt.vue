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
      <el-form v-if="editableOption" :model="editableOption" ref="optionForm">
        <el-form-item label="名称" :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]">
          <el-input v-model="editableOption.name"></el-input>
        </el-form-item>

        <el-form-item label="可选值">
          <el-row
            v-for="(value, index) in editableOption.values"
            :key="value.uuid"
            class="option-value-row"
            :gutter="20"
            style="margin-bottom: 10px"
          >
            <el-col :span="9">
              <el-form-item :prop="'values.' + index + '.value'" :rules="[{ required: true, message: '请输入值名称', trigger: 'blur' }]">
                <el-input v-model="value.value" placeholder="值名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-input-number v-model="value.priceAdjustment" :min="0" placeholder="价格调整" />
            </el-col>
            <el-col :span="5">
              <el-button type="danger" @click="removeOptionValue(index)">删除</el-button>
            </el-col>
          </el-row>
        </el-form-item>


        <el-form-item>
          <el-button type="primary" @click="addOptionValue">添加可选值</el-button>
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button type="primary" @click="saveOptionChanges" :loading="isSaving">保存</el-button>
        <el-button @click="cancelEdit">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getAllProductOptions, createProductOption, updateProductOption } from '../client/services.gen'; // 更新服务路径
import type { ProductOption } from '../client/types.gen';

const options = ref<ProductOption[]>([]);
const isEditDialogVisible = ref(false);
const isSaving = ref(false);
const editableOption = ref<ProductOption | null>(null);
const isCreating = ref(false);
const optionForm = ref(null);

// 获取商品选项
const fetchOptions = async () => {
  try {
    const response = await getAllProductOptions();
    options.value = response.data;
  } catch (error) {
    console.error('获取商品选项时出错:', error);
  }
};

// 打开编辑对话框
const openEditDialog = (option: ProductOption) => {
  editableOption.value = { ...option };
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

// 打开新建对话框
const openCreateDialog = () => {
  editableOption.value = {
    name: '',
    values: [{ uuid: Date.now().toString(), value: '', priceAdjustment: 0 }] // 初始化一个可选值
  };
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

// 添加新的值
const addOptionValue = () => {
  if (editableOption.value) {
    editableOption.value.values.push({
      uuid: Date.now().toString(), // 唯一标识符
      value: '',
      priceAdjustment: 0
    });
  }
};

// 删除某个值
const removeOptionValue = (index: number) => {
  if (editableOption.value && editableOption.value.values.length > 1) {
    editableOption.value.values.splice(index, 1); // 删除指定索引的值
  } else {
    ElMessage.warning('至少需要一个可选值');
  }
};

// 取消编辑
const cancelEdit = () => {
  isEditDialogVisible.value = false;
  fetchOptions(); // 重新获取商品选项列表
};

// 保存更改
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
