// ============================================================
// 库存管理系统 - 共享数据层 (LocalStorage 持久化)
// ============================================================

const DB = {
  INVENTORY_KEY: 'inventory_data',
  LEDGER_KEY: 'inventory_ledger',

  // 初始示例数据
  seedData: [
    { id: 1, warehouseCode: 'HZ001', warehouseName: '杭州RDC仓', warehouseAttr: '成品仓', warehouseSource: 'JLP', productGroup: '净厨组', kpiLine: '饮水', productLine: '饮水机', materialCode: '1BJ01001080', materialName: '饮水机、JYW-WH265、沙丘灰、220V、50HZ、1...', materialModel: 'JYW-WH265', canOrder: '否', pendingSupply: 0, pendingAlloc: 0, stockQty: 120, lockQty: 30, updatedAt: '2026-05-28 10:00:00' },
    { id: 2, warehouseCode: 'HZ001', warehouseName: '杭州RDC仓', warehouseAttr: '成品仓', warehouseSource: 'JLP', productGroup: '电热生活组', kpiLine: '开水煲', productLine: '开水煲', materialCode: '11101001636', materialName: '开水煲、K20FD-W530(B)、复古绿、塑料外壳、I...', materialModel: 'K20FD-W530B', canOrder: '否', pendingSupply: 0, pendingAlloc: 0, stockQty: 85, lockQty: 15, updatedAt: '2026-05-28 10:00:00' },
    { id: 3, warehouseCode: 'HZ001', warehouseName: '杭州RDC仓', warehouseAttr: '成品仓', warehouseSource: 'JLP', productGroup: '电热生活组', kpiLine: '开水煲', productLine: '开水煲', materialCode: '11101001627', materialName: '开水煲、K15FD-W112(A)、低端、青柠绿、I类结...', materialModel: 'K15FD-W112A', canOrder: '是', pendingSupply: 5, pendingAlloc: 0, stockQty: 200, lockQty: 50, updatedAt: '2026-05-28 10:00:00' },
    { id: 4, warehouseCode: 'JN001', warehouseName: '济南RDC仓', warehouseAttr: '成品仓', warehouseSource: 'JLP', productGroup: '电热生活组', kpiLine: '开水煲', productLine: '开水煲', materialCode: '11101001596', materialName: '开水煲、17WU1B(17WU1B-A)、奶油白、I类结构...', materialModel: '17WU1B-A', canOrder: '否', pendingSupply: 0, pendingAlloc: 0, stockQty: 60, lockQty: 10, updatedAt: '2026-05-28 10:00:00' },
    { id: 5, warehouseCode: 'JN001', warehouseName: '济南RDC仓', warehouseAttr: '成品仓', warehouseSource: 'JLP', productGroup: '净厨组', kpiLine: '饮水', productLine: '饮水机', materialCode: '11101007007', materialName: '开水煲、K17FD-W160Pro(A)、奶油白、I类结构...', materialModel: 'K17FD-W160Pro', canOrder: '是', pendingSupply: 10, pendingAlloc: 0, stockQty: 300, lockQty: 80, updatedAt: '2026-05-28 10:00:00' },
    { id: 6, warehouseCode: 'FS001', warehouseName: '佛山RDC仓', warehouseAttr: '成品仓', warehouseSource: 'JLP', productGroup: '电热生活组', kpiLine: '开水煲', productLine: '开水煲', materialCode: '11101001376', materialName: '开水煲、JYK-17C15(C)、黑色、I类电器、1800...', materialModel: 'JYK-17C15C', canOrder: '否', pendingSupply: 0, pendingAlloc: 0, stockQty: 45, lockQty: 5, updatedAt: '2026-05-28 10:00:00' },
    { id: 7, warehouseCode: 'FS001', warehouseName: '佛山RDC仓', warehouseAttr: '成品仓', warehouseSource: 'JLP', productGroup: '电热生活组', kpiLine: '开水煲', productLine: '开水煲', materialCode: '11101001597', materialName: '开水煲、17WU2(17WU2-A)、远航灰、I类结构、1...', materialModel: '17WU2-A', canOrder: '是', pendingSupply: 3, pendingAlloc: 0, stockQty: 175, lockQty: 25, updatedAt: '2026-05-28 10:00:00' },
    { id: 8, warehouseCode: 'FS001', warehouseName: '佛山RDC仓', warehouseAttr: '破损仓', warehouseSource: 'JLP', productGroup: '电热生活组', kpiLine: '开水煲', productLine: '开水煲', materialCode: '11101001564', materialName: '开水煲、K17FD-W6320(A)、银湖灰、I类结构...', materialModel: 'K17FD-W6320A', canOrder: '否', pendingSupply: 0, pendingAlloc: 0, stockQty: 8, lockQty: 0, updatedAt: '2026-05-28 10:00:00' }
  ],

  // 获取库存数据
  getInventory() {
    const raw = localStorage.getItem(this.INVENTORY_KEY);
    if (!raw) {
      this.saveInventory(this.seedData);
      return this.seedData;
    }
    return JSON.parse(raw);
  },

  // 保存库存数据
  saveInventory(data) {
    localStorage.setItem(this.INVENTORY_KEY, JSON.stringify(data));
  },

  // 获取流水记录
  getLedger() {
    const raw = localStorage.getItem(this.LEDGER_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  // 添加流水记录
  addLedger(entry) {
    const ledger = this.getLedger();
    entry.id = Date.now();
    entry.createdAt = new Date().toLocaleString('zh-CN');
    ledger.unshift(entry);
    localStorage.setItem(this.LEDGER_KEY, JSON.stringify(ledger));
  },

  // 生成新ID
  nextId() {
    const inv = this.getInventory();
    return inv.length > 0 ? Math.max(...inv.map(r => r.id)) + 1 : 1;
  },

  // 更新单条库存（并记录流水）
  updateItem(updatedItem, operator = '管理员', reason = '手动调整') {
    const inv = this.getInventory();
    const idx = inv.findIndex(r => r.id === updatedItem.id);
    if (idx === -1) return false;
    const old = inv[idx];
    // 记录变动
    if (old.stockQty !== updatedItem.stockQty || old.lockQty !== updatedItem.lockQty) {
      this.addLedger({
        materialCode: updatedItem.materialCode,
        materialName: updatedItem.materialName,
        warehouseName: updatedItem.warehouseName,
        changeType: '手动调整',
        stockBefore: old.stockQty,
        stockAfter: updatedItem.stockQty,
        stockChange: updatedItem.stockQty - old.stockQty,
        lockBefore: old.lockQty,
        lockAfter: updatedItem.lockQty,
        lockChange: updatedItem.lockQty - old.lockQty,
        operator,
        reason,
      });
    }
    updatedItem.updatedAt = new Date().toLocaleString('zh-CN');
    inv[idx] = updatedItem;
    this.saveInventory(inv);
    return true;
  },

  // 新增库存记录
  addItem(item, operator = '管理员') {
    const inv = this.getInventory();
    item.id = this.nextId();
    item.updatedAt = new Date().toLocaleString('zh-CN');
    inv.push(item);
    this.saveInventory(inv);
    this.addLedger({
      materialCode: item.materialCode,
      materialName: item.materialName,
      warehouseName: item.warehouseName,
      changeType: '新增入库',
      stockBefore: 0,
      stockAfter: item.stockQty,
      stockChange: item.stockQty,
      lockBefore: 0,
      lockAfter: item.lockQty,
      lockChange: item.lockQty,
      operator,
      reason: '新增库存记录',
    });
    return item;
  },

  // 删除库存记录
  deleteItem(id, operator = '管理员') {
    const inv = this.getInventory();
    const item = inv.find(r => r.id === id);
    if (!item) return false;
    this.addLedger({
      materialCode: item.materialCode,
      materialName: item.materialName,
      warehouseName: item.warehouseName,
      changeType: '删除记录',
      stockBefore: item.stockQty,
      stockAfter: 0,
      stockChange: -item.stockQty,
      lockBefore: item.lockQty,
      lockAfter: 0,
      lockChange: -item.lockQty,
      operator,
      reason: '删除库存记录',
    });
    const updated = inv.filter(r => r.id !== id);
    this.saveInventory(updated);
    return true;
  },

  // 批量导入（覆盖 or 追加）
  importBatch(rows, mode = 'append', operator = '管理员') {
    let inv = mode === 'overwrite' ? [] : this.getInventory();
    rows.forEach(row => {
      const existing = inv.find(r => r.materialCode === row.materialCode && r.warehouseCode === row.warehouseCode);
      if (existing) {
        const oldStock = existing.stockQty;
        const oldLock = existing.lockQty;
        Object.assign(existing, row, { id: existing.id, updatedAt: new Date().toLocaleString('zh-CN') });
        this.addLedger({
          materialCode: row.materialCode,
          materialName: row.materialName,
          warehouseName: row.warehouseName,
          changeType: '导入更新',
          stockBefore: oldStock,
          stockAfter: row.stockQty,
          stockChange: row.stockQty - oldStock,
          lockBefore: oldLock,
          lockAfter: row.lockQty,
          lockChange: row.lockQty - oldLock,
          operator,
          reason: 'Excel导入',
        });
      } else {
        row.id = inv.length > 0 ? Math.max(...inv.map(r => r.id)) + 1 : 1;
        row.updatedAt = new Date().toLocaleString('zh-CN');
        inv.push(row);
        this.addLedger({
          materialCode: row.materialCode,
          materialName: row.materialName,
          warehouseName: row.warehouseName,
          changeType: '导入新增',
          stockBefore: 0,
          stockAfter: row.stockQty,
          stockChange: row.stockQty,
          lockBefore: 0,
          lockAfter: row.lockQty,
          lockChange: row.lockQty,
          operator,
          reason: 'Excel导入',
        });
      }
    });
    this.saveInventory(inv);
    return inv.length;
  }
};
