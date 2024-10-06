<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getAllFixDeliveryInfos,
  createFixDeliveryInfo,
  updateFixDeliveryInfo,
  deleteFixDeliveryInfo as deleteFixDeliveryInfoAPI,
} from '../client/services.gen';
import type { FixDeliveryInfo } from '../client/types.gen';
import {
  ElMessage,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
} from 'element-plus';

const fixDeliveryInfos = ref<FixDeliveryInfo[]>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isCreating = ref(false);
const editableFixDeliveryInfo = ref<FixDeliveryInfo | null>(null);
const fixDeliveryInfoToDelete = ref<FixDeliveryInfo | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);

const addressForm = ref();
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // 用于校验时间格式的正则表达式
const rules = {
  school: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  addresses: [
    {
      validator: (rule, value, callback) => {
        if (!value.length) {
          callback(new Error('至少需要一个地址'));
        } else if (value.some((addr) => !addr.trim())) {
          callback(new Error('地址不能为空'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  times: [
    {
      validator: (rule, value, callback) => {
        if (!value.length) {
          callback(new Error('至少需要一个时间'));
        } else if (value.some((time) => !timeRegex.test(time))) {
          callback(new Error('时间格式无效，请输入 HH:mm 格式'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const fetchFixDeliveryInfos = async () => {
  try {
    const response = await getAllFixDeliveryInfos();
    fixDeliveryInfos.value = response.data;
  } catch (error) {
    console.error('Error fetching fixDeliveryInfos:', error);
  }
};

const openCreateDialog = () => {
  editableFixDeliveryInfo.value = {
    school: '',
    addresses: [''],
    times: [''],
  };
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const openEditDialog = (fixDeliveryInfo: FixDeliveryInfo) => {
  editableFixDeliveryInfo.value = { ...fixDeliveryInfo };
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const addFixDeliveryInfo = () => {
  if (editableFixDeliveryInfo.value) {
    editableFixDeliveryInfo.value.addresses.push('');
  }
};

const removeFixDeliveryInfo = (index: number) => {
  if (editableFixDeliveryInfo.value) {
    editableFixDeliveryInfo.value.addresses.splice(index, 1);
  }
};

const addDeliveryTime = () => {
  if (editableFixDeliveryInfo.value) {
    editableFixDeliveryInfo.value.times.push('');
  }
};

const removeDeliveryTime = (index: number) => {
  if (editableFixDeliveryInfo.value) {
    editableFixDeliveryInfo.value.times.splice(index, 1);
  }
};

const cancelEdit = () => {
  isEditDialogVisible.value = false;
  fetchFixDeliveryInfos();
};

const saveFixDeliveryInfoChanges = async () => {
  if (!editableFixDeliveryInfo.value) return;

  await addressForm.value.validate(async (valid: boolean) => {
    if (valid) {
      isSaving.value = true;
      try {
        if (isCreating.value) {
          await createFixDeliveryInfo({
            body: editableFixDeliveryInfo.value,
          });
          ElMessage.success('地址创建成功');
        } else {
          await updateFixDeliveryInfo({
            body: editableFixDeliveryInfo.value,
          });
          ElMessage.success('地址修改成功');
        }

        await fetchFixDeliveryInfos();
        isEditDialogVisible.value = false;
      } catch (error) {
        console.error('Error saving address:', error);
        ElMessage.error('保存失败！');
      } finally {
        isSaving.value = false;
      }
    } else {
      ElMessage.error('请完善表单信息');
    }
  });
};

const confirmDelete = (fixDeliveryInfo: FixDeliveryInfo) => {
  fixDeliveryInfoToDelete.value = fixDeliveryInfo;
  isDeleteDialogVisible.value = true;
};

const deleteFixDeliveryInfo = async () => {
  if (!fixDeliveryInfoToDelete.value) return;

  isDeleting.value = true;
  try {
    await deleteFixDeliveryInfoAPI({
      path: {
        id: fixDeliveryInfoToDelete.value.id,
      },
    });

    await fetchFixDeliveryInfos();
    isDeleteDialogVisible.value = false;
    ElMessage.success('地址删除成功');
  } catch (error) {
    console.error('Error deleting fixDeliveryInfo:', error);
    ElMessage.error('删除失败！');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  await fetchFixDeliveryInfos();
});

</script>

<template>
  <div>
    <el-button type="primary" @click="openCreateDialog">新建地址</el-button>

    <h1>地址列表</h1>

    <el-table :data="fixDeliveryInfos" stripe>
      <el-table-column prop="school" label="学校" />
      <el-table-column label="地址">
        <template #default="{ row }">
          <div v-for="(addr, index) in row.addresses" :key="index">{{ addr }}</div>
        </template>
      </el-table-column>
      <el-table-column label="配送时间">
        <template #default="{ row }">
          <div v-for="(time, index) in row.times" :key="index">{{ time }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Delete Confirmation Dialog -->
    <el-dialog v-model="isDeleteDialogVisible" width="30%" title="删除确认">
      <span>确定要删除该地址吗？</span>
      <template #footer>
        <el-button type="primary" @click="deleteFixDeliveryInfo" :loading="isDeleting"
          >确认</el-button>
        <el-button @click="isDeleteDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit FixDeliveryInfo Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" :title="isCreating ? '新建地址' : '编辑地址'">
      <el-form
        v-if="editableFixDeliveryInfo"
        :model="editableFixDeliveryInfo"
        :rules="rules"
        ref="addressForm"
      >
        <el-form-item label="学校" prop="school">
          <el-input v-model="editableFixDeliveryInfo.school"></el-input>
        </el-form-item>

        <el-form-item label="地址" prop="addresses">
          <div
            v-for="(addr, index) in editableFixDeliveryInfo.addresses"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 8px; width: 100%; "
          >
            <el-input
              v-model="editableFixDeliveryInfo.addresses[index]"
              placeholder="输入地址"
              style="flex: 1;"
            ></el-input>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeFixDeliveryInfo(index)"
              style="margin-left: 8px; width:60px;"
            >删除</el-button>
          </div>
          <el-button type="primary" plain @click="addFixDeliveryInfo"
            >添加地址</el-button
          >
        </el-form-item>

        <el-form-item label="配送时间" prop="times">
          <div
            v-for="(time, index) in editableFixDeliveryInfo.times"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 8px; width: 100%; "
          >
            <el-input
              v-model="editableFixDeliveryInfo.times[index]"
              placeholder="输入时间（HH:mm）"
              style="flex: 1;"
            ></el-input>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeDeliveryTime(index)"
              style="margin-left: 8px; width:60px;"
            >删除</el-button>
          </div>
          <el-button type="primary" plain @click="addDeliveryTime"
            >添加时间</el-button
          >
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="saveFixDeliveryInfoChanges" :loading="isSaving"
          >保存</el-button
        >
        <el-button @click="cancelEdit()">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>



<style scoped>
/* Add any additional styles here */
</style>
