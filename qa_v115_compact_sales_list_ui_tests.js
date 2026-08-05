const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const src=fs.readFileSync('app.js','utf8');

assert(html.includes('class="sales-list-title"'),'Thiếu khối tiêu đề danh sách riêng để bố trí gọn');
['saleSearch','saleMonthFilter','saleFromFilter','saleToFilter'].forEach(id=>assert(html.includes(`id="${id}"`),`Thiếu bộ lọc ${id}`));
assert(html.includes('onclick="setSaleListToday()"'),'Thiếu nút lọc Hôm nay');
assert(html.includes('onclick="resetSaleListFilters()"'),'Thiếu nút Xóa lọc');

assert(css.includes('V115 - Danh sách phiếu bán gọn'),'Thiếu CSS V115');
assert(css.includes('#salesListTab .sales-list-head{'),'Thiếu phạm vi CSS riêng cho đầu danh sách');
assert(css.includes('grid-template-columns:minmax(230px,.72fr) minmax(0,2.28fr)!important'),'Đầu danh sách chưa được chia lưới gọn');
assert(css.includes('grid-template-columns:minmax(240px,1.55fr) repeat(3,minmax(122px,.72fr)) auto auto!important'),'Bộ lọc chưa nằm trên một hàng ở màn hình rộng');
assert(css.includes('height:34px!important'),'Ô lọc/nút chưa được giảm chiều cao');
assert(css.includes('#salesListTab .sales-table-modern tbody td{'),'Dòng bảng chưa được thu gọn');
assert(css.includes('padding:8px 9px!important'),'Khoảng cách bảng chưa được thu gọn');
assert(css.includes('@media(max-width:900px)'),'Thiếu responsive tablet');
assert(css.includes('@media(max-width:560px)'),'Thiếu responsive điện thoại');

assert(src.includes("window.saleListMonthChanged=()=>"),'Không được mất xử lý lọc tháng');
assert(src.includes("window.saleListDateChanged=()=>"),'Không được mất xử lý khoảng ngày');
assert(src.includes("window.setSaleListToday=()=>"),'Không được mất xử lý lọc hôm nay');
assert(src.includes("window.resetSaleListFilters=()=>"),'Không được mất xử lý xóa lọc');

let depth=0;
for(const ch of css){if(ch==='{')depth++;else if(ch==='}')depth--;assert(depth>=0,'CSS đóng ngoặc sai thứ tự');}
assert.equal(depth,0,'CSS thiếu hoặc thừa dấu ngoặc');

console.log('V115 compact sales list UI tests OK');
