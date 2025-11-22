import XLSX from 'xlsx';

const wb = XLSX.readFile('scripts/339597630_按文本_小程序爆炸订单_11_8.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, {range: 0, header: 1});

console.log('Total rows:', data.length);
console.log('\nFirst 5 data rows:');
data.slice(1, 6).forEach((row, i) => {
  console.log(`\nRow ${i + 2}:`);
  console.log('  时间:', row[1]);
  console.log('  地点:', row[2]);
  console.log('  饮品:', row[3]);
  console.log('  冰热:', row[4]);
  console.log('  燕麦奶:', row[5]);
});

console.log('\n\nTesting drink parsing logic:');
console.log('Sample drink string: 【美式】葡萄美式：10.8r');
const testDrink = '【美式】葡萄美式：10.8r';
const parts = testDrink.split('】');
console.log('After split by 】:', parts);
if (parts.length >= 2) {
  const productName = parts[1].split('：')[0];
  console.log('Product name:', productName);
}

console.log('\n\nTest multiple drinks:');
const multiDrink = '【美式】葡萄美式：10.8r】【奶咖】香蕉拿铁：10.8r';
console.log('Multi drink string:', multiDrink);
// Split by the pattern "]【" to separate drinks
const drinks = multiDrink.split('】【');
console.log('Split result:', drinks);

console.log('\n\nAll data rows:');
data.slice(1).forEach((row, i) => {
  if (row[1]) {
    console.log(`\nRow ${i + 2}:`);
    console.log('  时间:', row[1]);
    console.log('  地点:', row[2]);
    console.log('  饮品:', row[3]);
    console.log('  冰热:', row[4]);
    console.log('  燕麦奶:', row[5]);
  }
});
