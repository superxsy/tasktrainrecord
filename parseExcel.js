const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 解析Excel文件
function parseMouseRecordExcel(filePath) {
    try {
        // 读取Excel文件
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // 获取第一个工作表
        const worksheet = workbook.Sheets[sheetName];
        
        // 将工作表转换为JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log('Excel数据行数:', data.length);
        console.log('前5行数据:');
        data.slice(0, 5).forEach((row, index) => {
            console.log(`第${index + 1}行:`, row);
        });
        
        // 解析小鼠数据和训练记录
        const mice = [];
        const records = [];
        const steps = [
            { id: 'step-0', title: '0. Habituation', mice: [] },
            { id: 'step-1', title: '1. Shaping', mice: [] },
            { id: 'step-2', title: '2. Initial Training', mice: [] },
            { id: 'step-3', title: '3. Reversal Learning', mice: [] },
            { id: 'step-4', title: '4. Probe Test', mice: [] },
            { id: 'step-5', title: '5. Advanced Training', mice: [] },
            { id: 'step-6', title: '6. Final Assessment', mice: [] },
            { id: 'step-7', title: '7. Completion', mice: [] }
        ];
        
        // 查找表头行
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(10, data.length); i++) {
            const row = data[i];
            if (row && row.some(cell => 
                typeof cell === 'string' && 
                (cell.toLowerCase().includes('mouse') || 
                 cell.toLowerCase().includes('id') ||
                 cell.toLowerCase().includes('date') ||
                 cell.toLowerCase().includes('session'))
            )) {
                headerRowIndex = i;
                break;
            }
        }
        
        if (headerRowIndex === -1) {
            console.log('未找到表头行，使用第一行作为表头');
            headerRowIndex = 0;
        }
        
        const headers = data[headerRowIndex] || [];
        console.log('表头:', headers);
        
        // 从第一行提取小鼠ID（通常在表头行）
        const mouseSet = new Set();
        const validMouseIds = [];
        
        // 查找包含小鼠ID的行（通常是第一行或前几行）
        for (let i = 0; i < Math.min(5, data.length); i++) {
            const row = data[i];
            if (!row) continue;
            
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];
                if (cell && typeof cell === 'string') {
                    const cellStr = cell.toString().trim();
                    // 匹配小鼠ID模式：字母+数字（如C001, Y006, X010等）
                    if (/^[A-Z]\d{3,4}$/.test(cellStr)) {
                        if (!mouseSet.has(cellStr)) {
                            mouseSet.add(cellStr);
                            validMouseIds.push(cellStr);
                        }
                    }
                }
            }
        }
        
        console.log('找到的有效小鼠ID:', validMouseIds);
        
        // 为每个有效的小鼠ID创建数据
        validMouseIds.forEach((mouseId, index) => {
            // 创建小鼠对象
            const mouse = {
                id: mouseId,
                color: getRandomColor(),
                sessionCount: 1
            };
            mice.push(mouse);
            
            // 根据小鼠ID的前缀分配到不同步骤
            let stepIndex = 0;
            if (mouseId.startsWith('C')) {
                stepIndex = 0; // Habituation
            } else if (mouseId.startsWith('Y')) {
                stepIndex = 1; // Shaping
            } else if (mouseId.startsWith('X')) {
                stepIndex = 2; // Initial Training
            } else {
                stepIndex = index % steps.length; // 其他情况按顺序分配
            }
            
            steps[stepIndex].mice.push(mouseId);
            
            // 创建一条示例记录
            const record = {
                id: `record-${mouseId}-${Date.now()}-${index}`,
                mouseId: mouseId,
                date: new Date().toISOString().split('T')[0],
                session: 1,
                step: steps[stepIndex].title,
                performance: 'Good',
                notes: `从Excel导入的${mouseId}数据`
            };
            records.push(record);
        });
        
        console.log(`解析完成: 找到${mice.length}只小鼠`);
        mice.forEach(mouse => console.log(`小鼠: ${mouse.id}`));
        
        return {
            mice,
            steps,
            records,
            mouseOrder: mice.map(m => m.id)
        };
        
    } catch (error) {
        console.error('解析Excel文件时出错:', error);
        return null;
    }
}

// 生成随机颜色
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 主函数
function main() {
    const excelPath = path.join(__dirname, 'Mouse record.xlsx');
    
    if (!fs.existsSync(excelPath)) {
        console.error('Excel文件不存在:', excelPath);
        return;
    }
    
    console.log('开始解析Excel文件:', excelPath);
    const result = parseMouseRecordExcel(excelPath);
    
    if (result) {
        // 保存解析结果到JSON文件
        const outputPath = path.join(__dirname, 'parsed-mouse-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
        console.log('解析结果已保存到:', outputPath);
        
        // 输出统计信息
        console.log('\n=== 解析统计 ===');
        console.log(`小鼠数量: ${result.mice.length}`);
        console.log(`训练步骤: ${result.steps.length}`);
        console.log(`记录数量: ${result.records.length}`);
        console.log('\n=== 小鼠列表 ===');
        result.mice.forEach(mouse => {
            console.log(`${mouse.id} (颜色: ${mouse.color})`);
        });
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { parseMouseRecordExcel, getRandomColor };