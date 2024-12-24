<!-- ActivityManagement.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  uploadImage1,
  getAllActivitiesShop,
  updateActivity,
  createEntity,
} from '../client/services.gen';
import type { Activity } from '../client/types.gen';
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
  ElRadioGroup,
  ElRadio,
  ElUpload,
} from 'element-plus';

const activities = ref<Activity[]>([]);
const isDeleteDialogVisible = ref(false);
const isEditDialogVisible = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const activityToDelete = ref<Activity | null>(null);
const editableActivity = ref<Activity | null>(null);

const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const imageFileMenu = ref<File | null>(null);
const imagePreviewMenu = ref<string | null>(null);
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
  status: '',
});

const resetFilters = () => {
  searchQuery.value = { title: '', status: '' };
  currentPage.value = 1; // Reset to first page after resetting
};

// Computed property for filtered activities
const filteredActivities = computed(() => {
  return activities.value.filter((activity) => {
    const matchesTitle =
      searchQuery.value.title === '' ||
      (activity.title && activity.title.includes(searchQuery.value.title));
    const matchesStatus =
      searchQuery.value.status === '' ||
      (activity.status !== undefined && activity.status.toString() === searchQuery.value.status);
    return matchesTitle && matchesStatus && activity.delete !== 1;
  });
});

const openEditDialog = (activity: Activity) => {
  editableActivity.value = {
    ...activity,
    // Removed cateIds and dePrice
  };
  imageFile.value = null;
  imagePreview.value = activity.imgURL || null;
  imageFileMenu.value = null;
  imagePreviewMenu.value = activity.imgURL_menu || null;
  isCreating.value = false;
  isEditDialogVisible.value = true;
};

const saveActivityChanges = async () => {
  if (!editableActivity.value) return;

  isSaving.value = true;
  let imageFilename = editableActivity.value.imgURL || '';
  let imageFilenameMenu = editableActivity.value.imgURL_menu || '';

  try {
    // Upload imgURL if a new file is selected
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
        ElMessage.error('主图片上传失败');
        throw error;
      }
    }

    // Upload imgURL_menu if a new file is selected
    if (imageFileMenu.value) {
      try {
        const imageMenuResponse = await uploadImage1({
          body: {
            image: imageFileMenu.value,
          },
        });
        imageFilenameMenu = imageMenuResponse.data;
      } catch (error) {
        console.error('Menu Image upload failed:', error);
        ElMessage.error('菜单图片上传失败');
        throw error;
      }
    }

    // Extract filename from URL if necessary
    if (imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop()!;
    }

    if (imageFilenameMenu.includes('/')) {
      imageFilenameMenu = imageFilenameMenu.split('/').pop()!;
    }

    // Update the editableActivity with new image filenames
    editableActivity.value.imgURL = imageFilename;
    editableActivity.value.imgURL_menu = imageFilenameMenu;

    console.log('editableActivity', editableActivity.value);

    if (isCreating.value) {
      await createEntity({
        body: editableActivity.value,
      });
      ElMessage.success('活动创建成功');
    } else {
      await updateActivity({
        body: editableActivity.value,
        method: 'PUT',
        throwOnError: true,
      });
      ElMessage.success('活动更新成功');
    }

    await fetchActivities();
    isEditDialogVisible.value = false;
  } catch (error) {
    console.error('Error saving activity:', error);
    ElMessage.error('保存活动失败');
  } finally {
    isSaving.value = false;
  }
};

const fetchActivities = async () => {
  try {
    const response = await getAllActivitiesShop();
    activities.value = response.data;
    console.log('activities:', activities.value);
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
};

onMounted(async () => {
  try {
    await fetchActivities();
    // Removed fetchProductCategories
  } catch (error) {
    console.error('Error during onMounted:', error);
  }
});

// Removed getCategoryTitles

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

    if (imageFilename && imageFilename.includes('/')) {
      imageFilename = imageFilename.split('/').pop();
    }
    let imageFilenameMenu = activityToDelete.value.imgURL_menu;
    if (imageFilenameMenu && imageFilenameMenu.includes('/')) {
      imageFilenameMenu = imageFilenameMenu.split('/').pop();
    }
    const updatedActivity = {
      ...activityToDelete.value,
      delete: 1,
      status: 0,
      imgURL: imageFilename || '',
      imgURL_menu: imageFilenameMenu || '',
    };
    await updateActivity({ body: updatedActivity });
    await fetchActivities();
    isDeleteDialogVisible.value = false;
    ElMessage.success('活动删除成功');
  } catch (error) {
    console.error('Error deleting activity:', error);
    ElMessage.error('删除活动失败');
  } finally {
    isDeleting.value = false;
  }
};

const openCreateDialog = () => {
  editableActivity.value = {
    title: '',
    imgURL: '',
    imgURL_menu: '',
    describe: '',
    startTime: '',
    endTime: '',
    status: 1,
    delete: 0,
  };
  imageFile.value = null;
  imagePreview.value = null;
  imageFileMenu.value = null;
  imagePreviewMenu.value = null;
  isCreating.value = true;
  isEditDialogVisible.value = true;
};

const onImageChange = (file: any) => {
  if (file && file.raw) {
    imageFile.value = file.raw;
    imagePreview.value = URL.createObjectURL(imageFile.value);
    console.log(imageFile.value);
  } else {
    console.error('No file selected for 主图片');
  }
};

const onImageMenuChange = (file: any) => {
  if (file && file.raw) {
    imageFileMenu.value = file.raw;
    imagePreviewMenu.value = URL.createObjectURL(imageFileMenu.value);
    console.log(imageFileMenu.value);
  } else {
    console.error('No file selected for 菜单图片');
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
      <el-table-column prop="imgURL" label="主图片" width="160px">
        <template #default="{ row }">
          <img
            :src="row.imgURL"
            alt="主活动图片"
            v-if="row.imgURL"
            style="width: 100px; height: auto;"
          />
        </template>
      </el-table-column>

      <el-table-column prop="imgURL_menu" label="菜单图片" width="160px">
        <template #default="{ row }">
          <img
            :src="row.imgURL_menu"
            alt="菜单图片"
            v-if="row.imgURL_menu"
            style="width: 100px; height: auto;"
          />
        </template>
      </el-table-column>

      <el-table-column label="活动名称" width="200px">
        <template #default="{ row }">
          <div>
            <div style="font-weight: bold;">{{ row.title }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="活动时间" width="300px">
        <template #default="{ row }">
          <div>开始时间：{{ formatDateTime(row.startTime) }}</div>  
          <div>结束时间：{{ formatDateTime(row.endTime) }}</div>
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
    <el-dialog v-model="isEditDialogVisible" width="50%" :title="isCreating ? '创建活动' : '编辑活动'">
      <el-form v-if="editableActivity" :model="editableActivity">
        <el-form-item label="活动名称">
          <el-input v-model="editableActivity.title"></el-input>
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

        <el-form-item label="描述">
          <el-input type="textarea" v-model="editableActivity.describe" />
        </el-form-item>

        <el-form-item label="活动状态">
          <el-radio-group v-model="editableActivity.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上传主图片">
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
            <el-button type="primary">选择主图片</el-button>
          </el-upload>
          <div
            style="color: #f56c6c; font-size: 12px; margin-top: 5px; width: 100%;"
          >
            主图片文件名禁止使用中文
          </div>
        </el-form-item>

        <el-form-item label="上传菜单图片">
          <img
            :src="imagePreviewMenu"
            v-if="imagePreviewMenu"
            style="width: 100px; height: auto; margin-right: 10px;"
          />
          <el-upload
            action=""
            :file-list="[]"
            :on-change="onImageMenuChange"
            :show-file-list="false"
            :auto-upload="false"
          >
            <el-button type="primary">选择菜单图片</el-button>
          </el-upload>
          <div
            style="color: #f56c6c; font-size: 12px; margin-top: 5px; width: 100%;"
          >
            菜单图片文件名禁止使用中文
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
