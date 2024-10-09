<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon as deleteCouponAPI,
} from '../client/services.gen';
import type { Coupon } from '../client/types.gen';
import {
  ElMessage,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElCheckbox,
} from 'element-plus';

const coupons = ref<Coupon[]>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isCreating = ref(false);
const editableCoupon = ref<Coupon | null>(null);
const couponToDelete = ref<Coupon | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);

const couponForm = ref();
const rules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  dePrice: [{ required: true, message: '请输入抵扣金额', trigger: 'blur' }],
  costPoints: [
    {
      validator: (rule, value, callback) => {
        if (editableCoupon.value?.convertible && !value) {
          callback(new Error('请输入消耗积分'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  convertible: [{ required: true, message: '请选择是否可兑换', trigger: 'change' }],
  validity: [{ required: true, message: '请选择有效期', trigger: 'change' }],
  issueNum: [{ required: true, message: '请输入发放数量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

const fetchCoupons = async () => {
  try {
    const response = await getAllCoupons();
    coupons.value = response.data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
  }
};

const openCreateDialog = () => {
  editableCoupon.value = {
    name: '',
    dePrice: 0,
    costPoints: 0,
    convertible: false,
    validity: '',
    issueNum: 0,
    status: 1,
  };
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const openEditDialog = (coupon: Coupon) => {
  editableCoupon.value = { ...coupon };
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const cancelEdit = () => {
  isEditDialogVisible.value = false;
  fetchCoupons();
};

const saveCouponChanges = async () => {
  if (!editableCoupon.value) return;

  await couponForm.value.validate(async (valid: boolean) => {
    if (valid) {
      isSaving.value = true;
      try {
        if (isCreating.value) {
          await createCoupon({
            body: editableCoupon.value,
          });
          ElMessage.success('优惠券创建成功');
        } else {
          await updateCoupon({
            body: editableCoupon.value,
          });
          ElMessage.success('优惠券修改成功');
        }

        await fetchCoupons();
        isEditDialogVisible.value = false;
      } catch (error) {
        console.error('Error saving coupon:', error);
        ElMessage.error('保存失败！');
      } finally {
        isSaving.value = false;
      }
    } else {
      ElMessage.error('请完善表单信息');
    }
  });
};

const confirmDelete = (coupon: Coupon) => {
  couponToDelete.value = coupon;
  isDeleteDialogVisible.value = true;
};

const deleteCoupon = async () => {
  if (!couponToDelete.value || !couponToDelete.value.id) return;

  isDeleting.value = true;
  try {
    await deleteCouponAPI({
      path: {
        id: couponToDelete.value.id,
      },
    });

    await fetchCoupons();
    isDeleteDialogVisible.value = false;
    ElMessage.success('优惠券删除成功');
  } catch (error) {
    console.error('Error deleting coupon:', error);
    ElMessage.error('删除失败！');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(async () => {
  await fetchCoupons();
});
</script>

<template>
  <div>
    <el-button type="primary" @click="openCreateDialog">新建优惠券</el-button>

    <h1>优惠券列表</h1>

    <el-table :data="coupons" stripe>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="dePrice" label="抵扣金额" />
      <el-table-column prop="costPoints" label="消耗积分" />
      <el-table-column prop="convertible" label="是否可兑换">
        <template #default="{ row }">
          <span>{{ row.convertible ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="validity" label="有效期" />
      <el-table-column label="统计">
        <template #default="{ row }">
          <div>
            发放数量：{{ row.issueNum }}<br />
            已领取数量：{{ row.receiveNum }}<br />
            已使用数量：{{ row.useNum }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <span>{{ row.status === 1 ? '上线' : '下线' }}</span>
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
      <span>确定要删除该优惠券吗？</span>
      <template #footer>
        <el-button type="primary" @click="deleteCoupon" :loading="isDeleting">确认</el-button>
        <el-button @click="isDeleteDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit Coupon Dialog -->
    <el-dialog
      v-model="isEditDialogVisible"
      width="50%"
      :title="isCreating ? '新建优惠券' : '编辑优惠券'"
    >
      <el-form
        v-if="editableCoupon"
        :model="editableCoupon"
        :rules="rules"
        ref="couponForm"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="editableCoupon.name"></el-input>
        </el-form-item>

        <el-form-item label="抵扣金额" prop="dePrice">
          <el-input v-model="editableCoupon.dePrice" type="number"></el-input>
        </el-form-item>

        <el-form-item label="是否可兑换" prop="convertible">
          <el-checkbox v-model="editableCoupon.convertible"></el-checkbox>
        </el-form-item>

        <el-form-item label="消耗积分" prop="costPoints" v-if="editableCoupon.convertible">
          <el-input v-model="editableCoupon.costPoints" type="number"></el-input>
        </el-form-item>

        <el-form-item label="有效期" prop="validity">
          <el-date-picker
            v-model="editableCoupon.validity"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="发放数量" prop="issueNum">
          <el-input v-model="editableCoupon.issueNum" type="number"></el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="editableCoupon.status" placeholder="请选择状态">
            <el-option label="上线" :value="1"></el-option>
            <el-option label="下线" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="saveCouponChanges" :loading="isSaving">保存</el-button>
        <el-button @click="cancelEdit()">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Add any additional styles here */
</style>
