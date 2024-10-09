<!-- ActivityManagement.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  uploadImage1,
  getAllActivities,
  updateActivity,
  createEntity,
  getAllProductCates,
} from '../client/services.gen';
import type { Activity, ProductCate } from '../client/types.gen';
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElPagination,
  ElDatePicker,
} from 'element-plus';

const activities = ref<Activity[]>([]);
const productCategories = ref<Map<string, string>>(new Map());
const productCategoriesArray = ref<Array<{ id: string; title: string }>>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const activityToDelete = ref<Activity | null>(null);
const editableActivity = ref<Activity | null>(null);

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isCreating = ref(false);

// Pagination variables
const currentPage = ref(1);
const pageSize = ref(10);

// Computed property for paginated activities
const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredActivities.value.slice(start, end);
});

// Search-related variables
const searchQuery = ref({
  title: '',
  cateId: '',
  status: '',
});

const resetFilters = () => {
  searchQuery.value = { title: '', cateId: '', status: '' };
  currentPage.value = 1; // Reset to first page after resetting
};

// Computed property for filtered activities
const filteredActivities = computed(() => {
  return activities.value.filter((activity) => {
    const matchesTitle =
      searchQuery.value.title === '' ||
      activity.title?.includes(searchQuery.value.title);
    const matchesCate =
      searchQuery.value.cateId === '' ||
      (activity.cateIds && activity.cateIds.includes(searchQuery.value.cateId));
    const matchesStatus =
      searchQuery.value.status === '' ||
      activity.status?.toString() === searchQuery.value.status;
    return matchesTitle && matchesCate && matchesStatus && activity.delete !== 1;
  });
});

const openEditDialog = (activity: Activity) => {
  editableActivity.value = {
    ...activity,
    cateIds: activity.cateIds ? [...activity.cateIds] : [],
  };
  imageFile.value = null;
  imagePreview.value = activity.imgURL || null;
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const saveActivityChanges = async () => {
  if (!editableActivity.value) return;

  isSaving.value = true;
  let imageFilename = editableActivity.value.imgURL || '';

  try {
    if (imageFile.value) {
      try {
        const imageResponse = await uploadImage1({
          body: {
            image: imageFile.value,
          },
        });
        imageFilename = imageResponse.data;
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }

    if (imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop()!;
    }

    editableActivity.value.imgURL = imageFilename;

    console.log('editableActivity', editableActivity.value);

    if (isCreating.value) {
      await createEntity({
        body: editableActivity.value,
      });
      ElMessage.success('Activity created successfully');
    } else {
      await updateActivity({
        body: editableActivity.value,
        method: 'PUT',
        throwOnError: true,
      });
      ElMessage.success('Activity updated successfully');
    }

    await fetchActivities();
    isEditDialogVisible.value = false;
  } catch (error) {
    console.error('Error saving activity:', error);
    ElMessage.error('Failed to save activity');
  } finally {
    isSaving.value = false;
  }
};

const fetchActivities = async () => {
  try {
    const response = await getAllActivities();
    activities.value = response.data;
    console.log('activities:', activities.value);
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
};

const fetchProductCategories = async () => {
  try {
    const response = await getAllProductCates();
    const categories: ProductCate[] = response.data
      .filter(
        (category: ProductCate) => category.delete === 0 && category.status !== 0
      )
      .sort((a: ProductCate, b: ProductCate) => b.priority - a.priority);
    const categoryMap = new Map<string, string>();
    categories.forEach((category) => {
      if (category.id && category.title) {
        categoryMap.set(category.id.toString(), category.title);
      }
    });
    productCategories.value = categoryMap;

    // Convert the Map to an array for easier iteration in templates
    productCategoriesArray.value = Array.from(categoryMap.entries()).map(
      ([id, title]) => ({ id, title })
    );
  } catch (error) {
    console.error('Error fetching product categories:', error);
  }
};

onMounted(async () => {
  try {
    await fetchActivities();
    await fetchProductCategories();
  } catch (error) {
    console.error('Error during onMounted:', error);
  }
});

const getCategoryTitles = (cateIds: string[]) => {
  return cateIds
    .map((id) => productCategories.value.get(id) || '未知分类')
    .join(', ');
};

const getStatusLabel = (status: number) => {
  return status === 1 ? '上架' : '下架';
};

const confirmDelete = (activity: Activity) => {
  activityToDelete.value = activity;
  isDeleteDialogVisible.value = true;
};

const deleteActivity = async () => {
  if (!activityToDelete.value) return;
  isDeleting.value = true;
  try {
    let imageFilename = activityToDelete.value.imgURL;

    if (imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop();
    }
    const updatedActivity = {
      ...activityToDelete.value,
      delete: 1,
      status: 0,
      imgURL: imageFilename,
    };
    await updateActivity({ body: updatedActivity });
    await fetchActivities();
    isDeleteDialogVisible.value = false;
  } catch (error) {
    console.error('Error deleting activity:', error);
  } finally {
    isDeleting.value = false;
  }
};

const openCreateDialog = () => {
  editableActivity.value = {
    title: '',
    describe: '',
    startTime: '',
    endTime: '',
    dePrice: 0,
    status: 1,
    imgURL: '',
    cateIds: [],
  };
  imageFile.value = null;
  imagePreview.value = null;
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const onImageChange = (file: any) => {
  if (file && file.raw) {
    imageFile.value = file.raw;
    imagePreview.value = URL.createObjectURL(imageFile.value);
    console.log(imageFile.value);
  } else {
    console.error('No file selected');
  }
};

// Function to format date without date-fns
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
</script>

<template>
  <div>
    <h3>搜索</h3>

    <el-form inline>
      <el-form-item label="活动名称">
        <el-input v-model="searchQuery.title" placeholder="输入活动名称"></el-input>
      </el-form-item>

      <el-form-item label="分类">
        <el-select
          v-model="searchQuery.cateId"
          placeholder="选择分类"
          style="width: 150pt;"
        >
          <el-option
            v-for="category in productCategoriesArray"
            :key="category.id"
            :label="category.title"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select
          v-model="searchQuery.status"
          placeholder="选择状态"
          style="width: 100pt;"
        >
          <el-option label="上架" value="1" />
          <el-option label="下架" value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="resetFilters">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" @click="openCreateDialog">创建活动</el-button>

    <h1>活动列表</h1>

    <el-table :data="paginatedActivities" stripe>
      <el-table-column prop="imgURL" label="图片" width="160px">
        <template #default="{ row }">
          <img
            :src="row.imgURL"
            alt="Activity Image"
            v-if="row.imgURL"
            style="width: 100px; height: auto;"
          />
        </template>
      </el-table-column>

      <el-table-column label="活动信息" width="200px">
        <template #default="{ row }">
          <div>
            <div style="font-weight: bold;">{{ row.title }}</div>
            <div>优惠抵扣: {{ row.dePrice }}分</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="活动时间" width="300px">
        <template #default="{ row }">
          <div>开始时间：{{ formatDateTime(row.startTime) }}</div>  
          <div>结束时间：{{ formatDateTime(row.endTime) }}</div>
        </template>
      </el-table-column>

      <el-table-column label="适用分类">
        <template #default="{ row }">
          <div v-if="row.cateIds && row.cateIds.length > 0">
            {{ getCategoryTitles(row.cateIds) }}
          </div>
          <div v-else>全部分类</div>
        </template>
      </el-table-column>

      <el-table-column label="描述">
        <template #default="{ row }">
          <div>{{ row.describe }}</div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100px">
        <template #default="{ row }">
          <span>{{ getStatusLabel(row.status) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="编辑" width="200px">
        <template #default="{ row }">
          <el-button type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination Component -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredActivities.length"
      layout="prev, pager, next"
    />

    <!-- Delete Confirmation Dialog -->
    <el-dialog v-model="isDeleteDialogVisible" width="30%" title="确认删除">
      <span>是否确认删除该活动？</span>
      <template #footer>
        <el-button type="primary" @click="deleteActivity" :loading="isDeleting"
          >是</el-button
        >
        <el-button @click="isDeleteDialogVisible = false">否</el-button>
      </template>
    </el-dialog>

    <!-- Create/Edit Activity Dialog -->
    <el-dialog v-model="isEditDialogVisible" width="50%" title="编辑活动">
      <el-form v-if="editableActivity" :model="editableActivity">
        <el-form-item label="活动名称">
          <el-input v-model="editableActivity.title"></el-input>
        </el-form-item>

        <el-form-item label="优惠抵扣价格">
          <el-input type="number" v-model.number="editableActivity.dePrice" />
        </el-form-item>

        <el-form-item label="活动时间">
          <el-date-picker
            v-model="editableActivity.startTime"
            type="datetime"
            placeholder="开始时间"
            style="width: 48%; margin-right: 4%;"
          />
          <el-date-picker
            v-model="editableActivity.endTime"
            type="datetime"
            placeholder="结束时间"
            style="width: 48%;"
          />
        </el-form-item>

        <el-form-item label="适用分类">
          <el-select
            v-model="editableActivity.cateIds"
            multiple
            placeholder="选择适用分类"
            style="width: 100%;"
          >
            <el-option
              v-for="category in productCategoriesArray"
              :key="category.id"
              :label="category.title"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input type="textarea" v-model="editableActivity.describe" />
        </el-form-item>

        <el-form-item label="活动状态">
          <el-radio-group v-model="editableActivity.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上传图片">
          <img
            :src="imagePreview"
            v-if="imagePreview"
            style="width: 100px; height: auto; margin-right: 10px;"
          />
          <el-upload
            action=""
            :file-list="[]"
            :on-change="onImageChange"
            :show-file-list="false"
            :auto-upload="false"
          >
            <el-button type="primary">选择图片</el-button>
          </el-upload>
          <div
            style="color: #f56c6c; font-size: 12px; margin-top: 5px; width: 100%;"
          >
            图片文件名禁止使用中文
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button
          type="primary"
          @click="saveActivityChanges"
          :loading="isSaving"
          >保存</el-button
        >
        <el-button @click="isEditDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Add any custom styles here if needed */
</style>
