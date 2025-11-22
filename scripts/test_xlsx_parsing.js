import XLSX from 'xlsx';

// Test functions (copied from Order.vue)
const parseDrinkString = (drinkStr) => {
  if (!drinkStr) return [];
  
  const drinks = [];
  
  // 使用正则表达式匹配所有 】 和 ： 之间的内容
  const pattern = /】([^：]+?)：/g;
  let match;
  
  while ((match = pattern.exec(drinkStr)) !== null) {
    let productName = match[1].trim();
    // 去除可能存在的【类别】前缀（如果有的话）
    if (productName.includes('【') && productName.includes('】')) {
      productName = productName.split('】').pop()?.trim() || productName;
    }
    if (productName) {
      drinks.push(productName);
    }
  }
  
  return drinks;
};

const detectTemperature = (tempStr) => {
  if (!tempStr) return null;
  
  if (tempStr.includes('热')) {
    return '热';
  } else if (tempStr.includes('少冰')) {
    return '少冰';
  } else if (tempStr.includes('冰')) {
    return '冰';
  }
  
  return null;
};

const shouldAddOatMilk = (oatMilkStr) => {
  if (!oatMilkStr || oatMilkStr.trim() === '') {
    return false;
  }
  
  if (oatMilkStr.includes('不') || oatMilkStr.includes('否')) {
    return false;
  }
  
  return true;
};

const parseDeliveryLocation = (locationStr) => {
  if (!locationStr) {
    return { school: '', address: '' };
  }
  
  if (locationStr.includes('：')) {
    const parts = locationStr.split('：');
    return {
      school: parts[0].trim(),
      address: parts[1]?.trim() || ''
    };
  }
  
  if (locationStr.includes(':')) {
    const parts = locationStr.split(':');
    return {
      school: parts[0].trim(),
      address: parts[1]?.trim() || ''
    };
  }
  
  return {
    school: locationStr.trim(),
    address: ''
  };
};

// Read and test the xlsx file
const wb = XLSX.readFile('scripts/339597630_按文本_小程序爆炸订单_11_8.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, {range: 0, header: 1});

console.log('Testing XLSX parsing with actual data:\n');

const dataRows = data.slice(1); // Skip header

dataRows.forEach((row, index) => {
  console.log(`\n======== Row ${index + 2} ========`);
  
  const timeStr = row[1]?.toString().trim();
  const locationStr = row[2]?.toString().trim();
  const drinkStr = row[3]?.toString().trim();
  const tempStr = row[4]?.toString().trim();
  const oatMilkStr = row[5]?.toString().trim();
  
  console.log('原始数据:');
  console.log('  时间:', timeStr);
  console.log('  地点:', locationStr);
  console.log('  饮品:', drinkStr);
  console.log('  冰热:', tempStr);
  console.log('  燕麦奶:', oatMilkStr);
  
  console.log('\n解析结果:');
  
  // Parse time
  const normalizedTime = timeStr.replace(/：/g, ':');
  const date = new Date(normalizedTime);
  console.log('  解析时间:', date.toISOString());
  
  // Parse location
  const location = parseDeliveryLocation(locationStr);
  console.log('  解析地点:', location);
  
  // Parse drinks
  const productNames = parseDrinkString(drinkStr);
  console.log('  解析饮品:', productNames);
  
  // Detect temperature
  const temperature = detectTemperature(tempStr);
  console.log('  检测温度:', temperature);
  
  // Detect oat milk
  const needOatMilk = shouldAddOatMilk(oatMilkStr);
  console.log('  需要燕麦奶:', needOatMilk);
});

console.log('\n\n======== Testing Edge Cases ========\n');

// Test multiple drinks with 】【
const multiDrink = '【美式】葡萄美式：10.8r】【奶咖】香蕉拿铁：10.8r';
console.log('多杯测试（】【格式）:', multiDrink);
console.log('解析结果:', parseDrinkString(multiDrink));

// Test multiple drinks with |
const multiDrinkPipe = '【美式】葡萄美式：10.8r | 【美式】葡萄美式：10.8r';
console.log('\n多杯测试（| 格式）:', multiDrinkPipe);
console.log('解析结果:', parseDrinkString(multiDrinkPipe));

const multiDrink2 = '【特调】阿婆梅子酪：11.7r】【美式】椰青美式：10.8r】【奶咖】香蕉拿铁：10.8r';
console.log('\n三杯测试（】【格式）:', multiDrink2);
console.log('解析结果:', parseDrinkString(multiDrink2));

const multiDrink3 = '【特调】阿婆梅子酪：11.7r | 【美式】椰青美式：10.8r | 【奶咖】香蕉拿铁：10.8r';
console.log('\n三杯测试（| 格式）:', multiDrink3);
console.log('解析结果:', parseDrinkString(multiDrink3));
