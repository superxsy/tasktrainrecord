const fs = require('fs');
const path = require('path');

// 读取解析的小鼠数据
const parsedData = JSON.parse(fs.readFileSync('parsed-mouse-data.json', 'utf8'));

// 读取HTML文件
let htmlContent = fs.readFileSync('matrix-version.html', 'utf8');

// 构建新的小鼠数据字符串
const miceDataStr = parsedData.mice.map(mouse => 
  `         { "id": "${mouse.id}", "sessions": "", "color": "${mouse.color}" }`
).join(',\n');

// 构建新的步骤数据字符串
const stepsDataStr = parsedData.steps.map(step => {
  const miceStr = step.mice.map(mouseId => {
    const mouse = parsedData.mice.find(m => m.id === mouseId);
    return `            { "id": "${mouseId}", "sessions": "", "color": "${mouse.color}" }`;
  }).join(',\n');
  
  return `        {\n          "title": "${step.title}",\n          "mice": [\n${miceStr}\n          ]\n        }`;
}).join(',\n');

// 构建新的小鼠顺序字符串
const mouseOrderStr = parsedData.mice.map(mouse => `"${mouse.id}"`).join(', ');

// 替换initializeDefaultData函数
const newInitFunction = `    function initializeDefaultData() {
      // Initialize with data from parsed Excel file
       state.mice = [
${miceDataStr}
       ];
      
      // Initialize steps with actual data from parsed Excel file
      state.steps = [
${stepsDataStr}
      ];
      
      // Initialize mouse order from parsed Excel data
      state.mouseOrder = [
        ${mouseOrderStr}
      ];
      
      // Initialize daily records from parsed Excel data
      if (!state.dailyRecords) {
        state.dailyRecords = [];
      }
      
      saveState();
    }`;

// 使用正则表达式替换initializeDefaultData函数
const functionRegex = /function initializeDefaultData\(\)[\s\S]*?saveState\(\);\s*}/;
htmlContent = htmlContent.replace(functionRegex, newInitFunction);

// 写回HTML文件
fs.writeFileSync('matrix-version.html', htmlContent, 'utf8');

console.log('✅ 成功更新matrix-version.html中的默认数据');
console.log('📊 更新的数据包括:');
console.log(`   - ${parsedData.mice.length}只小鼠`);
console.log(`   - ${parsedData.steps.length}个训练步骤`);
console.log('🔄 数据已从Excel文件导入并设置为默认值');