// QA nghiệp vụ V103 - kiểm thử công thức Thực thu / Sổ quỹ độc lập
function money(n){return Number(n)||0}
function inRange(d,from,to){return d && (!from || d>=from) && (!to || d<=to)}
function saleDirectPaid(s){
  const paid=money(s.paid), grand=money(s.grand);
  if(!paid || s.canceled) return 0;
  const key=String(s.paidEntryKey||s.paidSaleCode||'');
  const code=String(s.code||'');
  const source=String(s.paidSource||'');
  if(key && code && key===code && (source==='sale_form' || s.directPaidLocked===true)) return Math.min(paid, grand||paid);
  if(grand>0 && String(s.status||'').includes('Đã thu') && paid>=grand) return grand;
  return 0;
}
function financeTotals({sales=[],receipts=[],expenses=[],salaries=[]},from,to){
  const doanhSo=sales.filter(s=>!s.canceled && inRange(s.date,from,to)).reduce((a,s)=>a+money(s.grand),0);
  const thuTrucTiep=sales.filter(s=>!s.canceled && inRange(s.date,from,to)).reduce((a,s)=>a+saleDirectPaid(s),0);
  const thuPhieuThu=receipts.filter(r=>!r.canceled && inRange(r.date,from,to)).reduce((a,r)=>a+money(r.amount),0);
  const chi=expenses.filter(e=>inRange(e.date,from,to)).reduce((a,e)=>a+money(e.amount),0)+salaries.filter(e=>inRange(e.date,from,to)).reduce((a,e)=>a+money(e.total||e.amount),0);
  const thucThu=thuTrucTiep+thuPhieuThu;
  const tongThuSoQuy=thucThu;
  return {doanhSo,thuTrucTiep,thuPhieuThu,thucThu,tongThuSoQuy,chi};
}
function assertEq(name,a,b){if(a!==b){throw new Error(`${name}: expected ${b}, got ${a}`)} console.log('OK',name,a)}
const from='2026-07-01', to='2026-07-31';
// 1. Bán thu ngay trên phiếu bán, chưa lập phiếu thu riêng
let t=financeTotals({sales:[{code:'BH1',date:'2026-07-02',grand:100,paid:100,paidEntryKey:'BH1',paidSource:'sale_form'}]},from,to);
assertEq('thu trực tiếp phải vào thực thu',t.thucThu,100);
assertEq('thu trực tiếp phải vào sổ quỹ',t.tongThuSoQuy,100);
// 2. Bán chịu, chưa thu
 t=financeTotals({sales:[{code:'BH2',date:'2026-07-02',grand:100,paid:0}]},from,to);
assertEq('bán chịu không tăng thực thu',t.thucThu,0);
assertEq('bán chịu vẫn là doanh số',t.doanhSo,100);
// 3. Thu công nợ bằng phiếu thu
 t=financeTotals({sales:[{code:'BH2',date:'2026-06-20',grand:100,paid:0}],receipts:[{code:'PT1',date:'2026-07-03',amount:60,saleCode:'BH2'}]},from,to);
assertEq('thu công nợ cũ tăng thực thu kỳ hiện tại',t.thucThu,60);
assertEq('doanh số kỳ hiện tại không gồm đơn cũ',t.doanhSo,0);
// 4. Có chi phí
 t=financeTotals({sales:[{code:'BH3',date:'2026-07-04',grand:100,paid:40,paidEntryKey:'BH3',paidSource:'sale_form'}],receipts:[{code:'PT2',date:'2026-07-05',amount:60,saleCode:'BH3'}],expenses:[{date:'2026-07-06',amount:30}]},from,to);
assertEq('thực thu gồm thu trực tiếp và phiếu thu',t.thucThu,100);
assertEq('sổ quỹ thu khớp thực thu',t.tongThuSoQuy,100);
assertEq('tổng chi đúng',t.chi,30);
console.log('QA V103 finance tests passed');
