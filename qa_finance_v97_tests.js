const DEFAULT_RECEIPT_PAYMENT_METHOD='Chuyển khoản';
function financeDocDate(o){return String(o.date||'').slice(0,10)}
function isUnknownPaymentMethod(v){return !String(v||'').trim() || ['Chưa chọn','Chưa xác định','Chưa khai báo','undefined','null'].includes(String(v||'').trim())}
function normalizePaymentMethod(v){const m=String(v??'').trim(); return isUnknownPaymentMethod(m)?'':m}
function receiptEffectivePaymentMethod(r={}){return normalizePaymentMethod(r.paymentMethod||r.payMethod||r.method)||DEFAULT_RECEIPT_PAYMENT_METHOD}
function receiptDedupKey(r={}){const saleKey=String(r.saleId||r.debtKey||r.saleCode||r.customerCode||r.customerPhone||r.customerId||'');const date=String(financeDocDate(r)||r.date||'');const amount=String(Math.round((+r.amount||0)*100)/100);const method=String(normalizePaymentMethod(r.paymentMethod||r.payMethod||r.method)||'');return saleKey?['receipt',saleKey,date,amount,method].join('|'):['receipt-id',r.id||r.code||'',date,amount,method].join('|')}
function uniqueReceiptsForFinance(rows=[]){const seen=new Set(), out=[]; rows.forEach(r=>{const k=receiptDedupKey(r); if(!seen.has(k)){seen.add(k); out.push(r)}}); return out}
function saleDirectPaid(s={}){const paid=+s.paid||0; if(!paid||s.canceled)return 0; const grand=+s.grand||0; const code=String(s.code||''); const key=String(s.paidEntryKey||s.paidSaleCode||''); if(key&&code&&key===code) return Math.min(paid,grand||paid); return 0}
function receiptsForSalePayment(data,s={}){return uniqueReceiptsForFinance(data.receipts.filter(r=>!r.canceled && (r.saleId===s.id || r.saleCode===s.code || r.debtKey===`sale:${s.id}`)))}
function saleCollectedInRange(data,s,from,to){if(s.canceled)return 0; const grand=+s.grand||0; let paid=0; const sd=financeDocDate(s); if(sd&&sd>=from&&sd<=to) paid+=saleDirectPaid(s); receiptsForSalePayment(data,s).forEach(r=>{const d=financeDocDate(r); if(d&&d>=from&&d<=to) paid+=+r.amount||0}); return grand>0?Math.min(paid,grand):paid}
function dashboardCollected(data,from,to){return data.sales.filter(s=>!s.canceled && financeDocDate(s)>=from && financeDocDate(s)<=to).reduce((a,s)=>a+saleCollectedInRange(data,s,from,to),0)}
function cashbookRows(data,from,to){const rows=[]; const seen=new Set(); const pushRow=r=>{if(!r.date||r.date<from||r.date>to)return; const key=[r.source,r.id||'',r.code||'',r.type,r.date,r.income||0,r.expense||0].join('|'); if(seen.has(key))return; seen.add(key); rows.push(r)}; uniqueReceiptsForFinance(data.receipts.filter(r=>!r.canceled)).forEach(r=>{const amount=+r.amount||0; const date=financeDocDate(r); if(amount>0&&date)pushRow({source:'receipt',id:r.id,code:r.code,date,type:'Thu',income:amount,expense:0,paymentMethod:receiptEffectivePaymentMethod(r)})}); data.expenses.forEach(e=>{const amount=+e.amount||0; const date=financeDocDate(e); if(amount>0&&date)pushRow({source:'expense',id:e.id,code:e.code,date,type:'Chi',income:0,expense:amount,paymentMethod:normalizePaymentMethod(e.paymentMethod)||'Tiền mặt'})}); return rows}
function assertEq(name,got,want){if(got!==want){throw new Error(`${name}: got ${got}, want ${want}`)}console.log('OK',name,got)}
const data={
 sales:[
  {id:'s_jun',code:'BH_JUN',date:'2026-06-02',grand:10000000,paid:2000000,paidEntryKey:'BH_JUN'},
  {id:'s_old',code:'BH_OLD',date:'2026-05-15',grand:5000000},
  {id:'s_jul',code:'BH_JUL',date:'2026-07-01',grand:7000000}
 ],
 receipts:[
  {id:'r_jun',code:'PT_JUN',saleId:'s_jun',date:'2026-06-03',amount:3000000,paymentMethod:''},
  {id:'r_jun_dup',code:'PT_JUN_COPY',saleId:'s_jun',date:'2026-06-03',amount:3000000,paymentMethod:''},
  {id:'r_old_debt',code:'PT_OLD',saleId:'s_old',date:'2026-06-04',amount:5000000,paymentMethod:'Chuyển khoản'},
  {id:'r_jul_sale',code:'PT_JUL',saleId:'s_jul',date:'2026-06-05',amount:7000000,paymentMethod:'Tiền mặt'}
 ],
 expenses:[{id:'e1',code:'PC1',date:'2026-06-06',amount:1000000,paymentMethod:'Tiền mặt'}]
};
const from='2026-06-01', to='2026-06-30';
// Dashboard chỉ lấy phiếu bán trong kỳ: s_jun = paid trực tiếp 2tr + phiếu thu 3tr. Không lấy công nợ cũ và không lấy phiếu bán tháng 7.
assertEq('Dashboard thực thu đơn kỳ không bị phình bởi thu công nợ cũ', dashboardCollected(data,from,to), 5000000);
const rows=cashbookRows(data,from,to);
// Sổ quỹ là dòng tiền thật theo ngày chứng từ: r_jun 3tr + r_old_debt 5tr + r_jul_sale 7tr = 15tr, chống trùng r_jun_dup.
assertEq('Sổ quỹ tiền vào theo phiếu thu thực tế', rows.reduce((a,r)=>a+r.income,0), 15000000);
assertEq('Sổ quỹ tiền ra theo phiếu chi', rows.reduce((a,r)=>a+r.expense,0), 1000000);
assertEq('Phiếu thu thiếu phương thức mặc định chuyển khoản', rows.find(r=>r.code==='PT_JUN').paymentMethod, 'Chuyển khoản');
