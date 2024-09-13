<template>
  <div>
    <h1>Product List</h1>
    <el-table :data="products" stripe>
      <el-table-column prop="name" label="Product Name" />
      <el-table-column prop="describe" label="Description" />
      <el-table-column prop="imgURL" label="Image">
        <template #default="{ row }">
          <img :src="row.imgURL" alt="Product Image" v-if="row.imgURL" style="width: 100px; height: auto;" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getAllEntities2 } from '../client/services.gen'; // 假设API文件路径为 api.ts
import type { Product } from '../client/types.gen'; // 假设Product类型定义在 types.ts
import { ElTable, ElTableColumn } from 'element-plus';

export default defineComponent({
  name: 'Product',
  components: {
    ElTable,
    ElTableColumn,
  },
  setup() {
    const products = ref<Product[]>([]); // 存储获取到的产品列表

    // 在组件挂载时获取产品数据
    onMounted(async () => {
      try {
        const response = await getAllEntities2();
        products.value = response.data; // 假设 API 响应的数据为 response.data
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    });

    return {
      products,
    };
  }
});
</script>

<style scoped>
/* Add any additional styles here */
</style>
