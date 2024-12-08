<template>
  <div>
    <!-- 输入表单 -->
    <!-- <el-form>
      <el-form-item label="订单号">
        <el-input v-model="orderNumber" placeholder="输入订单号"></el-input>
      </el-form-item>
      <el-form-item label="下单时间">
        <el-date-picker
          v-model="orderTime"
          type="datetime"
          placeholder="选择下单时间"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="商品列表">
        <div v-for="(item, index) in items" :key="index" style="margin-bottom: 10px;">
          <el-input
            v-model="item.name"
            placeholder="商品名称"
            style="width: 30%; margin-right: 10px;"
          ></el-input>
          <el-input-number
            v-model="item.quantity"
            placeholder="数量"
            style="width: 15%; margin-right: 10px;"
          ></el-input-number>
          <el-input-number
            v-model="item.price"
            placeholder="单价"
            style="width: 15%; margin-right: 10px;"
          ></el-input-number>
          <el-button type="danger" @click="removeItem(index)">删除</el-button>
        </div>
        <el-button type="primary" @click="addItem">添加商品</el-button>
      </el-form-item>
      <el-form-item label="合计">
        <span>{{ totalAmount }} 元</span>
      </el-form-item>
    </el-form> -->

    <el-button type="primary" @click="handlePrint">打印</el-button>

    <!-- <svg
      id="printSvg"
      ref="printSvg"
      width="72mm"
      height="130mm"
      xmlns="http://www.w3.org/2000/svg"
      style="display: none;"
    >
      <text
        x="36mm"
        y="10mm"
        font-size="14"
        font-weight="bold"
        text-anchor="middle"
      >
        {{ storeName }}
      </text>

      <text x="5mm" y="20mm" font-size="12">
        订单号：{{ orderNumber }}
      </text>

      <text x="5mm" y="25mm" font-size="12">
        下单时间：{{ formatDateTime(new Date(orderTime)) }}
      </text>

      <line
        x1="5mm"
        :y1="`${30}mm`"
        x2="67mm"
        :y2="`${30}mm`"
        stroke="#000"
        stroke-width="0.5"
      />

      <text x="5mm" y="35mm" font-size="12">
        项目名称&nbsp;&nbsp;数量&nbsp;&nbsp;单价&nbsp;&nbsp;小计
      </text>

      <g v-for="(item, index) in items" :key="index">
        <text
          x="5mm"
          :y="`${40 + index * 5}mm`"
          font-size="12"
        >
          {{ item.name }}&nbsp;&nbsp;{{ item.quantity }}&nbsp;&nbsp;{{ item.price }}&nbsp;&nbsp;{{ (item.quantity * item.price).toFixed(2) }}
        </text>
      </g>

      <line
        x1="5mm"
        :y1="`${45 + items.length * 5}mm`"
        x2="67mm"
        :y2="`${45 + items.length * 5}mm`"
        stroke="#000"
        stroke-width="0.5"
      />

      <text
        x="5mm"
        :y="`${50 + items.length * 5}mm`"
        font-size="12"
        font-weight="bold"
      >
        合计：{{ totalAmount }} 元
      </text>

      <text
        x="36mm"
        :y="`${60 + items.length * 5}mm`"
        font-size="12"
        text-anchor="middle"
      >
        谢谢光临，欢迎再次惠顾！
      </text>
    </svg>
     -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElDatePicker,
} from 'element-plus';
import { hiprint, hiPrintPlugin } from 'vue-plugin-hiprint';
import printTemplate from '@/assets/printTemplate_head.json';

// 初始化 hiprint
hiprint.init({
  host: 'http://localhost:17521',
});

const handlePrint = async () => {
  let printData = {orderNum:66,total:100};
  let hiprintTemplate = new hiprint.PrintTemplate({ template: printTemplate});
  // 打印
  hiprintTemplate.print2(printData);
};

// // 响应式数据
// const storeName = ref('奇美拉咖啡');
// const orderNumber = ref('');
// const orderTime = ref('');
// const items = ref([{ name: '', quantity: 1, price: 0 }]);

// // 计算合计金额
// const totalAmount = computed(() => {
//   return items.value
//     .reduce((sum, item) => {
//       return sum + item.quantity * item.price;
//     }, 0)
//     .toFixed(2);
// });

// // 添加商品
// const addItem = () => {
//   items.value.push({ name: '', quantity: 1, price: 0 });
// };

// // 删除商品
// const removeItem = (index: number) => {
//   items.value.splice(index, 1);
// };

// // 格式化日期时间
// const formatDateTime = (date: Date) => {
//   if (!date) return '';
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');

//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const seconds = String(date.getSeconds()).padStart(2, '0');

//   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// };

// // 获取打印 SVG 的引用
// const printSvg = ref<SVGSVGElement | null>(null);

// const template = 
// // 包含一个 “panels” 及 hiprint中的 “面板”
// {
//   // “面板” 是一个数组，(支持多面板)
//   panels: [
//     // 面板 0 ， 包含 宽、高、打印元素、页眉、页脚等重要信息。
//     {
//       index: 0, // 面板下标
//       height: 120, // 纸张 高 (mm)
//       width: 80, // 纸张 宽 (mm)
//       paperHeader: 49.5, // 页眉 (pt)
//       paperFooter: 780, // 页脚 (pt)
//       printElements: [ // 打印元素, 数组
//         // 打印元素
//         {
//           // 打印元素 参数
//           options: { left: 60, top: 27, height: 13, width: 52, title: "页眉线" },
//           // 打印元素 类型
//           printElementType: { title: "自定义文本", type: "text" },
//         },
//       ], 
//       paperNumberLeft: 565.5, // 页码位置 left (pt)
//       paperNumberTop: 819, // 页码位置 top (pt)
//     },
//   ],
// };

// const handlePrint = async () => {
//   await nextTick(); // 确保 DOM 更新完成

//   if (!printSvg.value) {
//     console.error('打印内容为空');
//     return;
//   }

//   // 获取 SVG 内容
//   const serializer = new XMLSerializer();
//   let svgContent = serializer.serializeToString(printSvg.value);

//   // 添加命名空间，确保 SVG 能正确渲染
//   if (!svgContent.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
//     svgContent = svgContent.replace(
//       /^<svg/,
//       '<svg xmlns="http://www.w3.org/2000/svg"'
//     );
//   }

//   // 将 SVG 内容转换为 Base64 编码的 Data URL
//   const svgBase64 = btoa(unescape(encodeURIComponent(svgContent)));
//   const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

//   // 创建打印模板
//   const printTemplate = new hiprint.PrintTemplate();
//   const panel = printTemplate.addPrintPanel({
//     width: 72,
//     height: 130,
//     units: 'mm',
//     dpi: 203,
//   });

//   // 添加图片到打印模板
//   // panel.addPrintImage({
//   //   options: {
//   //     width: 72,
//   //     height: 130,
//   //     top: 0,
//   //     left: 0,
//   //     src: dataUrl,
//   //     units: 'mm',
//   //   },
//   // });

//   panel.addPrintImage({
//     options: {
//       width: 200,
//       height: 350,
//       top: 0,
//       left: 0,
//       src: dataUrl,
//       units: 'mm',
//     },
//   });

//   // 打印，并指定纸张尺寸
//   printTemplate.print({
//     paperSize: {
//       width: 72,
//       height: 130,
//       unit: 'mm',
//     },
//   });
// };

</script>

<style>
.hidden-print-area {
  visibility: hidden;
  position: absolute;
  left: -9999px;
  top: -9999px;
}

.print-content {
  width: 72mm;
  font-size: 12px;
}
.print-content .store-name {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  margin-top: 5mm;
}
.print-content .order-info {
  margin-top: 5mm;
  margin-left: 5mm;
}
.print-content .separator {
  margin-top: 5mm;
  margin-left: 5mm;
}
.print-content .item-header,
.print-content .item {
  margin-left: 5mm;
  margin-top: 2mm;
}
.print-content .total-amount {
  margin-top: 5mm;
  margin-left: 5mm;
  font-weight: bold;
}
.print-content .thank-you {
  text-align: center;
  margin-top: 10mm;
}

</style>
