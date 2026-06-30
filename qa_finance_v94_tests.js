// V94 finance regression tests: validates strict formulas without Firebase.
function money(n){return Math.round(n||0)}
function inRange(date,from,to){return String(date||'')>=from&&String(date||'')<=to}
function isCanceled(x){return x.canceled===true||String(x.status||'').includes('Đã hủy')}
function dedupeReceipts(receipts){
  const seen=new Set();
  return receipts.filter(r=>{
    const saleKey=String(r.saleId||r.debtKey||r.saleCode||r.customerCode||r.customerPhone||r.customerId||'');
    const method=String(r.paymentMethod||'');
    const key=saleKey?['receipt',saleKey,r.date,Math.round((+r.amount||0)*100)/100,method].join('|'):['receipt-id',r.id||r.code||'',r.date,+r.amount||0,method].join('|');
    if(seen.has(key)) return false;
    seen.add(key); return true;
  })
}
function linkedReceipts(s,receipts){return dedupeReceipts(receipts).filter(r=>r.saleId===s.id||r.saleCode===s.code||r.debtKey===`sale:${s.id}`)}
function saleDirectPaid(s){return (s.paidEntryKey===s.code&&s.paidSource==='sale_form')?Math.min(+s.paid||0,+s.grand||0):0}
function salePaidTotal(s,receipts){return saleDirectPaid(s)+linkedReceipts(s,receipts).reduce((a,r)=>a+(+r.amount||0),0)}
function dashboardThucThu(sales,receipts,from,to){return sales.filter(s=>!isCanceled(s)&&inRange(s.date,from,to)).reduce((a,s)=>{const direct=saleDirectPaid(s); const receiptInRange=linkedReceipts(s,receipts).filter(r=>inRange(r.date,from,to)).reduce((x,r)=>x+(+r.amount||0),0); return a+Math.min(+s.grand||0,direct+receiptInRange)},0)}
function cashbookIncome(sales,receipts,from,to){
  let income=dedupeReceipts(receipts).filter(r=>!isCanceled(r)&&inRange(r.date,from,to)).reduce((a,r)=>a+(+r.amount||0),0);
  sales.filter(s=>!isCanceled(s)&&inRange(s.date,from,to)).forEach(s=>{
    const direct=saleDirectPaid(s); if(direct<=0) return;
    const sameDay=linkedReceipts(s,receipts).filter(r=>r.date===s.date).reduce((a,r)=>a+(+r.amount||0),0); if(sameDay<direct) income+=direct;
  });
  return income;
}
function assertEq(name,actual,expected){if(money(actual)!==money(expected)){throw new Error(`${name}: expected ${expected}, got ${actual}`)} console.log('OK',name,actual)}
const sales=[
  {id:'s1',code:'BH1',date:'2026-06-01',grand:100,paid:40,paidEntryKey:'BH1',paidSource:'sale_form'},
  {id:'s2',code:'BH2',date:'2026-06-05',grand:200,paid:50,paidEntryKey:'BH2',paidSource:'sale_form'},
  {id:'s3',code:'BH3',date:'2026-05-20',grand:300,paid:0},
  {id:'s4',code:'BH4',date:'2026-06-08',grand:100,paid:0,status:'Đã hủy'}
];
const receipts=[
  {id:'r1',code:'PT1',date:'2026-06-07',saleId:'s2',saleCode:'BH2',amount:70,paymentMethod:'Tiền mặt'},
  {id:'r2',code:'PT2',date:'2026-06-07',saleId:'s2',saleCode:'BH2',amount:70,paymentMethod:'Tiền mặt'}, // duplicate, must be ignored
  {id:'r3',code:'PT3',date:'2026-06-10',saleId:'s3',saleCode:'BH3',amount:100,paymentMethod:'Chuyển khoản'}, // old debt, should not count dashboard June sales
  {id:'r4',code:'PT4',date:'2026-07-01',saleId:'s1',saleCode:'BH1',amount:20,paymentMethod:'Tiền mặt'}
];
// Dashboard June: s1 paid 40; s2 paid 50 direct + 70 receipt = 120; old May receipt r3 ignored; duplicate ignored.
assertEq('Dashboard thực thu theo phiếu bán trong kỳ', dashboardThucThu(sales,receipts,'2026-06-01','2026-06-30'), 160);
// Cashbook June: receipts r1 70 + r3 100 + direct s1 40 + direct s2 50. Duplicate r2 ignored.
assertEq('Sổ quỹ tổng thu trong kỳ', cashbookIncome(sales,receipts,'2026-06-01','2026-06-30'), 260);
