const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const src=fs.readFileSync('app.js','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');

// Phạm vi vai trò kho phải fail-closed và không phụ thuộc dữ liệu cũ có chọn hai kho.
assert(src.includes("if(currentPerm.role==='Kho Chính')return ['Kho Chính'];"),'Kho Chính chưa bị khóa phạm vi ở runtime');
assert(src.includes("if(currentPerm.role==='Kho Văn Phòng')return ['Kho Văn Phòng'];"),'Kho Văn Phòng chưa bị khóa phạm vi ở runtime');
assert(src.includes("if(role==='Kho Chính')wh=['Kho Chính'];"),'normalizePermission chưa khóa Kho Chính');
assert(src.includes("if(role==='Kho Văn Phòng')wh=['Kho Văn Phòng'];"),'normalizePermission chưa khóa Kho Văn Phòng');
assert(src.includes("if(role==='Kho Chính'||role==='Kho Văn Phòng')warehouseAccess=[role];"),'Lưu phân quyền vẫn có thể cấp hai kho cho vai trò kho cố định');

// Phiếu chuyển: chỉ hiện chi tiết theo kho nguồn, nhưng dữ liệu chuyển đến vẫn được tải để tính tồn kho nhận.
assert(src.includes("if(v.type==='TRANSFER')return canAccessWarehouse(v.fromWarehouse||v.warehouse||'Kho Chính');"),'Phiếu chuyển vẫn có thể hiện theo kho nhận');
assert(src.includes("where('toWarehouse','==',warehouse)"),'Thiếu tải chuyển đến để tính tồn kho nhận');
assert(src.includes("return rows.filter(r=>!r.warehouse||canAccessWarehouse(r.warehouse))"),'Nhật ký kho chưa lọc từng dòng theo kho');

// Không lộ tồn kho khác qua Dashboard, sản phẩm hoặc Excel.
assert(src.includes('function visibleStockOf(code,excludeVoucherId='),'Thiếu hàm tồn kho theo phạm vi');
assert(src.includes('function sumStockValue(){return data.products.reduce((a,p)=>a+(visibleStockOf(p.code)'),'Dashboard còn dùng tổng tồn toàn hệ thống');
assert(src.includes("if(type==='products')rows=data.products.map(p=>({code:p.code"),'Thiếu nhánh xuất sản phẩm');
assert(src.includes('stock:visibleStockOf(p.code)'),'Xuất sản phẩm còn lộ tổng tồn kho');
assert(src.includes("activeStockVouchers().filter(canAccessVoucher).flatMap"),'Xuất chứng từ kho chưa lọc quyền');
assert(src.includes('if(!canAccessWarehouse(importWarehouse))'),'Nhập Excel chưa chặn kho ngoài phạm vi');

// Kiểm tra lại quyền ở các thao tác theo ID.
assert(src.includes("if(!canAccessVoucher(v))return alert('Bạn không có quyền xem hoặc sửa chứng từ của kho này.')"),'Sửa phiếu chưa kiểm tra phạm vi');
assert(src.includes("if(!canAccessVoucher(v))return alert('Bạn không có quyền xem hoặc in chứng từ của kho này.')"),'In phiếu chưa kiểm tra phạm vi');
assert(src.includes("if(!v||!canAccessVoucher(v))return alert('Bạn không có quyền xóa chứng từ của kho này.')"),'Xóa phiếu chưa kiểm tra phạm vi');

// Firestore phải có lớp kiểm soát theo kho, không chỉ ẩn trên giao diện.
assert(rules.includes('function hasWarehouseAccess(warehouse)'),'Rules thiếu kiểm tra kho người dùng');
assert(rules.includes('function canReadStockVoucher(stock)'),'Rules thiếu kiểm tra đọc phiếu kho');
assert(rules.includes('function canWriteStockVoucher(stock)'),'Rules thiếu kiểm tra ghi phiếu kho');
assert(rules.includes('allow update: if canWriteStockVoucher(resource.data) && canWriteStockVoucher(request.resource.data);'),'Rules sửa phiếu chưa kiểm tra cả trước và sau');

// Năm nghiệp vụ phải là một menu dọc và đồng bộ trạng thái.
assert(html.includes('class="warehouse-operation-menu"'),'Thiếu menu nghiệp vụ kho');
['IN','OUT','TRANSFER','ADJUST','RETURN'].forEach(type=>assert(html.includes(`data-stock-mode="${type}"`),`Thiếu menu ${type}`));
assert.equal((html.match(/data-stock-mode=/g)||[]).length,5,'Menu dọc phải có đúng 5 nghiệp vụ theo yêu cầu');
assert(css.includes('.warehouse-operation-menu{position:sticky;top:106px;display:flex;flex-direction:column'),'Menu kho chưa xếp dọc');
assert(css.includes('.warehouse-operation-button.active{'),'Thiếu trạng thái nghiệp vụ đang chọn');
assert(src.includes('function syncStockOperationMenu(type)'),'Thiếu đồng bộ menu với loại chứng từ');

let depth=0;
for(const ch of css){if(ch==='{')depth++;else if(ch==='}')depth--;assert(depth>=0,'CSS đóng ngoặc sai thứ tự');}
assert.equal(depth,0,'CSS thiếu hoặc thừa dấu ngoặc');

console.log('V116 warehouse scope + vertical operations tests OK');
