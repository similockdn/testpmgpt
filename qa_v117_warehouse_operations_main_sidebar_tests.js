const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const src=fs.readFileSync('app.js','utf8');

assert(html.includes('<button type="button" class="menu-toggle">📦 Kho hàng</button>'),'Nhóm menu trái chưa đổi thành Kho hàng');
assert(html.includes('class="submenu warehouse-main-menu"'),'Thiếu nhóm nghiệp vụ kho trong menu chính');
['IN','OUT','TRANSFER','ADJUST','RETURN'].forEach(type=>{
  assert(html.includes(`data-page="inventory" data-stock-operation="${type}"`),`Thiếu nghiệp vụ ${type} trong menu chính`);
});
assert.equal((html.match(/data-stock-operation=/g)||[]).length,5,'Menu chính phải có đúng 5 nghiệp vụ kho');
assert(html.includes('class="stockbook-menu-item" data-page="stockbook"'),'Sổ kho không còn nằm trong nhóm Kho hàng');

assert(!html.includes('class="warehouse-operation-menu"'),'Menu nghiệp vụ cũ vẫn còn trong nội dung trang');
assert(!html.includes('data-stock-mode='),'Còn nút nghiệp vụ kho cũ trong nội dung');
assert(!css.includes('.warehouse-operation-menu{'),'CSS menu nghiệp vụ cũ chưa được dọn');
assert(css.includes('V117 - Nghiệp vụ kho nằm trong menu chính bên trái'),'Thiếu CSS V117');
assert(css.includes('#menu .warehouse-main-menu button{'),'Thiếu định dạng nhóm nghiệp vụ kho bên trái');

assert(src.includes("showPage(btn.dataset.page,btn.dataset.stockOperation||'')"),'Click menu chưa truyền loại nghiệp vụ');
assert(src.includes("const operation=id==='inventory'?(stockOperation||$('stockType')?.value||'IN'):'';"),'Điều hướng chưa xác định nghiệp vụ hiện tại');
assert(src.includes("if(id==='inventory'&&stockOperation)window.setStockMode?.(operation);"),'Điều hướng chưa chọn đúng biểu mẫu kho');
assert(src.includes("document.querySelectorAll('#menu [data-stock-operation]')"),'Chưa đồng bộ trạng thái menu chính');
assert(src.includes("$('pageTitle').textContent=meta?.title||btnTitle(id);"),'Tiêu đề trang chưa đổi theo nghiệp vụ kho');

let depth=0;
for(const ch of css){if(ch==='{')depth++;else if(ch==='}')depth--;assert(depth>=0,'CSS đóng ngoặc sai thứ tự');}
assert.equal(depth,0,'CSS thiếu hoặc thừa dấu ngoặc');

console.log('V117 warehouse operations main sidebar tests OK');
