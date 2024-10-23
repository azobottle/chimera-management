<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getAllUsers } from '../client/services.gen';
import type { User } from '../client/types.gen';
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElPagination } from 'element-plus';
import dayjs from 'dayjs';

const users = ref<User[]>([]);

// 分页相关的变量
const currentPage = ref(1);   // 当前页码
const pageSize = ref(10);      // 每页展示的用户数量

// 计算分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

// 搜索相关
const searchQuery = ref({
  name: '',
  school: ''
});

const resetFilters = () => {
  searchQuery.value = { name: '', school: '' };
  currentPage.value = 1; // Reset to first page after resetting
};

// Modify filteredUsers to apply the search criteria
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesName = searchQuery.value.name === '' || user.name?.includes(searchQuery.value.name);
    const matchesSchool = searchQuery.value.school === '' || user.school?.includes(searchQuery.value.school);
    return matchesName && matchesSchool ;
  });
});

const fetchUsers = async () => {
  try {
    const userResponse = await getAllUsers();
    users.value = userResponse.data;
    console.log("users:", users.value)
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

// 查看详情对话框相关
const detailDialogVisible = ref(false);
const selectedUser = ref<User | null>(null);

const showUserDetails = (user: User) => {
  selectedUser.value = user;
  detailDialogVisible.value = true;
};

onMounted(async () => {
  try {
    await fetchUsers();
  } catch (error) {
    console.error('Error fetching users:', error);
  }
});

</script>

<template>
  <div>
    <h3>搜索</h3>

    <el-form inline>
      <el-form-item label="名称">
        <el-input v-model="searchQuery.name" placeholder="输入用户名称"></el-input>
      </el-form-item>

      <el-form-item label="学校">
        <el-input v-model="searchQuery.school" placeholder="输入用户学校"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="resetFilters">重置</el-button>
      </el-form-item>
    </el-form>
    
    <h1>用户列表</h1>

    <el-table :data="paginatedUsers" stripe>
      <el-table-column prop="openid" label="openId" width="160px" />

      <el-table-column prop="name" label="用户名" width="300px" />

      <el-table-column prop="school" label="学校" width="160px" />
      
      <el-table-column prop="expend" label="消费总额" width="160px" />
      
      <el-table-column prop="orderNum" label="下单数" width="160px" />
      
      <el-table-column prop="studentCert" label="学生认证" width="100px">
        <template #default="scope">
          <span>{{ scope.row.studentCert ? '已认证' : '未认证' }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="points" label="持有积分" width="100px" />
      
      <el-table-column prop="createdAt" label="创建日期" width="180px">
        <template #default="scope">
          <span>{{ scope.row.createdAt ? dayjs(scope.row.createdAt).format('YYYY-MM-DD HH:mm:ss') : '' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="showUserDetails(scope.row)" type="primary" size="small">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredUsers.length"
      layout="prev, pager, next"
    />

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情">
      <div v-if="selectedUser">
        <p>用户名: {{ selectedUser.name }}</p>
        <p>openId: {{ selectedUser.openid }}</p>
        <p>学校: {{ selectedUser.school }}</p>
        <p>消费总额: {{ selectedUser.expend }}</p>
        <p>下单数: {{ selectedUser.orderNum }}</p>
        <p>持有积分: {{ selectedUser.points }}</p>
        <p>学生认证: {{ selectedUser.studentCert ? '已认证' : '未认证' }}</p>
        <h4>持有的优惠券:</h4>
        <ul>
          <li v-for="coupon in selectedUser.coupons" :key="coupon.uuid">
            {{ coupon.name }} - 状态: {{ coupon.status === 0 ? '未使用' : '已使用' }}
          </li>
        </ul>
        <h4>兑换的积分商品:</h4>
        <ul>
          <li v-for="product in selectedUser.pointsProducts" :key="product.uuid">
            {{ product.name }} - 领取方式: {{ product.sendType === 0 ? '自提' : '邮递' }}
          </li>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 样式可以根据需要进行自定义 */
</style>