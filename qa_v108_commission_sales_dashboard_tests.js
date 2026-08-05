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
  'commissionEligibleSales','staffByIdentity','commissionStaffMeta','commissionRoleIncluded','commissionPartsForFilter','commissionFilteredSales','saleReturnVouchers','saleRefundVouchers',
  'calcSaleFromItemsForReturn','receiptDebtKey','staffFunctions','staffHasFunction','techFeeDefault','suggestedTechCost',
  'isoLocalDate','isoDateFromLocal','dashboardWeekSalesRows'
];

const ctx={
  console,
  data:{sales:[],receipts:[],stockVouchers:[],staff:[]},
  commissionAppliedFilter:{},
  isSaleCanceled:s=>String(s?.status||'').includes('Đã hủy')||s?.canceled===true,
  isReceiptCanceled:r=>String(r?.status||'').includes('Đã hủy')||r?.canceled===true,
  isVoucherCanceled:v=>String(v?.status||'').includes('Đã hủy')||v?.canceled===true,
  reportDateValue:v=>String(v||'').slice(0,10),
  financeDocDate:v=>String(v?.date||'').slice(0,10),
  normalizePaymentMethod:v=>String(v||'').trim(),
  normalizePhone:v=>String(v||'').replace(/\D/g,''),
  searchKey:v=>String(v||'').trim().toLowerCase(),
  saleCustomerInfo:s=>({name:s.customerName||'',phone:s.customerPhone||'',code:s.customerCode||''}),
  saleItemSummary:s=>({models:(s.items||[]).map(x=>x.code).join(', ')}),
  debtClean:v=>String(v||'').trim().toLowerCase(),
  debtAddressKey:v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' '),
  costFor:()=>0,
  saleRevenueRecognitionDate:s=>String(s?.date||'').slice(0,10),
  today:()=> '2026-08-01',
  uid:()=> 'UID',
  $:id=>id==='saleTech'?{value:'T1'}:null
};
ctx.activeSales=()=>ctx.data.sales.filter(s=>!ctx.isSaleCanceled(s));
ctx.activeReceipts=()=>ctx.data.receipts.filter(r=>!ctx.isReceiptCanceled(r));
ctx.activeStockVouchers=()=>ctx.data.stockVouchers.filter(v=>!ctx.isVoucherCanceled(v));
vm.createContext(ctx);
vm.runInContext(functionNames.map(extractFunction).join('\n'),ctx);

function setData(sales=[],receipts=[],vouchers=[]){ctx.data.sales=sales;ctx.data.receipts=receipts;ctx.data.stockVouchers=vouchers;ctx.commissionAppliedFilter={};}
const base={id:'S1',code:'BH1',date:'2026-06-30',grand:100,vat:0,commissionBase:100,commissionPercent:5,paid:0,status:'Chưa thu tiền'};

setData([{...base}],[]);
assert.equal(ctx.saleCommissionValue(ctx.data.sales[0]),0,'Chưa thu không được tính hoa hồng');

setData([{...base}],[{id:'R1',saleId:'S1',date:'2026-07-05',amount:50,paymentMethod:'Tiền mặt'}]);
assert.equal(ctx.saleCommissionValue(ctx.data.sales[0]),0,'Thu 50% không được tính hoa hồng');

setData([{...base}],[{id:'R1',saleId:'S1',date:'2026-07-05',amount:100,paymentMethod:'Tiền mặt'}]);
assert.equal(ctx.saleCommissionValue(ctx.data.sales[0]),5,'Thu đủ 100% phải tính hoa hồng');
assert.equal(ctx.saleCommissionEarnedAt(ctx.data.sales[0]),'2026-07-05','Ngày hoa hồng phải là ngày thu đủ');

setData([{...base}],[
  {id:'R1',saleId:'S1',date:'2026-07-05',amount:50,paymentMethod:'Tiền mặt'},
  {id:'R2',saleId:'S1',date:'2026-07-05',amount:50,paymentMethod:'Tiền mặt'}
]);
assert.equal(ctx.salePaymentInfo(ctx.data.sales[0]).paidTotal,100,'Hai phiếu thu hợp lệ giống ngày/số tiền không được gộp');
assert.equal(ctx.saleCommissionValue(ctx.data.sales[0]),5,'Hai phiếu thu cộng đủ phải mở hoa hồng');

setData([{...base,paidTotal:100,debtLeft:0,commissionStatus:'earned',commissionEarnedAt:'2026-07-05'}],[]);
assert.equal(ctx.saleCommissionValue(ctx.data.sales[0]),0,'Không được tin số đã thu/trạng thái hoa hồng lưu sẵn khi không có chứng từ thu hợp lệ');

setData([{...base}],[{id:'R1',saleId:'S1',date:'2026-07-05',amount:100,status:'Đã hủy'}]);
assert.equal(ctx.saleCommissionValue(ctx.data.sales[0]),0,'Phiếu thu đã hủy phải thu hồi toàn bộ hoa hồng');

setData([{...base}],[
  {id:'R1',saleId:'S1',date:'2026-07-05',amount:100},
  {id:'R1',saleId:'S1',date:'2026-07-05',amount:100}
]);
assert.equal(ctx.salePaymentInfo(ctx.data.sales[0]).paidTotal,100,'Cùng một định danh phiếu thu không được cộng hai lần');

const imported={...base,paid:100,paidSource:'excel_import',paidEntryKey:'BH1',directPaidLocked:true,status:'Đã thu tiền'};
setData([imported],[]);
assert.equal(ctx.salePaymentInfo(imported).paidTotal,100,'Đơn Excel đã thu đủ phải được nhận diện');
assert.equal(ctx.saleCommissionValue(imported),5,'Đơn Excel đã thu đủ phải tính hoa hồng');

const zeroPct={...imported,commissionPercent:0,saleCommission:77};
setData([zeroPct],[]);
assert.equal(ctx.saleCommissionValue(zeroPct),0,'0% phải tuyệt đối bằng 0, không lấy số cũ');

const afterPartialReturn={...base,grand:100,paid:200,paidSource:'sale_form',paidEntryKey:'BH1',directPaidLocked:true,status:'Đã thu tiền'};
setData([afterPartialReturn],[],[{id:'TH1',type:'RETURN',saleId:'S1',date:'2026-07-10',settlement:'Đã hoàn tiền',refundAmount:100}]);
assert.equal(ctx.salePaymentInfo(afterPartialReturn).paidTotal,100,'Hoàn tiền trả hàng phải trừ đúng tiền đã thu, không làm mất toàn bộ khoản thu trực tiếp');
assert.equal(ctx.saleCommissionValue(afterPartialReturn),5,'Đơn còn lại vẫn thu đủ sau hoàn tiền phải giữ hoa hồng phần còn lại');

const refundedBelowThreshold={...base};
setData([refundedBelowThreshold],[{id:'R1',saleId:'S1',date:'2026-07-05',amount:100}],
  [{id:'TH1',type:'RETURN',saleId:'S1',date:'2026-07-10',settlement:'Đã hoàn tiền',refundAmount:20}]);
assert.equal(ctx.salePaymentInfo(refundedBelowThreshold).paidTotal,80,'Hoàn tiền phải làm giảm số thực thu');
assert.equal(ctx.saleCommissionValue(refundedBelowThreshold),0,'Sau hoàn tiền làm thực thu dưới 100% phải thu hồi hoa hồng');

setData([refundedBelowThreshold],[
  {id:'R1',saleId:'S1',date:'2026-07-05',amount:100},
  {id:'R2',saleId:'S1',date:'2026-07-15',amount:20}
],[{id:'TH1',type:'RETURN',saleId:'S1',date:'2026-07-10',settlement:'Đã hoàn tiền',refundAmount:20}]);
assert.equal(ctx.saleCommissionValue(refundedBelowThreshold),5,'Thu bù lại đủ 100% sau hoàn tiền phải mở lại hoa hồng');
assert.equal(ctx.saleCommissionEarnedAt(refundedBelowThreshold),'2026-07-15','Ngày hưởng lại phải là ngày thu bù đủ 100%');

const fractionalGrand={...base,grand:99.6,commissionBase:99.6};
setData([fractionalGrand],[{id:'R1',saleId:'S1',date:'2026-07-05',amount:100}]);
assert.equal(ctx.saleFullyPaidForCommission(fractionalGrand),true,'Sai số tiền lẻ dưới 1 VND không được treo hoa hồng');

setData([{...base}],[{id:'R1',saleId:'S1',date:'2026-07-05',amount:100,paymentMethod:'Tiền mặt'}]);
ctx.commissionAppliedFilter={from:'2026-07-01',to:'2026-07-31'};
assert.equal(ctx.commissionFilteredSales().length,1,'Đơn bán tháng 6 thu đủ tháng 7 phải vào kỳ tháng 7');
ctx.commissionAppliedFilter={from:'2026-06-01',to:'2026-06-30'};
assert.equal(ctx.commissionFilteredSales().length,0,'Không được ghi hoa hồng ngược về tháng bán');

const fullBecauseReturn={...base,grand:50,commissionBase:50,commissionEligibilityDate:'2026-07-10'};
setData([fullBecauseReturn],[{id:'R1',saleId:'S1',date:'2026-06-20',amount:50,paymentMethod:'Tiền mặt'}]);
assert.equal(ctx.saleCommissionEarnedAt(fullBecauseReturn),'2026-07-10','Nếu giảm giá trị đơn do trả hàng mới làm đủ 100%, ngày hưởng phải là ngày trả hàng');

ctx.data.sales=[{id:'S1',code:'BH1'},{id:'S2',code:'BH2'}];
assert.equal(ctx.receiptSaleId({saleCode:'BH1',debtKey:'sale:S2'}),'S2','debtKey phải ưu tiên hơn saleCode cũ');
assert.equal(ctx.receiptDebtKey({debtKey:'opening:C1',id:'R1'}),'opening:C1','Phiếu thu công nợ đầu kỳ phải giữ đúng khóa');

const changedCustomer={...base,customerCode:'NEW',customerPhone:'0902000000'};
setData([changedCustomer],[{id:'R1',saleId:'S1',date:'2026-07-05',amount:100,customerCode:'OLD',customerPhone:'0902111111'}]);
assert.equal(ctx.receiptsForSalePayment(changedCustomer).length,1,'saleId đúng không được mất liên kết do snapshot khách cũ');

const returnSale={id:'S1',code:'BH1',date:'2026-07-01',grand:1800000,vat:0,paid:0,vatMode:'none',commissionPercent:5,techCost:100000,techFuel:0,surcharge:0,orderDiscountType:'percent',orderDiscountValue:10,orderDiscountTotal:200000,subtotalBeforeOrderDiscount:2000000,items:[{code:'F07',qty:2,price:1000000}]};
setData([returnSale],[]);
const returned=ctx.calcSaleFromItemsForReturn(returnSale,[{code:'F07',qty:1,price:1000000}]);
assert.equal(returned.grand,900000,'Trả một phần phải giữ chiết khấu toàn đơn 10%');
assert.equal(returned.saleCommission,45000,'Hoa hồng sau trả hàng phải theo doanh số còn lại');
const fixedDiscountSale={...returnSale,orderDiscountType:'amount',orderDiscountValue:200000,orderDiscountTotal:200000};
setData([fixedDiscountSale],[]);
const fixedReturned=ctx.calcSaleFromItemsForReturn(fixedDiscountSale,[{code:'F07',qty:1,price:1000000}]);
assert.equal(fixedReturned.grand,900000,'Chiết khấu số tiền phải được phân bổ theo tỷ lệ hàng còn lại');

ctx.data.staff=[{id:'T1',dept:'Kỹ thuật',functions:['Kỹ thuật'],techFee:100000}];
assert.equal(ctx.suggestedTechCost(),100000,'Công kỹ thuật phải là 100.000/đơn, không nhân số lượng');

setData([
  {id:'W1',code:'W1',date:'2026-07-27',grand:100},
  {id:'W2',code:'W2',date:'2026-08-01',grand:200},
  {id:'W3',code:'W3',date:'2026-08-02',grand:300},
  {id:'W4',code:'W4',date:'2026-08-01',grand:999,status:'Đã hủy'}
],[]);
const weekRows=ctx.dashboardWeekSalesRows('2026-08-01');
assert.deepEqual(Array.from(weekRows,x=>x.key),['2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-07-31','2026-08-01','2026-08-02'],'Biểu đồ tuần phải luôn đủ T2-CN');
assert.equal(weekRows.reduce((a,x)=>a+x.value,0),600,'Biểu đồ tuần chỉ cộng phiếu bán còn hiệu lực đúng ngày');
assert.equal(weekRows[5].count,1,'Số đơn theo ngày phải loại phiếu đã hủy');

const rules=fs.readFileSync('firestore.rules','utf8');
assert(!/match \/\{document=\*\*\}[\s\S]*allow read, write: if signedIn/.test(rules),'Không được có luật catch-all mở toàn bộ dữ liệu');
assert(/match \/\{document=\*\*\}[\s\S]*allow read, write: if false/.test(rules),'Collection chưa khai báo phải bị từ chối');

const html=fs.readFileSync('index.html','utf8');
assert(html.includes('Ngày thu đủ 100%'),'Bảng hoa hồng phải hiển thị ngày thu đủ');
assert(html.includes('<option>Công ty</option>'),'Phiếu bán phải hỗ trợ khách Công ty');
assert(html.includes('id="saleMonthFilter"')&&html.includes('id="saleFromFilter"')&&html.includes('id="saleToFilter"'),'Danh sách phiếu bán phải có lọc tháng và khoảng ngày');
assert(src.includes("Doanh thu ghi nhận từng ngày"),'Dashboard phải có biểu đồ doanh thu ghi nhận từng ngày trong tuần');

console.log('V108 commission, sales date filter and weekly dashboard tests OK');
