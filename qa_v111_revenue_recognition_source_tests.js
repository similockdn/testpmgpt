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
  saleIsInstalled:s=>s?.installStatus==='Đã lắp',
  saleFullyPaidForCommission:s=>s?.fullyPaid===true,
  saleCommissionEarnedAt:s=>s?.fullyPaidAt||'',
  stockVoucherForSale:s=>s?.stockVoucher||null
};
ctx.activeSales=()=>ctx.data.sales.filter(s=>!ctx.isSaleCanceled(s));
vm.createContext(ctx);
vm.runInContext([
  'saleInstallationCompletedAt',
  'saleRevenueRecognitionDate',
  'revenueRecognizedSalesInRange'
].map(extractFunction).join('\n'),ctx);

const depositPending={id:'S1',date:'2026-07-05',installStatus:'Chưa lắp',fullyPaid:false,fullyPaidAt:'',grand:3000000};
assert.equal(ctx.saleRevenueRecognitionDate(depositPending),'','Đơn cọc chưa lắp không được ghi nhận doanh thu');

const fullButNotInstalled={id:'S2',date:'2026-07-05',installStatus:'Chưa lắp',fullyPaid:true,fullyPaidAt:'2026-07-08',grand:3000000};
assert.equal(ctx.saleRevenueRecognitionDate(fullButNotInstalled),'2026-07-08','Thu đủ 100% phải ghi nhận theo ngày thu đủ, không phụ thuộc lắp đặt');

const installedButPartial={id:'S3',date:'2026-07-05',installStatus:'Đã lắp',installCompletedDate:'2026-07-12',fullyPaid:false,grand:3000000};
assert.equal(ctx.saleRevenueRecognitionDate(installedButPartial),'','Đã lắp nhưng chưa thu đủ vẫn chưa được ghi nhận doanh thu');

const paidAfterInstall={id:'S4',date:'2026-06-25',installStatus:'Đã lắp',installCompletedDate:'2026-07-10',fullyPaid:true,fullyPaidAt:'2026-07-18',grand:3000000};
assert.equal(ctx.saleRevenueRecognitionDate(paidAfterInstall),'2026-07-18','Phải ghi nhận vào ngày thu đủ nếu thu đủ sau ngày lắp');

const installedAfterPaid={id:'S5',date:'2026-06-25',installStatus:'Đã lắp',installCompletedDate:'2026-07-20',fullyPaid:true,fullyPaidAt:'2026-06-28',grand:3000000};
assert.equal(ctx.saleRevenueRecognitionDate(installedAfterPaid),'2026-06-28','Ngày lắp sau đó không được đẩy doanh thu sang kỳ khác');

ctx.data.sales=[depositPending,fullButNotInstalled,installedButPartial,paidAfterInstall,installedAfterPaid];
assert.deepEqual(Array.from(ctx.revenueRecognizedSalesInRange('2026-06-01','2026-06-30')).map(x=>x.id),['S5'],'Tháng 6 nhận đúng đơn đã thu đủ trong tháng');
assert.deepEqual(Array.from(ctx.revenueRecognizedSalesInRange('2026-07-01','2026-07-31')).map(x=>x.id),['S2','S4'],'Tháng 7 nhận đúng các đơn đạt đủ 100% trong tháng');

assert(src.includes("const sales=revenueRecognizedSalesInRange(from,to)"),'Báo cáo phải dùng doanh thu đã ghi nhận thay vì ngày bán');
assert(src.includes("const salesInRange=revenueRecognizedSalesInRange(range.from,range.to)"),'Dashboard phải dùng doanh thu đã ghi nhận');
assert(src.includes("'Nguồn khách hàng':ci.source||''"),'Xuất báo cáo doanh thu phải có nguồn khách hàng');
assert(src.includes('customerSource:ci.source||\'\''),'Xuất toàn bộ phiếu bán phải có nguồn khách hàng');
assert(html.includes("exportExcel('revenueReport')"),'Giao diện báo cáo phải có nút xuất doanh thu');
assert(html.includes('Nguồn khách hàng'),'Bảng chi tiết doanh thu phải hiển thị nguồn khách hàng');

console.log('V111 revenue recognition and customer source tests OK');
