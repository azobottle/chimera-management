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
  school: [{ required: true, message: '请输入地址名称', trigger: 'blur' }],
  addresses: [
    {
      validator: (rule, value, callback) => {
        if (!value.length) {
          callback(new Error('至少需要一个配送点'));
        } else if (value.some((addr) => !addr.trim())) {
          callback(new Error('配送点不能为空'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  times_work: [
    {
      validator: (rule, value, callback) => {
        if (!value.length) {
          callback(new Error('至少需要一个时间'));
        } else if (value.some((times_work) => !timeRegex.test(times_work))) {
          callback(new Error('时间格式无效，请输入 HH:mm 格式'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  times_weekend: [
    {
      validator: (rule, value, callback) => {
        if (!value.length) {
          callback(new Error('至少需要一个时间'));
        } else if (value.some((times_weekend) => !timeRegex.test(times_weekend))) {
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
    times_work: [''],
    times_weekend: [''],
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

const addDeliveryTimeWork = () => {
  if (editableFixDeliveryInfo.value) {
    editableFixDeliveryInfo.value.times_work.push('');
  }
};

const removeDeliveryTimeWork = (index: number) => {
  if (editableFixDeliveryInfo.value) {
    editableFixDeliveryInfo.value.times_work.splice(index, 1);
  }
};

const addDeliveryTimeWeekend = () => {
  if (editableFixDeliveryInfo.value) {
    editableFixDeliveryInfo.value.times_weekend.push('');
  }
};

const removeDeliveryTimeWeekend = (index: number) => {
  if (editableFixDeliveryInfo.value) {
    editableFixDeliveryInfo.value.times_weekend.splice(index, 1);
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
          ElMessage.success('配送点创建成功');
        } else {
          await updateFixDeliveryInfo({
            body: editableFixDeliveryInfo.value,
          });
          ElMessage.success('配送点修改成功');
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
    ElMessage.success('配送点删除成功');
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
    <el-button type="primary" @click="openCreateDialog">新建配送点</el-button>

    <h1>配送点列表</h1>

    <el-table :data="fixDeliveryInfos" stripe>
      <el-table-column prop="school" label="地址" />
      <el-table-column label="配送点">
        <template #default="{ row }">
          <div v-for="(addr, index) in row.addresses" :key="index">{{ addr }}</div>
        </template>
      </el-table-column>
      <el-table-column label="工作日配送时间">
        <template #default="{ row }">
          <div v-for="(times_work, index) in row.times_work" :key="index">{{ times_work }}</div>
        </template>
      </el-table-column>
      <el-table-column label="周末配送时间">
        <template #default="{ row }">
          <div v-for="(times_weekend, index) in row.times_weekend" :key="index">{{ times_weekend }}</div>
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
      <span>确定要删除该配送点吗？</span>
      <template #footer>
        <el-button type="primary" @click="deleteFixDeliveryInfo" :loading="isDeleting"
          >确认</el-button>
        <el-button @click="isDeleteDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit FixDeliveryInfo Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" :title="isCreating ? '新建配送点' : '编辑配送点'">
      <el-form
        v-if="editableFixDeliveryInfo"
        :model="editableFixDeliveryInfo"
        :rules="rules"
        ref="addressForm"
      >
        <el-form-item label="地址" prop="school">
          <el-input v-model="editableFixDeliveryInfo.school"></el-input>
        </el-form-item>

        <el-form-item label="配送点" prop="addresses">
          <div
            v-for="(addr, index) in editableFixDeliveryInfo.addresses"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 8px; width: 100%; "
          >
            <el-input
              v-model="editableFixDeliveryInfo.addresses[index]"
              placeholder="输入配送点"
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
            >添加配送点</el-button
          >
        </el-form-item>

        <el-form-item label="工作日配送时间" prop="times_work">
          <div
            v-for="(time, index) in editableFixDeliveryInfo.times_work"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 8px; width: 100%; "
          >
            <el-input
              v-model="editableFixDeliveryInfo.times_work[index]"
              placeholder="输入时间（HH:mm）"
              style="flex: 1;"
            ></el-input>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeDeliveryTimeWork(index)"
              style="margin-left: 8px; width:60px;"
            >删除</el-button>
          </div>
          <el-button type="primary" plain @click="addDeliveryTimeWork"
            >添加时间</el-button
          >
        </el-form-item>

        <el-form-item label="周末配送时间" prop="times_weekend">
          <div
            v-for="(time, index) in editableFixDeliveryInfo.times_weekend"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 8px; width: 100%; "
          >
            <el-input
              v-model="editableFixDeliveryInfo.times_weekend[index]"
              placeholder="输入时间（HH:mm）"
              style="flex: 1;"
            ></el-input>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeDeliveryTimeWeekend(index)"
              style="margin-left: 8px; width:60px;"
            >删除</el-button>
          </div>
          <el-button type="primary" plain @click="addDeliveryTimeWeekend"
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
