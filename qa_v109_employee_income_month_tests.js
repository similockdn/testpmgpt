const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const src=fs.readFileSync('app.js','utf8');

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

const functionNames=[
  'validateDate','isoLocalDate','isoDateFromLocal','periodRange','reportDateValue','normalizeImportDate',
  'staffFunctions','staffHasFunction','staffByIdentity','commissionStaffMeta','commissionRoleIncluded','commissionPartsForFilter',
  'lineGross','lineDiscountAmount','lineNet','calcOrderDiscount','calcSaleTotals','calcCommissionBase','calcCommission',
  'saleCommissionBaseValue','saleExpectedCommissionValue','saleCommissionValue',
  'receiptSaleId','receiptCustomerMatchesSale','receiptDedupKey','uniqueReceiptsForFinance','receiptsForSalePayment',
  'saleDirectPaid','salePaymentInfo','saleFullyPaidForCommission','salePaymentEvents','saleCommissionEarnedAt',
  'commissionEligibleSales','commissionFilteredSales','salaryBonusDeductByStaff','employeeIncomeRows','saleReturnVouchers','saleRefundVouchers'
];

const ctx={
  console,
  Date,
  data:{sales:[],receipts:[],stockVouchers:[],staff:[],salaries:[],warranties:[]},
  commissionAppliedFilter:{},
  today:()=> '2026-08-03',
  isSaleCanceled:s=>String(s?.status||'').includes('Đã hủy')||s?.canceled===true,
  isReceiptCanceled:r=>String(r?.status||'').includes('Đã hủy')||r?.canceled===true,
  isVoucherCanceled:v=>String(v?.status||'').includes('Đã hủy')||v?.canceled===true,
  financeDocDate:v=>String(v?.date||'').slice(0,10),
  normalizePhone:v=>String(v||'').replace(/\D/g,''),
  debtClean:v=>String(v||'').trim().toLowerCase(),
  debtAddressKey:v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' '),
  searchKey:v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase(),
  saleCustomerInfo:s=>({name:s.customerName||'',phone:s.customerPhone||'',code:s.customerCode||''}),
  saleItemSummary:s=>({models:(s.items||[]).map(x=>x.code).join(', ')}),
  $:()=>null
};
ctx.activeSales=()=>ctx.data.sales.filter(s=>!ctx.isSaleCanceled(s));
ctx.activeReceipts=()=>ctx.data.receipts.filter(r=>!ctx.isReceiptCanceled(r));
ctx.activeStockVouchers=()=>ctx.data.stockVouchers.filter(v=>!ctx.isVoucherCanceled(v));
vm.createContext(ctx);
vm.runInContext(functionNames.map(extractFunction).join('\n'),ctx);

assert.deepEqual({...ctx.periodRange('month','2026-08-03','2026-02')},{from:'2026-02-01',to:'2026-02-28'},'Phải chọn được một tháng cũ cụ thể');
assert.deepEqual({...ctx.periodRange('month','2024-02-10','2024-02')},{from:'2024-02-01',to:'2024-02-29'},'Tháng nhuận phải có đủ ngày cuối tháng');
assert.deepEqual({...ctx.periodRange('week','2026-08-03')},{from:'2026-08-03',to:'2026-08-09'},'Tuần phải theo giờ địa phương, không lệch UTC');
assert.equal(ctx.normalizeImportDate(25569),'1970-01-01','Ngày Excel dạng số phải được chuẩn hóa');
assert.equal(ctx.normalizeImportDate('31/07/2026'),'2026-07-31','Ngày Việt Nam phải được chuẩn hóa');

ctx.data.staff=[
  {id:'E1',name:'Lan Sale',dept:'Sale',functions:['Sale']},
  {id:'E2',name:'Minh Kỹ Thuật',dept:'Kỹ thuật',functions:['Kỹ thuật']}
];
ctx.data.sales=[
  {id:'S1',code:'BH1',date:'2026-06-20',customerName:'Khách A',customerPhone:'0901',staffId:'',staffName:'Lan Sale',techId:'E2',techName:'Minh Kỹ Thuật',grand:100,commissionBase:100,commissionPercent:5,paid:0,techCost:10,techFuel:2,items:[{code:'F07'}]},
  {id:'S2',code:'BH2',date:'2026-07-20',customerName:'Khách B',staffId:'E1',staffName:'Lan Sale',techId:'E2',techName:'Minh Kỹ Thuật',grand:200,commissionBase:200,commissionPercent:5,paid:0,techCost:20,techFuel:3,items:[{code:'S01'}]}
];
ctx.data.receipts=[
  {id:'R1',saleId:'S1',date:'2026-07-31',amount:100},
  {id:'R2',saleId:'S2',date:'2026-08-01',amount:200}
];
ctx.data.salaries=[
  {id:'L1',date:'2026-07-15',staffName:'Lan Sale',bonus:3,deduct:1},
  {id:'L2',date:'2026-08-15',staffId:'E1',staffName:'Lan Sale',bonus:99,deduct:0}
];

ctx.commissionAppliedFilter={from:'2026-07-01',to:'2026-07-31',staffId:'E1',dept:'',q:''};
let rows=ctx.employeeIncomeRows();
assert.equal(rows.length,1,'Lọc một nhân viên không được kéo theo người còn lại trên cùng đơn');
assert.equal(rows[0].id,'E1','Dữ liệu cũ chỉ có tên phải khớp đúng hồ sơ nhân viên');
assert.equal(rows[0].saleCommission,5,'Hoa hồng phải vào tháng đạt đủ 100%');
assert.equal(rows[0].techCost,0,'Không được cộng công của kỹ thuật khác cho Sale đang chọn');
assert.equal(rows[0].bonus,3,'Thưởng phải lọc đúng tháng');
assert.equal(rows[0].deduct,1,'Phạt phải lọc đúng tháng');
assert.equal(rows[0].total,7,'Tổng thu nhập nhân viên phải đúng sau lọc');

ctx.commissionAppliedFilter={from:'2026-07-01',to:'2026-07-31',staffId:'E2',dept:'',q:''};
rows=ctx.employeeIncomeRows();
assert.equal(rows.length,1,'Lọc kỹ thuật phải chỉ còn kỹ thuật đó');
assert.equal(rows[0].saleCommission,0,'Không được cộng hoa hồng của Sale khác cho kỹ thuật đang chọn');
assert.equal(rows[0].techCost,10,'Công kỹ thuật tháng 7 phải đúng');
assert.equal(rows[0].techFuel,2,'Tiền xăng kỹ thuật tháng 7 phải đúng');

ctx.commissionAppliedFilter={from:'2026-07-01',to:'2026-07-31',staffId:'',dept:'',q:'lan sale'};
rows=ctx.employeeIncomeRows();
assert.deepEqual(Array.from(rows,x=>x.id),['E1'],'Tìm theo tên nhân viên không được hiện thu nhập người khác');

ctx.commissionAppliedFilter={from:'2026-07-01',to:'2026-07-31',staffId:'',dept:'',q:'BH1'};
rows=ctx.employeeIncomeRows();
assert.deepEqual(new Set(Array.from(rows,x=>x.id)),new Set(['E1','E2']),'Tìm theo mã đơn phải hiện đúng các nhân viên tham gia đơn');

ctx.commissionAppliedFilter={from:'2026-07-01',to:'2026-07-31',staffId:'',dept:'Sale',q:''};
rows=ctx.employeeIncomeRows();
assert.deepEqual(Array.from(rows,x=>x.id),['E1'],'Lọc phòng Sale không được lẫn công kỹ thuật');

ctx.commissionAppliedFilter={from:'2026-07-01',to:'2026-07-31',staffId:'',dept:'Kỹ thuật',q:''};
rows=ctx.employeeIncomeRows();
assert.deepEqual(Array.from(rows,x=>x.id),['E2'],'Lọc phòng kỹ thuật không được lẫn hoa hồng Sale');

ctx.commissionAppliedFilter={from:'2026-08-01',to:'2026-08-31',staffId:'E1',dept:'',q:''};
rows=ctx.employeeIncomeRows();
assert.equal(rows[0].saleCommission,10,'Đơn thu đủ ngày đầu tháng phải vào đúng tháng mới');
assert.equal(rows[0].bonus,99,'Dòng thưởng tháng mới phải không lẫn tháng cũ');

const html=fs.readFileSync('index.html','utf8');
assert(html.includes('id="commissionMonth"')&&html.includes('type="month"'),'Giao diện phải có ô chọn tháng cụ thể');
assert(src.includes("else if(type==='salaries')"),'Import Excel lương phải được hỗ trợ');
assert(src.includes("else if(type==='stockVouchers')"),'Nhánh import phải không báo sai là chưa hỗ trợ');

console.log('V109 employee income month filter tests OK');
