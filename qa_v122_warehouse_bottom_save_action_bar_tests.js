const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const src=fs.readFileSync('app.js','utf8');
const version=fs.readFileSync('VERSION.txt','utf8').trim();

assert.equal(version,'V122_WAREHOUSE_BOTTOM_SAVE_ACTION_BAR','Sai VERSION V122');
assert(html.includes('class="warehouse-bottom-save-bar"'),'Thiếu thanh lưu dưới danh sách mã hàng');
assert(html.includes('id="stockSaveBottomButton"'),'Thiếu nút lưu cuối bảng');
assert(html.includes('id="stockSaveTopButton"'),'Nút lưu phía trên chưa có ID để đồng bộ');
assert(html.includes('id="stockSaveSummary"'),'Thiếu chỉ báo số dòng/số lượng');
assert(html.indexOf('id="stockSaveBottomButton"')>html.indexOf('id="stockItems"'),'Nút lưu cuối chưa nằm sau bảng mã hàng');
assert(src.includes('function stockSaveButtonText('),'Thiếu tên nút động theo nghiệp vụ');
assert(src.includes('function updateStockSaveSummary()'),'Thiếu cập nhật tổng dòng/số lượng');
assert(src.includes("$('stockSaveBottomButton').textContent=buttonText"),'Nút dưới chưa đồng bộ nghiệp vụ');
assert(src.includes("$('stockSaveTopButton').textContent=buttonText"),'Nút trên chưa đồng bộ nghiệp vụ');
assert(src.includes("window.saveStockVoucher();"),'Phím tắt chưa gọi đúng hàm lưu toàn cục');
assert(src.includes("event.ctrlKey||event.metaKey"),'Thiếu phím tắt Windows/macOS');
assert(css.includes('V122 - Lưu phiếu kho ngay sau danh sách mã hàng'),'Thiếu CSS V122');
assert(css.includes('.warehouse-bottom-save-actions .stock-save-main'),'Thiếu định dạng nút lưu chính');
assert(src.includes("version:'v122'"),'Backup chưa cập nhật V122');

console.log('V122 warehouse bottom save action bar tests OK');
