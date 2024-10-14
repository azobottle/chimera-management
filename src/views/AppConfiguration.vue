<template>
    <el-container>
      <el-header>
        <el-button type="primary" @click="openAddDialog">新增配置</el-button>
      </el-header>
  
      <el-main>
        <el-table :data="configurations" style="width: 100%">
          <el-table-column prop="key" label="配置项键名" />
          <el-table-column prop="value" label="配置项值" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="category" label="类别" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteConfiguration(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
  
      <!-- 添加/编辑对话框 -->
      <el-dialog :title="isEditing ? '编辑配置' : '新增配置'" v-model="dialogVisible">
        <el-form :model="currentConfig" :rules="rules" ref="configForm" label-width="100px">
          <el-form-item label="键名" prop="key">
            <el-input v-model="currentConfig.key" />
          </el-form-item>
          <el-form-item label="值" prop="value">
            <el-input v-model="currentConfig.value" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="currentConfig.description" />
          </el-form-item>
          <el-form-item label="类别" prop="category">
            <el-input v-model="currentConfig.category" />
          </el-form-item>
        </el-form>
  
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </template>
      </el-dialog>
    </el-container>
</template>
  
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { ElMessage, type FormInstance } from 'element-plus';
  import { addConfiguration, deleteConfiguration, getAllAppConfigurations, updateConfiguration, type AppConfiguration, type GetAllAppConfigurationsResponse } from '@/client';
  
  
  
  const configurations = ref<AppConfiguration[]>([]); // 保存配置列表
  const dialogVisible = ref(false); // 控制对话框显示
  const isEditing = ref(false); // 是否处于编辑模式
  const currentConfig = ref<AppConfiguration>({
    id: '',
    key: '',
    value: '',
    description: '',
    category: '',
  });
  
  // 表单验证规则
  const rules = {
    key: [{ required: true, message: '请输入配置键名', trigger: 'blur' }],
    value: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
  };
 // 这里给 configForm 添加 ElForm 的类型
  const configForm = ref<FormInstance>();
  
  // 获取所有配置项
  const fetchConfigurations = async () => {
    try {
      const response = await getAllAppConfigurations();
      configurations.value = response.data as GetAllAppConfigurationsResponse ;
    } catch (error) {
      ElMessage.error('获取配置失败');
    }
  };
  
  // 打开新增配置对话框
  const openAddDialog = () => {
    isEditing.value = false;
    currentConfig.value = { id: '', key: '', value: '', description: '', category: '' };
    dialogVisible.value = true;
  };
  
  // 编辑配置
  const openEditDialog = (config: AppConfiguration) => {
    isEditing.value = true;
    currentConfig.value = { ...config };
    dialogVisible.value = true;
  };
  
  // 提交表单
  const submitForm = () => {
    configForm.value?.validate(async (valid: boolean) => {
      if (valid) {
        currentConfig.value
        if (isEditing.value) {
          await handleUpdateConfiguration();
        } else {
          await handleAddConfiguration();
        }
        dialogVisible.value = false;
        fetchConfigurations();
      }
    });
  };
  
  // 新增配置
  const handleAddConfiguration = async () => {
    try {
      await addConfiguration({ body: currentConfig.value });
      ElMessage.success('新增配置成功');
    } catch (error) {
      ElMessage.error('新增配置失败');
    }
  };
  
  // 更新配置
  const handleUpdateConfiguration = async () => {
    try {
      await updateConfiguration({ body: currentConfig.value });
      ElMessage.success('修改配置成功');
    } catch (error) {
      ElMessage.error('修改配置失败');
    }
  };
  
  // 删除配置
  const handleDeleteConfiguration = async (id: string) => {
    try {
      await deleteConfiguration({ path: { id:id } });
      ElMessage.success('删除配置成功');
      fetchConfigurations();
    } catch (error) {
      ElMessage.error('删除配置失败');
    }
  };
  
  // 页面挂载时获取所有配置
  onMounted(() => {
    fetchConfigurations();
  });
</script>
  
<style scoped>
  .el-table {
    margin-top: 20px;
  }
</style>
  