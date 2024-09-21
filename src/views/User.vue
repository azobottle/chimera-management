<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getAllUsers } from '../client/services.gen';
import type { User } from '../client/types.gen';
import { ElMessage, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElPagination } from 'element-plus';

const users = ref<User[]>([]);

// 分页相关的变量
const currentPage = ref(1);   // 当前页码
const pageSize = ref(2);      // 每页展示的商品数量

// 计算分页后的商品列表
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
    const matchesName = searchQuery.value.name === '' || user.name.includes(searchQuery.value.name);
    const matchesSchool = searchQuery.value.school === '' || user.school.includes(searchQuery.value.school);
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

      <el-table-column prop="name" label="用户名" width="160px" />

      <el-table-column prop="school" label="学校" width="160px" />
      
      <el-table-column prop="expend" label="消费总额" width="160px" />
      
      <el-table-column prop="orderNum" label="下单数" width="160px" />
      
      <el-table-column prop="createdAt" label="创建日期" width="160px" />

    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredUsers.length"
      layout="prev, pager, next"
    />

  </div>
</template>



<style scoped>
</style>
