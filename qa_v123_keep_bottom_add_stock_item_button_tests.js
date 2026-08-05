const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const src=fs.readFileSync('app.js','utf8');
const version=fs.readFileSync('VERSION.txt','utf8').trim();

assert.equal(version,'V123_KEEP_BOTTOM_ADD_STOCK_ITEM_BUTTON','Sai VERSION V123');
assert.equal((html.match(/onclick="addStockItem\(\)"/g)||[]).length,1,'Giao diện phải có đúng một nút Thêm mã hàng');
const headerStart=html.indexOf('<div class="warehouse-items-head">');
const tableStart=html.indexOf('<table class="editable">',headerStart);
const header=html.slice(headerStart,tableStart);
assert(headerStart>=0&&tableStart>headerStart,'Không tìm thấy phần tiêu đề Danh sách mã hàng');
assert(!header.includes('addStockItem'),'Góc phải phía trên vẫn còn nút Thêm mã hàng');
const bottom=html.match(/<div class="warehouse-bottom-save-actions">([\s\S]*?)<\/div>/)?.[1]||'';
assert(bottom.includes('addStockItem'),'Thanh lưu phía dưới thiếu nút Thêm mã hàng');
assert(bottom.includes('Làm phiếu mới'),'Thanh lưu phía dưới thiếu nút Làm phiếu mới');
assert(bottom.includes('stockSaveBottomButton'),'Thanh lưu phía dưới thiếu nút Lưu phiếu');
assert(css.includes('.warehouse-bottom-save-actions{display:grid;grid-template-columns:1fr 1fr}'),'Bố cục điện thoại chưa đúng cho hai nút phụ');
assert(src.includes("version:'v123'"),'Backup chưa cập nhật V123');

console.log('V123 keep bottom add stock item button tests OK');
