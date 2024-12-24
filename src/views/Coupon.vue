<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  getAllProductCates,
  addCouponToUser,
  distributeCouponToStudents
} from '../client/services.gen';
import type { Coupon, ProductCate } from '../client/types.gen';
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
  ElMessageBox 
} from 'element-plus';

const coupons = ref<Coupon[]>([]);
const productCates = ref<ProductCate[]>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isCreating = ref(false);
const editableCoupon = ref<Coupon | null>(null);
const couponToDelete = ref<Coupon | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);

const isIssueDialogVisible = ref(false);
const userIdInput = ref('');
const couponToIssue = ref<Coupon | null>(null);
const isIssuing = ref(false);

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
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  validity: [
    {
      validator: (rule, value, callback) => {
        if (editableCoupon.value?.type === '活动' && !value) {
          callback(new Error('活动类型的优惠券有效期为必填'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
};

// 优惠券类型选项
const couponTypes = [
  { label: '新客', value: '新客' },
  { label: '兑换', value: '兑换' },
  { label: '活动', value: '活动' },
  { label: '学生', value: '学生' },
  { label: '临时', value: '临时' },
];

const searchCriteria = ref({
  name: '',
  status: null as number | null,
  type: '',
});

const filteredCoupons = computed(() => {
  return coupons.value.filter((coupon) => {
    const matchesName =
      !searchCriteria.value.name ||
      coupon.name.toLowerCase().includes(searchCriteria.value.name.toLowerCase());
    const matchesStatus =
      searchCriteria.value.status === null || coupon.status === searchCriteria.value.status;
    const matchesType =
      !searchCriteria.value.type || coupon.type === searchCriteria.value.type;
    return matchesName && matchesStatus && matchesType;
  });
});

const fetchCoupons = async () => {
  try {
    const response = await getAllCoupons();
    // 过滤掉已被伪删除的优惠券
    coupons.value = response.data.filter((coupon) => coupon.delete !== 1);
  } catch (error) {
    console.error('Error fetching coupons:', error);
  }
};

const fetchProductCates = async () => {
  try {
    const response = await getAllProductCates();
    productCates.value = response.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
  }
};

const openCreateDialog = () => {
  editableCoupon.value = {
    name: '',
    cateId: null,
    dePrice: 0,
    costPoints: 0,
    convertible: false, // 由程序自动管理
    validity: '',
    status: 0,
    delete: 0,
    type: '',
  };
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const openEditDialog = (coupon: Coupon) => {
  editableCoupon.value = { ...coupon };
  // 将 dePrice 从分转换为元
  if (editableCoupon.value.dePrice !== undefined) {
    editableCoupon.value.dePrice = editableCoupon.value.dePrice / 100;
  }
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const cancelEdit = () => {
  isEditDialogVisible.value = false;
  fetchCoupons();
};

const saveCouponChanges = async () => {
  if (!editableCoupon.value) return;

  // 根据类型自动设置 convertible
  if (editableCoupon.value.type === '兑换') {
    editableCoupon.value.convertible = true;
  } else {
    editableCoupon.value.convertible = false;
  }

  await couponForm.value.validate(async (valid: boolean) => {
    if (valid) {
      isSaving.value = true;
      try {
        const couponToSave = { ...editableCoupon.value };

        // 将 dePrice 从元转换为分
        if (couponToSave.dePrice !== undefined) {
          couponToSave.dePrice = Math.round(couponToSave.dePrice * 100);
        }

        if (isCreating.value) {
          await createCoupon({
            body: couponToSave,
          });
          ElMessage.success('优惠券创建成功');
        } else {
          await updateCoupon({
            body: couponToSave,
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
    // 将 delete 字段设置为 1，进行伪删除
    const updatedCoupon = { ...couponToDelete.value, delete: 1, status:0 };
    await updateCoupon({
      body: updatedCoupon,
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

const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const resetSearch = () => {
  searchCriteria.value = {
    name: '',
    status: null,
    type: '',
  };
};

const openIssueDialog = (coupon: Coupon) => {
  couponToIssue.value = coupon;
  userIdInput.value = '';
  isIssueDialogVisible.value = true;
};

const issueCoupon = async () => {
  if (!couponToIssue.value || !userIdInput.value) {
    ElMessage.error('请输入用户ID');
    return;
  }

  isIssuing.value = true;
  try {
    await addCouponToUser({
      query: {
        couponId: couponToIssue.value.id.toString(),
        userId: userIdInput.value,
      },
    });
    ElMessage.success('优惠券发放成功');
    isIssueDialogVisible.value = false;
  } catch (error) {
    console.error('Error issuing coupon:', error);
    ElMessage.error('发放失败！');
  } finally {
    isIssuing.value = false;
  }
};

const confirmDistribute = async (coupon) => {
  try {
    const confirmed = await ElMessageBox.confirm(
      '确定要将此优惠券发放给所有认证为学生的用户吗？',
      '发放确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    if (confirmed) {
      await distributeCouponToStudents({
        query: {
          couponId: coupon.id.toString(),
        }
      });
      ElMessage.success('优惠券成功发放给学生');
    }
  } catch (error) {
    console.error('Error distributing coupon:', error);
    ElMessage.error('发放失败！');
  }
};


// 监听 editableCoupon.type 的变化，自动设置 convertible
watch(
  () => editableCoupon.value?.type,
  (newType) => {
    if (editableCoupon.value) {
      editableCoupon.value.convertible = newType === '兑换';
      if (['新客', '兑换', '临时', '学生'].includes(newType)) {
        // 设置有效期为空
        editableCoupon.value.validity = null;
      }
    }
  }
);


onMounted(async () => {
  await fetchCoupons();
  await fetchProductCates();
});
</script>

<template>
  <div>
    <!-- 搜索条件输入区域 -->
    <h1>优惠券搜索</h1>
    <div
      style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"
    >
      <div style="margin-bottom: 20px;">
        <el-input
          v-model="searchCriteria.name"
          placeholder="搜索名称"
          style="width: 200px; margin-right: 10px;"
          clearable
        ></el-input>

        <el-select
          v-model="searchCriteria.status"
          placeholder="状态"
          style="width: 150px; margin-right: 10px;"
          clearable
        >
          <el-option label="全部" :value="null"></el-option>
          <el-option label="上线" :value="1"></el-option>
          <el-option label="下线" :value="0"></el-option>
        </el-select>

        <!-- 类型筛选 -->
        <el-select
          v-model="searchCriteria.type"
          placeholder="类型"
          style="width: 150px; margin-right: 10px;"
          clearable
        >
          <el-option
            v-for="type in couponTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          ></el-option>
        </el-select>

        <el-button type="primary" @click="resetSearch">重置</el-button>
      </div>

      <el-button type="primary" @click="openCreateDialog">新建优惠券</el-button>
    </div>
    
    <h1>优惠券列表</h1>

    <el-table :data="filteredCoupons" stripe>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型" />
      <el-table-column label="分类">
        <template #default="{ row }">
          <!-- 根据 cateId 显示分类名称 -->
          <span>
            {{
              row.cateId
                ? productCates.find((cate) => cate.id === row.cateId)?.title || '未知分类'
                : '未分类'
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="抵扣金额">
        <template #default="{ row }">
          <span>{{ (row.dePrice / 100).toFixed(1) }} 元</span>
        </template>
      </el-table-column>
      <el-table-column prop="costPoints" label="消耗积分" />
      <!-- 移除了 '是否可兑换' 列 -->
      <el-table-column prop="validity" label="有效期截至">
        <template #default="{ row }">
          <div>{{ row.validity ? formatDateTime(row.validity) : '无' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="统计">
        <template #default="{ row }">
          <div>
            发放数量：{{ row.issueNum ?? 0 }}<br />
            已使用数量：{{ row.useNum ?? 0 }}
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
          <el-button v-if="row.type === '临时'" type="success" @click="openIssueDialog(row)">发放</el-button>
          <el-button v-if="row.type === '学生'" type="success" @click="confirmDistribute(row)">发放</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="isDeleteDialogVisible" width="30%" title="删除确认">
      <span>确定要删除该优惠券吗？</span>
      <template #footer>
        <el-button type="primary" @click="deleteCoupon" :loading="isDeleting">确认</el-button>
        <el-button @click="isDeleteDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 新建/编辑优惠券对话框 -->
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

        <el-form-item label="类型" prop="type">
          <el-select v-model="editableCoupon.type" placeholder="请选择类型">
            <el-option
              v-for="type in couponTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="分类" prop="cateId">
          <el-select v-model="editableCoupon.cateId" placeholder="请选择分类" clearable>
            <el-option
              v-for="cate in productCates"
              :key="cate.id"
              :label="cate.title"
              :value="cate.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="抵扣金额（元）" prop="dePrice">
          <el-input v-model.number="editableCoupon.dePrice" type="number"></el-input>
        </el-form-item>

        <!-- 移除了 '是否可兑换' 字段 -->

        <!-- 消耗积分，根据 convertible 是否为 true 决定是否显示 -->
        <el-form-item label="消耗积分" prop="costPoints" v-if="editableCoupon.convertible">
          <el-input v-model.number="editableCoupon.costPoints" type="number"></el-input>
        </el-form-item>

        <el-form-item label="有效期截至" prop="validity">
          <el-date-picker
            v-model="editableCoupon.validity"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
            :disabled="['新客', '兑换', '临时', '学生'].includes(editableCoupon.type)"
          ></el-date-picker>
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

    <el-dialog v-model="isIssueDialogVisible" width="30%" title="发放优惠券">
    <el-form>
      <el-form-item label="用户ID">
        <el-input v-model="userIdInput"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="issueCoupon" :loading="isIssuing">发放</el-button>
      <el-button @click="isIssueDialogVisible = false">取消</el-button>
    </template>
  </el-dialog>
  
  </div>
</template>

<style scoped>
/* 可根据需要添加样式 */
</style>
