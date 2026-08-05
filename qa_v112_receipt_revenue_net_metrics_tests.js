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
  saleOrderNonCommissionExpenseValue:s=>s.nonCommissionExpense||0,
  saleCommissionValue:s=>s.commission||0
};
vm.createContext(ctx);
vm.runInContext(extractFunction('revenueDeductionMetrics'),ctx);

const sales=[
  {grand:3000000,nonCommissionExpense:1200000,commission:100000},
  {grand:2000000,nonCommissionExpense:800000,commission:80000}
];
const metrics=ctx.revenueDeductionMetrics(sales,[{amount:300000}],[{total:500000}]);
assert.equal(metrics.revenue,5000000,'Tổng doanh thu phải bằng tổng giá trị phiếu đã thu đủ');
assert.equal(metrics.expense,2800000,'Chi phí phải gồm chi phí đơn + phiếu chi + lương, không gồm hoa hồng');
assert.equal(metrics.commission,180000,'Hoa hồng chỉ cộng một lần');
assert.equal(metrics.afterExpense,2200000,'Sai doanh thu sau chi phí');
assert.equal(metrics.afterCommission,4820000,'Sai doanh thu sau hoa hồng');
assert.equal(metrics.afterExpenseCommission,2020000,'Sai doanh thu sau chi phí + hoa hồng');
assert.equal(metrics.afterExpenseCommission,metrics.revenue-metrics.expense-metrics.commission,'Công thức tổng phải đối chiếu tuyệt đối');

const paymentCtx={
  isSaleCanceled:s=>s?.canceled===true,
  saleDirectPaid:s=>s?.directPaid||0,
  receiptsForSalePayment:s=>s?.receipts||[],
  saleRefundVouchers:s=>s?.refunds||[],
  reportDateValue:v=>String(v||'').slice(0,10),
  financeDocDate:v=>String(v?.date||'').slice(0,10),
  data:{sales:[]}
};
paymentCtx.activeSales=()=>paymentCtx.data.sales.filter(s=>!paymentCtx.isSaleCanceled(s));
vm.createContext(paymentCtx);
vm.runInContext([
  'salePaymentInfo','saleFullyPaidForCommission','salePaymentEvents',
  'saleCommissionEarnedAt','saleRevenueRecognitionDate','revenueRecognizedSalesInRange'
].map(extractFunction).join('\n'),paymentCtx);

const paidAcrossMonths={id:'A',grand:3000000,installStatus:'Chưa lắp',receipts:[{id:'PT1',date:'2026-07-05',amount:1000000},{id:'PT2',date:'2026-08-02',amount:2000000}]};
const partial={id:'B',grand:3000000,receipts:[{id:'PT3',date:'2026-08-01',amount:2900000}]};
const refundedBelowFull={id:'C',grand:3000000,receipts:[{id:'PT4',date:'2026-08-02',amount:3000000}],refunds:[{id:'HT1',date:'2026-08-03',refundAmount:500000}]};
const paidDirect={id:'D',grand:3000000,directPaid:3000000,directPaidDate:'2026-07-10'};
const canceled={id:'E',grand:3000000,canceled:true,receipts:[{id:'PT5',date:'2026-08-02',amount:3000000}]};
paymentCtx.data.sales=[paidAcrossMonths,partial,refundedBelowFull,paidDirect,canceled];

assert.equal(paymentCtx.salePaymentInfo(paidAcrossMonths).paidTotal,3000000,'Phải cộng đúng nhiều phiếu thu gắn cùng đơn');
assert.equal(paymentCtx.saleRevenueRecognitionDate(paidAcrossMonths),'2026-08-02','Đơn phải vào tháng của phiếu thu làm đạt đủ 100%');
assert.equal(paymentCtx.saleRevenueRecognitionDate(partial),'','Thiếu dù chỉ 1 phần vẫn không được tính doanh thu');
assert.equal(paymentCtx.saleRevenueRecognitionDate(refundedBelowFull),'','Hoàn tiền làm đơn dưới 100% phải loại khỏi doanh thu');
assert.equal(paymentCtx.saleRevenueRecognitionDate(paidDirect),'2026-07-10','Thu đủ trực tiếp hợp lệ phải dùng đúng ngày thu');
assert.equal(paymentCtx.saleRevenueRecognitionDate(canceled),'','Đơn hủy không được ghi nhận doanh thu');
assert.deepEqual(Array.from(paymentCtx.revenueRecognizedSalesInRange('2026-07-01','2026-07-31')).map(s=>s.id),['D'],'Tháng 7 chỉ có đơn đạt đủ trong tháng 7');
assert.deepEqual(Array.from(paymentCtx.revenueRecognizedSalesInRange('2026-08-01','2026-08-31')).map(s=>s.id),['A'],'Tháng 8 chỉ có đơn được phiếu thu làm đạt đủ trong tháng 8');

assert(src.includes("if(isSaleCanceled(s)||!saleFullyPaidForCommission(s))return '';"),'Doanh thu phải loại phiếu chưa thu đủ 100%');
assert(!extractFunction('saleRevenueRecognitionDate').includes('saleIsInstalled'),'Ghi nhận doanh thu không được phụ thuộc trạng thái lắp đặt');
assert(src.includes("'Tong_hop_doanh_thu':revenueSummaryExportRows()"),'Xuất doanh thu phải có sheet tổng hợp');
['kpiRevenueAfterExpense','kpiRevenueAfterCommission','kpiRevenueAfterExpenseCommission'].forEach(id=>assert(html.includes(`id="${id}"`),`Thiếu KPI ${id}`));

console.log('V112 receipt revenue and net metrics tests OK');
