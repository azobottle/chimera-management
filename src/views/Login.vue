<template>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="login-form">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" autocomplete="off"></el-input>
      </el-form-item>
  
      <el-form-item label="密码" prop="password">
        <el-input
          type="password"
          v-model="form.password"
          autocomplete="off"
        ></el-input>
      </el-form-item>
  
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">登录</el-button>
      </el-form-item>
  
      <el-alert v-if="errorMessage" type="error" :description="errorMessage" />
    </el-form>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRouter } from 'vue-router'; // 导入 Vue Router
  import { ElForm, ElFormItem, ElInput, ElButton, ElAlert } from 'element-plus';
  import type { FormRules } from 'element-plus';
  import {  login } from '@/client';
  
  export default defineComponent({
    name:"Login",
    components: { ElForm, ElFormItem, ElInput, ElButton, ElAlert },
    setup() {
      const router = useRouter(); // 使用 useRouter 钩子获取 router 实例
      const form = ref({
        username: '',
        password: ''
      });
  
      const rules = ref<FormRules>({
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      });
  
      const formRef = ref<InstanceType<typeof ElForm>>();
      const errorMessage = ref<string | null>(null);
  
      const handleSubmit = async () => {
        const valid = await formRef.value?.validate();
        if (valid) {
          try {
            await login({
                query:form.value
            })
              // 登录成功，跳转到统计页面
              router.push({ path: '/stats' })

          } catch (error) {
            if (error instanceof Error) {
              // 登录失败，显示错误信息
              errorMessage.value = `请求失败: ${error.message}`;
            } else {
              errorMessage.value = '未知错误'
            }
          }
        }
      };
  
      return {
        form,
        rules,
        formRef,
        handleSubmit,
        errorMessage
      };
    }
  });
  </script>
  
  <style scoped>
  .login-form {
    max-width: 360px;
    margin: 0 auto;
    padding: 20px;
  }
  </style>
  