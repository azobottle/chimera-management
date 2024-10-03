<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getAllFixDeliveryInfos,
  createFixDeliveryInfo,
  updateFixDeliveryInfo,
  deleteFixDeliveryInfo as deleteAddressAPI,
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

const addresses = ref<Address[]>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isCreating = ref(false);
const editableAddress = ref<Address | null>(null);
const addressToDelete = ref<Address | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);

const addressForm = ref();
const rules = {
  school: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  address: [
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
};

const fetchAddresses = async () => {
  try {
    const response = await getAllAddresses();
    addresses.value = response.data; // Assuming data is an array of addresses
  } catch (error) {
    console.error('Error fetching addresses:', error);
  }
};

const openCreateDialog = () => {
  editableAddress.value = {
    school: '',
    address: [''],
  };
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const openEditDialog = (address: Address) => {
  editableAddress.value = { ...address };
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const addAddress = () => {
  if (editableAddress.value) {
    editableAddress.value.address.push('');
  }
};

const removeAddress = (index: number) => {
  if (editableAddress.value) {
    editableAddress.value.address.splice(index, 1);
  }
};

const cancelEdit = () => {
  isEditDialogVisible.value = false
  fetchAddresses()
}

const saveAddressChanges = async () => {
  if (!editableAddress.value) return;

  await addressForm.value.validate(async (valid: boolean) => {
    if (valid) {
      isSaving.value = true;
      try {
        if (isCreating.value) {
          // 创建新地址
          await createAddress({
            body: editableAddress.value,
          });
          ElMessage.success('地址创建成功');
        } else {
          // 更新现有地址
          await updateAddress({
            body: editableAddress.value,
          });
          ElMessage.success('地址修改成功');
        }

        await fetchAddresses();
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

const confirmDelete = (address: Address) => {
  addressToDelete.value = address;
  isDeleteDialogVisible.value = true;
};

const deleteAddress = async () => {
  if (!addressToDelete.value) return;

  isDeleting.value = true;
  try {
    await deleteAddressAPI({
      path: {
        id: addressToDelete.value.id,
      }
    });

    await fetchAddresses();
    isDeleteDialogVisible.value = false;
    ElMessage.success('地址删除成功');
  } catch (error) {
    console.error('Error deleting address:', error);
    ElMessage.error('删除失败！');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  await fetchAddresses();
});
</script>

<template>
  <div>
    <el-button type="primary" @click="openCreateDialog">新建地址</el-button>

    <h1>地址列表</h1>

    <el-table :data="addresses" stripe>
      <el-table-column prop="school" label="学校" />
      <el-table-column label="地址">
        <template #default="{ row }">
          <div v-for="(addr, index) in row.address" :key="index">{{ addr }}</div>
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
        <el-button type="primary" @click="deleteAddress" :loading="isDeleting"
          >确认</el-button
        >
        <el-button @click="isDeleteDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit Address Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" :title="isCreating ? '新建地址' : '编辑地址'">
      <el-form
        v-if="editableAddress"
        :model="editableAddress"
        :rules="rules"
        ref="addressForm"
      >
        <el-form-item label="学校" prop="school">
          <el-input v-model="editableAddress.school"></el-input>
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <div
            v-for="(addr, index) in editableAddress.address"
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 8px; width: 100%; "
          >
            <el-input
              v-model="editableAddress.address[index]"
              placeholder="输入地址"
              style="flex: 1;"
            ></el-input>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeAddress(index)"
              style="margin-left: 8px; width:60px;"
            >删除</el-button>
          </div>
          <el-button type="primary" plain @click="addAddress"
            >添加地址</el-button
          >
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="saveAddressChanges" :loading="isSaving"
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
