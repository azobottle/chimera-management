<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllAddresses, createAddress, updateAddress } from '../client/services.gen'; // Update services as needed
import type { Address } from '../client/types.gen';
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus';

const addresses = ref<Address[]>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isCreating = ref(false);
const editableAddress = ref<Address | null>(null);
const addressToDelete = ref<Address | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);

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
    address: []
  };
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const openEditDialog = (address: Address) => {
  editableAddress.value = { ...address };
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const saveAddressChanges = async () => {
  if (!editableAddress.value) return;

  isSaving.value = true;
  try {
    if (isCreating.value) {
      // Create new address
      await createAddress({
        body: editableAddress.value,
        method: 'POST'
      });
      ElMessage.success('地址创建成功');
    } else {
      // Update existing address
      await updateAddress({
        body: editableAddress.value,
        method: 'PUT'
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
};

const confirmDelete = (address: Address) => {
  addressToDelete.value = address;
  isDeleteDialogVisible.value = true;
};

const deleteAddress = async () => {
  if (!addressToDelete.value) return;

  isDeleting.value = true;
  try {
    // Assuming delete logic is similar to categories
    await updateAddress({
      body: { ...addressToDelete.value, deleted: true }, // Adjust according to your API
      method: 'DELETE'
    });

    await fetchAddresses();
    isDeleteDialogVisible.value = false;
  } catch (error) {
    console.error('Error deleting address:', error);
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
      <el-table-column label="">
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
        <el-button type="primary" @click="deleteAddress" :loading="isDeleting">确认</el-button>
        <el-button @click="isDeleteDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit Address Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" title="编辑地址">
      <el-form v-if="editableAddress" :model="editableAddress">
        <el-form-item label="学校">
          <el-input v-model="editableAddress.school"></el-input>
        </el-form-item>

        <el-form-item label="地址">
          <el-input v-model="editableAddress.address" placeholder="输入地址" />
          <el-button @click="editableAddress.address.push('')">添加地址</el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="saveAddressChanges" :loading="isSaving">保存</el-button>
        <el-button @click="isEditDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Add any additional styles here */
</style>
