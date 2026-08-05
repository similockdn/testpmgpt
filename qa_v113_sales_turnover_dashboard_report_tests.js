const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const src=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');

function extractFunction(name){
  const start=src.indexOf(`function ${name}(`);
  if(start<0)throw new Error(`Không tìm thấy hàm ${name}`);
  const p0=src.indexOf('(',start);
  let paren=0,quote='',escape=false,body=-1;
  for(let i=p0;i<src.length;i++){
    const c=src[i];
    if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='(')paren++;
    else if(c===')'&&--paren===0){body=src.indexOf('{',i);break;}
  }
  let depth=0;quote='';escape=false;
  for(let i=body;i<src.length;i++){
    const c=src[i];
    if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{')depth++;
    else if(c==='}'&&--depth===0)return src.slice(start,i+1);
  }
  throw new Error(`Hàm ${name} không đóng ngoặc`);
}

const ctx={
  data:{sales:[]},
  isSaleCanceled:s=>s?.canceled===true,
  reportDateValue:v=>String(v||'').slice(0,10),
  salePaymentInfo:s=>s.payment||{paidTotal:0,debtLeft:+s.grand||0}
};
ctx.activeSales=()=>ctx.data.sales.filter(s=>!ctx.isSaleCanceled(s));
vm.createContext(ctx);
vm.runInContext([
  extractFunction('salesOrdersInRange'),
  extractFunction('salesTurnoverMetrics')
].join('\n'),ctx);

const full={id:'A',date:'2026-07-02',grand:3000000,payment:{paidTotal:3000000,debtLeft:0}};
const partial={id:'B',date:'2026-07-10',grand:2000000,payment:{paidTotal:400000,debtLeft:1600000}};
const unpaid={id:'C',date:'2026-07-20',grand:1000000,payment:{paidTotal:0,debtLeft:1000000}};
const overpaid={id:'D',date:'2026-07-25',grand:500000,payment:{paidTotal:700000,debtLeft:0}};
const june={id:'E',date:'2026-06-30',grand:900000,payment:{paidTotal:900000,debtLeft:0}};
const canceled={id:'F',date:'2026-07-15',grand:800000,canceled:true,payment:{paidTotal:0,debtLeft:800000}};
ctx.data.sales=[full,partial,unpaid,overpaid,june,canceled];

const july=Array.from(ctx.salesOrdersInRange('2026-07-01','2026-07-31'));
assert.deepEqual(july.map(s=>s.id),['A','B','C','D'],'Doanh số tháng 7 phải lấy mọi phiếu còn hiệu lực theo ngày bán');

const m=ctx.salesTurnoverMetrics(july);
assert.equal(m.turnover,6500000,'Tổng doanh số phải gồm phiếu đã thu đủ, thu một phần và chưa thu');
assert.equal(m.paid,3900000,'Đã thu phải phân bổ theo phiếu và không vượt giá trị phiếu');
assert.equal(m.debt,2600000,'Còn phải thu phải bằng Tổng doanh số - Đã thu');
assert.equal(m.turnover,m.paid+m.debt,'Ba chỉ tiêu doanh số phải đối chiếu tuyệt đối');
assert.equal(m.orderCount,4,'Sai tổng số phiếu');
assert.equal(m.fullyPaidCount,2,'Sai số phiếu đã thu đủ');
assert.equal(m.partPaidCount,1,'Sai số phiếu thu một phần');
assert.equal(m.unpaidCount,1,'Sai số phiếu chưa thu');

assert(html.includes('id="kpiSalesTurnover"'),'Dashboard thiếu KPI Tổng doanh số bán hàng');
assert(html.includes('id="reportSalesTurnoverDetailTable"'),'Báo cáo thiếu bảng chi tiết doanh số');
assert(html.includes("exportExcel('salesTurnover')"),'Thiếu nút Xuất doanh số');
assert(src.includes("'Tong_hop_doanh_so':salesTurnoverSummaryExportRows()"),'Excel doanh số thiếu sheet tổng hợp');
assert(src.includes("'Chi_tiet_doanh_so':rows.length?rows"),'Excel doanh số thiếu sheet chi tiết');
assert(src.includes("const sales=revenueRecognizedSalesInRange(from,to);"),'Không được thay đổi doanh thu thực thu sang ngày bán');

console.log('V113 sales turnover dashboard/report tests OK');
