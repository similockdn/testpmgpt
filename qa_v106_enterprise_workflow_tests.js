const assert = require('assert');
const money = n => Number(n||0);
const inRange = (d, from, to) => String(d||'') >= from && String(d||'') <= to;
const active = rows => (rows||[]).filter(x => x.active !== false && x.canceled !== true && x.status !== 'Đã hủy');

function salesRevenue(sales, from, to){
  return active(sales).filter(s=>inRange(s.date,from,to)).reduce((a,s)=>a+money(s.grand),0);
}
function receiptsForSale(receipts, sale){
  return active(receipts).filter(r => r.saleId === sale.id || r.saleCode === sale.code || r.debtKey === `sale:${sale.id}`);
}
function directPaid(sale){
  if(!sale.paid) return 0;
  if(sale.paidEntryKey && sale.paidEntryKey === sale.code) return Math.min(money(sale.paid), money(sale.grand));
  return 0;
}
function collectedForSalesInPeriod(sales, receipts, from, to){
  return active(sales).filter(s=>inRange(s.date,from,to)).reduce((sum,s)=>{
    const direct = inRange(s.date, from, to) ? directPaid(s) : 0;
    const rec = receiptsForSale(receipts, s).filter(r=>inRange(r.date,from,to)).reduce((a,r)=>a+money(r.amount),0);
    return sum + Math.min(money(s.grand), direct + rec);
  },0);
}
function cashbook(receipts, expenses, salaries, sales, from, to, opening=0){
  const seen = new Set();
  let income=0, expense=0;
  for(const r of active(receipts).filter(r=>inRange(r.date,from,to))){
    const key = ['receipt', r.id||r.code, r.date, r.amount].join('|');
    if(seen.has(key)) continue; seen.add(key);
    income += money(r.amount);
  }
  // Direct paid locked to sale form is also real cash if no receipt exists for that direct amount.
  for(const s of active(sales).filter(s=>inRange(s.date,from,to))){
    const amount = directPaid(s); if(!amount) continue;
    const hasSameReceipt = active(receipts).some(r => (r.saleId===s.id || r.saleCode===s.code || r.debtKey===`sale:${s.id}`) && money(r.amount)===amount && r.date===s.date);
    if(!hasSameReceipt) income += amount;
  }
  expense += active(expenses).filter(e=>inRange(e.date,from,to)).reduce((a,e)=>a+money(e.amount),0);
  expense += active(salaries).filter(e=>inRange(e.date,from,to)).reduce((a,e)=>a+money(e.total||e.amount),0);
  return {opening, income, expense, closing: opening + income - expense};
}
function debtBySale(sales, receipts){
  return active(sales).map(s=>{
    const paid = directPaid(s)+receiptsForSale(receipts,s).reduce((a,r)=>a+money(r.amount),0);
    return {sale:s.code, debt: Math.max(0, money(s.grand)-paid)};
  });
}

const data = {
  sales:[
    {id:'S_JULY_1', code:'BH001', date:'2026-07-01', grand:10000000, paid:2000000, paidEntryKey:'BH001'},
    {id:'S_JULY_2', code:'BH002', date:'2026-07-02', grand:5000000},
    {id:'S_JUNE_1', code:'BH000', date:'2026-06-20', grand:8000000}
  ],
  receipts:[
    {id:'R1', code:'PT001', saleId:'S_JULY_2', date:'2026-07-03', amount:3000000},
    {id:'R2', code:'PT002', saleId:'S_JUNE_1', date:'2026-07-04', amount:8000000},
    {id:'R2_DUP', code:'PT002', saleId:'S_JUNE_1', date:'2026-07-04', amount:8000000, active:false}
  ],
  expenses:[{id:'E1',date:'2026-07-05',amount:1000000}],
  salaries:[{id:'L1',date:'2026-07-31',total:2000000}]
};

assert.equal(salesRevenue(data.sales,'2026-07-01','2026-07-31'),15000000, 'Doanh số tháng 7 chỉ lấy phiếu bán tháng 7');
assert.equal(collectedForSalesInPeriod(data.sales,data.receipts,'2026-07-01','2026-07-31'),5000000, 'Thu theo đơn tháng 7 = 2tr trực tiếp BH001 + 3tr phiếu thu BH002');
assert.deepEqual(cashbook(data.receipts,data.expenses,data.salaries,data.sales,'2026-07-01','2026-07-31',1000000), {opening:1000000,income:13000000,expense:3000000,closing:11000000}, 'Sổ quỹ tháng 7 = thu trực tiếp + phiếu thu tháng 7 - chi');
assert.deepEqual(debtBySale(data.sales,data.receipts), [
  {sale:'BH001', debt:8000000},
  {sale:'BH002', debt:2000000},
  {sale:'BH000', debt:0}
], 'Công nợ theo từng phiếu');
console.log('V106 enterprise workflow business tests OK');
