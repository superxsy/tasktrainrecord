# 每日记录功能实现指南

## 1. 实现概述

本指南详细说明如何在现有的小鼠训练记录系统中添加每日记录功能。实现将分为前端UI扩展、后端API扩展和数据结构扩展三个部分。

## 2. 前端实现

### 2.1 HTML结构扩展

在现有的 `matrix-version.html` 中添加以下结构：

```html
<!-- 在header中添加导航按钮 -->
<div id="controls">
  <button id="matrix-view-btn" class="active">训练步骤</button>
  <button id="daily-records-btn">每日记录</button>
  <button id="edit-mode-btn">Enable Edit Mode</button>
  <!-- 现有按钮... -->
</div>

<!-- 每日记录视图容器 -->
<section id="daily-records-section" class="section" style="display: none;">
  <div class="section-header">
    <h2 class="section-title">每日记录管理</h2>
    <div class="daily-controls">
      <select id="mouse-filter">
        <option value="">所有小鼠</option>
      </select>
      <input type="date" id="date-filter">
      <button id="add-record-btn">添加记录</button>
    </div>
  </div>
  
  <!-- 记录表单 -->
  <div id="record-form" class="record-form" style="display: none;">
    <!-- 表单内容 -->
  </div>
  
  <!-- 记录列表 -->
  <div id="records-list" class="records-list">
    <!-- 记录列表内容 -->
  </div>
  
  <!-- 统计图表 -->
  <div id="charts-container" class="charts-container">
    <canvas id="weight-chart"></canvas>
    <canvas id="duration-chart"></canvas>
  </div>
</section>
```

### 2.2 CSS样式扩展

```css
/* 每日记录视图样式 */
.daily-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.daily-controls select,
.daily-controls input {
  padding: 8px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
}

.record-form {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  padding: 25px;
  border-radius: 15px;
  margin: 20px 0;
  border: 2px solid #e1e8ed;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.records-table th,
.records-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.records-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
}

.chart-wrapper {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

### 2.3 JavaScript功能实现

```javascript
// 扩展state对象
let state = { 
  mice: [], 
  steps: [], 
  mouseOrder: [],
  dailyRecords: [] // 新增每日记录数组
};

// 视图切换功能
function initializeViewSwitching() {
  const matrixViewBtn = document.getElementById('matrix-view-btn');
  const dailyRecordsBtn = document.getElementById('daily-records-btn');
  const matrixSection = document.querySelector('.main-content');
  const dailySection = document.getElementById('daily-records-section');
  
  matrixViewBtn.addEventListener('click', () => {
    showMatrixView();
    matrixViewBtn.classList.add('active');
    dailyRecordsBtn.classList.remove('active');
  });
  
  dailyRecordsBtn.addEventListener('click', () => {
    showDailyRecordsView();
    dailyRecordsBtn.classList.add('active');
    matrixViewBtn.classList.remove('active');
  });
}

function showMatrixView() {
  document.querySelector('.main-content').style.display = 'grid';
  document.getElementById('daily-records-section').style.display = 'none';
}

function showDailyRecordsView() {
  document.querySelector('.main-content').style.display = 'none';
  document.getElementById('daily-records-section').style.display = 'block';
  renderDailyRecordsView();
}

// 每日记录管理功能
class DailyRecordsManager {
  constructor() {
    this.currentFilter = { mouseId: '', date: '' };
    this.initializeEventListeners();
  }
  
  initializeEventListeners() {
    // 添加记录按钮
    document.getElementById('add-record-btn').addEventListener('click', () => {
      this.showRecordForm();
    });
    
    // 筛选器
    document.getElementById('mouse-filter').addEventListener('change', (e) => {
      this.currentFilter.mouseId = e.target.value;
      this.renderRecordsList();
    });
    
    document.getElementById('date-filter').addEventListener('change', (e) => {
      this.currentFilter.date = e.target.value;
      this.renderRecordsList();
    });
  }
  
  showRecordForm(record = null) {
    const formContainer = document.getElementById('record-form');
    const isEdit = record !== null;
    
    formContainer.innerHTML = `
      <h3>${isEdit ? '编辑记录' : '添加新记录'}</h3>
      <form id="daily-record-form">
        <div class="form-row">
          <div class="form-group">
            <label for="record-mouse-id">小鼠ID:</label>
            <select id="record-mouse-id" required>
              <option value="">选择小鼠</option>
              ${this.getAllMiceOptions(record?.mouseId)}
            </select>
          </div>
          <div class="form-group">
            <label for="record-date">日期:</label>
            <input type="date" id="record-date" value="${record?.date || new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="record-duration">训练时长 (分钟):</label>
            <input type="number" id="record-duration" min="0" max="1440" value="${record?.duration || ''}" placeholder="例如: 30">
          </div>
          <div class="form-group">
            <label for="record-weight">体重 (克):</label>
            <input type="number" id="record-weight" min="0" max="1000" step="0.1" value="${record?.weight || ''}" placeholder="例如: 25.5">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="record-reward">奖励水量 (毫升):</label>
            <input type="number" id="record-reward" min="0" max="100" step="0.1" value="${record?.rewardVolume || ''}" placeholder="例如: 1.5">
          </div>
          <div class="form-group">
            <label for="record-task">任务信息:</label>
            <input type="text" id="record-task" value="${record?.taskInfo || ''}" placeholder="例如: 步骤3完成">
          </div>
        </div>
        <div class="form-group">
          <label for="record-notes">备注:</label>
          <textarea id="record-notes" rows="3" placeholder="记录任何额外信息...">${record?.notes || ''}</textarea>
        </div>
        <div class="form-actions">
          <button type="submit">${isEdit ? '更新记录' : '保存记录'}</button>
          <button type="button" id="cancel-form">取消</button>
          ${isEdit ? '<button type="button" id="delete-record" class="delete-btn">删除记录</button>' : ''}
        </div>
      </form>
    `;
    
    formContainer.style.display = 'block';
    
    // 绑定表单事件
    this.bindFormEvents(record);
  }
  
  bindFormEvents(record) {
    const form = document.getElementById('daily-record-form');
    const cancelBtn = document.getElementById('cancel-form');
    const deleteBtn = document.getElementById('delete-record');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveRecord(record);
    });
    
    cancelBtn.addEventListener('click', () => {
      this.hideRecordForm();
    });
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('确定要删除这条记录吗？')) {
          this.deleteRecord(record.id);
        }
      });
    }
  }
  
  saveRecord(existingRecord) {
    const formData = {
      mouseId: document.getElementById('record-mouse-id').value,
      date: document.getElementById('record-date').value,
      duration: parseFloat(document.getElementById('record-duration').value) || null,
      weight: parseFloat(document.getElementById('record-weight').value) || null,
      rewardVolume: parseFloat(document.getElementById('record-reward').value) || null,
      taskInfo: document.getElementById('record-task').value.trim(),
      notes: document.getElementById('record-notes').value.trim()
    };
    
    // 验证必填字段
    if (!formData.mouseId || !formData.date) {
      alert('请填写小鼠ID和日期');
      return;
    }
    
    // 检查是否已存在相同小鼠和日期的记录
    const existingIndex = state.dailyRecords.findIndex(r => 
      r.mouseId === formData.mouseId && 
      r.date === formData.date && 
      (!existingRecord || r.id !== existingRecord.id)
    );
    
    if (existingIndex !== -1) {
      if (!confirm('该小鼠在此日期已有记录，是否覆盖？')) {
        return;
      }
      // 删除现有记录
      state.dailyRecords.splice(existingIndex, 1);
    }
    
    if (existingRecord) {
      // 更新现有记录
      const index = state.dailyRecords.findIndex(r => r.id === existingRecord.id);
      if (index !== -1) {
        state.dailyRecords[index] = {
          ...existingRecord,
          ...formData,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // 添加新记录
      const newRecord = {
        id: this.generateRecordId(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.dailyRecords.push(newRecord);
    }
    
    saveState();
    this.hideRecordForm();
    this.renderRecordsList();
    this.updateCharts();
  }
  
  deleteRecord(recordId) {
    const index = state.dailyRecords.findIndex(r => r.id === recordId);
    if (index !== -1) {
      state.dailyRecords.splice(index, 1);
      saveState();
      this.renderRecordsList();
      this.updateCharts();
    }
  }
  
  generateRecordId() {
    return 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  getAllMiceOptions(selectedId = '') {
    const allMice = getAllMice();
    return allMice.map(mouse => 
      `<option value="${mouse.id}" ${mouse.id === selectedId ? 'selected' : ''}>${mouse.id}</option>`
    ).join('');
  }
  
  hideRecordForm() {
    document.getElementById('record-form').style.display = 'none';
  }
  
  renderRecordsList() {
    const container = document.getElementById('records-list');
    let filteredRecords = [...state.dailyRecords];
    
    // 应用筛选器
    if (this.currentFilter.mouseId) {
      filteredRecords = filteredRecords.filter(r => r.mouseId === this.currentFilter.mouseId);
    }
    if (this.currentFilter.date) {
      filteredRecords = filteredRecords.filter(r => r.date === this.currentFilter.date);
    }
    
    // 按日期降序排序
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredRecords.length === 0) {
      container.innerHTML = '<div class="empty-message">暂无记录</div>';
      return;
    }
    
    const tableHTML = `
      <table class="records-table">
        <thead>
          <tr>
            <th>小鼠ID</th>
            <th>日期</th>
            <th>训练时长</th>
            <th>体重</th>
            <th>奖励水量</th>
            <th>任务信息</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRecords.map(record => this.renderRecordRow(record)).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = tableHTML;
    
    // 绑定编辑按钮事件
    container.querySelectorAll('.edit-record-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const recordId = e.target.dataset.recordId;
        const record = state.dailyRecords.find(r => r.id === recordId);
        if (record) {
          this.showRecordForm(record);
        }
      });
    });
  }
  
  renderRecordRow(record) {
    return `
      <tr>
        <td>${record.mouseId}</td>
        <td>${record.date}</td>
        <td>${record.duration ? record.duration + ' 分钟' : '-'}</td>
        <td>${record.weight ? record.weight + ' 克' : '-'}</td>
        <td>${record.rewardVolume ? record.rewardVolume + ' 毫升' : '-'}</td>
        <td>${record.taskInfo || '-'}</td>
        <td>${record.notes || '-'}</td>
        <td>
          <button class="edit-record-btn" data-record-id="${record.id}" title="编辑">
            ✏️
          </button>
        </td>
      </tr>
    `;
  }
  
  updateCharts() {
    this.renderWeightChart();
    this.renderDurationChart();
  }
  
  renderWeightChart() {
    // 使用Chart.js渲染体重变化图表
    // 实现细节...
  }
  
  renderDurationChart() {
    // 使用Chart.js渲染训练时长统计图表
    // 实现细节...
  }
}

// 初始化每日记录管理器
let dailyRecordsManager;

function renderDailyRecordsView() {
  if (!dailyRecordsManager) {
    dailyRecordsManager = new DailyRecordsManager();
  }
  
  // 更新小鼠筛选器选项
  const mouseFilter = document.getElementById('mouse-filter');
  const allMice = getAllMice();
  mouseFilter.innerHTML = '<option value="">所有小鼠</option>' + 
    allMice.map(mouse => `<option value="${mouse.id}">${mouse.id}</option>`).join('');
  
  dailyRecordsManager.renderRecordsList();
  dailyRecordsManager.updateCharts();
}
```

## 3. 后端实现

### 3.1 扩展server.js

```javascript
// 在现有的server.js中添加每日记录相关的API路由

// 获取指定小鼠的每日记录
app.get('/api/daily-records/:mouseId', (req, res) => {
  try {
    const { mouseId } = req.params;
    const data = loadData();
    const records = (data.dailyRecords || []).filter(r => r.mouseId === mouseId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching daily records:', error);
    res.status(500).json({ error: 'Failed to fetch daily records' });
  }
});

// 添加每日记录
app.post('/api/daily-records', (req, res) => {
  try {
    const recordData = req.body;
    
    // 验证数据
    if (!recordData.mouseId || !recordData.date) {
      return res.status(400).json({ error: 'Mouse ID and date are required' });
    }
    
    const data = loadData();
    if (!data.dailyRecords) {
      data.dailyRecords = [];
    }
    
    // 生成唯一ID
    const newRecord = {
      id: 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.dailyRecords.push(newRecord);
    saveData(data);
    
    res.json({ success: true, record: newRecord });
  } catch (error) {
    console.error('Error adding daily record:', error);
    res.status(500).json({ error: 'Failed to add daily record' });
  }
});

// 更新每日记录
app.put('/api/daily-records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const data = loadData();
    if (!data.dailyRecords) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const recordIndex = data.dailyRecords.findIndex(r => r.id === id);
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    data.dailyRecords[recordIndex] = {
      ...data.dailyRecords[recordIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    saveData(data);
    res.json({ success: true, record: data.dailyRecords[recordIndex] });
  } catch (error) {
    console.error('Error updating daily record:', error);
    res.status(500).json({ error: 'Failed to update daily record' });
  }
});

// 删除每日记录
app.delete('/api/daily-records/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const data = loadData();
    if (!data.dailyRecords) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    const recordIndex = data.dailyRecords.findIndex(r => r.id === id);
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    data.dailyRecords.splice(recordIndex, 1);
    saveData(data);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily record:', error);
    res.status(500).json({ error: 'Failed to delete daily record' });
  }
});
```

## 4. 数据迁移

### 4.1 向后兼容性处理

```javascript
// 在loadState函数中添加数据迁移逻辑
async function loadState() {
  try {
    const response = await fetch('/api/data');
    if (response.ok) {
      const serverData = await response.json();
      state = serverData;
      
      // 确保dailyRecords数组存在
      if (!state.dailyRecords) {
        state.dailyRecords = [];
        saveState(); // 保存更新后的状态
      }
      
      // 其他向后兼容性处理...
    }
  } catch (error) {
    // 错误处理...
  }
}
```

## 5. 测试建议

### 5.1 功能测试清单

- [ ] 视图切换功能正常
- [ ] 添加每日记录功能
- [ ] 编辑每日记录功能
- [ ] 删除每日记录功能
- [ ] 筛选和排序功能
- [ ] 数据验证功能
- [ ] 图表显示功能
- [ ] 数据导入导出兼容性
- [ ] 响应式设计适配
- [ ] 数据持久化功能

### 5.2 性能优化建议

1. **数据索引**：为大量记录建立索引以提高查询性能
2. **分页加载**：当记录数量较多时实现分页
3. **图表优化**：使用Chart.js的性能优化选项
4. **缓存策略**：实现客户端缓存减少服务器请求

## 6. 部署注意事项

1. 确保现有数据备份
2. 测试数据迁移功能
3. 验证所有API端点
4. 检查响应式设计在不同设备上的表现
5. 确认Chart.js库正确加载