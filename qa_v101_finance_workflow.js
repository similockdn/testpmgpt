const assert = require('assert');
const inRange=(date,from,to)=>date>=from&&date<=to;
const uniqueReceipts=(rows)=>{
  const seen=new Set(), out=[];
  for(const r of rows){
    const key=[r.id||'', r.code||'', r.saleId||'', r.date||'', r.amount||0].join('|');
    if(!seen.has(key)){seen.add(key);out.push(r)}
  }
  return out;
};
function cashbook({receipts=[],expenses=[],salaries=[]},from,to,opening=0){
  const inc=uniqueReceipts(receipts).filter(r=>r.active!==false&&inRange(r.date,from,to)).reduce((a,r)=>a+(+r.amount||0),0);
  const exp=expenses.filter(e=>inRange(e.date,from,to)).reduce((a,e)=>a+(+e.amount||0),0)+salaries.filter(e=>inRange(e.date,from,to)).reduce((a,e)=>a+(+e.total||+e.amount||0),0);
  return {income:inc,expense:exp,closing:opening+inc-exp};
}
function salesRevenue(sales,from,to){return sales.filter(s=>s.active!==false&&inRange(s.date,from,to)).reduce((a,s)=>a+(+s.grand||0),0)}
function debtForSale(sale,receipts){const paid=receipts.filter(r=>r.saleId===sale.id).reduce((a,r)=>a+(+r.amount||0),0);return Math.max(0,(+sale.grand||0)-paid)}
const data={
  sales:[{id:'s1',date:'2026-06-01',grand:10000000,installStatus:'Chưa lắp'},{id:'s2',date:'2026-06-02',grand:5000000,installStatus:'Đã lắp'}],
  receipts:[{id:'r1',code:'PT1',saleId:'s1',date:'2026-06-01',amount:2000000},{id:'r2',code:'PT2',saleId:'s2',date:'2026-06-05',amount:3000000},{id:'r2',code:'PT2',saleId:'s2',date:'2026-06-05',amount:3000000}],
  expenses:[{date:'2026-06-04',amount:500000}],
  salaries:[{date:'2026-06-30',total:1000000}]
};
assert.equal(salesRevenue(data.sales,'2026-06-01','2026-06-30'),15000000,'Doanh số phải lấy phiếu bán');
assert.deepEqual(cashbook(data,'2026-06-01','2026-06-30',1000000),{income:5000000,expense:1500000,closing:4500000},'Sổ quỹ phải lấy phiếu thu/chi và chống trùng');
assert.equal(debtForSale(data.sales[0],data.receipts),8000000,'Công nợ s1');
assert.equal(debtForSale(data.sales[1],data.receipts),0,'Công nợ s2 đã thu đủ theo phiếu thu');
console.log('V101 finance workflow tests OK');
