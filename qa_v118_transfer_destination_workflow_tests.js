const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const src=fs.readFileSync('app.js','utf8');

assert(html.includes('id="stockWorkflowHint"'),'Thiếu vùng hướng dẫn nghiệp vụ xuất/chuyển kho');
assert(css.includes('.stock-workflow-hint.is-out'),'Thiếu định dạng cảnh báo Xuất kho');
assert(css.includes('.stock-workflow-hint.is-transfer'),'Thiếu định dạng luồng Chuyển kho');

assert(src.includes("OUT:{title:'Phiếu xuất kho',hint:'Hàng ra khỏi hệ thống nên phiếu này không có kho nhận.'}"),'Chưa làm rõ nghiệp vụ Xuất kho');
assert(src.includes("function transferDestinationWarehouses(sourceWarehouse){return WAREHOUSES.filter(warehouse=>warehouse!==sourceWarehouse)}"),'Danh sách kho nhận chưa loại kho chuyển đi');
assert(src.includes("currentPerm.role==='Kho Chính'&&allowed.includes('Kho Văn Phòng')?'Kho Văn Phòng'"),'Kho Chính chưa tự chọn Kho Văn Phòng');
assert(src.includes("$('stockWarehouse').addEventListener('change',()=>{syncTransferDestination();updateStockWorkflowHint()})"),'Đổi kho chuyển đi chưa đồng bộ kho nhận');
assert(src.includes("syncTransferDestination(v.toWarehouse||'')"),'Mở sửa phiếu chưa khôi phục kho nhận hợp lệ');
assert(src.includes("if(type==='TRANSFER' && !transferDestinationWarehouses(warehouse).includes(toWarehouse))"),'Thiếu chặn kho nhận không hợp lệ');
assert(src.includes("if(toWrap) toWrap.style.display=isTransfer?'block':'none'"),'Kho nhận chưa chỉ hiện cho Chuyển kho');
assert(src.includes("version:'v118'"),'Backup chưa cập nhật phiên bản V118');

console.log('V118 transfer destination workflow tests OK');
