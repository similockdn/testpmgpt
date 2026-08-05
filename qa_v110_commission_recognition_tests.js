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
  'lineGross','lineDiscountAmount','lineNet','calcOrderDiscount','calcSaleTotals','calcCommissionBase','calcCommission',
  'saleCommissionBaseValue','saleExpectedCommissionValue','saleCommissionValue',
  'receiptSaleId','receiptCustomerMatchesSale','receiptDedupKey','uniqueReceiptsForFinance','receiptsForSalePayment',
  'saleDirectPaid','salePaymentInfo','saleFullyPaidForCommission','salePaymentEvents','saleCommissionEarnedAt',
  'commissionEligibleSales','commissionRecognizedSalesInRange','saleReturnVouchers','saleRefundVouchers'
];

const ctx={
  console,Date,
  data:{sales:[],receipts:[],stockVouchers:[],staff:[]},
  isSaleCanceled:s=>s?.canceled===true||s?.status==='Đã hủy',
  isReceiptCanceled:r=>r?.canceled===true||r?.status==='Đã hủy',
  isVoucherCanceled:v=>v?.canceled===true||v?.status==='Đã hủy',
  reportDateValue:v=>String(v||'').slice(0,10),
  financeDocDate:v=>String(v?.date||'').slice(0,10),
  normalizePhone:v=>String(v||'').replace(/\D/g,''),
  debtClean:v=>String(v||'').trim().toLowerCase(),
  debtAddressKey:v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ')
};
ctx.activeSales=()=>ctx.data.sales.filter(s=>!ctx.isSaleCanceled(s));
ctx.activeReceipts=()=>ctx.data.receipts.filter(r=>!ctx.isReceiptCanceled(r));
ctx.activeStockVouchers=()=>ctx.data.stockVouchers.filter(v=>!ctx.isVoucherCanceled(v));
vm.createContext(ctx);
vm.runInContext(functionNames.map(extractFunction).join('\n'),ctx);

const totals=ctx.calcSaleTotals([{qty:1,price:108000,discount:0}], 'included8', 0, 20000);
assert.equal(Math.round(totals.vat),8000,'VAT gồm trong giá phải tách đúng');
assert.equal(Math.round(totals.grand),128000,'Tổng thanh toán phải gồm phụ thu');
assert.equal(Math.round(ctx.calcCommissionBase(totals)),120000,'Doanh số tính hoa hồng phải gồm phụ thu và loại VAT');
assert.equal(ctx.calcCommission(totals,2),2400,'Hoa hồng phải dùng đúng % nhập trên đơn');

const sale={
  id:'S1',code:'BH-THANG-TRUOC',date:'2026-06-25',directPaidDate:'2026-06-25',
  ...totals,commissionPercent:2,expectedSaleCommission:2400,saleCommission:0,
  customerCode:'KL001',customerPhone:'0901000001'
};
ctx.data.sales=[sale];
ctx.data.staff=[{id:'E1',commissionPercent:9}];

assert.equal(ctx.saleExpectedCommissionValue(sale),2400,'Đổi % mặc định nhân viên không được làm đổi % đã lưu trên đơn');
assert.equal(ctx.saleCommissionValue(sale),0,'Chưa thu tiền không được tính hoa hồng');
assert.equal(ctx.commissionRecognizedSalesInRange('2026-06-01','2026-06-30').length,0,'Đơn chưa thu đủ không được ghi nhận trong tháng bán');

ctx.data.receipts=[{id:'R1',saleId:'S1',date:'2026-07-03',amount:100000}];
assert.equal(ctx.saleCommissionValue(sale),0,'Thu một phần không được tính hoa hồng');
assert.equal(ctx.saleCommissionEarnedAt(sale),'','Thu một phần không được có ngày ghi nhận');

ctx.data.receipts.push({id:'R2',saleId:'S1',date:'2026-07-18',amount:28000});
assert.equal(ctx.saleCommissionValue(sale),2400,'Thu đủ 100% phải ghi nhận toàn bộ hoa hồng');
assert.equal(ctx.saleCommissionEarnedAt(sale),'2026-07-18','Ngày ghi nhận phải là ngày tổng thu đạt 100%');
assert.equal(ctx.commissionRecognizedSalesInRange('2026-06-01','2026-06-30').length,0,'Đơn tháng trước không được tính vào tháng bán nếu tháng sau mới thu đủ');
assert.equal(ctx.commissionRecognizedSalesInRange('2026-07-01','2026-07-31').length,1,'Đơn tháng trước phải tính vào tháng sau khi tháng sau thu đủ');

assert(src.includes('expectedSaleCommission,saleCommission:isEarned?expectedSaleCommission:0'),'Cập nhật phiếu thu phải tách hoa hồng dự kiến và hoa hồng được trả');
assert(src.includes('expectedSaleCommission,saleCommission:fullyPaid?expectedSaleCommission:0'),'Import đơn phải chỉ ghi hoa hồng được trả khi thu đủ');
assert(!src.includes("if(saleExpectedCommissionValue(s)>0)commissionHistory.push({type:'canceled'"),'Hủy phiếu chưa thu không được tạo bút toán âm hoa hồng dự kiến');

const html=fs.readFileSync('index.html','utf8');
assert(html.includes('tính cả phụ thu; chỉ ghi nhận khi thu đủ 100%'),'Giao diện nhập đơn phải nêu rõ quy tắc phụ thu và thu đủ');
assert(html.includes('theo tháng thu đủ; doanh số tính hoa hồng gồm phụ thu'),'Báo cáo phải giải thích rõ tháng ghi nhận và phụ thu');

console.log('V110 commission recognition and surcharge tests OK');
