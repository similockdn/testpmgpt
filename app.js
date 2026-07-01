import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';
import { collection, addDoc, setDoc, doc, deleteDoc, getDocs, getDoc, updateDoc, serverTimestamp, writeBatch } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

function createMissingElement(id){
  console.warn('Thiếu phần tử giao diện, tự tạo tạm để tránh lỗi:', id);
  const el=document.createElement('input');
  el.type='hidden';
  el.id=id;
  el.dataset.autoCreated='true';
  document.body.appendChild(el);
  return el;
}
const $=id=>document.getElementById(id)||createMissingElement(id);
// Local wrappers for window handlers used inside ES module
const addSaleItem=(...args)=>window.addSaleItem(...args);
const addStockItem=(...args)=>window.addStockItem(...args);
const clearCostProducts=(...args)=>window.clearCostProducts(...args);
const clearPriceProducts=(...args)=>window.clearPriceProducts(...args);
const createSupplementStockVoucher=(...args)=>window.createSupplementStockVoucher(...args);
const deleteCostPriceGroup=(...args)=>window.deleteCostPriceGroup(...args);
const deletePriceGroup=(...args)=>window.deletePriceGroup(...args);
const editCostPriceGroup=(...args)=>window.editCostPriceGroup(...args);
const editCustomer=(...args)=>window.editCustomer(...args);
const editExpense=(...args)=>window.editExpense(...args);
const editPermission=(...args)=>window.editPermission(...args);
const editPriceGroup=(...args)=>window.editPriceGroup(...args);
const editProduct=(...args)=>window.editProduct(...args);
const editReceipt=(...args)=>window.editReceipt(...args);
const editSale=(...args)=>window.editSale(...args);
const editStaff=(...args)=>window.editStaff(...args);
const editStock=(...args)=>window.editStock(...args);
const editWarranty=(...args)=>window.editWarranty(...args);
const newCostPriceList=(...args)=>window.newCostPriceList(...args);
const newPriceList=(...args)=>window.newPriceList(...args);
const openSaleReturn=(...args)=>window.openSaleReturn(...args);
const printReceipt=(...args)=>window.printReceipt(...args);
const printSale=(...args)=>window.printSale(...args);
const printStock=(...args)=>window.printStock(...args);
const quickCreateCustomer=(...args)=>window.quickCreateCustomer(...args);
const receiptFor=(...args)=>window.receiptFor(...args);
const refreshCommissionStaffOptions=(...args)=>window.refreshCommissionStaffOptions(...args);
const removeDoc=(...args)=>window.removeDoc(...args);
const renderCostProductPicker=(...args)=>window.renderCostProductPicker(...args);
const renderPriceProductPicker=(...args)=>window.renderPriceProductPicker(...args);
const resetExpenseForm=(...args)=>window.resetExpenseForm(...args);
const resetReceiptForm=(...args)=>window.resetReceiptForm(...args);
const resetSaleForm=(...args)=>window.resetSaleForm(...args);
const resetStockForm=(...args)=>window.resetStockForm(...args);
const saleItemKeyNav=(...args)=>window.saleItemKeyNav(...args);
const saleProductChanged=(...args)=>window.saleProductChanged(...args);
const saveSale=(...args)=>window.saveSale(...args);
const saveSaleReturn=(...args)=>window.saveSaleReturn(...args);
const setReportQuickRange=(...args)=>window.setReportQuickRange(...args);
const staffDeptChanged=(...args)=>window.staffDeptChanged(...args);
const stockProductChanged=(...args)=>window.stockProductChanged(...args);
const syncSaleExportStockToSticky=(...args)=>window.syncSaleExportStockToSticky(...args);
const updateSaleTotals=(...args)=>window.updateSaleTotals(...args);
const viewCommissionStaff=(...args)=>window.viewCommissionStaff(...args);
const viewSaleDetail=(...args)=>window.viewSaleDetail(...args);
const money=n=>(Number(n)||0).toLocaleString('vi-VN')+'đ';const today=()=>new Date().toISOString().slice(0,10);const uid=()=>Math.random().toString(36).slice(2,9);const normEmail=v=>String(v||'').trim().toLowerCase();
function numberToVietnamese(n){
  n=Math.round(Number(n)||0);
  if(n===0) return 'Không đồng';
  const negative=n<0; n=Math.abs(n);
  const units=['','nghìn','triệu','tỷ','nghìn tỷ','triệu tỷ'];
  const digit=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
  function readBlock(num,full){
    const hundred=Math.floor(num/100), ten=Math.floor((num%100)/10), one=num%10;
    const out=[];
    if(full||hundred>0){
      out.push(digit[hundred]+' trăm');
      if(ten===0&&one>0) out.push('lẻ');
    }
    if(ten>1){
      out.push(digit[ten]+' mươi');
      if(one===1) out.push('mốt');
      else if(one===4) out.push('tư');
      else if(one===5) out.push('lăm');
      else if(one>0) out.push(digit[one]);
    }else if(ten===1){
      out.push('mười');
      if(one===5) out.push('lăm');
      else if(one>0) out.push(digit[one]);
    }else if(one>0){
      out.push(digit[one]);
    }
    return out.join(' ');
  }
  const blocks=[];
  while(n>0){blocks.unshift(n%1000);n=Math.floor(n/1000)}
  const parts=[];
  blocks.forEach((block,idx)=>{
    if(block===0) return;
    const unitIndex=blocks.length-1-idx;
    const hasHigher=idx>0;
    const full=hasHigher&&block<100;
    parts.push((readBlock(block,full)+' '+units[unitIndex]).trim());
  });
  let text=parts.join(' ').replace(/\s+/g,' ').trim();
  text=(negative?'Âm ':'')+text.charAt(0).toUpperCase()+text.slice(1)+' đồng';
  return text;
}
const ADMIN_EMAIL='similockdn@gmail.com';
const userDocRef = (u)=>doc(db,'users',u.uid);
const userProfileData = (u, extra={})=>({uid:u.uid,email:normEmail(u.email),...extra});
const WAREHOUSES=['Kho Chính','Kho Văn Phòng'];
let currentUser=null,currentPerm={role:'Admin',perms:[],warehouseAccess:WAREHOUSES},creatingAdmin=false;let editingSale=null,editingStock=null,editingWarranty=null,editingExpense=null,editingReceipt=null;
let commissionAppliedFilter={q:'',dept:'',staffId:'',period:'all',from:'',to:''};
const data={customers:[],products:[],productCategories:[],systemCategories:[],warrantyReasons:[],staff:[],prices:[],costPrices:[],sales:[],stockVouchers:[],receipts:[],warranties:[],expenses:[],salaries:[],users:[],logs:[]};
function userWarehouses(){return currentPerm.role==='Admin'?WAREHOUSES:((currentPerm.warehouseAccess&&currentPerm.warehouseAccess.length)?currentPerm.warehouseAccess:WAREHOUSES)}
function canAccessWarehouse(w){return currentPerm.role==='Admin'||userWarehouses().includes(w)}
function canAccessVoucher(v){if(currentPerm.role==='Admin')return true; if(!has('inventory')&&!has('stockbook'))return false; if(v.type==='TRANSFER')return canAccessWarehouse(v.fromWarehouse||v.warehouse||'Kho Chính')||canAccessWarehouse(v.toWarehouse||'Kho Văn Phòng'); return canAccessWarehouse(voucherWarehouse(v));}
function warehouseOptions(selected='',allowed=userWarehouses()){return allowed.map(w=>`<option value="${w}" ${w===selected?'selected':''}>${w}</option>`).join('')}
function defaultWarehouse(){return userWarehouses()[0]||WAREHOUSES[0]}
function voucherWarehouse(v){return v.warehouse||v.fromWarehouse||defaultWarehouse()}
function voucherToWarehouse(v){return v.toWarehouse||''}
function isTransferVoucher(v){return v.type==='TRANSFER'}
const modules=['dashboard','sales','commissions','expenses','cashbook','salaries','debts','inventory','stockbook','warranty','customers','products','categories','prices','staff','reports','permissions','system','audit'];
const permissionMap={
 Admin:modules.concat(['viewCost','viewSalary','manageSalary','editSales','deleteSales','editStock','deleteStock','audit']),
 Sale:['dashboard','sales','commissions','customers','products','warranty'],
 'Kỹ thuật':['dashboard','warranty','customers','products'],
 Kho:['dashboard','inventory','stockbook','products'],
 'Kho Chính':['dashboard','inventory','stockbook','products'],
 'Kho Văn Phòng':['dashboard','inventory','stockbook','products'],
 'Kế toán':['dashboard','expenses','cashbook','commissions','debts','reports','sales','customers','products']
};
const permLabels={dashboard:'Dashboard',sales:'Bán hàng',commissions:'Hoa hồng',expenses:'Phiếu chi',cashbook:'Sổ quỹ',debts:'Công nợ',inventory:'Kho',stockbook:'Sổ kho',warranty:'Bảo hành',customers:'Khách hàng',products:'Sản phẩm',categories:'Danh mục chung',prices:'Bảng giá',categories:'Danh mục chung',staff:'Nhân viên',reports:'Báo cáo',categories:'Danh mục chung',permissions:'Phân quyền',system:'Hệ thống',viewCost:'Xem giá vốn/lợi nhuận',editSales:'Sửa đơn bán',deleteSales:'Hủy phiếu bán',editStock:'Sửa phiếu kho',deleteStock:'Xóa phiếu kho',audit:'Xem nhật ký thao tác',salaries:'Lương nhân viên',viewSalary:'Xem lương',manageSalary:'Quản lý lương'};

const permissionGroups=[
  {title:'Tổng quan',desc:'Các màn hình điều hành chung',keys:['dashboard','reports','audit']},
  {title:'Bán hàng & khách hàng',desc:'Tạo đơn, khách hàng, công nợ, bảo hành',keys:['sales','editSales','deleteSales','customers','debts','warranty','commissions']},
  {title:'Kho & sản phẩm',desc:'Sản phẩm, tồn kho và chứng từ kho',keys:['products','inventory','stockbook','editStock','deleteStock']},
  {title:'Tài chính nhạy cảm',desc:'Giá vốn, lợi nhuận, lương, chi phí',keys:['expenses','cashbook','salaries','viewSalary','manageSalary','viewCost']},
  {title:'Quản trị hệ thống',desc:'Nhân viên, phân quyền và thiết lập hệ thống',keys:['staff','categories','prices','permissions','system']}
];
function permissionGroupHtml(selected=[]){
  const sel=new Set(selected||[]);
  return permissionGroups.map(g=>`<div class="perm-card"><div class="perm-card-head"><b>${g.title}</b><small>${g.desc}</small></div><div class="perm-actions-mini"><button class="btn ghost" type="button" onclick="togglePermissionGroup('${g.title}',true)">Chọn nhóm</button><button class="btn ghost" type="button" onclick="togglePermissionGroup('${g.title}',false)">Bỏ nhóm</button></div><div class="perm-options">${g.keys.map(k=>`<label><input type="checkbox" value="${k}" ${sel.has(k)?'checked':''}> <span>${permLabels[k]||k}</span></label>`).join('')}</div></div>`).join('');
}
window.togglePermissionGroup=(title,checked)=>{
  const g=permissionGroups.find(x=>x.title===title); if(!g)return;
  document.querySelectorAll('#permBox input').forEach(i=>{if(g.keys.includes(i.value))i.checked=!!checked;});
};
window.selectAllPermissions=()=>document.querySelectorAll('#permBox input').forEach(i=>i.checked=true);
window.clearAllPermissions=()=>document.querySelectorAll('#permBox input').forEach(i=>i.checked=false);
window.applyRolePreset=()=>{
  const role=$('uRole')?.value||'Sale';
  const preset=permissionMap[role]||[];
  document.querySelectorAll('#permBox input').forEach(i=>i.checked=preset.includes(i.value));
  document.querySelectorAll('#warehouseAccessBox input').forEach(i=>{i.checked=role==='Admin'||(role==='Kho Chính'&&i.value==='Kho Chính')||(role==='Kho Văn Phòng'&&i.value==='Kho Văn Phòng')});
};
function permissionSummary(perms=[]){
  if(!perms.length)return '<span class="muted-small">Chưa cấp quyền</span>';
  const set=new Set(perms);
  return permissionGroups.map(g=>{
    const count=g.keys.filter(k=>set.has(k)).length;
    if(!count)return '';
    return `<span class="perm-chip">${g.title}: ${count}</span>`;
  }).join('') || perms.map(p=>`<span class="perm-chip">${permLabels[p]||p}</span>`).join('');
}

function normalizePermission(p={}){
  let role=p.role||'Chưa phân quyền';
  let wh=Array.isArray(p.warehouseAccess)?p.warehouseAccess.filter(w=>WAREHOUSES.includes(w)):[];
  if(role==='Admin')wh=WAREHOUSES;
  if(role==='Kho Chính'&&!wh.length)wh=['Kho Chính'];
  if(role==='Kho Văn Phòng'&&!wh.length)wh=['Kho Văn Phòng'];
  return {...p,role,perms:p.perms||[],warehouseAccess:wh};
}
function has(p){return currentPerm.role==='Admin'||(currentPerm.perms||[]).includes(p)}
function isSaleCanceled(s){return String(s?.status||'').includes('Đã hủy')||String(s?.orderStatus||'').includes('Đã hủy')||s?.canceled===true||s?.isCanceled===true}
function isVoucherCanceled(v){return String(v?.status||'').includes('Đã hủy')||v?.canceled===true||v?.isCanceled===true}
function isReceiptCanceled(r){return String(r?.status||'').includes('Đã hủy')||r?.canceled===true||r?.isCanceled===true}
function isWarrantyCanceled(w){return String(w?.status||'').includes('Đã hủy')||w?.canceled===true||w?.isCanceled===true}
function activeSales(){return data.sales.filter(s=>!isSaleCanceled(s))}
function activeReceipts(){return data.receipts.filter(r=>!isReceiptCanceled(r))}
function activeStockVouchers(){return data.stockVouchers.filter(v=>!isVoucherCanceled(v))}
function activeWarranties(){return data.warranties.filter(w=>!isWarrantyCanceled(w))}
function col(n){return collection(db,n)}
async function loadCol(n){try{const s=await getDocs(col(n));data[n]=s.docs.map(d=>({id:d.id,...d.data()}));}catch(e){console.warn('Không tải được collection '+n,e.message);data[n]=[];}}
async function loadAll(){for(const n of ['customers','products','productCategories','systemCategories','warrantyReasons','staff','prices','costPrices','sales','stockVouchers','receipts','warranties','warrantyReasons','expenses','salaries','users','logs']) await loadCol(n); await normalizeUnknownReceiptPaymentMethods(); renderAll();}
async function logAction(action,detail){try{await addDoc(col('logs'),{action,detail,email:currentUser?.email||'',at:serverTimestamp()})}catch(e){}}
function fillSelect(el,arr,labelFn,valFn){if(!el)return;el.innerHTML='<option value="">-- Chọn --</option>'+arr.map(x=>`<option value="${valFn?valFn(x):x.id}">${labelFn(x)}</option>`).join('')}
function nextCode(prefix,arr){let max=0;arr.forEach(x=>{const m=String(x.code||'').match(/(\d+)$/);if(m)max=Math.max(max,+m[1])});return prefix+String(max+1).padStart(6,'0')}
function stockOf(code,excludeVoucherId='',warehouse=''){
  if(!warehouse){
    // Tổng tồn = cộng tồn từng kho để phiếu chuyển kho không làm thay đổi tổng tồn.
    return WAREHOUSES.reduce((a,w)=>a+stockOf(code,excludeVoucherId,w),0);
  }
  let qty=0;
  data.stockVouchers.forEach(v=>{
    if(isVoucherCanceled(v))return;
    if(v.id===excludeVoucherId)return;
    (v.items||[]).forEach(it=>{
      if(it.code!==code)return;
      const q=+it.qty||0;
      if(v.type==='TRANSFER'){
        const from=v.fromWarehouse||v.warehouse||'Kho Chính';
        const to=v.toWarehouse||'Kho Văn Phòng';
        if(warehouse===from) qty-=q;
        if(warehouse===to) qty+=q;
      }else{
        if(voucherWarehouse(v)!==warehouse)return;
        if(v.type==='IN'||v.type==='RETURN')qty+=q;
        else if(v.type==='OUT')qty-=q;
        else qty+=q;
      }
    });
  });
  return qty;
}
function prefixByStockType(t){return t==='IN'?'NK':t==='OUT'?'XK':t==='RETURN'?'TH':t==='TRANSFER'?'CK':t==='CHECK'?'KK':'DC'}
function stockTypeName(t){return t==='IN'?'Phiếu nhập kho':t==='OUT'?'Phiếu xuất kho':t==='RETURN'?'Phiếu trả lại hàng bán':t==='TRANSFER'?'Phiếu chuyển kho':t==='CHECK'?'Phiếu kiểm kê':'Phiếu điều chỉnh kho'}
function stockStatusBadge(stock,minStock=3){
  const qty=Number(stock)||0;
  const min=Number(minStock)||3;
  if(qty<=0) return '<span class="badge red">Hết hàng</span>';
  if(qty<min) return '<span class="badge orange">Tồn thấp</span>';
  return '<span class="badge green">Đủ hàng</span>';
}
function stockVoucherLocked(v){return !!(v.saleId||v.saleCode||v.locked)}

const PAYMENT_METHODS=['Tiền mặt','Chuyển khoản','Quẹt thẻ','Ví điện tử','Cọc trước','Khác'];
const DEFAULT_RECEIPT_PAYMENT_METHOD='Chuyển khoản';
function isUnknownPaymentMethod(v){
  const m=String(v??'').trim();
  return !m || ['Chưa chọn','Chưa xác định','Chưa khai báo','Chưa khai báo/Chưa chọn','Không xác định','undefined','null','NaN'].includes(m);
}
function paymentMethodText(v){return isUnknownPaymentMethod(v)?DEFAULT_RECEIPT_PAYMENT_METHOD:String(v||'').trim()}
function paymentMethodBadge(v){const m=paymentMethodText(v);const cls=m.includes('Chuyển')?'blue':(m.includes('Tiền mặt')?'green':(m.includes('Cọc')?'orange':'gray'));return `<span class="badge ${cls}">${m}</span>`}
function saleLocked(s){const pay=salePaymentInfo(s);return pay.paidTotal>0||!!stockVoucherForSale(s)}

function normalizeSaleItemsForCompare(items=[]){
  return (items||[]).map(it=>({
    code:String(it.code||'').trim(),
    name:String(it.name||'').trim(),
    qty:+(it.qty||0)||0,
    price:+(it.price||0)||0,
    discountType:String(it.discountType||'percent'),
    discount:+(it.discount||0)||0
  }));
}
function saleFinancialSnapshot(s={}){
  return {
    items: normalizeSaleItemsForCompare(s.items||[]),
    vatMode:String(s.vatMode||''),
    surcharge:+(s.surcharge||0)||0,
    orderDiscountType:String(s.orderDiscountType||'none'),
    orderDiscountValue:+(s.orderDiscountValue||0)||0,
    commissionPercent:+(s.commissionPercent||0)||0,
    techCost:+(s.techCost||0)||0,
    techFuel:+(s.techFuel||0)||0,
    warehouse:String(s.warehouse||''),
    stockExported:!!s.stockExported,
    grand:+(s.grand||0)||0,
    subtotal:+(s.subtotal||0)||0,
    cost:+(s.cost||0)||0
  };
}
function saleFinancialChanges(oldSale={},newSale={}){
  const oldSnap=saleFinancialSnapshot(oldSale);
  const newSnap=saleFinancialSnapshot(newSale);
  const changes=[];
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  if(!eq(oldSnap.items,newSnap.items)) changes.push('Sản phẩm / số lượng / đơn giá / chiết khấu dòng');
  ['vatMode','surcharge','orderDiscountType','orderDiscountValue','commissionPercent','techCost','techFuel','warehouse','stockExported','grand','subtotal','cost'].forEach(k=>{
    if(JSON.stringify(oldSnap[k])!==JSON.stringify(newSnap[k])) changes.push(k);
  });
  return [...new Set(changes)];
}
function saleCustomerOnlyChanges(oldSale={},newSale={}){
  const ignore=['customerId','customerCode','customerName','customerPhone','customerAddress','customerType','customerGroup','name','phone','address','type','updatedAt','customerEditHistory'];
  const a={...oldSale}, b={...newSale};
  ignore.forEach(k=>{delete a[k]; delete b[k];});
  return JSON.stringify(saleFinancialSnapshot(oldSale))===JSON.stringify(saleFinancialSnapshot(newSale));
}
async function requireSaleFinancialEditReason(oldSale,newSale){
  const changes=saleFinancialChanges(oldSale,newSale);
  if(!changes.length) return '';
  if(!has('editSales') && currentPerm.role!=='Admin'){
    throw new Error('Bạn không có quyền sửa đơn giá / sản phẩm / chiết khấu / kho của phiếu bán. Chỉ được sửa thông tin khách hàng.');
  }
  const locked=saleLocked(oldSale);
  const msg=[
    `Bạn đang sửa dữ liệu tài chính của phiếu ${oldSale.code||''}.`,
    `Thay đổi: ${changes.join(', ')}`,
    `Tổng cũ: ${money(oldSale.grand||0)} → Tổng mới: ${money(newSale.grand||0)}`,
    locked?'Phiếu này đã thu tiền hoặc đã xuất kho. Hệ thống sẽ cập nhật lại đúng mã phiếu cũ, không tạo doanh thu mới.':'Hệ thống sẽ cập nhật lại đúng mã phiếu cũ, không cộng trùng doanh thu.',
    'Nhập lý do chỉnh sửa:'
  ].join('\n');
  const reason=prompt(msg,'Nhập sai đơn giá / chiết khấu');
  if(!reason || !String(reason).trim()) throw new Error('Bắt buộc nhập lý do khi sửa đơn giá / sản phẩm / chiết khấu.');
  return String(reason).trim();
}
async function logSaleFinancialEdit(oldSale,newSale,reason){
  const changes=saleFinancialChanges(oldSale,newSale);
  if(!changes.length) return;
  await addDoc(col('logs'),{
    action:'Sửa dữ liệu tài chính phiếu bán',
    detail:`${oldSale.code||oldSale.id}: ${changes.join(', ')} | ${money(oldSale.grand||0)} -> ${money(newSale.grand||0)} | Lý do: ${reason}`,
    saleId:oldSale.id||'',
    saleCode:oldSale.code||'',
    changes,
    oldGrand:+(oldSale.grand||0)||0,
    newGrand:+(newSale.grand||0)||0,
    oldItems:normalizeSaleItemsForCompare(oldSale.items||[]),
    newItems:normalizeSaleItemsForCompare(newSale.items||[]),
    reason,
    email:currentUser?.email||'',
    at:serverTimestamp()
  });
}
function stockLedgerRows(){
  const rows=[];
  activeStockVouchers().forEach(v=>{
    (v.items||[]).forEach(it=>{
      const q=+it.qty||0;
      if(v.type==='TRANSFER'){
        rows.push({date:v.date,code:v.code,type:'Chuyển đi',warehouse:v.fromWarehouse||v.warehouse||'',product:it.code,name:it.name,qty:-Math.abs(q),note:v.note||it.note||''});
        rows.push({date:v.date,code:v.code,type:'Chuyển đến',warehouse:v.toWarehouse||'',product:it.code,name:it.name,qty:Math.abs(q),note:v.note||it.note||''});
      }else{
        const sign=v.type==='OUT'?-1:1;
        rows.push({date:v.date,code:v.code,type:stockTypeName(v.type),warehouse:voucherWarehouse(v),product:it.code,name:it.name,qty:sign*q,note:v.note||it.note||''});
      }
    })
  });
  return rows.filter(r=>!r.warehouse||canAccessWarehouse(r.warehouse)).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.code).localeCompare(String(a.code)));
}

function stockBookRows(from='',to=''){
  const productMap=new Map();
  (data.products||[]).forEach(p=>{
    productMap.set(p.code,{
      code:p.code||'',
      name:p.name||'',
      cost:+p.cost||0,
      minStock:+p.minStock||3,
      active:p.active||'active',
      khoChinh:0,
      khoVanPhong:0,
      stock:0,
      totalIn:0,
      totalOut:0,
      totalTransfer:0,
      totalAdj:0,
      periodMovement:false,
      value:0
    });
  });
  function ensure(code,name,cost=0){
    code=String(code||'').trim();
    if(!code)return null;
    if(!productMap.has(code)){
      productMap.set(code,{code,name:name||'',cost:+cost||0,minStock:3,active:'active',khoChinh:0,khoVanPhong:0,stock:0,totalIn:0,totalOut:0,totalTransfer:0,totalAdj:0,periodMovement:false,value:0});
    }
    const r=productMap.get(code);
    if(name&&!r.name)r.name=name;
    if(cost&&!r.cost)r.cost=+cost||0;
    return r;
  }
  activeStockVouchers().forEach(v=>{
    const inPeriod=!from&&!to?true:stockDateInRange(v.date,from,to);
    (v.items||[]).forEach(it=>{
      const q=Math.abs(+it.qty||0);
      const r=ensure(it.code,it.name,it.cost);
      if(!r||!q)return;
      const fromWh=v.fromWarehouse||v.warehouse||'Kho Chính';
      const toWh=v.toWarehouse||'Kho Văn Phòng';
      const wh=voucherWarehouse(v)||'Kho Chính';
      if(v.type==='TRANSFER'){
        if(fromWh==='Kho Chính')r.khoChinh-=q;
        if(fromWh==='Kho Văn Phòng')r.khoVanPhong-=q;
        if(toWh==='Kho Chính')r.khoChinh+=q;
        if(toWh==='Kho Văn Phòng')r.khoVanPhong+=q;
        if(inPeriod){r.totalTransfer+=q;r.periodMovement=true;}
      }else if(v.type==='OUT'){
        if(wh==='Kho Chính')r.khoChinh-=q;
        if(wh==='Kho Văn Phòng')r.khoVanPhong-=q;
        if(inPeriod){r.totalOut+=q;r.periodMovement=true;}
      }else if(v.type==='IN'||v.type==='RETURN'){
        if(wh==='Kho Chính')r.khoChinh+=q;
        if(wh==='Kho Văn Phòng')r.khoVanPhong+=q;
        if(inPeriod){r.totalIn+=q;r.periodMovement=true;}
      }else{
        const signed=+it.qty||0;
        if(wh==='Kho Chính')r.khoChinh+=signed;
        if(wh==='Kho Văn Phòng')r.khoVanPhong+=signed;
        if(inPeriod){r.totalAdj+=signed;r.periodMovement=true;}
      }
    });
  });
  return [...productMap.values()].map(r=>{
    const main=canAccessWarehouse('Kho Chính')?r.khoChinh:0;
    const office=canAccessWarehouse('Kho Văn Phòng')?r.khoVanPhong:0;
    const stock=main+office;
    return {...r,khoChinh:main,khoVanPhong:office,stock,value:stock*(+r.cost||0)};
  }).sort((a,b)=>String(a.code).localeCompare(String(b.code),'vi',{numeric:true}));
}

function printHeader(title){return `<p style="text-align:center;line-height:1.45;margin:0 0 6px"><b>SIMILOCK ĐÀ NẴNG</b><br>223 Trường Chinh, P. An Khê, TP. Đà Nẵng<br>403 Nguyễn Thái Bình, P. Bảy Hiền, TP.HCM<br>Hotline: 0905.244.009</p><h2 style="text-align:center;margin:4px 0 8px;font-size:18px">${title}</h2><hr>`}

function voucherItemsFromSaleItems(items){return (items||[]).map(it=>{const p=data.products.find(x=>x.code===it.code)||{};return {code:it.code,name:it.name||p.name||'',qty:+it.qty||0,inputQty:+it.qty||0,cost:+p.cost||0,note:'Xuất theo đơn bán hàng'}})}
function safeNum(v){return Number(String(v??'').replace(/[^0-9.-]/g,''))||0}
function parseCSV(text){
  const rows = [];
  let row = [];
  let cur = '';
  let q = false;
  text = String(text || '').replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (q && c === '"' && n === '"') {
      cur += '"';
      i++;
      continue;
    }

    if (c === '"') {
      q = !q;
      continue;
    }

    if (c === ',' && !q) {
      row.push(cur.trim());
      cur = '';
      continue;
    }

    if ((c === '\n' || c === '\r') && !q) {
      if (c === '\r' && n === '\n') i++;
      row.push(cur.trim());
      cur = '';
      if (row.some(x => x !== '')) rows.push(row);
      row = [];
      continue;
    }

    cur += c;
  }

  row.push(cur.trim());
  if (row.some(x => x !== '')) rows.push(row);
  return rows;
}
function normalizePhone(v){return String(v||'').replace(/\D/g,'')}
function customerCodeFromPhone(phone){let n=normalizePhone(phone);return n?'KL'+n:''}
function ensureCustomerCode(c){return c.customerCode||c.code||customerCodeFromPhone(c.phone)||''}
function htmlesc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

function cleanCustomerName(name,phone='',code=''){
  const n=String(name||'').trim();
  const ph=String(phone||'').trim();
  const cd=String(code||'').trim();
  if(!n) return '';
  const onlyNum=normalizePhone(n);
  if(ph && onlyNum && onlyNum===normalizePhone(ph)) return '';
  if(cd && n.toLowerCase()===cd.toLowerCase()) return '';
  if(cd && ph && n.toLowerCase()===(cd+' - '+ph).toLowerCase()) return '';
  return n;
}
function customerInfo(c={}){
  const code=ensureCustomerCode(c);
  const phone=c.phone||c.customerPhone||'';
  const rawName=c.name||c.customerName||c.fullName||c.contact||'';
  const name=cleanCustomerName(rawName,phone,code)||'Chưa cập nhật tên';
  return {name,code,phone,address:c.address||c.customerAddress||'',type:c.type||c.customerType||c.customerGroup||'Khách lẻ'};
}
function saleCustomerRecord(s={}){
  return data.customers.find(c=>(s.customerId&&c.id===s.customerId)||(s.customerCode&&ensureCustomerCode(c)===s.customerCode)||(s.customerPhone&&normalizePhone(c.phone)===normalizePhone(s.customerPhone)))||{};
}
function saleCustomerInfo(s={}){
  const snap=s.customerSnapshot||{};
  const c=saleCustomerRecord(s);
  const code=snap.code||snap.customerCode||s.customerCode||ensureCustomerCode(c)||'';
  const phone=snap.phone||s.customerPhone||c.phone||'';
  const address=snap.address||s.customerAddress||c.address||'';
  const type=snap.type||s.customerType||s.customerGroup||c.type||'Khách lẻ';
  // Quan trọng: tên hiển thị của phiếu bán phải lấy từ snapshot của chính phiếu đó.
  // Không tự lấy tên mới từ danh mục khách hàng, vì sửa hồ sơ khách sẽ làm đổi hàng loạt đơn cũ.
  const name=cleanCustomerName(snap.name,phone,code)||cleanCustomerName(s.customerName,phone,code)||'Chưa cập nhật tên';
  return {name,code,phone,address,type};
}
function customerSnapshotFromCustomer(c={}, overrideType=''){
  const i=customerInfo(c);
  const type=overrideType||i.type||'Khách lẻ';
  return {id:c.id||'', code:i.code||'', customerCode:i.code||'', name:i.name||'', phone:i.phone||'', address:i.address||'', type};
}
function customerSnapshotPayload(snap={}){
  return {
    customerId:snap.id||'', customerCode:snap.code||snap.customerCode||'', customerName:snap.name||'',
    customerPhone:snap.phone||'', customerAddress:snap.address||'', customerType:snap.type||'Khách lẻ', customerGroup:snap.type||'Khách lẻ',
    customerSnapshot:{id:snap.id||'', code:snap.code||snap.customerCode||'', name:snap.name||'', phone:snap.phone||'', address:snap.address||'', type:snap.type||'Khách lẻ'}
  };
}
function customerSearchValue(c={}){const i=customerInfo(c);return `${i.code} | ${i.name} | ${i.phone} | ${i.type} | ${i.address}`;}
function saleEditCustomerOptionValue(c={}){const i=customerInfo(c);return `${c.id||''} | ${i.code} | ${i.name} | ${i.phone} | ${i.type} | ${i.address}`;}
function findCustomerFromSaleEditPicker(raw=''){
  const text=String(raw||'').trim();
  if(!text) return null;
  const first=text.split('|')[0].trim();
  // Ưu tiên tuyệt đối ID ở đầu giá trị datalist để không nhầm khách trùng tên/SĐT hiển thị.
  let c=data.customers.find(x=>x.id===first);
  if(c) return c;
  const parsed=parseCustomerInput(text);
  const phone=parsed.phone||extractPhone(text);
  const code=parsed.customerCode||'';
  if(code) { c=data.customers.find(x=>ensureCustomerCode(x).toLowerCase()===code.toLowerCase()); if(c) return c; }
  if(phone) { c=data.customers.find(x=>normalizePhone(customerInfo(x).phone)===normalizePhone(phone)); if(c) return c; }
  const exact=searchKey(text);
  c=data.customers.find(x=>searchKey(saleEditCustomerOptionValue(x))===exact || searchKey(customerSearchValue(x))===exact);
  return c||null;
}

function detectCustomerType(raw=''){
  const k=searchKey(raw);
  if(/\bctv\b/.test(k)) return 'CTV';
  if(k.includes('dai ly') || k.includes('daily')) return 'Đại lý';
  if(k.includes('cong ty') || k.includes('company') || k.includes('cty')) return 'Công ty';
  return 'Khách lẻ';
}
function extractPhone(raw=''){
  const text=String(raw||'');
  const m=text.match(/(?:\+?84|0)?[\s.\-()]*\d(?:[\s.\-()]*\d){7,10}/);
  return m ? normalizePhone(m[0]).replace(/^84/,'0') : '';
}
function parseCustomerInput(raw=''){
  raw=String(raw||'').trim();
  const out={customerCode:'',name:'',phone:'',type:'Khách lẻ',address:''};
  if(!raw) return out;
  const parts=raw.split('|').map(x=>x.trim());
  if(parts.length>=2){
    out.customerCode=parts[0]||'';
    out.name=parts[1]||'';
    out.phone=extractPhone(parts[2]||parts.find(x=>extractPhone(x))||'');
    out.type=(parts[3]&&['Khách lẻ','CTV','Đại lý','Công ty'].includes(parts[3]))?parts[3]:detectCustomerType(raw);
    out.address=parts.slice(4).join(' | ').trim();
    if(!out.phone) out.phone=extractPhone(raw);
    if(!out.customerCode && out.phone) out.customerCode=customerCodeFromPhone(out.phone);
    return out;
  }
  out.phone=extractPhone(raw);
  out.customerCode=(raw.match(/\b(KL\d{6,})\b/i)||[])[1]||customerCodeFromPhone(out.phone);
  out.type=detectCustomerType(raw);
  let name=raw;
  if(out.customerCode) name=name.replace(new RegExp(out.customerCode,'i'),' ');
  if(out.phone) {
    const digits=normalizePhone(out.phone);
    name=name.replace(/(?:\+?84|0)?[\s.\-()]*\d(?:[\s.\-()]*\d){7,10}/,' ');
    name=name.replace(digits,' ');
  }
  name=name.replace(/khach\s*le|khách\s*lẻ|ctv|dai\s*ly|đại\s*lý|cong\s*ty|công\s*ty/ig,' ')
           .replace(/[|,;]+/g,' ').replace(/\s+/g,' ').trim();
  out.name=/^[0-9+ .\-()]+$/.test(name)?'':name;
  return out;
}
function customerDisplayValue(c={}){const i=customerInfo(c);return i.name||i.phone||i.code||'';}
function setSaleCustomerFields(c={}, opts={}){
  const i=customerInfo(c);
  const forceContact=!!(opts.forceContact||opts.forceAddress||opts.forceAll);
  if($('saleCustomerId')) $('saleCustomerId').value=c.id||'';
  if($('saleCustomerSearch') && opts.setName!==false) $('saleCustomerSearch').value=i.name||'';
  if($('saleCustomerPhone') && (forceContact || !window.__saleCustomerPhoneManual)) { $('saleCustomerPhone').value=i.phone||''; window.__saleCustomerPhoneManual=false; }
  if($('saleCustomerAddress') && (forceContact || !window.__saleCustomerAddressManual)) { $('saleCustomerAddress').value=i.address||''; window.__saleCustomerAddressManual=false; }
  if($('saleCustomerType')) $('saleCustomerType').value=['Khách lẻ','CTV','Đại lý','Công ty'].includes(i.type)?i.type:'Khách lẻ';
}
function customerShortLabel(c={}){const i=customerInfo(c);return `${i.code} - ${i.name}${i.phone?' - '+i.phone:''}`;}
function validateDate(v){return !v || /^\d{4}-\d{2}-\d{2}$/.test(v)}
function normalizeDateInput(v, fallback=today()){
  const raw=String(v||'').trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // Hỗ trợ trường hợp trình duyệt/nhập tay dạng dd/mm/yyyy hoặc dd-mm-yyyy
  const m=raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if(m){
    const dd=m[1].padStart(2,'0'), mm=m[2].padStart(2,'0'), yy=m[3];
    return `${yy}-${mm}-${dd}`;
  }
  return fallback;
}
function saleDateValue(){
  const el=$('saleDate');
  // Không tự ép về ngày hiện tại khi nhân viên chọn ngày trước hiện tại.
  // Chỉ dùng hôm nay khi ô ngày bị trống hoặc sai định dạng.
  const v=normalizeDateInput(el?.value||'', today());
  if(el && el.value!==v) el.value=v;
  return v;
}
function lineGross(it){return (+it.qty||0)*(+it.price||0)}
function lineDiscountAmount(it){
  const gross=lineGross(it);
  const type=it.discountType||'percent';
  let val=+(it.discount||0)||0;
  if(type==='amount') return Math.min(Math.max(val,0),gross);
  return Math.min(Math.max(gross*val/100,0),gross);
}
function lineNet(it){return Math.max(lineGross(it)-lineDiscountAmount(it),0)}
function calcOrderDiscount(subtotal,type,value){
  let v=+(value||0)||0;
  if(!type||type==='none'||v<=0) return 0;
  if(type==='percent') return Math.min(Math.max(subtotal*v/100,0),subtotal);
  return Math.min(Math.max(v,0),subtotal);
}
function discountLabel(type,value){
  if(!type||type==='none'||!(+value>0)) return '';
  return type==='percent' ? `${+value||0}%` : money(+value||0);
}
function calcSaleTotals(items,vatMode,paid,surcharge=0,orderDiscountType='none',orderDiscountValue=0){
  let goodsBeforeDiscount=items.reduce((a,it)=>a+lineGross(it),0);
  let lineDiscountTotal=items.reduce((a,it)=>a+lineDiscountAmount(it),0);
  let subtotalBeforeOrderDiscount=items.reduce((a,it)=>a+lineNet(it),0);
  let orderDiscountTotal=calcOrderDiscount(subtotalBeforeOrderDiscount,orderDiscountType,orderDiscountValue);
  let subtotal=Math.max(subtotalBeforeOrderDiscount-orderDiscountTotal,0);
  let extra=+(surcharge||0)||0;
  let rate=vatMode?.includes('10') ? 0.10 : (vatMode?.includes('8') ? 0.08 : 0);
  let vat=0,grand=subtotal+extra;
  if(vatMode?.startsWith('add')){vat=subtotal*rate;grand=subtotal+vat+extra}
  else if(vatMode?.startsWith('included')){vat=subtotal-subtotal/(1+rate);grand=subtotal+extra}
  let discountTotal=lineDiscountTotal+orderDiscountTotal;
  return{goodsBeforeDiscount,lineDiscountTotal,subtotalBeforeOrderDiscount,orderDiscountType,orderDiscountValue:+(orderDiscountValue||0)||0,orderDiscountTotal,discountTotal,subtotal,vat,surcharge:extra,grand,debt:grand-(+paid||0)}
}
function calcCommissionBase(totals){return Math.max(0,(+totals?.grand||0)-(+totals?.vat||0))}
function calcCommission(totals,percent){let base=Math.max(0,calcCommissionBase(totals));return Math.round(base*(+percent||0)/100)}
function saleCommissionBaseValue(s){if(isSaleCanceled(s))return 0;return Math.max(0,+s?.commissionBase||calcCommissionBase(s)||0)}
function saleCommissionValue(s){if(isSaleCanceled(s)||!saleFullyPaidForCommission(s))return 0;const pct=+(s?.commissionPercent||0)||0;const calculated=Math.round(saleCommissionBaseValue(s)*pct/100);return pct?calculated:(+s?.saleCommission||0)}
function saleProfitValue(s){if(isSaleCanceled(s))return 0;const cost=+s?.cost||((s?.items||[]).reduce((a,it)=>a+costFor(it.code,s.date||today())*(+it.qty||0),0));return saleCommissionBaseValue(s)-cost-saleCommissionValue(s)-(+s?.techCost||0)-(+s?.techFuel||0)}
function saleItemSummary(s){
  const map={};
  (s?.items||[]).forEach(it=>{
    const code=String(it.code||it.model||it.productCode||'').trim();
    if(!code)return;
    const qty=+(it.qty||it.quantity||0)||0;
    const name=String(it.name||it.productName||'').trim();
    if(!map[code])map[code]={code,name,qty:0};
    map[code].qty+=qty;
    if(name&&!map[code].name)map[code].name=name;
  });
  const arr=Object.values(map);
  return {
    items:arr,
    models:arr.map(x=>x.code).join(', '),
    qtyText:arr.map(x=>`${x.code}: ${x.qty}`).join(', '),
    totalQty:arr.reduce((a,x)=>a+(+x.qty||0),0)
  };
}

function staffFunctions(staff){
  const list=Array.isArray(staff?.functions)?staff.functions:[];
  const legacy=staff?.dept||'';
  const set=new Set(list.filter(Boolean));
  if(legacy==='Sale'||legacy==='Quản lý')set.add('Sale');
  if(legacy==='Kỹ thuật')set.add('Kỹ thuật');
  if(legacy==='Kho'||legacy==='Kho Chính'||legacy==='Kho Văn Phòng')set.add('Kho');
  if(legacy==='Kế toán')set.add('Kế toán');
  if(legacy==='Quản lý')set.add('Quản lý');
  if(legacy==='Admin')set.add('Admin');
  return [...set];
}
function staffHasFunction(staff,fn){return staffFunctions(staff).includes(fn)}
function staffFunctionText(staff){const a=staffFunctions(staff);return a.length?a.join(', '):(staff?.dept||'')}
function salePercentDefault(staffId){let s=data.staff.find(x=>x.id===staffId);return staffHasFunction(s,'Sale')?+(s?.commissionPercent??5):0}
function techFeeDefault(staffId){let s=data.staff.find(x=>x.id===staffId);return staffHasFunction(s,'Kỹ thuật')?+(s?.techFee??100000):0}
function saleInstallQty(){return saleItems().reduce((a,it)=>a+(+it.qty||0),0)}
function suggestedTechCost(){return saleInstallQty()*techFeeDefault($('saleTech')?.value)}
function expenseTotal(from='',to=''){return data.expenses.filter(e=>(!from||String(e.date||'')>=from)&&(!to||String(e.date||'')<=to)).reduce((a,e)=>a+(+e.amount||0),0)}
function salaryTotal(from='',to=''){return data.salaries.filter(e=>(!from||String(e.date||'')>=from)&&(!to||String(e.date||'')<=to)).reduce((a,e)=>a+(+e.total||+e.amount||0),0)}

function authMsg(e){
  const m=String(e?.code||e?.message||e||'');
  console.error('AUTH/FIRESTORE ERROR:', e);
  if(m.includes('invalid-api-key'))return 'Sai Firebase apiKey hoặc firebase-config.js chưa được cập nhật đúng.';
  if(m.includes('auth/unauthorized-domain')||m.includes('unauthorized-domain'))return 'Domain web chưa được thêm trong Firebase Authentication > Settings > Authorized domains. Hãy thêm domain GitHub Pages của bạn.';
  if(m.includes('operation-not-allowed'))return 'Firebase chưa bật Email/Password. Vào Authentication > Sign-in method > bật Email/Password.';
  if(m.includes('invalid-credential'))return 'Email hoặc mật khẩu không đúng, hoặc tài khoản chưa tồn tại.';
  if(m.includes('user-not-found'))return 'Email chưa tồn tại hoặc chưa được tạo trong Firebase Authentication.';
  if(m.includes('wrong-password'))return 'Mật khẩu không đúng.';
  if(m.includes('email-already-in-use'))return 'Email này đã được tạo tài khoản rồi. Hãy bấm Đăng nhập.';
  if(m.includes('weak-password'))return 'Mật khẩu phải tối thiểu 6 ký tự.';
  if(m.includes('permission-denied')||m.includes('Missing or insufficient permissions'))return 'Firestore Rules đang chặn đọc/ghi. Hãy dùng Rules cơ bản và bấm Publish.';
  return m;
}
async function ensureFirstAdmin(u){
  try{
    const pRef = userDocRef(u);
    const p = await getDoc(pRef);
    if(p.exists()) return p.data();
    const snap = await getDocs(col('users'));
    if(snap.empty || normEmail(u.email)===ADMIN_EMAIL){
      const admin=userProfileData(u,{name:'Admin Similock',role:'Admin',perms:permissionMap.Admin,warehouseAccess:WAREHOUSES,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      await setDoc(pRef,admin,{merge:true});
      return normalizePermission(admin);
    }
    const pending=userProfileData(u,{name:'',role:'Chưa phân quyền',perms:[],createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await setDoc(pRef,pending,{merge:true});
    return normalizePermission(pending);
  }catch(e){
    alert('Đăng nhập Auth thành công nhưng Firestore đang lỗi. Chi tiết: '+authMsg(e));
    return normalizePermission({role:'Admin',perms:permissionMap.Admin,email:normEmail(u.email),uid:u.uid,warehouseAccess:WAREHOUSES});
  }
}


function setLoginBusy(isBusy, msg=''){
  ['loginBtn'].forEach(id=>{ if($(id)) $(id).disabled=!!isBusy; });
  const box=$('loginStatus');
  if(box){ box.textContent=msg||''; box.style.display=msg?'block':'none'; }
}
async function loadUserProfile(u){
  const email=normEmail(u.email);
  const pRef=userDocRef(u);
  try{
    const p=await getDoc(pRef);
    if(p.exists()) return normalizePermission({uid:u.uid,...p.data()});

    // Chuẩn UID: document users/{uid}. Admin chính tự được cấp quyền.
    if(email===ADMIN_EMAIL){
      const admin=userProfileData(u,{name:'Admin Similock',role:'Admin',perms:permissionMap.Admin,warehouseAccess:WAREHOUSES,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      await setDoc(pRef,admin,{merge:true});
      return normalizePermission(admin);
    }

    // Bảo mật: KHÔNG tự cấp Admin cho tài khoản đầu tiên.
    // Chỉ ADMIN_EMAIL được tự tạo hồ sơ Admin. Các tài khoản khác luôn chờ phân quyền.

    // Nhân viên tự tạo hồ sơ chờ phân quyền bằng UID để Admin sửa sau.
    const pending=userProfileData(u,{name:'',role:'Chưa phân quyền',perms:[],createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await setDoc(pRef,pending,{merge:true});
    return normalizePermission(pending);
  }catch(e){
    throw new Error(authMsg(e));
  }
}


$('loginBtn').onclick=async()=>{
  try{
    const email=normEmail($('email').value),pw=$('password').value;
    if(!email||!pw)return alert('Nhập email và mật khẩu');
    setLoginBusy(true,'Đang đăng nhập...');
    await signInWithEmailAndPassword(auth,email,pw);
  }catch(e){alert(authMsg(e));setLoginBusy(false)}
};


// =========================
// BẢO MẬT PHIÊN ĐĂNG NHẬP
// Tự đăng xuất sau 15 phút không thao tác, cảnh báo trước 60 giây và đồng bộ logout giữa nhiều tab.
// =========================
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const IDLE_WARNING_MS = 14 * 60 * 1000;
let idleWarningTimer = null;
let idleLogoutTimer = null;
let idleCountdownTimer = null;
let idleLastActivity = Date.now();
let idleEventsAttached = false;
let idleLastBroadcast = 0;
let idleLoggingOut = false;

function clearIdleTimers(){
  clearTimeout(idleWarningTimer);
  clearTimeout(idleLogoutTimer);
  clearInterval(idleCountdownTimer);
  idleWarningTimer = null;
  idleLogoutTimer = null;
  idleCountdownTimer = null;
}
function idleModal(){
  let m = document.getElementById('idleTimeoutModal');
  if(m) return m;
  m = document.createElement('div');
  m.id = 'idleTimeoutModal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;';
  m.innerHTML = `
    <div style="width:min(430px,94vw);background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(15,23,42,.28);padding:24px;font-family:inherit;color:#0f172a;">
      <h3 style="margin:0 0 8px;font-size:20px;">Phiên làm việc sắp hết hạn</h3>
      <p style="margin:0 0 12px;line-height:1.45;color:#475569;">Bạn đã không thao tác trong thời gian dài. Hệ thống sẽ tự đăng xuất để bảo vệ dữ liệu kho, công nợ và giá vốn.</p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:12px;margin:12px 0;color:#9a3412;">
        Tự đăng xuất sau <b id="idleCountdown">60</b> giây.
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
        <button id="idleLogoutNow" class="btn ghost" type="button">Đăng xuất</button>
        <button id="idleContinue" class="btn primary" type="button">Tiếp tục làm việc</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.querySelector('#idleContinue').onclick = ()=>resetIdleTimer('continue');
  m.querySelector('#idleLogoutNow').onclick = ()=>forceIdleLogout('Người dùng chọn đăng xuất từ cảnh báo timeout');
  return m;
}
function hideIdleModal(){
  const m = document.getElementById('idleTimeoutModal');
  if(m) m.style.display = 'none';
  clearInterval(idleCountdownTimer);
  idleCountdownTimer = null;
}
function showIdleWarning(){
  if(!currentUser) return;
  const m = idleModal();
  let remain = 60;
  const c = m.querySelector('#idleCountdown');
  c.textContent = remain;
  m.style.display = 'flex';
  clearInterval(idleCountdownTimer);
  idleCountdownTimer = setInterval(()=>{
    remain -= 1;
    c.textContent = Math.max(0, remain);
    if(remain <= 0) forceIdleLogout('Tự động đăng xuất do không thao tác 15 phút');
  }, 1000);
}
function resetIdleTimer(source='activity'){
  if(!currentUser) return;
  idleLastActivity = Date.now();
  hideIdleModal();
  clearIdleTimers();
  idleWarningTimer = setTimeout(showIdleWarning, IDLE_WARNING_MS);
  idleLogoutTimer = setTimeout(()=>forceIdleLogout('Tự động đăng xuất do không thao tác 15 phút'), IDLE_TIMEOUT_MS);
  // Báo nhẹ cho các tab khác, giới hạn 2 giây/lần để tránh ghi localStorage quá nhiều khi rê chuột.
  const now = Date.now();
  if(source !== 'storage' && now - idleLastBroadcast > 2000){
    idleLastBroadcast = now;
    try{ localStorage.setItem('similock:lastActivity', String(now)); }catch(e){}
  }
}
async function forceIdleLogout(reason){
  if(idleLoggingOut) return;
  idleLoggingOut = true;
  clearIdleTimers();
  hideIdleModal();
  try{ localStorage.setItem('similock:forceLogout', String(Date.now())); }catch(e){}
  try{ await logAction('Logout timeout', reason || 'Phiên hết hạn'); }catch(e){}
  try{ await signOut(auth); }catch(e){}
  idleLoggingOut = false;
  alert('Phiên đăng nhập đã hết hạn do không thao tác. Vui lòng đăng nhập lại.');
}
function attachIdleEvents(){
  if(idleEventsAttached) return;
  idleEventsAttached = true;
  ['click','keydown','mousemove','mousedown','touchstart','scroll'].forEach(ev=>{
    window.addEventListener(ev, ()=>resetIdleTimer('activity'), {passive:true});
  });
  window.addEventListener('storage', (e)=>{
    if(e.key === 'similock:lastActivity') resetIdleTimer('storage');
    if(e.key === 'similock:forceLogout' && currentUser) signOut(auth);
  });
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) resetIdleTimer('activity');
  });
}
function startIdleSecurity(){
  attachIdleEvents();
  idleLoggingOut = false;
  resetIdleTimer('login');
}
function stopIdleSecurity(){
  clearIdleTimers();
  hideIdleModal();
  idleLoggingOut = false;
}



function setChangePasswordBusy(isBusy,msg=''){
  const btn=$('savePasswordBtn'); if(btn) btn.disabled=!!isBusy;
  const box=$('changePasswordStatus');
  if(box){box.style.display=msg?'block':'none'; box.textContent=msg||'';}
}
window.openChangePasswordModal=function(){
  ['oldPassword','newPassword','confirmPassword'].forEach(id=>{const el=$(id); if(el) el.value='';});
  setChangePasswordBusy(false,'');
  $('changePasswordModal').classList.remove('hidden');
  setTimeout(()=>{try{$('oldPassword').focus()}catch(e){}},50);
}
window.closeChangePasswordModal=function(){
  $('changePasswordModal').classList.add('hidden');
  setChangePasswordBusy(false,'');
}
window.changeMyPassword=async function(){
  try{
    if(!auth.currentUser) return alert('Bạn cần đăng nhập lại để đổi mật khẩu.');
    const oldPw=$('oldPassword').value;
    const newPw=$('newPassword').value;
    const confirmPw=$('confirmPassword').value;
    if(!oldPw) return alert('Vui lòng nhập mật khẩu hiện tại.');
    if(!newPw || newPw.length<6) return alert('Mật khẩu mới phải tối thiểu 6 ký tự.');
    if(newPw!==confirmPw) return alert('Mật khẩu mới nhập lại chưa khớp.');
    if(oldPw===newPw) return alert('Mật khẩu mới không được trùng mật khẩu hiện tại.');
    setChangePasswordBusy(true,'Đang xác thực mật khẩu hiện tại...');
    const credential=EmailAuthProvider.credential(auth.currentUser.email,oldPw);
    await reauthenticateWithCredential(auth.currentUser,credential);
    setChangePasswordBusy(true,'Đang cập nhật mật khẩu mới...');
    await updatePassword(auth.currentUser,newPw);
    await logAction('Change Password','Người dùng tự đổi mật khẩu');
    window.closeChangePasswordModal();
    alert('Đổi mật khẩu thành công. Lần đăng nhập sau hãy dùng mật khẩu mới.');
  }catch(e){
    setChangePasswordBusy(false,'');
    alert('Đổi mật khẩu thất bại: '+authMsg(e));
  }
}
$('changePasswordBtn').onclick=()=>window.openChangePasswordModal();

$('logoutBtn').onclick=async()=>{ await logAction('Logout','Người dùng bấm đăng xuất'); try{localStorage.setItem('similock:forceLogout',String(Date.now()))}catch(e){}; signOut(auth); };

onAuthStateChanged(auth,async u=>{
  if(!u){stopIdleSecurity();currentUser=null;currentPerm={role:'Admin',perms:[],warehouseAccess:WAREHOUSES};$('loginPage').style.display='grid';$('appPage').style.display='none';setLoginBusy(false);return}
  try{
    setLoginBusy(true,'Đang tải phân quyền...');
    currentUser=u;
    currentPerm = await loadUserProfile(u);
    if(currentPerm.role==='Chưa phân quyền'){
      await signOut(auth);
      alert('Đăng nhập Auth thành công nhưng email này chưa được Admin phân quyền: '+normEmail(u.email));
      return;
    }
    $('currentUser').textContent=normEmail(u.email)+' • '+(currentPerm.role||'');
    $('loginPage').style.display='none';$('appPage').style.display='flex';
    startIdleSecurity();
    applyPermissions();
    await loadAll();
    showPage(has('dashboard')?'dashboard':((currentPerm.perms||[])[0]||'dashboard'));
    setLoginBusy(false);
  }catch(e){
    $('loginPage').style.display='grid';$('appPage').style.display='none';setLoginBusy(false);
    alert('Đăng nhập chưa hoàn tất: '+authMsg(e));
  }
});

function applyPermissions(){
  const canViewCost=has('viewCost');
  document.querySelectorAll('#menu button[data-page]').forEach(b=>{b.style.display=has(b.dataset.page)?'block':'none'});
  document.querySelectorAll('#menu .menu-group').forEach(g=>{const visible=[...g.querySelectorAll('button[data-page]')].some(b=>b.style.display!=='none');g.style.display=visible?'block':'none';});
  document.querySelectorAll('.view-cost').forEach(x=>x.classList.toggle('hidden',!canViewCost));
  const profitCard=$('kpiProfitCard'); if(profitCard)profitCard.classList.toggle('hidden',!canViewCost);
  document.querySelectorAll('.salary-only').forEach(x=>x.classList.toggle('hidden',!(has('viewSalary')||has('manageSalary'))));
  document.querySelectorAll('.manage-salary').forEach(x=>x.classList.toggle('hidden',!has('manageSalary')));
}
document.querySelectorAll('#menu .menu-toggle').forEach(btn=>btn.onclick=()=>btn.closest('.menu-group').classList.toggle('open'));document.querySelectorAll('#menu button[data-page]').forEach(btn=>btn.onclick=()=>showPage(btn.dataset.page));
function showPage(id){if(!has(id))return alert('Tài khoản chưa được phân quyền');document.querySelectorAll('#menu button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));document.querySelectorAll('#menu .menu-group').forEach(g=>g.classList.toggle('active-group',[...g.querySelectorAll('button[data-page]')].some(b=>b.dataset.page===id)));const activeBtn=document.querySelector(`#menu button[data-page="${id}"]`);if(activeBtn)activeBtn.closest('.menu-group')?.classList.add('open');document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));$('pageTitle').textContent=btnTitle(id);$('pageSub').textContent='Similock Đà Nẵng - Quản lý bán hàng, kho, công nợ, bảo hành';if(id==='reports')setTimeout(()=>window.setReportTab?.(currentReportTab||'revenue'),0)}
function btnTitle(id){return ({dashboard:'Dashboard điều hành',sales:'Bán hàng',commissions:'Hoa hồng',expenses:'Phiếu chi / Chi phí',cashbook:'Sổ quỹ',salaries:'Lương nhân viên',debts:'Công nợ',inventory:'Kho hàng',stockbook:'Sổ kho',warranty:'Bảo hành',customers:'Khách hàng',products:'Sản phẩm',categories:'Danh mục chung',prices:'Bảng giá',categories:'Danh mục chung',staff:'Nhân viên',reports:'Báo cáo',categories:'Danh mục chung',permissions:'Phân quyền',system:'Hệ thống',audit:'Nhật ký thao tác'}[id]||id)}

function renderAll(){
  // V49: gọi hàm nội bộ trực tiếp, không phụ thuộc window.* khi module chưa export xong.
  const steps=[
    ['applyPermissions',()=>applyPermissions()],
    ['renderSelectors',()=>renderSelectors()],
    ['renderDashboard',()=>renderDashboard()],
    ['renderCustomers',()=>renderCustomers()],
    ['renderProducts',()=>renderProducts()],
    ['renderSystemCategories',()=>{ if(typeof window.renderSystemCategories==='function') window.renderSystemCategories(); }],
    ['renderPriceProductPicker',()=>{ if(typeof window.renderPriceProductPicker==='function') window.renderPriceProductPicker(); }],
    ['renderCostProductPicker',()=>{ if(typeof window.renderCostProductPicker==='function') window.renderCostProductPicker(); }],
    ['renderPrices',()=>renderPrices()],
    ['renderCostPrices',()=>renderCostPrices()],
    ['renderStaff',()=>renderStaff()],
    ['renderSales',()=>renderSales()],
    ['renderCommissions',()=>renderCommissions()],
    ['renderExpenses',()=>renderExpenses()],
    ['renderSalaries',()=>renderSalaries()],
    ['renderDebts',()=>renderDebts()],
    ['renderReceipts',()=>renderReceipts()],
    ['renderCashbook',()=>renderCashbook()],
    ['renderStock',()=>renderStock()],
    ['renderStockBook',()=>renderStockBook()],
    ['renderWarrantyCoverage',()=>renderWarrantyCoverage()],
    ['renderWarranties',()=>renderWarranties()],
    ['renderWarrantyReasonCategories',()=>renderWarrantyReasonCategories()],
    ['renderReports',()=>renderReports()],
    ['renderPermissions',()=>renderPermissions()],
    ['renderAuditLogs',()=>renderAuditLogs()],
    ['staffDeptChanged',()=>staffDeptChanged()],
    ['resetSaleForm',()=>resetSaleForm()],
    ['resetStockForm',()=>resetStockForm()]
  ];
  const errors=[];
  for(const [name,fn] of steps){
    try{ fn(); }catch(e){ console.error('RENDER ERROR '+name+':',e); errors.push(name+': '+(e.message||e)); }
  }
  if(errors.length){ alert('Đăng nhập được nhưng lỗi khi tải màn hình: '+errors.join(' | ')); }
}
function ensureProductDatalist(){
  let dl=document.getElementById('productCodesList');
  if(!dl){dl=document.createElement('datalist');dl.id='productCodesList';document.body.appendChild(dl);}
  dl.innerHTML=data.products.map(p=>`<option value="${p.code} - ${p.name||''}"></option>`).join('');
}
function productCodeFromInput(v){
  v=String(v||'').trim();
  if(!v)return '';
  const prefix=v.split(' - ')[0].trim();
  const direct=data.products.find(p=>String(p.code||'').toLowerCase()===prefix.toLowerCase() || String(p.code||'').toLowerCase()===v.toLowerCase());
  if(direct)return direct.code;
  const mixed=data.products.find(p=>`${p.code} ${p.name||''}`.toLowerCase().includes(v.toLowerCase()));
  return mixed?mixed.code:v.toUpperCase();
}
function productByInput(v){
  v=String(v||'').trim(); if(!v)return null;
  const prefix=v.split(' - ')[0].trim();
  return data.products.find(p=>String(p.code||'').toLowerCase()===prefix.toLowerCase() || `${p.code} - ${p.name||''}`.toLowerCase()===v.toLowerCase())||null;
}

function checkedCodesFromBox(boxId){
  const box=$(boxId); if(!box)return [];
  return [...box.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.value);
}
function renderProductPicker(boxId, searchId, hintId, selectedCodes=[]){
  const box=$(boxId); if(!box)return;
  const old=new Set([...checkedCodesFromBox(boxId), ...selectedCodes.filter(Boolean)]);
  const q=String($(searchId)?.value||'').trim().toLowerCase();
  const rows=data.products.filter(p=>!q || `${p.code} ${p.name||''} ${p.category||''}`.toLowerCase().includes(q));
  box.innerHTML=rows.length?`<table class="picker-table-inner"><thead><tr><th style="width:44px"></th><th style="width:120px">Model</th><th>Tên sản phẩm</th><th style="width:140px">Danh mục</th><th style="width:120px">Giá hiện tại</th></tr></thead><tbody>${rows.map(p=>`<tr onclick="const cb=this.querySelector('input[type=checkbox]'); if(event.target.tagName!=='INPUT'){cb.checked=!cb.checked;} updateProductPickerHint('${boxId}','${hintId}')"><td><input type="checkbox" value="${p.code}" ${old.has(p.code)?'checked':''} onchange="updateProductPickerHint('${boxId}','${hintId}')"></td><td><b>${p.code}</b></td><td>${p.name||''}</td><td>${p.category||''}</td><td><b>${money(p.price||0)}</b></td></tr>`).join('')}</tbody></table>`:`<div class="empty">Không tìm thấy model phù hợp</div>`;
  updateProductPickerHint(boxId,hintId);
}
function updateProductPickerHint(boxId,hintId){
  const hint=$(hintId); if(!hint)return;
  const codes=checkedCodesFromBox(boxId);
  hint.innerHTML=codes.length?`Đã chọn <b>${codes.length}</b> model: ${codes.join(', ')}`:'Chưa chọn model nào';
}
window.renderPriceProductPicker=()=>renderProductPicker('priceProductPicker','priceProductSearch','priceSelectedHint',[$('priceProduct')?.value||'']);
window.renderCostProductPicker=()=>renderProductPicker('costProductPicker','costProductSearch','costSelectedHint',[$('costProduct')?.value||'']);
function selectVisibleProductPicker(boxId,hintId){
  const box=$(boxId); if(!box)return;
  box.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=true);
  updateProductPickerHint(boxId,hintId);
}
function clearProductPicker(boxId,hintId,hiddenId,searchId){
  const box=$(boxId); if(box)box.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=false);
  if($(hiddenId))$(hiddenId).value='';
  if($(searchId))$(searchId).value='';
  updateProductPickerHint(boxId,hintId);
}
window.selectAllPriceProducts=()=>selectVisibleProductPicker('priceProductPicker','priceSelectedHint');
window.clearPriceProducts=()=>clearProductPicker('priceProductPicker','priceSelectedHint','priceProduct','priceProductSearch');
window.selectAllCostProducts=()=>selectVisibleProductPicker('costProductPicker','costSelectedHint');
window.clearCostProducts=()=>clearProductPicker('costProductPicker','costSelectedHint','costProduct','costProductSearch');
function setOnlyCheckedProduct(boxId, code){
  const box=$(boxId); if(!box)return;
  box.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=x.value===code);
}
function renderSelectors(){fillSelect($('saleStaff'),data.staff.filter(x=>staffHasFunction(x,'Sale')||staffHasFunction(x,'Quản lý')),x=>`${x.name}${staffHasFunction(x,'Kỹ thuật')?' (Sale + Kỹ thuật)':''}`);fillSelect($('saleTech'),data.staff.filter(x=>staffHasFunction(x,'Kỹ thuật')),x=>`${x.name}${staffHasFunction(x,'Sale')?' (Kỹ thuật + Sale)':''}`);refreshCommissionStaffOptions();ensureProductDatalist();fillReceiptCustomerOptions();renderProductCategoryOptions();renderWarrantyReasonOptions();renderExpenseCategoryOptions();renderPaymentMethodOptions();renderSystemCategories();renderWarrantyStaffSelectors();if($('saleWarehouse'))$('saleWarehouse').innerHTML=warehouseOptions($('saleWarehouse').value||defaultWarehouse());if($('stockWarehouse'))$('stockWarehouse').innerHTML=warehouseOptions($('stockWarehouse').value||defaultWarehouse());if($('stockToWarehouse'))$('stockToWarehouse').innerHTML=warehouseOptions($('stockToWarehouse').value||defaultWarehouse(),WAREHOUSES);if($('customerList')) $('customerList').innerHTML=data.customers.map(c=>`<option value="${customerSearchValue(c)}"></option>`).join('')}
let dashboardRange='month';
let dashboardCustomFrom='';
let dashboardCustomTo='';
function dashboardSetDateInputs(from='',to=''){
  if($('dashFromDate'))$('dashFromDate').value=from||'';
  if($('dashToDate'))$('dashToDate').value=to||'';
}
window.setDashboardRange=(range)=>{
  dashboardRange=range||'month';
  dashboardCustomFrom='';
  dashboardCustomTo='';
  dashboardSetDateInputs('','');
  document.querySelectorAll('.dash-filter button').forEach(b=>b.classList.toggle('active',b.dataset.range===dashboardRange));
  renderDashboard();
};
window.setDashboardCustomRange=()=>{
  dashboardCustomFrom=$('dashFromDate')?.value||'';
  dashboardCustomTo=$('dashToDate')?.value||'';
  if(!dashboardCustomFrom&&!dashboardCustomTo){setDashboardRange('month');return;}
  dashboardRange='custom';
  document.querySelectorAll('.dash-filter button').forEach(b=>b.classList.remove('active'));
  renderDashboard();
};
function dashboardRangeDates(){
  const now=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const todayStr=fmt(now);
  if(dashboardRange==='custom'){
    const from=dashboardCustomFrom||'1900-01-01';
    const to=dashboardCustomTo||todayStr;
    let label='Tùy chọn';
    if(dashboardCustomFrom&&dashboardCustomTo)label=`${dashboardCustomFrom.split('-').reverse().join('/')} - ${dashboardCustomTo.split('-').reverse().join('/')}`;
    else if(dashboardCustomFrom)label=`Từ ${dashboardCustomFrom.split('-').reverse().join('/')}`;
    else if(dashboardCustomTo)label=`Đến ${dashboardCustomTo.split('-').reverse().join('/')}`;
    return {from,to,label};
  }
  let from=new Date(now.getFullYear(),now.getMonth(),1), label='Tháng này';
  if(dashboardRange==='7days'){from=new Date(now);from.setDate(now.getDate()-6);label='7 ngày gần nhất'}
  if(dashboardRange==='year'){from=new Date(now.getFullYear(),0,1);label='Năm nay'}
  return {from:fmt(from),to:todayStr,label};
}
function monthKey(d){return String(d||'').slice(0,7)}
function sumStockValue(){return data.products.reduce((a,p)=>a+(stockOf(p.code)*(costFor(p.code,today())||+p.cost||0)),0)}
function renderDashboard(){
  const range=dashboardRangeDates();
  const salesInRange=activeSales().filter(s=>String(s.date||'')>=range.from&&String(s.date||'')<=range.to);
  const activeDebtRows=calcDebts();
  const settledDebtRows=calcSettledDebts();
  const overdueRows=activeDebtRows.filter(d=>debtOverdueDays(d)>0).sort((a,b)=>debtOverdueDays(b)-debtOverdueDays(a)||b.debt-a.debt);
  const rev=salesInRange.reduce((a,s)=>a+(+s.grand||0),0);
  const cashRowsInRange=cashbookRows(range.from,range.to);
  // V105-WORKFLOW-STABLE:
  // Quy tắc nghiệp vụ chốt: Doanh số, Thu theo đơn và Tiền vào quỹ là 3 chỉ số khác nhau.
  //
  // Doanh số = tổng giá trị các Phiếu bán có ngày bán trong kỳ lọc.
  // Thu theo đơn = số tiền đã thu cho chính các Phiếu bán có ngày bán trong kỳ lọc.
  // Sổ quỹ = dòng tiền thực tế theo ngày chứng từ thu/chi.
  // Hai chỉ số này KHÔNG dùng chung công thức vì Sổ quỹ có thể gồm thu công nợ cũ hoặc khoản thu ngoài kỳ bán.
  const collected=salesInRange.reduce((a,s)=>a+saleCollectedInRange(s,range.from,range.to),0);
  const cashIn=cashRowsInRange.reduce((a,r)=>a+(+r.income||0),0);
  const cashOut=cashRowsInRange.reduce((a,r)=>a+(+r.expense||0),0);
  const orderProfit=salesInRange.reduce((a,s)=>a+(+s.profit||saleProfitValue(s)||0),0);
  const monthlyExpenses=data.expenses.filter(e=>String(e.date||'')>=range.from&&String(e.date||'')<=range.to&&!isSalaryCategory(e.category));
  const monthlySalaries=data.salaries.filter(e=>String(e.date||'')>=range.from&&String(e.date||'')<=range.to);
  const expense=monthlyExpenses.reduce((a,e)=>a+(+e.amount||0),0)+monthlySalaries.reduce((a,e)=>a+(+e.total||+e.amount||0),0);
  const profit=orderProfit-expense;
  const debt=activeDebtRows.reduce((a,d)=>a+d.debt,0);
  const low=data.products.filter(p=>stockOf(p.code)<=(+p.minStock||3)).sort((a,b)=>stockOf(a.code)-stockOf(b.code));
  const warranties=activeWarranties().filter(w=>String(w.date||w.createdDate||w.createdAt||'')>=range.from&&String(w.date||w.createdDate||w.createdAt||'')<=range.to);
  if($('kpiRevenue'))$('kpiRevenue').textContent=money(rev);
  if($('kpiProfit'))$('kpiProfit').textContent=money(profit);
  if($('kpiDebt'))$('kpiDebt').textContent=money(debt);
  if($('kpiDebtCount'))$('kpiDebtCount').textContent=activeDebtRows.length;
  if($('kpiCollected'))$('kpiCollected').textContent=money(collected);
  if($('kpiCashIn'))$('kpiCashIn').textContent=money(cashIn);
  if($('kpiSettledCount'))$('kpiSettledCount').textContent=settledDebtRows.length;
  if($('kpiOverdueCount'))$('kpiOverdueCount').textContent=overdueRows.length;
  if($('kpiLowStock'))$('kpiLowStock').textContent=low.length;
  if($('dashOrderCount'))$('dashOrderCount').textContent=salesInRange.length;
  if($('dashStockValue'))$('dashStockValue').textContent=compactMoney(sumStockValue());
  if($('dashWarrantyCount'))$('dashWarrantyCount').textContent=warranties.length;
  if($('dashRevenueNote'))$('dashRevenueNote').textContent=range.label;
  if($('dashOrderNote'))$('dashOrderNote').textContent=range.label;

  const last12=[];const now=new Date();
  for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;last12.push({key,label:`T${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}`,value:0,profit:0});}
  activeSales().forEach(s=>{const row=last12.find(x=>x.key===monthKey(s.date));if(row){row.value+=+s.grand||0;row.profit+=+s.profit||saleProfitValue(s)||0;}});
  const productMap={};salesInRange.forEach(s=>(s.items||[]).forEach(it=>{const p=data.products.find(x=>x.code===it.code)||{};productMap[it.code]=productMap[it.code]||{code:it.code,name:p.name||'',qty:0,revenue:0};productMap[it.code].qty+=+it.qty||0;productMap[it.code].revenue+=lineNet(it)||((+it.price||0)*(+it.qty||0));}));
  const productRows=Object.values(productMap).sort((a,b)=>b.qty-a.qty);
  const stockRows=data.products.map(p=>({label:p.code,value:stockOf(p.code),stockValue:stockOf(p.code)*(costFor(p.code,today())||+p.cost||0)})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
  const debtPie=[{label:'Đang nợ',value:activeDebtRows.length},{label:'Đã tất toán',value:settledDebtRows.length},{label:'Quá hạn',value:overdueRows.length}];
  const incomeSale=salesInRange.reduce((a,s)=>a+saleCommissionValue(s),0);
  const incomeTech=salesInRange.reduce((a,s)=>a+(+s.techCost||0)+(+s.techFuel||0),0);
  renderChartHtml('dashboardCharts',
    modernLineChart('Doanh số 12 tháng',last12.map(x=>({label:x.label,value:x.value})),{sub:'Xu hướng doanh số theo phiếu bán',money:true,badge:compactMoney(last12.reduce((a,x)=>a+x.value,0))})+
    modernDonutChart('Cơ cấu công nợ',debtPie,{sub:'Tình trạng thu tiền theo phiếu'})+
    modernBarChart('Top model bán chạy',productRows.map(x=>({label:x.code,value:x.qty})),{sub:'Số lượng bán trong '+range.label,limit:8})+
    modernBarChart('Tồn kho theo model',stockRows.map(x=>({label:x.label,value:x.value})),{sub:'Top model còn tồn nhiều nhất',limit:8})+
    modernLineChart('Lợi nhuận 12 tháng',last12.map(x=>({label:x.label,value:x.profit})),{sub:'Lợi nhuận theo đơn hàng',money:true,badge:compactMoney(last12.reduce((a,x)=>a+x.profit,0))})+
    modernDonutChart('Thu nhập Sale / Kỹ thuật',[{label:'Hoa hồng Sale',value:incomeSale},{label:'Công + xăng Kỹ thuật',value:incomeTech}],{sub:'Tổng trong '+range.label,money:true})
  );

  const st={};salesInRange.forEach(s=>{let n=data.staff.find(x=>x.id===s.staffId)?.name||s.staffName||'Khác';st[n]=st[n]||{rev:0,count:0};st[n].rev+=+s.grand||0;st[n].count++});
  if($('topStaff'))$('topStaff').innerHTML=Object.entries(st).sort((a,b)=>b[1].rev-a[1].rev).slice(0,6).map(([n,v])=>`<tr><td>${htmlesc(n)}</td><td>${money(v.rev)}</td><td>${v.count}</td></tr>`).join('')||'<tr><td colspan="3">Chưa có dữ liệu</td></tr>';
  if($('latestSales'))$('latestSales').innerHTML=activeSales().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6).map(s=>{const ci=saleCustomerInfo(s);const models=(s.items||[]).map(it=>it.code).filter(Boolean).slice(0,2).join(', ');return `<tr><td><b>${htmlesc(s.code||'')}</b></td><td>${htmlesc(ci.name||'')}</td><td>${htmlesc(models||'')}</td><td>${money(s.grand)}</td></tr>`}).join('')||'<tr><td colspan="4">Chưa có đơn hàng</td></tr>';
  if($('dashboardDebtRows'))$('dashboardDebtRows').innerHTML=overdueRows.concat(activeDebtRows.filter(d=>debtOverdueDays(d)<=0)).slice(0,6).map(d=>{const ci=customerInfo(d.customer);const od=debtOverdueDays(d);return `<tr><td><b>${htmlesc(d.saleCode||'')}</b></td><td>${htmlesc(ci.name||'')}</td><td>${money(d.debt)}</td><td>${od>0?`<span class="badge red">${od} ngày</span>`:'<span class="badge green">Trong hạn</span>'}</td></tr>`}).join('')||'<tr><td colspan="4">Không có công nợ</td></tr>';
  if($('lowStockRows'))$('lowStockRows').innerHTML=low.slice(0,6).map(p=>`<tr><td><b>${htmlesc(p.code||'')}</b></td><td>${htmlesc(p.name||'')}</td><td><span class="badge red">${stockOf(p.code)}</span></td></tr>`).join('')||'<tr><td colspan="3">Kho ổn định</td></tr>';
}



window.saveCustomer=async()=>{let phone=extractPhone(($('cPhone').value||'').trim());let code=($('cCode').value||customerCodeFromPhone(phone)).trim();let name=cleanCustomerName(($('cName').value||'').trim(),phone,code);let o={customerCode:code,name,type:$('cType').value,phone,address:$('cAddress').value,email:$('cEmail')?.value||'',contact:$('cContact')?.value||'',source:$('cSource')?.value||'',birthday:$('cBirthday')?.value||'',note:$('cNote')?.value||'',discount:+$('cDiscount').value||0,openingDebt:+$('cOpeningDebt').value||0};if(!o.name)return alert('Nhập đúng tên khách hàng, không dùng SĐT làm tên');if(!o.phone)return alert('Nhập số điện thoại khách hàng');let id=$('cId').value;if(id){
  // V49: sửa hồ sơ khách chỉ cập nhật danh mục khách hàng.
  // Không ghi đè snapshot khách trên các phiếu bán cũ; muốn sửa phiếu nào thì vào Chi tiết phiếu bán → Sửa khách.
  await updateDoc(doc(db,'customers',id),o);
  await logAction('Sửa hồ sơ khách hàng',o.name);
}else {
  await addDoc(col('customers'),{...o,createdAt:serverTimestamp()});
  await logAction('Tạo khách hàng',o.name);
}
clearCustomer();await loadAll()}
function clearCustomer(){['cId','cCode','cName','cPhone','cAddress','cEmail','cContact','cSource','cBirthday','cNote'].forEach(i=>{if($(i))$(i).value=''});$('cDiscount').value=0;$('cOpeningDebt').value=0}
function searchKey(v){
  return String(v||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d').replace(/Đ/g,'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}
function customerText(c={}){
  const code=ensureCustomerCode(c);
  const phone=normalizePhone(c.phone);
  return [
    code,c.customerCode,c.code,c.name,c.customerName,c.fullName,c.phone,phone,
    c.address,c.type,c.email,c.contact,c.source,c.note,c.birthday,c.discount,c.openingDebt
  ].filter(v=>v!==undefined&&v!==null).join(' ');
}
function customerMatchesSearch(c,q){
  const raw=String(q||'').trim();
  if(!raw) return true;
  const hay=searchKey(customerText(c));
  const hayCompact=hay.replace(/\s+/g,'');
  const qKey=searchKey(raw);
  const qCompact=qKey.replace(/\s+/g,'');
  if(!qKey) return true;
  if(hay.includes(qKey) || hayCompact.includes(qCompact)) return true;
  const phoneQ=normalizePhone(raw);
  if(phoneQ && normalizePhone(c.phone).includes(phoneQ)) return true;
  return qKey.split(/\s+/).filter(Boolean).every(t=>hay.includes(t));
}
function filteredCustomers(){
  const input=$('customerSearch');
  const q=input?input.value:'';
  return data.customers.filter(c=>customerMatchesSearch(c,q));
}
function renderCustomers(){
  const table=$('customerTable');
  if(!table) return;
  const rows=filteredCustomers();
  const count=$('customerSearchCount');
  if(count) count.textContent=`Hiển thị ${rows.length}/${data.customers.length} khách`;
  table.innerHTML=rows.map(c=>{
    const ci=customerInfo(c);
    return `<tr><td><b>${ci.code}</b></td><td><b>${ci.name||'(Chưa có tên)'}</b>${c.contact?`<br><small>LH: ${c.contact}</small>`:''}</td><td>${ci.type||''}</td><td>${ci.phone||''}${c.email?`<br><small>${c.email}</small>`:''}</td><td>${ci.address||''}</td><td>${c.source||''}</td><td>${c.discount||0}%</td><td><button class="btn ghost" onclick="editCustomer('${c.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('customers','${c.id}')">Xóa</button></td></tr>`
  }).join('') || `<tr><td colspan="8"><b>Không tìm thấy khách hàng phù hợp.</b></td></tr>`;
}
window.clearCustomerSearch=()=>{if($('customerSearch'))$('customerSearch').value='';renderCustomers();};

function matchSearchText(q,...parts){
  const raw=String(q||'').trim();
  if(!raw) return true;
  const hay=searchKey(parts.flat().filter(v=>v!==undefined&&v!==null).join(' '));
  const qKey=searchKey(raw);
  const phoneQ=normalizePhone(raw);
  return !qKey || hay.includes(qKey) || (phoneQ && hay.replace(/\s+/g,'').includes(phoneQ)) || qKey.split(/\s+/).filter(Boolean).every(t=>hay.includes(t));
}
window.editCustomer=id=>{let c=data.customers.find(x=>x.id===id);if(!c)return;$('cId').value=id;$('cCode').value=ensureCustomerCode(c);$('cName').value=c.name||'';$('cType').value=c.type||'Khách lẻ';$('cPhone').value=c.phone||'';$('cAddress').value=c.address||'';if($('cEmail'))$('cEmail').value=c.email||'';if($('cContact'))$('cContact').value=c.contact||'';if($('cSource'))$('cSource').value=c.source||'';if($('cBirthday'))$('cBirthday').value=c.birthday||'';if($('cNote'))$('cNote').value=c.note||'';$('cDiscount').value=c.discount||0;$('cOpeningDebt').value=c.openingDebt||0;let anchor=$('customerFormAnchor')||$('cCode');anchor.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{$('cName')?.focus();},250);if(window.showToast)window.showToast('Đã mở thông tin khách để sửa','info',c.name||ensureCustomerCode(c));}
function quickCustomerModalHtml(pref={}){
  const code=pref.customerCode||customerCodeFromPhone(pref.phone)||'';
  const type=['Khách lẻ','CTV','Đại lý','Công ty'].includes(pref.type)?pref.type:'Khách lẻ';
  return `<div class="modal-backdrop" id="quickCustomerModal"><div class="modal-card sale-customer-edit-modal"><div class="panel-head"><h3>Thêm khách hàng mới</h3><button class="btn ghost" onclick="document.getElementById('quickCustomerModal').remove()">Đóng</button></div><div class="grid form-grid"><div><label>Mã KH</label><input id="qcCode" value="${code}" placeholder="Tự tạo theo SĐT"></div><div><label>Tên khách <span class="req">*</span></label><input id="qcName" value="${pref.name||''}" placeholder="VD: Nguyễn Văn A"></div><div><label>Loại khách</label><select id="qcType"><option ${type==='Khách lẻ'?'selected':''}>Khách lẻ</option><option ${type==='CTV'?'selected':''}>CTV</option><option ${type==='Đại lý'?'selected':''}>Đại lý</option><option ${type==='Công ty'?'selected':''}>Công ty</option></select></div><div><label>SĐT <span class="req">*</span></label><input id="qcPhone" value="${pref.phone||''}" placeholder="090..."></div><div class="span2"><label>Địa chỉ</label><input id="qcAddress" value="${pref.address||''}" placeholder="Địa chỉ lắp đặt/giao hàng"></div></div><div class="muted-small" style="margin:10px 0">Form này tách rõ Tên / SĐT / Địa chỉ để tránh hệ thống lấy nhầm số điện thoại làm tên khách.</div><div style="text-align:right"><button class="btn ghost" onclick="document.getElementById('quickCustomerModal').remove()">Hủy</button><button class="btn primary" onclick="saveQuickCustomerFromSale()">Lưu khách</button></div></div></div>`;
}
window.quickCreateCustomer=async()=>{
  const pref=parseCustomerInput($('saleCustomerSearch')?.value||'');
  document.getElementById('quickCustomerModal')?.remove();
  document.body.insertAdjacentHTML('beforeend',quickCustomerModalHtml(pref));
  setTimeout(()=>($('qcName')?.value ? $('qcPhone')?.focus() : $('qcName')?.focus()),80);
}
window.saveQuickCustomerFromSale=async()=>{
  let phone=extractPhone($('qcPhone')?.value||'');
  let customerCode=($('qcCode')?.value||customerCodeFromPhone(phone)).trim();
  let name=cleanCustomerName(($('qcName')?.value||'').trim(),phone,customerCode);
  let type=$('qcType')?.value||'Khách lẻ';
  let address=($('qcAddress')?.value||'').trim();
  if(!name) return alert('Bắt buộc nhập đúng tên khách hàng, không dùng SĐT làm tên.');
  if(!phone) return alert('Bắt buộc nhập số điện thoại khách hàng.');
  const dup=data.customers.find(c=>normalizePhone(c.phone)===normalizePhone(phone));
  if(dup && !confirm('SĐT này đã có trong danh mục khách hàng. Vẫn tạo khách mới?')){
    setSaleCustomerFields(dup,{forceAddress:true});
    document.getElementById('quickCustomerModal')?.remove();
    saleCustomerChanged();
    return;
  }
  if(!customerCode) customerCode=customerCodeFromPhone(phone);
  await addDoc(col('customers'),{customerCode,name,type,phone,address,email:'',contact:'',source:'',birthday:'',note:'',discount:0,openingDebt:0,createdAt:serverTimestamp()});
  await logAction('Tạo nhanh khách hàng',name+' '+phone);
  await loadAll();
  const c=data.customers.find(x=>normalizePhone(x.phone)===normalizePhone(phone) && (x.name||'')===name) || data.customers.find(x=>ensureCustomerCode(x)===customerCode) || {customerCode,name,phone,type,address};
  setSaleCustomerFields(c,{forceAddress:true});
  if($('saleCustomerType')) $('saleCustomerType').value=type;
  if($('saleCustomerPhone')) { $('saleCustomerPhone').value=phone||customerInfo(c).phone||''; window.__saleCustomerPhoneManual=false; }
  if($('saleCustomerAddress')) { $('saleCustomerAddress').value=address||customerInfo(c).address||''; window.__saleCustomerAddressManual=false; }
  document.getElementById('quickCustomerModal')?.remove();
  saleCustomerChanged();
  if(window.showToast) window.showToast('Đã thêm khách hàng', 'success', name);
}

function saleCustomerEditResultRow(c){
  const i=customerInfo(c);
  return `<button type="button" class="sce-customer-row" data-id="${htmlesc(c.id||'')}" onclick="selectSaleCustomerForSaleEdit('${htmlesc(c.id||'')}')">
    <div><b>${htmlesc(i.name||'')}</b> <span class="muted-small">${htmlesc(i.code||'')}</span></div>
    <div class="muted-small">📞 ${htmlesc(i.phone||'')} &nbsp; 🏷 ${htmlesc(i.type||'Khách lẻ')}</div>
    <div class="muted-small">📍 ${htmlesc(i.address||'')}</div>
  </button>`;
}
function filteredSaleEditCustomers(q=''){
  const raw=String(q||'').trim();
  const rows=(raw?data.customers.filter(c=>customerMatchesSearch(c,raw)):data.customers).slice(0,80);
  return rows;
}
window.renderSaleCustomerEditResults=()=>{
  const box=$('sceCustomerResults');
  if(!box) return;
  const q=$('sceCustomerSearch')?.value||'';
  const rows=filteredSaleEditCustomers(q);
  box.innerHTML=rows.length?rows.map(saleCustomerEditResultRow).join(''):`<div class="muted-small" style="padding:10px">Không tìm thấy khách phù hợp. Có thể nhập tay Tên / SĐT / Địa chỉ bên dưới rồi bấm Lưu.</div>`;
}
window.selectSaleCustomerForSaleEdit=(id)=>{
  const c=data.customers.find(x=>x.id===id);
  if(!c) return alert('Không tìm thấy khách hàng đã chọn');
  const i=customerInfo(c);
  if(!i.name || i.name==='Chưa cập nhật tên' || !i.phone) return alert('Khách hàng này thiếu tên hoặc SĐT. Vui lòng cập nhật danh mục khách hàng trước.');
  if($('sceAppliedExistingId')) $('sceAppliedExistingId').value=c.id||'';
  if($('sceExistingId')) $('sceExistingId').value=c.id||'';
  if($('sceId')) $('sceId').value=c.id||'';
  if($('sceCode')) $('sceCode').value=i.code||'';
  if($('sceName')) $('sceName').value=i.name||'';
  if($('scePhone')) $('scePhone').value=i.phone||'';
  if($('sceAddress')) $('sceAddress').value=i.address||'';
  if($('sceType')) $('sceType').value=['Khách lẻ','CTV','Đại lý','Công ty'].includes(i.type)?i.type:'Khách lẻ';
  if($('sceCustomerSearch')) $('sceCustomerSearch').value=`${i.name} ${i.phone} ${i.code}`;
  document.querySelectorAll('.sce-customer-row').forEach(btn=>btn.classList.toggle('selected',btn.dataset.id===id));
  if(window.showToast) window.showToast('Đã chọn khách hàng','success',`${i.name} - ${i.phone}`);
};
window.applyExistingCustomerToSaleEdit=()=>{
  const id=($('sceAppliedExistingId')?.value||'').trim();
  if(id) return selectSaleCustomerForSaleEdit(id);
  const q=($('sceCustomerSearch')?.value||'').trim();
  const rows=filteredSaleEditCustomers(q);
  if(rows.length===1) return selectSaleCustomerForSaleEdit(rows[0].id);
  return alert('Vui lòng bấm chọn đúng khách trong danh sách kết quả trước khi áp dụng.');
};
function saleCustomerEditModalHtml(c,saleId=''){
  const ci=customerInfo(c);
  const title=saleId?'Sửa khách trên phiếu bán':'Sửa thông tin khách hàng';
  const note=saleId?'Chỉ cập nhật thông tin khách của phiếu đang mở. Không thay đổi sản phẩm, số lượng, đơn giá, chiết khấu, đã thu, còn nợ và kho.':'Đang sửa khách ở phiếu bán đang nhập. Không tự tính lại giá sản phẩm.';
  const initialSearch=ci.name&&ci.name!=='Chưa cập nhật tên'?`${ci.name} ${ci.phone||''} ${ci.code||''}`:'';
  return `<div class="modal-backdrop" id="saleCustomerEditModal"><div class="modal-card sale-customer-edit-modal"><div class="panel-head"><h3>${title}</h3><button class="btn ghost" onclick="document.getElementById('saleCustomerEditModal').remove()">Đóng</button></div>
  <input id="sceExistingId" type="hidden" value="${htmlesc(c.id||'')}"><input id="sceAppliedExistingId" type="hidden" value="">
  <div class="quick-pick-customer" style="margin-bottom:12px;padding:10px;border:1px dashed #cfe8ff;border-radius:14px;background:#f8fcff">
    <label>Tìm và chọn đúng khách hàng đã có sẵn trong danh mục</label>
    <div class="inline"><input id="sceCustomerSearch" value="${htmlesc(initialSearch)}" placeholder="Gõ tên / SĐT / mã KH / địa chỉ để tìm khách" style="flex:1" oninput="renderSaleCustomerEditResults()"><button class="btn ghost" onclick="applyExistingCustomerToSaleEdit()">Áp dụng khách đã chọn</button></div>
    <div id="sceCustomerResults" class="sce-customer-results"></div>
    <small class="field-note">Click trực tiếp vào khách cần chọn. Hệ thống dùng ID nội bộ nhưng không hiển thị ID ra giao diện, tránh nhầm khách trùng tên. Nếu nhập tay Tên/SĐT/Địa chỉ, hệ thống chỉ sửa snapshot của phiếu này.</small>
  </div>
  <div class="grid form-grid"><input id="sceId" type="hidden" value="${htmlesc(c.id||'')}"><input id="sceSaleId" type="hidden" value="${htmlesc(saleId||'')}"><div><label>Mã KH</label><input id="sceCode" value="${htmlesc(ci.code||'')}" placeholder="KL090..."></div><div><label>Tên khách <span class="req">*</span></label><input id="sceName" value="${htmlesc(ci.name==='Chưa cập nhật tên'?'':ci.name)}" placeholder="Nhập đúng tên khách"></div><div><label>Loại khách</label><select id="sceType"><option ${ci.type==='Khách lẻ'?'selected':''}>Khách lẻ</option><option ${ci.type==='CTV'?'selected':''}>CTV</option><option ${ci.type==='Đại lý'?'selected':''}>Đại lý</option><option ${ci.type==='Công ty'?'selected':''}>Công ty</option></select></div><div><label>SĐT <span class="req">*</span></label><input id="scePhone" value="${htmlesc(ci.phone||'')}" placeholder="090..."></div><div class="span2"><label>Địa chỉ</label><input id="sceAddress" value="${htmlesc(ci.address||'')}" placeholder="Địa chỉ lắp đặt/giao hàng"></div></div><div class="muted-small" style="margin:10px 0">${note}</div><div style="text-align:right"><button class="btn ghost" onclick="document.getElementById('saleCustomerEditModal').remove()">Hủy</button><button class="btn primary" onclick="saveSaleCustomerEdit()">Lưu thông tin khách</button></div></div></div>`;
}
window.editSaleCustomer=()=>{
  const c=findCustomerBySearch();
  if(!c) return alert('Vui lòng chọn khách hàng trước khi sửa. Nếu là khách mới, bấm + Khách để tạo trước.');
  document.getElementById('saleCustomerEditModal')?.remove();
  document.body.insertAdjacentHTML('beforeend', saleCustomerEditModalHtml(customerSnapshotFromCustomer(c, saleCustomerType()), ''));
  setTimeout(()=>{renderSaleCustomerEditResults(); $('sceName')?.focus();},80);
}
window.editSaleCustomerFromSale=(saleId)=>{
  const s=data.sales.find(x=>x.id===saleId);
  if(!s) return alert('Không tìm thấy phiếu bán');
  const ci=saleCustomerInfo(s);
  const snapshot={id:s.customerId||'', customerCode:ci.code||'', code:ci.code||'', name:ci.name||'', phone:ci.phone||'', address:ci.address||'', type:ci.type||'Khách lẻ'};
  document.getElementById('saleCustomerEditModal')?.remove();
  document.body.insertAdjacentHTML('beforeend', saleCustomerEditModalHtml(snapshot,saleId));
  setTimeout(()=>{renderSaleCustomerEditResults(); $('sceName')?.focus();},80);
}
window.saveSaleCustomerEdit=async()=>{
  const saleId=$('sceSaleId')?.value||'';
  const sale=saleId?data.sales.find(x=>x.id===saleId):null;
  const appliedExistingId=($('sceAppliedExistingId')?.value||'').trim();
  let customerId=($('sceId')?.value||$('sceExistingId')?.value||'').trim();
  const phone=extractPhone($('scePhone')?.value||'');
  const type=$('sceType')?.value||'Khách lẻ';
  const address=($('sceAddress')?.value||'').trim();
  let customerCode=($('sceCode')?.value||customerCodeFromPhone(phone)).trim();
  const name=cleanCustomerName(($('sceName')?.value||'').trim(),phone,customerCode);
  const oldCi=sale?saleCustomerInfo(sale):{};
  const selectedCustomer=appliedExistingId?data.customers.find(x=>x.id===appliedExistingId):null;
  if(selectedCustomer){ customerId=selectedCustomer.id||customerId; }
  else if(saleId){
    const phoneChanged=normalizePhone(phone)!==normalizePhone(oldCi.phone||'');
    const codeChanged=String(customerCode||'').trim().toLowerCase()!==String(oldCi.code||'').trim().toLowerCase();
    if(phoneChanged || codeChanged){ customerId=''; if(!customerCode || codeChanged) customerCode=customerCodeFromPhone(phone); }
  }
  if(!name) return alert('Vui lòng nhập đúng tên khách hàng, không dùng SĐT hoặc mã KH làm tên.');
  if(!phone) return alert('Vui lòng nhập số điện thoại khách hàng');
  if(!saleId){
    if($('saleCustomerId')) $('saleCustomerId').value=customerId||'';
    if($('saleCustomerSearch')) $('saleCustomerSearch').value=name;
    if($('saleCustomerPhone')) { $('saleCustomerPhone').value=phone; window.__saleCustomerPhoneManual=true; }
    if($('saleCustomerAddress')) { $('saleCustomerAddress').value=address; window.__saleCustomerAddressManual=true; }
    if($('saleCustomerType')) $('saleCustomerType').value=['Khách lẻ','CTV','Đại lý'].includes(type)?type:'Khách lẻ';
    document.getElementById('saleCustomerEditModal')?.remove();
    updateSaleTotals();
    if(window.showToast) window.showToast('Đã cập nhật khách trên phiếu đang nhập','success',name);
    return;
  }
  if(!sale) return alert('Không tìm thấy phiếu bán cần sửa khách');
  const oldCustomerId=sale.customerId||'';
  const oldPay=salePaymentInfo(sale);
  const payload=customerSnapshotPayload({id:customerId,code:customerCode,name,phone,address,type});
  await updateDoc(doc(db,'sales',saleId),{
    ...payload,
    // V58-FIX: chỉ sửa snapshot khách. Không đụng items/price/qty/discount/cost/grand/paid/debt/stock.
    paidTotal:oldPay.paidTotal, debtLeft:oldPay.debtLeft, paymentStatus:oldPay.paymentStatus, status:oldPay.paymentStatus,
    customerEditHistory:[...(sale.customerEditHistory||[]),{at:new Date().toISOString(),from:saleCustomerInfo(sale),to:{customerId,customerCode,name,phone,address,type}}],
    updatedAt:serverTimestamp()
  });
  await syncRelatedDocsForSaleCustomer(saleId,{...payload,code:sale.code||''},sale);
  await logAction('Sửa khách riêng trên phiếu bán',`${sale.code||saleId}: ${customerCode} - ${name}`);
  await loadAll();
  const ids=[oldCustomerId,customerId].filter(Boolean);
  for(const id of [...new Set(ids)]) await updatePaymentStatusesForCustomer(id);
  await updatePaymentStatusForSaleSnapshot(saleId);
  await loadAll();
  document.getElementById('saleCustomerEditModal')?.remove();
  if(saleId){document.getElementById('saleDetailModal')?.remove(); viewSaleDetail(saleId);}
  try{renderSales();renderDebts();renderReceipts();renderReports();}catch(e){console.warn('Refresh after customer edit',e)}
  if(window.showToast) window.showToast('Đã cập nhật khách trên phiếu','success',name);
}





const CATEGORY_TYPE_LABELS={productCategory:'Danh mục sản phẩm',expenseCategory:'Loại phiếu chi',paymentMethod:'Phương thức thanh toán',warrantyReason:'Lý do bảo hành',installStatus:'Trạng thái lắp đặt',orderStatus:'Trạng thái đơn hàng'};
const CATEGORY_DEFAULTS={
  productCategory:['Khóa thông minh','Khóa cửa gỗ','Khóa cửa nhôm Xingfa','Khóa cổng','Khóa kính','Phụ kiện','Robot','Khác'],
  expenseCategory:['Tiền điện','Tiền nước','Tiền Internet','Tiền thuê nhà','Tiền vận chuyển hàng','Marketing','Văn phòng phẩm','Xăng xe','Mua hàng','Lương cố định','Khác'],
  paymentMethod:['Tiền mặt','Chuyển khoản','Quẹt thẻ','Ví điện tử','Cọc trước','Khác'],
  warrantyReason:['Không nhận vân tay','Không mở bằng App','Kẹt chốt','Hết pin','Khóa tự mở','Không nhận thẻ','Lỗi Wifi','Lỗi FaceID','Lỗi nguồn','Lỗi Motor','Lỗi bo mạch','Bảo trì định kỳ','Khác'],
  installStatus:['Chưa lắp','Đang lắp','Đã lắp','Đã hủy'],
  orderStatus:['Đã báo giá','Đã xác nhận','Đã đặt cọc','Chưa xuất kho','Đã xuất kho','Đang lắp','Hoàn thành','Đã hủy']
};
function categoryTypeLabel(t){return CATEGORY_TYPE_LABELS[t]||t||''}
function systemCategoryRows(type){return (data.systemCategories||[]).filter(x=>!type||x.type===type)}
function systemCategoryNames(type, includeInactive=false){
  const docs=systemCategoryRows(type).filter(x=>includeInactive||x.active!=='inactive').map(x=>x.name||'').filter(Boolean);
  const defaults=CATEGORY_DEFAULTS[type]||[];
  let extra=[];
  if(type==='productCategory')extra=(data.products||[]).map(x=>x.category||'').filter(Boolean);
  if(type==='expenseCategory')extra=(data.expenses||[]).map(x=>x.category||'').filter(Boolean);
  if(type==='paymentMethod')extra=[...(data.receipts||[]).map(x=>paymentMethodText(x.paymentMethod)),...(data.expenses||[]).map(x=>x.paymentMethod||'')].filter(Boolean);
  if(type==='warrantyReason')extra=[...(data.warrantyReasons||[]).map(x=>x.name||x.reason||x.title||''),...(data.warranties||[]).flatMap(w=>Array.isArray(w.reasons)?w.reasons:[]),...(data.warranties||[]).map(w=>w.reasonOther||'')].filter(Boolean);
  const seen=new Set();
  return [...defaults,...docs,...extra].map(x=>String(x).trim()).filter(Boolean).filter(x=>{const k=searchKey(x); if(seen.has(k))return false; seen.add(k); return true;}).sort((a,b)=>a.localeCompare(b,'vi'));
}
function categoryUsage(type,name){
  name=String(name||'');
  if(type==='productCategory')return (data.products||[]).filter(x=>String(x.category||'')===name).length;
  if(type==='expenseCategory')return (data.expenses||[]).filter(x=>String(x.category||'')===name).length;
  if(type==='paymentMethod')return (data.receipts||[]).filter(x=>paymentMethodText(x.paymentMethod)===name).length+(data.expenses||[]).filter(x=>String(x.paymentMethod||'')===name).length;
  if(type==='warrantyReason')return (data.warranties||[]).filter(w=>(Array.isArray(w.reasons)&&w.reasons.includes(name))||String(w.reasonOther||'')===name).length;
  if(type==='installStatus')return (data.sales||[]).filter(s=>String(s.installStatus||'')===name).length;
  if(type==='orderStatus')return (data.sales||[]).filter(s=>String(s.orderStatus||s.workflowStatus||'')===name).length;
  return 0;
}
function categoryDocByName(type,name){const k=searchKey(name);return systemCategoryRows(type).find(x=>searchKey(x.name)===k)}
async function renameCategoryInRelatedData(type,oldName,newName){
  if(!oldName||oldName===newName)return;
  const tasks=[];
  if(type==='productCategory') for(const p of (data.products||[]).filter(x=>String(x.category||'')===oldName)) tasks.push(updateDoc(doc(db,'products',p.id),{category:newName,updatedAt:serverTimestamp()}));
  if(type==='expenseCategory') for(const e of (data.expenses||[]).filter(x=>String(x.category||'')===oldName)) tasks.push(updateDoc(doc(db,'expenses',e.id),{category:newName,updatedAt:serverTimestamp()}));
  if(type==='paymentMethod'){
    for(const r of (data.receipts||[]).filter(x=>paymentMethodText(x.paymentMethod)===oldName)) tasks.push(updateDoc(doc(db,'receipts',r.id),{paymentMethod:newName,updatedAt:serverTimestamp()}));
    for(const e of (data.expenses||[]).filter(x=>String(x.paymentMethod||'')===oldName)) tasks.push(updateDoc(doc(db,'expenses',e.id),{paymentMethod:newName,updatedAt:serverTimestamp()}));
  }
  if(type==='warrantyReason') for(const w of (data.warranties||[]).filter(w=>(Array.isArray(w.reasons)&&w.reasons.includes(oldName))||String(w.reasonOther||'')===oldName)){
    const next={updatedAt:serverTimestamp()};
    if(Array.isArray(w.reasons)&&w.reasons.includes(oldName)) next.reasons=w.reasons.map(r=>r===oldName?newName:r);
    if(String(w.reasonOther||'')===oldName) next.reasonOther=newName;
    tasks.push(updateDoc(doc(db,'warranties',w.id),next));
  }
  if(type==='installStatus') for(const sale of (data.sales||[]).filter(x=>String(x.installStatus||'')===oldName)) tasks.push(updateDoc(doc(db,'sales',sale.id),{installStatus:newName,updatedAt:serverTimestamp()}));
  if(type==='orderStatus') for(const sale of (data.sales||[]).filter(x=>String(x.orderStatus||x.workflowStatus||'')===oldName)) tasks.push(updateDoc(doc(db,'sales',sale.id),{orderStatus:newName,updatedAt:serverTimestamp()}));
  for(const t of tasks) await t;
}
function renderSystemCategories(){
  const tb=$('categoryTable'); if(!tb)return;
  const typeFilter=$('catFilterType')?.value||'';
  const activeType=$('catType')?.value||typeFilter||'productCategory';
  const q=searchKey($('catSearch')?.value||'');
  const types=typeFilter?[typeFilter]:Object.keys(CATEGORY_TYPE_LABELS);
  let rows=[];
  for(const type of types){
    for(const name of systemCategoryNames(type,true)){
      const docRow=categoryDocByName(type,name);
      const status=docRow?.active==='inactive'?'inactive':'active';
      const note=docRow?.note||'';
      const isDefault=!(docRow&&docRow.id);
      const usage=categoryUsage(type,name);
      const text=searchKey([categoryTypeLabel(type),name,status,note].join(' '));
      if(q&&!text.includes(q))continue;
      rows.push({type,name,status,note,isDefault,usage,id:docRow?.id||''});
    }
  }
  rows.sort((a,b)=>categoryTypeLabel(a.type).localeCompare(categoryTypeLabel(b.type),'vi')||a.name.localeCompare(b.name,'vi'));
  if($('catSearchCount'))$('catSearchCount').textContent=`Hiển thị ${rows.length} danh mục`;
  tb.innerHTML=rows.map(r=>`<tr><td><span class="badge blue">${categoryTypeLabel(r.type)}</span></td><td><b>${htmlesc(r.name)}</b>${r.isDefault?'<br><small>Mặc định hệ thống</small>':''}</td><td>${r.status==='inactive'?'<span class="badge orange">Tạm ẩn</span>':'<span class="badge green">Đang dùng</span>'}</td><td>${r.usage}</td><td>${htmlesc(r.note||'')}</td><td><button class="btn ghost" onclick="editSystemCategory('${r.type}',${JSON.stringify(r.name).replace(/"/g,'&quot;')})">Sửa</button> <button class="btn danger" onclick="deleteSystemCategory('${r.type}',${JSON.stringify(r.name).replace(/"/g,'&quot;')})">Xóa</button></td></tr>`).join('')||'<tr><td colspan="6">Chưa có danh mục phù hợp</td></tr>';
  if($('catType')&&!$('catType').value)$('catType').value=activeType;
}
window.renderSystemCategories=renderSystemCategories;
window.resetSystemCategoryForm=()=>{['catId','catOldType','catOldName','catName','catNote'].forEach(id=>{if($(id))$(id).value=''}); if($('catActive'))$('catActive').value='active'; if($('catType'))$('catType').value='productCategory';};
window.clearSystemCategorySearch=()=>{if($('catSearch'))$('catSearch').value=''; if($('catFilterType'))$('catFilterType').value=''; renderSystemCategories();};
window.editSystemCategory=(type,name)=>{const r=categoryDocByName(type,name)||{type,name,active:'active',note:''}; if($('catId'))$('catId').value=r.id||''; if($('catOldType'))$('catOldType').value=type; if($('catOldName'))$('catOldName').value=name; if($('catType'))$('catType').value=type; if($('catName'))$('catName').value=name; if($('catActive'))$('catActive').value=r.active||'active'; if($('catNote'))$('catNote').value=r.note||''; document.getElementById('categories')?.scrollIntoView({behavior:'smooth',block:'start'});};
window.saveSystemCategory=async()=>{
  const id=($('catId')?.value||'').trim(); const type=$('catType')?.value||'productCategory'; const name=String($('catName')?.value||'').trim(); const active=$('catActive')?.value||'active'; const note=$('catNote')?.value||'';
  const oldType=$('catOldType')?.value||type; const oldName=$('catOldName')?.value||'';
  if(!name)return alert('Nhập tên danh mục');
  const exists=systemCategoryNames(type,true).some(x=>searchKey(x)===searchKey(name) && !(id && searchKey(x)===searchKey(oldName) && oldType===type));
  if(exists)return alert('Danh mục đã tồn tại trong nhóm này');
  if(id){await updateDoc(doc(db,'systemCategories',id),{type,name,active,note,updatedAt:serverTimestamp()}); await renameCategoryInRelatedData(oldType,oldName,name); await logAction('Sửa danh mục',`${categoryTypeLabel(type)}: ${oldName} -> ${name}`);}
  else{await addDoc(col('systemCategories'),{type,name,active,note,createdAt:serverTimestamp(),updatedAt:serverTimestamp()}); await logAction('Thêm danh mục',`${categoryTypeLabel(type)}: ${name}`);}
  resetSystemCategoryForm(); await loadAll();
};
window.deleteSystemCategory=async(type,name)=>{
  const usage=categoryUsage(type,name); const row=categoryDocByName(type,name);
  if(usage>0)return alert('Danh mục đang có dữ liệu phát sinh ('+usage+'), không thể xóa. Hãy sửa/đổi tên nếu cần.');
  if(!row?.id)return alert('Danh mục mặc định không thể xóa. Có thể tạo danh mục mới hoặc tạm ẩn danh mục tùy chỉnh.');
  if(!confirm('Xóa danh mục '+name+'?'))return;
  await deleteDoc(doc(db,'systemCategories',row.id)); await logAction('Xóa danh mục',`${categoryTypeLabel(type)}: ${name}`); await loadAll();
};
function renderExpenseCategoryOptions(){const sel=$('exCategory'); if(!sel)return; const cur=sel.value||'Tiền điện'; sel.innerHTML=systemCategoryNames('expenseCategory').map(x=>`<option value="${htmlesc(x)}">${htmlesc(x)}</option>`).join(''); sel.value=systemCategoryNames('expenseCategory').includes(cur)?cur:(systemCategoryNames('expenseCategory')[0]||'Khác');}
function renderPaymentMethodOptions(){['receiptPaymentMethod','exPaymentMethod'].forEach(id=>{const sel=$(id); if(!sel)return; const cur=paymentMethodText(sel.value||DEFAULT_RECEIPT_PAYMENT_METHOD); const list=systemCategoryNames('paymentMethod'); sel.innerHTML=list.map(x=>`<option value="${htmlesc(x)}">${htmlesc(x)}</option>`).join(''); sel.value=list.includes(cur)?cur:DEFAULT_RECEIPT_PAYMENT_METHOD;});}

function productCategoryNames(){
  const legacy=(data.productCategories||[]).map(x=>x.name||x.category||'').filter(Boolean);
  const list=[...systemCategoryNames('productCategory'),...legacy];
  const seen=new Set();
  return list.map(x=>String(x).trim()).filter(Boolean).filter(x=>{const k=searchKey(x); if(seen.has(k))return false; seen.add(k); return true;}).sort((a,b)=>a.localeCompare(b,'vi'));
}
function renderProductCategoryOptions(){
  const cats=productCategoryNames();
  const pCat=$('pCategory');
  const filter=$('productCategoryFilter');
  const current=pCat?.value||'Khóa thông minh';
  if(pCat){pCat.innerHTML=cats.map(c=>`<option value="${htmlesc(c)}">${htmlesc(c)}</option>`).join(''); pCat.value=cats.includes(current)?current:(cats[0]||'');}
  if(filter){const fv=filter.value||''; filter.innerHTML='<option value="">Tất cả danh mục</option>'+cats.map(c=>`<option value="${htmlesc(c)}">${htmlesc(c)}</option>`).join(''); filter.value=cats.includes(fv)?fv:'';}
}
window.saveProductCategory=async()=>{
  const name=($('newProductCategory')?.value||'').trim();
  if(!name) return alert('Nhập tên danh mục sản phẩm');
  if(productCategoryNames().some(x=>searchKey(x)===searchKey(name))) return alert('Danh mục đã tồn tại');
  await addDoc(col('systemCategories'),{type:'productCategory',name,active:'active',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  if($('newProductCategory')) $('newProductCategory').value='';
  await logAction('Tạo danh mục sản phẩm',name);
  await loadAll();
}
window.deleteSelectedProductCategory=async()=>{
  const name=($('productCategoryFilter')?.value||$('pCategory')?.value||'').trim();
  if(!name) return alert('Chọn danh mục cần xóa');
  if(data.products.some(p=>String(p.category||'')===name)) return alert('Danh mục đang có sản phẩm, không thể xóa. Hãy đổi danh mục sản phẩm trước.');
  let rows=(data.systemCategories||[]).filter(x=>x.type==='productCategory'&&String(x.name||'')===name);
  if(!rows.length) rows=(data.productCategories||[]).filter(x=>String(x.name||x.category||'')===name);
  if(!rows.length) return alert('Danh mục mặc định không thể xóa');
  if(!confirm('Xóa danh mục '+name+'?')) return;
  for(const r of rows) await deleteDoc(doc(db, r.type==='productCategory'?'systemCategories':'productCategories', r.id));
  await logAction('Xóa danh mục sản phẩm',name);
  await loadAll();
}

window.saveProduct=async()=>{let old=$('pId').value?data.products.find(x=>x.id===$('pId').value):{};let o={code:$('pCode').value.trim(),name:$('pName').value,category:$('pCategory').value,cost:has('viewCost')?(+$('pCost').value||0):(+old?.cost||0),price:+$('pPrice').value||0,minStock:+$('pMinStock').value||3,active:($('pActive')?.value||'active')};if(!o.code||!o.name)return alert('Nhập model và tên');let id=$('pId').value;if(id){await updateDoc(doc(db,'products',id),o);await logAction('Sửa sản phẩm',o.code)}else {await addDoc(col('products'),{...o,createdAt:serverTimestamp()});await logAction('Tạo sản phẩm',o.code)}clearProduct();await loadAll()}
function clearProduct(){['pId','pCode','pName'].forEach(i=>$(i).value='');renderProductCategoryOptions(); if($('pCategory')) $('pCategory').value=productCategoryNames()[0]||'Khóa thông minh';$('pCost').value='';$('pPrice').value='';$('pMinStock').value=3;if($('pActive'))$('pActive').value='active'}
function renderProducts(){
  const input=document.getElementById('productSearch');
  const table=document.getElementById('productTable');
  if(!table) return;
  const q=String(input?.value||'').trim().toLowerCase();
  const cat=String($('productCategoryFilter')?.value||'').trim();
  const rows=data.products.filter(p=>{
    if(cat && String(p.category||'')!==cat) return false;
    const hay=[p.code,p.name,p.category,p.price,p.cost,stockOf(p.code),(p.active==='inactive'?'ngừng bán':'đang kinh doanh')].join(' ').toLowerCase();
    return !q||hay.includes(q);
  });
  table.innerHTML=rows.map(p=>`<tr><td>${p.code}</td><td>${p.name}</td><td>${p.category||''}</td><td class="view-cost">${money(p.cost)}</td><td>${money(p.price)}</td><td>${stockOf(p.code)}</td><td>${p.active==='inactive'?'<span class="badge red">Ngừng bán</span>':'<span class="badge green">Đang bán</span>'}</td><td><button class="btn ghost" onclick="editProduct('${p.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('products','${p.id}')">Xóa</button></td></tr>`).join('') || `<tr><td colspan="8">Không tìm thấy sản phẩm phù hợp</td></tr>`;
  applyPermissions();
}
window.renderProducts=renderProducts;
window.clearProductSearch=()=>{const input=document.getElementById('productSearch'); if(input) input.value=''; renderProducts();};
window.editProduct=id=>{let p=data.products.find(x=>x.id===id);renderProductCategoryOptions();$('pId').value=id;$('pCode').value=p.code||'';$('pName').value=p.name||'';$('pCategory').value=p.category||'';$('pCost').value=p.cost||0;$('pPrice').value=p.price||0;$('pMinStock').value=p.minStock||3;if($('pActive'))$('pActive').value=p.active||'active'}


function activePriceFor(code,type,date=today()){
  const now=String(date||today());
  const list=data.prices.filter(p=>p.code===code&&p.type===(type||'Khách lẻ')&&String(p.active)!=='false')
    .filter(p=>(!p.validFrom||String(p.validFrom)<=now)&&(!p.validTo||String(p.validTo)>=now))
    .sort((a,b)=>String(b.validFrom||'').localeCompare(String(a.validFrom||'')));
  return list[0]||null;
}
function priceStatus(p){
  if(String(p.active)==='false') return ['Ngưng áp dụng','red'];
  const d=today();
  if(p.validTo && String(p.validTo)<d) return ['Hết hạn','red'];
  if(p.validFrom && String(p.validFrom)>d) return ['Sắp áp dụng','orange'];
  return ['Đang áp dụng','green'];
}

window.switchPricePane=(pane='sale')=>{
  const salePane=$('priceSalePane'), costPane=$('priceCostPane'), saleTab=$('priceSaleTab'), costTab=$('priceCostTab');
  const showCost=pane==='cost';
  if(salePane) salePane.classList.toggle('active', !showCost);
  if(costPane) costPane.classList.toggle('active', showCost);
  if(saleTab) saleTab.classList.toggle('active', !showCost);
  if(costTab) costTab.classList.toggle('active', showCost);
  if(showCost && !has('viewCost')) toast('Bạn không có quyền xem bảng giá vốn','error');
};

function selectedPriceCodes(){
  const picked=checkedCodesFromBox('priceProductPicker');
  const fallback=productCodeFromInput($('priceProduct')?.value||'');
  return [...new Set(picked.length?picked:(fallback?[fallback]:[]))].filter(Boolean);
}
function priceGroupKeyOf(p){return [p.listName||'',p.type||'',p.validFrom||'',p.validTo||'',String(p.active)!=='false'?'true':'false',p.note||''].join('|||')}
function groupPrices(list){
  const m=new Map();
  list.forEach(p=>{const k=priceGroupKeyOf(p); if(!m.has(k))m.set(k,{key:k,listName:p.listName||'',type:p.type||'',validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||'',items:[]}); m.get(k).items.push(p);});
  return [...m.values()].sort((a,b)=>String(a.listName).localeCompare(String(b.listName))||String(b.validFrom||'').localeCompare(String(a.validFrom||'')));
}

window.newPriceList=()=>{
  ['priceId','priceGroupKey','priceProduct','priceListName','priceFrom','priceTo','priceNote'].forEach(i=>{if($(i))$(i).value=''});
  if($('priceType'))$('priceType').value='Khách lẻ'; if($('priceActive'))$('priceActive').value='true';
  clearPriceProducts();
  if($('priceDraftRows'))$('priceDraftRows').innerHTML='<tr><td colspan="8" class="empty-row">Chưa có sản phẩm trong bảng giá</td></tr>';
  updatePriceDraftSummary();
}
function priceVatFromRow(tr){return +(tr?.querySelector('.price-vat')?.value||8)||0}
function priceBaseFromRow(tr){const gi=tr?.querySelector('.price-gross-input');if(gi){const g=+(gi.value||0)||0;const vat=priceVatFromRow(tr);return Math.round(g/(1+vat/100));}return +(tr?.querySelector('.price-base')?.value||0)||0}
function priceGrossFromRow(tr){const gi=tr?.querySelector('.price-gross-input');if(gi)return +(gi.value||0)||0;return Math.round(priceBaseFromRow(tr)*(1+priceVatFromRow(tr)/100))}
window.updatePriceDraftSummary=()=>{
  const rows=[...($('priceDraftRows')?.querySelectorAll('tr[data-code]')||[])];
  let base=0, vat=0, gross=0;
  rows.forEach((tr,i)=>{
    const b=priceBaseFromRow(tr), g=priceGrossFromRow(tr); base+=b; gross+=g; vat+=g-b;
    const stt=tr.querySelector('.price-stt'); if(stt)stt.textContent=i+1;
    const grossEl=tr.querySelector('.price-gross'); if(grossEl)grossEl.textContent=money(g);
    const baseEl=tr.querySelector('.price-base-label'); if(baseEl)baseEl.textContent=money(b);
  });
  if($('priceDraftCount'))$('priceDraftCount').textContent=rows.length;
  if($('priceDraftBaseTotal'))$('priceDraftBaseTotal').textContent=money(base);
  if($('priceDraftVatTotal'))$('priceDraftVatTotal').textContent=money(vat);
  if($('priceDraftGrossTotal'))$('priceDraftGrossTotal').textContent=money(gross);
}
function removePriceDraftRow(btn){
  btn.closest('tr')?.remove();
  if(!document.querySelector('#priceDraftRows tr[data-code]'))document.getElementById('priceDraftRows').innerHTML='<tr><td colspan="8" class="empty-row">Chưa có sản phẩm trong bảng giá</td></tr>';
  updatePriceDraftSummary();
}
window.removePriceDraftRow=removePriceDraftRow;
function priceDraftRowHtml(code, grossValue){
  const prod=data.products.find(p=>p.code===code)||{};
  const vat=8;
  const gross=+(grossValue||prod.price||0)||0;
  const base=Math.round(gross/(1+vat/100));
  return `<tr data-code="${code}">
    <td class="price-stt"></td>
    <td><b>${code}</b></td>
    <td>${prod.name||''}</td>
    <td>${prod.unit||'Bộ'}</td>
    <td><b class="price-base-label">${money(base)}</b></td>
    <td><select class="price-vat" onchange="updatePriceDraftSummary()"><option value="0">0</option><option value="8" selected>8</option><option value="10">10</option></select></td>
    <td><input class="price-gross-input" type="number" value="${gross||''}" placeholder="Nhập giá bán" oninput="updatePriceDraftSummary()"></td>
    <td><button class="btn danger tiny" onclick="removePriceDraftRow(this)">Xóa</button></td>
  </tr>`;
}
window.createPriceDraftRows=()=>{
  const codes=selectedPriceCodes();
  if(!codes.length)return alert('Chọn ít nhất 1 model trước');
  const tb=$('priceDraftRows'); if(!tb)return;
  const existing=new Map([...tb.querySelectorAll('tr[data-code]')].map(tr=>[tr.dataset.code,priceGrossFromRow(tr)]));
  const all=[...new Set([...existing.keys(),...codes])];
  tb.innerHTML=all.map(code=>priceDraftRowHtml(code, existing.get(code))).join('');
  updatePriceDraftSummary();
}
function priceDraftItems(){
  const rows=[...($('priceDraftRows')?.querySelectorAll('tr[data-code]')||[])];
  return rows.map(tr=>({code:tr.dataset.code,price:priceGrossFromRow(tr),vat:priceVatFromRow(tr),priceBeforeVat:priceBaseFromRow(tr)})).filter(x=>x.code);
}
window.savePrice=async()=>{
  let items=priceDraftItems();
  const base={listName:($('priceListName')?.value||'').trim(),type:$('priceType').value,validFrom:$('priceFrom').value||'',validTo:$('priceTo').value||'',active:$('priceActive').value==='true',note:$('priceNote').value||'',updatedAt:serverTimestamp()};
  if(!base.listName)return alert('Nhập tên bảng giá');
  if(!items.length)return alert('Chọn sản phẩm rồi bấm “Đưa vào bảng giá”');
  const missing=items.filter(x=>!x.price).map(x=>x.code);
  if(missing.length)return alert('Chưa nhập giá bán cho model: '+missing.join(', '));
  if(base.validFrom&&base.validTo&&base.validFrom>base.validTo)return alert('Ngày hiệu lực đến phải lớn hơn hoặc bằng ngày bắt đầu');
  const oldKey=$('priceGroupKey')?.value||'';
  const oldRows=oldKey?data.prices.filter(p=>priceGroupKeyOf(p)===oldKey):[];
  for(const old of oldRows){ if(!items.some(it=>it.code===old.code)) await deleteDoc(doc(db,'prices',old.id)); }
  for(const it of items){
    const old=oldRows.find(x=>x.code===it.code);
    const rowData={...base,code:it.code,price:it.price,vat:it.vat,priceBeforeVat:it.priceBeforeVat};
    if(old) await updateDoc(doc(db,'prices',old.id),rowData);
    else await addDoc(col('prices'),{...rowData,createdAt:serverTimestamp()});
  }
  await logAction(oldKey?'Sửa bảng giá':'Thêm bảng giá',`${base.listName} - ${items.length} model`);
  newPriceList(); await loadAll();
}
function renderPrices(){
  const q=String($('priceSearch')?.value||'').trim().toLowerCase();
  const tb=$('priceTable'); if(!tb)return;
  let groups=groupPrices(data.prices).filter(g=>{const productText=g.items.map(p=>{const prod=data.products.find(x=>x.code===p.code)||{};return `${p.code} ${prod.name||''} ${p.price}`}).join(' ');const hay=[g.listName,g.type,g.validFrom,g.validTo,g.note,productText].join(' ').toLowerCase();return !q||hay.includes(q)});
  tb.innerHTML=groups.map(g=>{let st=priceStatus(g);let models=g.items.slice(0,6).map(x=>x.code).join(', ')+(g.items.length>6?'...':'');return`<tr><td><b>${g.listName||''}</b><small>${g.type||''} • ${g.validFrom||'--'} → ${g.validTo||'--'}<br>${models}</small><span class="badge ${st[1]}">${st[0]}</span></td><td><b>${g.items.length}</b></td><td><button class="btn ghost" onclick="editPriceGroup('${encodeURIComponent(g.key)}')">Mở</button><button class="btn danger" onclick="deletePriceGroup('${encodeURIComponent(g.key)}')">Xóa</button></td></tr>`}).join('')||'<tr><td colspan="3">Không tìm thấy bảng giá phù hợp</td></tr>';
}
window.editPriceGroup=(keyEnc)=>{const key=decodeURIComponent(keyEnc);const rows=data.prices.filter(p=>priceGroupKeyOf(p)===key);if(!rows.length)return alert('Không tìm thấy bảng giá');const p=rows[0];$('priceGroupKey').value=key;$('priceId').value='';$('priceProduct').value='';if($('priceListName'))$('priceListName').value=p.listName||'';$('priceType').value=p.type;$('priceFrom').value=p.validFrom||'';$('priceTo').value=p.validTo||'';$('priceActive').value=String(p.active)!=='false'?'true':'false';$('priceNote').value=p.note||'';renderPriceProductPicker();const codes=rows.map(x=>x.code);const box=$('priceProductPicker');if(box)box.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=codes.includes(x.value));updateProductPickerHint('priceProductPicker','priceSelectedHint');if($('priceDraftRows')){$('priceDraftRows').innerHTML=rows.map(p=>priceDraftRowHtml(p.code,p.price||0)).join('');updatePriceDraftSummary();}showPage('prices')}
window.editPrice=id=>{let p=data.prices.find(x=>x.id===id); if(p) editPriceGroup(encodeURIComponent(priceGroupKeyOf(p)));}
window.deletePriceGroup=async(keyEnc)=>{const key=decodeURIComponent(keyEnc);const rows=data.prices.filter(p=>priceGroupKeyOf(p)===key);if(!rows.length)return;if(!confirm(`Xóa toàn bộ bảng giá này (${rows.length} model)?`))return;for(const r of rows) await deleteDoc(doc(db,'prices',r.id));await logAction('Xóa bảng giá',rows[0].listName||key);await loadAll();}


function activeCostFor(code,date=today()){
  const d=String(date||today());
  const list=(data.costPrices||[]).filter(x=>x.code===code&&String(x.active)!=='false')
    .filter(x=>(!x.validFrom||String(x.validFrom)<=d)&&(!x.validTo||String(x.validTo)>=d))
    .sort((a,b)=>String(b.validFrom||'').localeCompare(String(a.validFrom||'')));
  return list[0]||null;
}
function costFor(code,date=today()){
  const cp=activeCostFor(code,date);
  if(cp)return +cp.cost||0;
  return +(data.products.find(p=>p.code===code)?.cost||0);
}
function costGroupKeyOf(p){return [p.listName||'',p.validFrom||'',p.validTo||'',String(p.active)!=='false'?'true':'false',p.note||''].join('|||')}
function groupCostPrices(list){const m=new Map();list.forEach(p=>{const k=costGroupKeyOf(p); if(!m.has(k))m.set(k,{key:k,listName:p.listName||'',validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||'',items:[]}); m.get(k).items.push(p);});return [...m.values()].sort((a,b)=>String(a.listName).localeCompare(String(b.listName))||String(b.validFrom||'').localeCompare(String(a.validFrom||'')));}
window.newCostPriceList=()=>{if(!has('viewCost'))return alert('Chỉ Admin được xem/sửa bảng giá vốn');['costId','costGroupKey','costProduct','costListName','costFrom','costTo','costNote'].forEach(i=>{if($(i))$(i).value=''});if($('costActive'))$('costActive').value='true';clearCostProducts();if($('costDraftRows'))$('costDraftRows').innerHTML='<tr><td colspan="6" class="empty-row">Chưa có sản phẩm trong bảng giá vốn</td></tr>';}
window.createCostDraftRows=()=>{
  if(!has('viewCost'))return alert('Chỉ Admin được xem/sửa bảng giá vốn');
  const picked=checkedCodesFromBox('costProductPicker');
  const fallback=productCodeFromInput($('costProduct')?.value||'');
  const codes=[...new Set(picked.length?picked:(fallback?[fallback]:[]))].filter(Boolean);
  if(!codes.length)return alert('Chọn ít nhất 1 model trước');
  const tb=$('costDraftRows'); if(!tb)return;
  const existing=new Map([...tb.querySelectorAll('tr[data-code]')].map(tr=>[tr.dataset.code,tr.querySelector('input')?.value||'']));
  const all=[...new Set([...existing.keys(),...codes])];
  tb.innerHTML=all.map(code=>{const prod=data.products.find(p=>p.code===code)||{};const old=existing.get(code);const val=old!==undefined?old:(prod.cost||'');return `<tr data-code="${code}"><td class="cost-stt"></td><td><b>${code}</b></td><td>${prod.name||''}</td><td>${prod.unit||'Bộ'}</td><td><input type="number" value="${val}" placeholder="Nhập giá vốn"></td><td><button class="btn danger tiny" onclick="this.closest('tr').remove();refreshCostDraftRows();">Xóa</button></td></tr>`;}).join('');
  refreshCostDraftRows();
}
function refreshCostDraftRows(){const rows=[...($('costDraftRows')?.querySelectorAll('tr[data-code]')||[])];rows.forEach((tr,i)=>{const stt=tr.querySelector('.cost-stt');if(stt)stt.textContent=i+1;});if($('costDraftRows')&&!rows.length)$('costDraftRows').innerHTML='<tr><td colspan="6" class="empty-row">Chưa có sản phẩm trong bảng giá vốn</td></tr>'; }
window.refreshCostDraftRows=refreshCostDraftRows;
function costDraftItems(){const rows=[...($('costDraftRows')?.querySelectorAll('tr[data-code]')||[])];return rows.map(tr=>({code:tr.dataset.code,cost:+(tr.querySelector('input')?.value||0)||0})).filter(x=>x.code);}
window.saveCostPrice=async()=>{
  if(!has('viewCost'))return alert('Chỉ Admin được xem/sửa bảng giá vốn');
  let items=costDraftItems();
  const base={listName:($('costListName')?.value||'').trim(),validFrom:$('costFrom').value||'',validTo:$('costTo').value||'',active:$('costActive').value==='true',note:$('costNote').value||'',updatedAt:serverTimestamp()};
  if(!base.listName)return alert('Nhập tên bảng giá vốn');
  if(!items.length)return alert('Chọn sản phẩm rồi bấm “Đưa vào bảng giá vốn”');
  const missing=items.filter(x=>!x.cost).map(x=>x.code); if(missing.length)return alert('Chưa nhập giá vốn cho model: '+missing.join(', '));
  if(base.validFrom&&base.validTo&&base.validFrom>base.validTo)return alert('Ngày hiệu lực đến phải lớn hơn hoặc bằng ngày bắt đầu');
  const oldKey=$('costGroupKey')?.value||'';const oldRows=oldKey?data.costPrices.filter(p=>costGroupKeyOf(p)===oldKey):[];
  for(const old of oldRows){ if(!items.some(it=>it.code===old.code)) await deleteDoc(doc(db,'costPrices',old.id)); }
  for(const it of items){const old=oldRows.find(x=>x.code===it.code); if(old) await updateDoc(doc(db,'costPrices',old.id),{...base,code:it.code,cost:it.cost}); else await addDoc(col('costPrices'),{...base,code:it.code,cost:it.cost,createdAt:serverTimestamp()});}
  await logAction(oldKey?'Sửa bảng giá vốn':'Thêm bảng giá vốn',`${base.listName} - ${items.length} model`);
  newCostPriceList(); await loadAll();
}
function renderCostPrices(){
  if(!has('viewCost'))return;
  const q=String($('costPriceSearch')?.value||'').trim().toLowerCase();
  const tb=$('costPriceTable'); if(!tb)return;
  const groups=groupCostPrices(data.costPrices||[]).filter(g=>{const productText=g.items.map(p=>{const prod=data.products.find(x=>x.code===p.code)||{};return `${p.code} ${prod.name||''} ${p.cost}`}).join(' ');const hay=[g.listName,g.validFrom,g.validTo,g.note,productText].join(' ').toLowerCase();return !q||hay.includes(q)});
  tb.innerHTML=groups.map(g=>{let st=priceStatus(g);let models=g.items.slice(0,6).map(x=>x.code).join(', ')+(g.items.length>6?'...':'');return`<tr><td><b>${g.listName||''}</b><small>${g.validFrom||'Không giới hạn'} → ${g.validTo||'Không giới hạn'}<br>${models}</small><span class="badge ${st[1]}">${st[0]}</span></td><td><b>${g.items.length}</b></td><td><button class="btn ghost" onclick="editCostPriceGroup('${encodeURIComponent(g.key)}')">Mở</button><button class="btn danger" onclick="deleteCostPriceGroup('${encodeURIComponent(g.key)}')">Xóa</button></td></tr>`}).join('')||'<tr><td colspan="3">Không tìm thấy giá vốn phù hợp</td></tr>';
}
window.editCostPriceGroup=(keyEnc)=>{if(!has('viewCost'))return alert('Chỉ Admin được sửa bảng giá vốn');const key=decodeURIComponent(keyEnc);const rows=data.costPrices.filter(p=>costGroupKeyOf(p)===key);if(!rows.length)return alert('Không tìm thấy bảng giá vốn');const p=rows[0];$('costGroupKey').value=key;$('costId').value='';$('costProduct').value='';if($('costListName'))$('costListName').value=p.listName||'';$('costFrom').value=p.validFrom||'';$('costTo').value=p.validTo||'';$('costActive').value=String(p.active)!=='false'?'true':'false';$('costNote').value=p.note||'';renderCostProductPicker();const codes=rows.map(x=>x.code);const box=$('costProductPicker');if(box)box.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=codes.includes(x.value));updateProductPickerHint('costProductPicker','costSelectedHint');if($('costDraftRows')){$('costDraftRows').innerHTML=rows.map(p=>{const prod=data.products.find(x=>x.code===p.code)||{};return `<tr data-code="${p.code}"><td class="cost-stt"></td><td><b>${p.code}</b></td><td>${prod.name||''}</td><td>${prod.unit||'Bộ'}</td><td><input type="number" value="${p.cost||0}"></td><td><button class="btn danger tiny" onclick="this.closest('tr').remove();refreshCostDraftRows();">Xóa</button></td></tr>`}).join('');refreshCostDraftRows();}showPage('prices')}
window.editCostPrice=id=>{if(!has('viewCost'))return alert('Chỉ Admin được sửa bảng giá vốn');let p=data.costPrices.find(x=>x.id===id); if(p) editCostPriceGroup(encodeURIComponent(costGroupKeyOf(p)));}
window.deleteCostPriceGroup=async(keyEnc)=>{if(!has('viewCost'))return alert('Chỉ Admin được xóa bảng giá vốn');const key=decodeURIComponent(keyEnc);const rows=data.costPrices.filter(p=>costGroupKeyOf(p)===key);if(!rows.length)return;if(!confirm(`Xóa toàn bộ bảng giá vốn này (${rows.length} model)?`))return;for(const r of rows) await deleteDoc(doc(db,'costPrices',r.id));await logAction('Xóa bảng giá vốn',rows[0].listName||key);await loadAll();}

function renderStaff(){const q=($('staffSearch')?.value||'').toLowerCase().trim();const rows=data.staff.filter(e=>matchSearchText(q,e.name,e.dept,staffFunctionText(e),e.phone,e.commissionPercent,e.techFee));if($('staffSearchCount'))$('staffSearchCount').textContent=`Hiển thị ${rows.length}/${data.staff.length}`;$('staffTable').innerHTML=rows.map(e=>`<tr><td>${e.name}</td><td>${e.dept||''}</td><td>${staffFunctionText(e)}</td><td>${e.phone||''}</td><td>${staffHasFunction(e,'Sale')?((e.commissionPercent??5)+'%'):''}</td><td>${staffHasFunction(e,'Kỹ thuật')?money(e.techFee??100000):''}</td><td><button class="btn ghost" onclick="editStaff('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('staff','${e.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="7">Không tìm thấy nhân viên phù hợp</td></tr>'}
function selectedStaffFunctions(){return [...document.querySelectorAll('.staff-fn:checked')].map(x=>x.value)}
function setStaffFunctions(list){const set=new Set(list||[]);document.querySelectorAll('.staff-fn').forEach(x=>x.checked=set.has(x.value));staffDeptChanged()}
window.staffDeptChanged=()=>{let funcs=selectedStaffFunctions();let dept=$('eDept')?.value||'Sale';if(!funcs.length&&dept){if(dept==='Sale'||dept==='Quản lý')funcs.push('Sale');else if(dept==='Kỹ thuật')funcs.push('Kỹ thuật');else if(dept.includes('Kho'))funcs.push('Kho');else funcs.push(dept)}if($('saleCommissionBox'))$('saleCommissionBox').style.display=(funcs.includes('Sale')||funcs.includes('Quản lý'))?'block':'none';if($('techFeeBox'))$('techFeeBox').style.display=funcs.includes('Kỹ thuật')?'block':'none'}
window.saveStaff=async()=>{let dept=$('eDept').value;let functions=selectedStaffFunctions();if(!functions.length){if(dept==='Sale'||dept==='Quản lý')functions=['Sale'];else if(dept==='Kỹ thuật')functions=['Kỹ thuật'];else if(dept.includes('Kho'))functions=['Kho'];else functions=[dept]}let o={name:$('eName').value.trim(),dept,functions,phone:$('ePhone').value,commissionPercent:+($('eCommissionPercent')?.value||0),techFee:+($('eTechFee')?.value||0)};if(functions.includes('Sale')||functions.includes('Quản lý')){if(!o.commissionPercent)o.commissionPercent=5}else{o.commissionPercent=0}if(functions.includes('Kỹ thuật')){if(!o.techFee)o.techFee=100000}else{o.techFee=0}if(!o.name)return alert('Nhập tên nhân viên');let id=$('eId').value;if(id){await updateDoc(doc(db,'staff',id),o);await logAction('Sửa nhân viên',o.name)}else {await addDoc(col('staff'),o);await logAction('Tạo nhân viên',o.name)}$('eId').value='';$('eName').value='';$('ePhone').value='';$('eCommissionPercent').value=5;$('eTechFee').value=100000;$('eDept').value='Sale';setStaffFunctions(['Sale']);await loadAll()}

window.clearStaffSearch=()=>{if($('staffSearch'))$('staffSearch').value='';renderStaff();}
window.editStaff=id=>{let e=data.staff.find(x=>x.id===id);$('eId').value=id;$('eName').value=e.name;$('eDept').value=e.dept||'Sale';$('ePhone').value=e.phone||'';if($('eCommissionPercent'))$('eCommissionPercent').value=e.commissionPercent??5;if($('eTechFee'))$('eTechFee').value=e.techFee??100000;setStaffFunctions(staffFunctions(e))}



function receiptSaleId(r={}){
  if(!r) return '';
  if(r.saleId) return String(r.saleId);
  if(Array.isArray(r.allocations)){
    const a=r.allocations.find(x=>x && (x.saleId||x.saleCode));
    if(a?.saleId) return String(a.saleId);
    if(a?.saleCode){
      const sale=data.sales.find(s=>String(s.code||'')===String(a.saleCode));
      return sale?.id||'';
    }
  }
  if(r.saleCode){
    const sale=data.sales.find(s=>String(s.code||'')===String(r.saleCode));
    return sale?.id||'';
  }
  if(r.debtKey && String(r.debtKey).startsWith('sale:')) return String(r.debtKey).slice(5);
  return '';
}
function receiptCustomerMatchesSale(r={},s={}){
  // ERP-DEBT-V7: Tránh phiếu thu của khách trùng tên / saleCode cũ bị trừ nhầm.
  // Chỉ xem là cùng phiếu khi có cùng mã KH, SĐT hoặc địa chỉ đủ rõ ràng.
  const rCode=debtClean(r.customerCode||'');
  const sCode=debtClean(s.customerCode||'');
  const rPhone=normalizePhone(r.customerPhone||r.phone||'');
  const sPhone=normalizePhone(s.customerPhone||s.phone||'');
  const rAddr=debtAddressKey(r.customerAddress||r.address||'');
  const sAddr=debtAddressKey(s.customerAddress||s.address||'');
  if(rCode && sCode && rCode===sCode) return true;
  if(rPhone && sPhone && rPhone===sPhone){
    if(!rAddr || !sAddr) return true;
    return rAddr===sAddr;
  }
  if(rAddr && sAddr && rAddr===sAddr && rCode && sCode && rCode===sCode) return true;
  return false;
}
function receiptDedupKey(r={}){
  const saleKey=String(receiptSaleId(r)||r.debtKey||r.saleCode||r.customerCode||r.customerPhone||r.customerId||'');
  const date=String(financeDocDate(r)||r.date||'');
  const amount=String(Math.round((+r.amount||0)*100)/100);
  const method=String(normalizePaymentMethod(r.paymentMethod||r.payMethod||r.method)||'');
  // Nếu không có khóa nghiệp vụ thì giữ theo id để tránh gộp nhầm chứng từ độc lập.
  return saleKey?['receipt',saleKey,date,amount,method].join('|'):['receipt-id',r.id||r.code||'',date,amount,method].join('|');
}
function uniqueReceiptsForFinance(rows=[]){
  const seen=new Set(), out=[];
  rows.forEach(r=>{
    const k=receiptDedupKey(r);
    if(seen.has(k))return;
    seen.add(k);
    out.push(r);
  });
  return out;
}
function receiptsForSalePayment(s={}){
  const sid=String(s.id||'');
  const scode=String(s.code||'');
  return uniqueReceiptsForFinance(activeReceipts().filter(r=>{
    const rid=receiptSaleId(r);
    // Khóa mạnh: receipt có saleId hoặc debtKey sale:id đúng phiếu thì nhận.
    if(rid && sid && rid===sid){
      // Nếu receipt có kèm thông tin khách thì phải khớp snapshot để tránh dữ liệu cũ bị sửa nhầm.
      if(r.customerCode||r.customerPhone||r.customerAddress) return receiptCustomerMatchesSale(r,s);
      return true;
    }
    if(r.debtKey && sid && String(r.debtKey)===`sale:${sid}`){
      if(r.customerCode||r.customerPhone||r.customerAddress) return receiptCustomerMatchesSale(r,s);
      return true;
    }
    // Khóa yếu saleCode chỉ dùng khi khách cũng khớp. Tuyệt đối không chỉ dựa vào tên.
    if(r.saleCode && scode && String(r.saleCode)===scode) return receiptCustomerMatchesSale(r,s);
    return false;
  }));
}
function allocationForCustomer(customerId){
  // ERP-FIX: Không còn phân bổ tiền theo khách hàng/tên khách.
  // Công nợ được quản lý theo từng phiếu bán riêng để tránh khách trùng tên/SĐT khác nhau bị trừ nhầm.
  const map={};
  activeSales().filter(s=>!customerId || s.customerId===customerId).forEach(s=>{map[s.id]=salePaymentInfo(s)});
  return map;
}
function saleDirectPaid(s={}){
  // ERP-DEBT-V6: Công nợ tính nghiêm ngặt theo từng phiếu bán.
  // Không dùng tên khách / customerId để phân bổ tiền.
  // Chỉ tính tiền nhập trực tiếp trên phiếu khi khoản paid gắn đúng mã phiếu hiện tại,
  // hoặc dữ liệu cũ thể hiện phiếu đã thu đủ. Thanh toán một phần cũ không có khóa phiếu sẽ KHÔNG tự trừ.
  const paid=+s.paid||0;
  if(!paid || isSaleCanceled(s)) return 0;
  const grand=+s.grand||0;
  const code=String(s.code||'');
  const key=String(s.paidEntryKey||s.paidSaleCode||'');
  const source=String(s.paidSource||'');
  const st=String(s.status||s.paymentStatus||'').toLowerCase();

  // Khoản nhập trực tiếp ở form bán hàng phải có key đúng phiếu.
  // Không dùng directPaidLocked đơn lẻ vì dữ liệu cũ có thể bị copy/sửa nhầm giữa các phiếu trùng tên.
  if(key && code && key===code && (source==='sale_form' || s.initialPaidAtSale===true || s.directPaidLocked===true)){
    return Math.min(paid, grand || paid);
  }

  // Legacy: phiếu cũ đã thu đủ nhưng chưa có paidEntryKey. Chỉ chấp nhận trạng thái đã thu đủ.
  // Nếu paid bị nhập lớn hơn tổng, chỉ tính tối đa bằng tổng để không tạo thu dư/khấu trừ sai.
  const isPaidStatus=st.includes('đã thu')||st.includes('da thu')||st.includes('paid');
  if(grand>0 && isPaidStatus && paid>=grand){
    return grand;
  }

  // Thanh toán một phần phải được ghi bằng phiếu thu có saleId/saleCode/debtKey đúng phiếu.
  return 0;
}
function saleCollectedInRange(s={},from='',to=''){
  // Tiền đã thu của một phiếu bán trong khoảng lọc.
  // 1) Thu trực tiếp trên phiếu bán: chỉ tính nếu ngày bán nằm trong khoảng.
  // 2) Phiếu thu: chỉ tính các phiếu thu vừa thuộc phiếu bán đó, vừa có ngày thu trong khoảng.
  // 3) Tổng thu không vượt quá tổng giá trị phiếu bán để tránh báo cáo thu dư làm lệch KPI.
  if(isSaleCanceled(s)) return 0;
  const grand=+s.grand||0;
  let paid=0;
  const saleDate=reportDateValue(s.date||s.createdDate||s.createdAt||'');
  if(saleDate && (!from || saleDate>=from) && (!to || saleDate<=to)) paid+=saleDirectPaid(s);
  receiptsForSalePayment(s).forEach(r=>{
    const d=financeDocDate(r);
    if(d && (!from || d>=from) && (!to || d<=to)) paid+=+r.amount||0;
  });
  return grand>0?Math.min(paid,grand):paid;
}
function salePaymentInfo(s){
  if(isSaleCanceled(s))return {paidTotal:0,debtLeft:0,paymentStatus:'Đã hủy'};
  const grand=+s.grand||0;
  const paidAtSale=saleDirectPaid(s);
  const receiptPaid=receiptsForSalePayment(s).reduce((a,r)=>a+(+r.amount||0),0);
  const paidTotal=paidAtSale+receiptPaid;
  const debtLeft=Math.max(0,grand-paidTotal);
  const paymentStatus=debtLeft<=0?'Đã thu tiền':(paidTotal>0?'Thanh toán một phần':'Chưa thu tiền');
  return {paidTotal,debtLeft,paymentStatus};
}
function saleFullyPaidForCommission(s={}){
  if(isSaleCanceled(s)) return false;
  const grand=+s.grand||0;
  if(grand<=0) return false;
  const pay=salePaymentInfo(s);
  return (+pay.paidTotal||0)>=grand && (+pay.debtLeft||0)<=0;
}
function commissionEligibleSales(){
  return activeSales().filter(s=>saleFullyPaidForCommission(s));
}
function currentStaffMatchIds(){
  const ids=new Set();
  const email=normEmail(currentUser?.email||currentPerm?.email||'');
  const uname=searchKey(currentPerm?.name||'');
  const staffId=String(currentPerm?.staffId||currentPerm?.employeeId||'').trim();
  if(staffId) ids.add(staffId);
  data.staff.forEach(st=>{
    if(staffId && st.id===staffId) ids.add(st.id);
    if(email && normEmail(st.email||'')===email) ids.add(st.id);
    if(uname && searchKey(st.name||'')===uname) ids.add(st.id);
  });
  return [...ids];
}
function canViewAllCommissions(){
  return currentPerm.role==='Admin' || ['Quản lý','Kế toán'].includes(currentPerm.role||'') || has('viewCost');
}
function warrantyStartFromSale(s={}){
  return String(s.installCompletedDate||s.installCompleteDate||s.completedInstallDate||s.installedAt||s.installDate||s.date||today()).slice(0,10);
}
function inferSaleInstallStatus(s={}){
  const st=String(s.installStatus||s.installationStatus||'').trim();
  if(st) return st;
  if(s.installCompletedDate||s.installCompleteDate||s.completedInstallDate||s.installedAt||s.installDate) return 'Đã lắp';
  if(stockVoucherForSale(s)) return 'Đã lắp';
  return 'Chưa lắp';
}
function saleIsInstalled(s={}){return inferSaleInstallStatus(s)==='Đã lắp';}
function debtWorkflowType(d={}){
  const pay=+d.paid||0, debt=+d.debt||0;
  const installed=(d.sales||[]).some(s=>saleIsInstalled(s));
  if(debt>0 && pay>0 && !installed) return 'deposit_pending_install';
  if(debt>0 && installed) return 'installed_unpaid';
  if(debt>0) return 'active';
  if(d.settled) return 'settled';
  return 'all';
}
function debtWorkflowBadge(d={}){
  const t=debtWorkflowType(d);
  const map={deposit_pending_install:['Đã cọc - Chưa lắp','orange'],installed_unpaid:['Đã lắp - Chưa thanh toán','red'],active:['Đang nợ','red'],settled:['Đã tất toán','green'],all:['Tất cả','gray']};
  const m=map[t]||map.all;
  return `<span class="badge ${m[1]}">${m[0]}</span>`;
}
function saleMoneyStatus(s){
  const pay=salePaymentInfo(s);
  const paid=+pay.paidTotal||0, grand=+s.grand||0, over=Math.max(0,paid-grand);
  if(over>0) return {overPaid:over,label:s.returnSettlement||s.moneyStatus||'Khách đang dư tiền',badge:'orange'};
  if((+pay.debtLeft||0)>0) return {overPaid:0,label:'Còn nợ',badge:paid>0?'orange':'red'};
  return {overPaid:0,label:'Đã thu đủ',badge:'green'};
}
async function updatePaymentStatusesForCustomer(customerId){
  // Chỉ cập nhật trạng thái từng phiếu bán, không cộng dồn theo khách.
  const rows=activeSales().filter(s=>!customerId || s.customerId===customerId);
  for(const s of rows){
    const st=salePaymentInfo(s);
    try{await updateDoc(doc(db,'sales',s.id),{paidTotal:st.paidTotal,debtLeft:st.debtLeft,paymentStatus:st.paymentStatus,status:st.paymentStatus,updatedAt:serverTimestamp()});}catch(e){console.warn('Không cập nhật trạng thái công nợ đơn '+s.id,e.message)}
  }
}
async function updatePaymentStatusForSaleSnapshot(saleId){
  const s=data.sales.find(x=>x.id===saleId); if(!s) return;
  const pay=salePaymentInfo(s);
  try{await updateDoc(doc(db,'sales',saleId),{paidTotal:pay.paidTotal,debtLeft:pay.debtLeft,paymentStatus:pay.paymentStatus,status:pay.paymentStatus,updatedAt:serverTimestamp()});}catch(e){console.warn('Không cập nhật công nợ phiếu '+saleId,e.message)}
}
function stockVoucherForSale(s){if(isSaleCanceled(s))return null;return data.stockVouchers.find(v=>!isVoucherCanceled(v)&&v.id===s.stockVoucherId)||data.stockVouchers.find(v=>!isVoucherCanceled(v)&&v.saleId===s.id)||null;}

function saleReturnVouchers(s){return activeStockVouchers().filter(v=>v.type==='RETURN' && (v.saleId===s.id || v.saleCode===s.code));}
function saleReturnedQtyMap(s){const m={}; saleReturnVouchers(s).forEach(v=>(v.items||[]).forEach(it=>{m[it.code]=(m[it.code]||0)+(+it.qty||0)})); return m;}
function calcSaleFromItemsForReturn(s,items){
  const totals=calcSaleTotals(items,s.vatMode||'included8',s.paid||0,s.surcharge||0);
  const cost=items.reduce((a,it)=>a+costFor(it.code,s.date||today())*(+it.qty||0),0);
  const commissionPercent=+s.commissionPercent||0;
  const saleCommission=calcCommission(totals,commissionPercent);
  const techCost=+s.techCost||0;
  const techFuel=+s.techFuel||0;
  const commissionBase=calcCommissionBase(totals);
  return {...totals,cost,commissionBase,saleCommission,techFuel,profit:commissionBase-cost-saleCommission-techCost-techFuel};
}
window.openSaleReturn=id=>{
  const s=data.sales.find(x=>x.id===id); if(!s)return alert('Không tìm thấy đơn bán');
  const sv=stockVoucherForSale(s); if(!sv)return alert('Đơn này chưa xuất kho nên không cần trả hàng nhập lại kho.');
  const wh=voucherWarehouse(sv)||s.warehouse||defaultWarehouse();
  const returned=saleReturnedQtyMap(s);
  const rows=(s.items||[]).filter(it=>(+it.qty||0)>0);
  if(!rows.length)return alert('Đơn này không còn sản phẩm để trả lại.');
  const html=`<div class="modal-backdrop" id="saleReturnModal"><div class="modal-card"><div class="panel-head"><h3>Trả lại hàng bán - ${s.code}</h3><button class="btn ghost" onclick="document.getElementById('saleReturnModal').remove()">Đóng</button></div>
  <div class="grid form-grid"><div><label>Ngày trả</label><input id="returnDate" type="date" value="${today()}"></div><div><label>Nhập về kho</label><select id="returnWarehouse">${warehouseOptions(wh)}</select></div><div><label>Xử lý tiền dư nếu đã thu đủ</label><select id="returnSettlement"><option>Khách đang dư tiền</option><option>Cần hoàn tiền</option><option>Cấn trừ đơn sau</option></select></div><div class="span2"><label>Ghi chú</label><input id="returnNote" value="Khách chỉ nhận một phần, nhập lại hàng dư về kho"></div></div>
  <table class="editable"><thead><tr><th>Model</th><th>Tên sản phẩm</th><th>SL còn tính bán</th><th>Đã trả trước</th><th>SL trả lần này</th></tr></thead><tbody id="returnItems">${rows.map(it=>`<tr data-code="${it.code}" data-name="${it.name||''}" data-max="${+it.qty||0}" data-price="${+it.price||0}" data-discount="${+it.discount||0}"><td><b>${it.code}</b></td><td>${it.name||''}</td><td>${it.qty}</td><td>${returned[it.code]||0}</td><td><input type="number" min="0" max="${+it.qty||0}" value="0"></td></tr>`).join('')}</tbody></table>
  <p class="muted">Ví dụ bán/xuất kho 10 bộ nhưng khách nhận 8 bộ: nhập SL trả lần này = 2. Hệ thống sẽ tạo phiếu nhập trả hàng, cộng lại tồn kho và giảm số lượng/tổng tiền trên đơn bán còn 8 bộ.</p>
  <div style="text-align:right"><button class="btn primary" onclick="saveSaleReturn('${s.id}')">Lưu trả hàng & nhập kho</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
};
window.saveSaleReturn=async(id)=>{
  const s=data.sales.find(x=>x.id===id); if(!s)return alert('Không tìm thấy đơn bán');
  const wh=$('returnWarehouse')?.value||s.warehouse||defaultWarehouse();
  if(!canAccessWarehouse(wh))return alert('Bạn không có quyền nhập về kho: '+wh);
  const rows=[...document.querySelectorAll('#returnItems tr')];
  const returnItems=[]; const returnMap={};
  for(const tr of rows){
    const code=tr.dataset.code,name=tr.dataset.name,max=+tr.dataset.max||0,price=+tr.dataset.price||0,discount=+tr.dataset.discount||0;
    const qty=+tr.querySelector('input').value||0;
    if(qty<0)return alert('Số lượng trả không hợp lệ: '+code);
    if(qty>max)return alert(`Model ${code} chỉ còn ${max} bộ đang tính bán, không thể trả ${qty} bộ.`);
    if(qty>0){const p=data.products.find(x=>x.code===code)||{}; returnItems.push({code,name,qty,inputQty:qty,cost:+p.cost||costFor(code,s.date||today())||0,note:`Trả lại từ đơn bán ${s.code}`}); returnMap[code]=qty;}
  }
  if(!returnItems.length)return alert('Nhập số lượng trả ít nhất 1 dòng');
  if(!confirm(`Xác nhận nhập lại ${returnItems.reduce((a,it)=>a+(+it.qty||0),0)} sản phẩm về ${wh} và giảm số lượng trên đơn ${s.code}?`))return;
  const rci=saleCustomerInfo(s); const voucher={code:nextCode('TH',data.stockVouchers),date:$('returnDate')?.value||today(),type:'RETURN',warehouse:wh,saleId:s.id,saleCode:s.code,customerId:s.customerId||'',customerCode:rci.code||'',customerName:rci.name,customerPhone:rci.phone||'',customerAddress:rci.address||'',customerType:rci.type||'',note:$('returnNote')?.value||`Trả lại hàng bán từ đơn ${s.code}`,settlement:$('returnSettlement')?.value||'Khách đang dư tiền',items:returnItems,value:returnItems.reduce((a,it)=>a+(+it.qty||0)*(+it.cost||0),0),locked:true,updatedAt:serverTimestamp()};
  await addDoc(col('stockVouchers'),{...voucher,createdAt:serverTimestamp()});
  const newItems=(s.items||[]).map(it=>({...it,qty:Math.max(0,(+it.qty||0)-(+returnMap[it.code]||0))})).filter(it=>(+it.qty||0)>0);
  const newTotals=calcSaleFromItemsForReturn(s,newItems);
  const returnedQty=(+s.returnedQty||0)+returnItems.reduce((a,it)=>a+(+it.qty||0),0);
  const oldPay=salePaymentInfo(s);
  const overPaid=Math.max(0,(+oldPay.paidTotal||0)-(+newTotals.grand||0));
  const returnSettlement=$('returnSettlement')?.value||'Khách đang dư tiền';
  await updateDoc(doc(db,'sales',s.id),{items:newItems,...newTotals,returnedQty,hasReturn:true,returnStatus:newItems.length?'Đã trả một phần':'Đã trả hết',overPaid,returnSettlement,moneyStatus:overPaid>0?returnSettlement:'',updatedAt:serverTimestamp()});
  await logAction('Trả lại hàng bán',`${voucher.code} - đơn ${s.code}`);
  document.getElementById('saleReturnModal')?.remove();
  document.getElementById('saleDetailModal')?.remove();
  await loadAll();
  await updatePaymentStatusesForCustomer(s.customerId||'');
  await loadAll();
  alert('Đã tạo phiếu trả hàng và nhập lại kho: '+voucher.code);
  viewSaleDetail(id);
};

function saleIsFullyCompleted(s){
  const pay=salePaymentInfo(s);
  return (+pay.debtLeft||0)<=0 && !!stockVoucherForSale(s);
}
function saleNeedSupplementStock(s){
  const pay=salePaymentInfo(s);
  return (+pay.debtLeft||0)<=0 && !stockVoucherForSale(s);
}
window.createSupplementStockVoucher=async(id)=>{
  const s=data.sales.find(x=>x.id===id); if(!s)return alert('Không tìm thấy đơn bán');
  if(stockVoucherForSale(s))return alert('Đơn này đã có phiếu xuất kho');
  if(!confirm(`Tạo phiếu xuất kho bổ sung cho đơn ${s.code}?`))return;
  const warehouse=s.warehouse||'Kho Văn Phòng';
  for(const it of (s.items||[])){
    const available=stockOf(it.code,'',warehouse);
    if((+it.qty||0)>available && !confirm(`Sản phẩm ${it.code} tại ${warehouse} còn ${available}. Vẫn tạo phiếu xuất kho bổ sung?`)) return;
  }
  const items=voucherItemsFromSaleItems(s.items||[]);
  const cost=(s.items||[]).reduce((a,it)=>a+costFor(it.code,s.date||today())*(+it.qty||0),0);
  const sci=saleCustomerInfo(s);
  const voucher={
    code:nextCode('XK',data.stockVouchers),date:s.date||today(),type:'OUT',warehouse,saleId:s.id,saleCode:s.code,customerId:s.customerId||'',customerCode:sci.code||'',customerName:sci.name,customerPhone:sci.phone||'',customerAddress:sci.address||'',customerType:sci.type||'',
    note:`Xuất kho bổ sung cho đơn bán ${s.code}`,
    items,value:cost,updatedAt:serverTimestamp()
  };
  const vr=await addDoc(col('stockVouchers'),{...voucher,createdAt:serverTimestamp()});
  await updateDoc(doc(db,'sales',s.id),{warehouse,stockExported:true,stockVoucherId:vr.id,stockVoucherCode:voucher.code,orderStatus:'Hoàn tất',updatedAt:serverTimestamp()});
  await logAction('Tạo PXK bổ sung',`${voucher.code} - đơn ${s.code}`);
  await loadAll();
  alert(`Đã tạo phiếu xuất kho bổ sung ${voucher.code}`);
  const modal=document.getElementById('saleDetailModal'); if(modal)modal.remove();
  viewSaleDetail(id);
}

window.resetSaleForm=()=>{editingSale=null;$('saleCode').value=nextCode('BH',data.sales);$('saleDate').value=today();$('saleCustomerSearch').value='';if($('saleCustomerId'))$('saleCustomerId').value='';if($('saleCustomerPhone')){$('saleCustomerPhone').value=''; window.__saleCustomerPhoneManual=false;}if($('saleCustomerAddress')){$('saleCustomerAddress').value=''; window.__saleCustomerAddressManual=false;}if($('saleCustomerType'))$('saleCustomerType').value='Khách lẻ';if($('saleVatMode'))$('saleVatMode').value='included8';$('salePaid').value=0;if($('salePaymentMethod'))$('salePaymentMethod').value='Tiền mặt';if($('saleCommissionPercent'))$('saleCommissionPercent').value=salePercentDefault($('saleStaff')?.value);if($('saleTechCost'))$('saleTechCost').value=techFeeDefault($('saleTech')?.value);if($('saleTechFuel'))$('saleTechFuel').value=0;if($('saleSurcharge'))$('saleSurcharge').value=0;if($('saleOrderDiscountType'))$('saleOrderDiscountType').value='none';if($('saleOrderDiscountValue'))$('saleOrderDiscountValue').value=0;$('saleNote').value='';if($('saleInstallStatus'))$('saleInstallStatus').value='Chưa lắp';if($('saleInstallCompletedDate'))$('saleInstallCompletedDate').value='';if($('saleWarehouse'))$('saleWarehouse').value='Kho Văn Phòng';if($('saleExportStock'))$('saleExportStock').checked=false;if($('saleExportStockSticky'))$('saleExportStockSticky').checked=false;ensureProductDatalist();$('saleItems').innerHTML='';addSaleItem();updateSaleTotals()}
window.addSaleItem=(it={})=>{let tr=document.createElement('tr');tr.innerHTML=`<td><input list="productCodesList" placeholder="Tìm model..." value="${it.code||''}" onchange="saleProductChanged(this)" oninput="saleProductChanged(this)"></td><td><input value="${it.name||''}" readonly></td><td><input type="number" value="${it.qty||1}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td><input type="number" value="${it.price||0}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td><select onchange="updateSaleTotals()"><option value="percent" ${(it.discountType||'percent')==='percent'?'selected':''}>%</option><option value="amount" ${(it.discountType||'percent')==='amount'?'selected':''}>VNĐ</option></select></td><td><input type="number" value="${it.discount||0}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td class="line-total">0</td><td><button class="btn danger" onclick="this.closest('tr').remove();updateSaleTotals()">X</button></td>`;$('saleItems').appendChild(tr);updateSaleTotals();setTimeout(()=>tr.querySelector('input')?.focus(),30);return tr}
window.saleItemKeyNav=(e,el)=>{if(e.key!=='Enter')return;e.preventDefault();const tr=el.closest('tr');const inputs=[...tr.querySelectorAll('input:not([readonly]),select')];let i=inputs.indexOf(el);if(i<inputs.length-1){inputs[i+1].focus();inputs[i+1].select?.();}else{addSaleItem();}}
window.addQuickSaleModel=(code)=>{let p=data.products.find(x=>String(x.code).toLowerCase()===String(code).toLowerCase() || String(x.code).toLowerCase().includes(String(code).toLowerCase()));if(!p)return alert('Chưa có model '+code+' trong danh mục sản phẩm'); if(p.active==='inactive')return alert('Model '+p.code+' đang ngừng bán, không thể thêm vào phiếu bán.');let customer=findCustomerBySearch();let bp=activePriceFor(p.code,saleCustomerType(),saleDateValue());let tr=addSaleItem({code:p.code,name:p.name,qty:1,price:bp?.price||p.price||0,discount:customer?.discount||0});saleProductChanged(tr.children[0].querySelector('input'));setTimeout(()=>tr.children[2].querySelector('input')?.focus(),30)}
window.syncSaleExportStockFromSticky=()=>{if($('saleExportStock')&&$('saleExportStockSticky'))$('saleExportStock').checked=$('saleExportStockSticky').checked}
window.syncSaleExportStockToSticky=()=>{if($('saleExportStock')&&$('saleExportStockSticky'))$('saleExportStockSticky').checked=$('saleExportStock').checked}
window.saleProductChanged=sel=>{let p=productByInput(sel.value)||{};if(!p.code)return;if(p.active==='inactive'){alert('Model '+p.code+' đang ngừng bán, không thể bán.');sel.value='';return;}let tr=sel.closest('tr');tr.children[1].querySelector('input').value=p.name||'';let customer=findCustomerBySearch();let bp=activePriceFor(p.code,saleCustomerType(),saleDateValue());let price=bp?.price||p.price||0;tr.children[3].querySelector('input').value=price;tr.children[4].querySelector('select').value='percent';tr.children[5].querySelector('input').value=customer?.discount||0;updateSaleTotals()}
function saleItems(){return [...$('saleItems').querySelectorAll('tr')].map(tr=>{const inp=[...tr.querySelectorAll('input')];return{code:productCodeFromInput(inp[0]?.value||''),name:inp[1]?.value||'',qty:+(inp[2]?.value||0)||0,price:+(inp[3]?.value||0)||0,discountType:tr.children[4]?.querySelector('select')?.value||'percent',discount:+(inp[4]?.value||0)||0}}).filter(x=>x.code&&x.qty>0)}
window.updateSaleTotals=()=>{let t=calcSaleTotals(saleItems(),$('saleVatMode')?.value||'included8',$('salePaid')?.value||0,$('saleSurcharge')?.value||0,$('saleOrderDiscountType')?.value||'none',$('saleOrderDiscountValue')?.value||0);[...$('saleItems').querySelectorAll('tr')].forEach(tr=>{const inp=[...tr.querySelectorAll('input')];let it={qty:+(inp[2]?.value||0)||0,price:+(inp[3]?.value||0)||0,discountType:tr.children[4]?.querySelector('select')?.value||'percent',discount:+(inp[4]?.value||0)||0};const line=tr.querySelector('.line-total'); if(line) line.textContent=money(lineNet(it))});if($('saleGoodsBeforeDiscount'))$('saleGoodsBeforeDiscount').textContent=money(t.goodsBeforeDiscount);if($('saleDiscountText'))$('saleDiscountText').textContent=money(t.discountTotal);$('saleSubTotal').textContent=money(t.subtotal);$('saleVat').textContent=money(t.vat);if($('saleSurchargeText'))$('saleSurchargeText').textContent=money(t.surcharge);$('saleGrand').textContent=money(t.grand);$('saleDebt').textContent=money(t.debt);if($('saleGrandSticky'))$('saleGrandSticky').textContent=money(t.grand);if($('saleDebtSticky'))$('saleDebtSticky').textContent=money(t.debt);syncSaleExportStockToSticky()};['saleVatMode','salePaid','saleCustomerSearch','saleCustomerPhone','saleCommissionPercent','saleTechCost','saleSurcharge','saleTechFuel','saleOrderDiscountType','saleOrderDiscountValue'].forEach(id=>setTimeout(()=>$(id)?.addEventListener('input',updateSaleTotals),0));setTimeout(()=>$('saleStaff')?.addEventListener('change',()=>{if($('saleCommissionPercent'))$('saleCommissionPercent').value=salePercentDefault($('saleStaff').value);updateSaleTotals()}),0);setTimeout(()=>$('saleTech')?.addEventListener('change',()=>{if($('saleTechCost'))$('saleTechCost').value=suggestedTechCost()||techFeeDefault($('saleTech').value);updateSaleTotals()}),0);

function saleCustomerSearchMatches(q='', limit=12){
  const raw=String(q||'').trim();
  const key=searchKey(raw);
  const phone=normalizePhone(raw);
  let rows=data.customers.slice();
  if(raw){
    rows=rows.filter(c=>{
      const i=customerInfo(c);
      const hay=searchKey([i.code,i.name,i.phone,i.address,i.type,c.email,c.contact,c.source].filter(Boolean).join(' '));
      const p=normalizePhone(i.phone||'');
      return hay.includes(key) || (phone && (p.includes(phone)||phone.includes(p)));
    });
  }
  return rows.slice(0,limit);
}
function renderSaleCustomerSearchResults(){
  const box=$('saleCustomerResults'); if(!box) return;
  const raw=$('saleCustomerSearch')?.value||'';
  const rows=saleCustomerSearchMatches(raw,12);
  if(!rows.length){box.innerHTML='<div class="sale-customer-no-result">Không tìm thấy khách phù hợp. Có thể bấm + Khách để tạo mới.</div>'; box.classList.add('show'); return;}
  box.innerHTML=rows.map(c=>{const i=customerInfo(c);return `<button type="button" class="sale-customer-result-row" onclick="selectSaleCustomerById('${htmlesc(c.id||'')}')"><b>${htmlesc(i.name||'Chưa cập nhật tên')}</b><small>${htmlesc(i.code||'')} · ${htmlesc(i.phone||'')} · ${htmlesc(i.type||'Khách lẻ')}</small><small>${htmlesc(i.address||'')}</small></button>`}).join('');
  box.classList.add('show');
}
window.renderSaleCustomerSearchResults=renderSaleCustomerSearchResults;
window.handleSaleCustomerSearchInput=()=>{
  if($('saleCustomerId')) $('saleCustomerId').value='';
  renderSaleCustomerSearchResults();
  // Không tự đổ dữ liệu khi chỉ gõ tên để tránh nhầm khách trùng tên.
};
window.selectSaleCustomerById=(id)=>{
  const c=data.customers.find(x=>x.id===id);
  if(!c) return alert('Không tìm thấy khách hàng đã chọn. Vui lòng tải lại dữ liệu.');
  setSaleCustomerFields(c,{forceContact:true});
  $('saleCustomerResults')?.classList.remove('show');
  // Chọn khách chỉ cập nhật thông tin khách. Không tự đổi đơn giá/sản phẩm đang có trên phiếu.
  updateSaleTotals();
};
document.addEventListener('click',e=>{
  const box=$('saleCustomerResults');
  if(!box) return;
  if(!e.target.closest('.sale-customer-name')) box.classList.remove('show');
});

function findCustomerBySearch(){
  const selectedId=($('saleCustomerId')?.value||'').trim();
  if(selectedId){const byId=data.customers.find(x=>x.id===selectedId); if(byId) return byId;}
  const raw=($('saleCustomerSearch')?.value||'').trim();
  const phoneRaw=($('saleCustomerPhone')?.value||'').trim();
  if(!raw && !phoneRaw) return null;
  const parsed=parseCustomerInput(raw || phoneRaw);
  const code=String(parsed.customerCode||'').trim().toLowerCase();
  const phone=normalizePhone(parsed.phone||phoneRaw||raw);
  let c=null;
  // Ưu tiên mã KH / SĐT vì đây là dữ liệu định danh. Không chọn theo tên nếu có khả năng trùng tên.
  if(code) c=data.customers.find(x=>String(ensureCustomerCode(x)||'').trim().toLowerCase()===code);
  if(!c && phone) c=data.customers.find(x=>normalizePhone(x.phone)===phone);
  if(!c && phone) c=data.customers.find(x=>{const p=normalizePhone(x.phone); return p && (p.includes(phone)||phone.includes(p));});
  if(!c && raw){
    const key=searchKey(raw);
    const matches=data.customers.filter(x=>searchKey(customerInfo(x).name)===key || searchKey(customerSearchValue(x))===key);
    if(matches.length===1) c=matches[0];
  }
  return c||null;
}

function saleCustomerAddressValue(customer=null){
  const manual=!!window.__saleCustomerAddressManual;
  const inputVal=($('saleCustomerAddress')?.value||'').trim();
  if(manual) return inputVal;
  const c=customer||findCustomerBySearch();
  return (c?(customerInfo(c).address||''):'') || inputVal;
}
function saleCustomerPhoneValue(customer=null){
  const manual=!!window.__saleCustomerPhoneManual;
  const inputVal=($('saleCustomerPhone')?.value||'').trim();
  if(manual) return inputVal;
  const c=customer||findCustomerBySearch();
  return (c?(customerInfo(c).phone||''):'') || inputVal;
}
window.updateSaleCustomerAddressManual=()=>{ window.__saleCustomerAddressManual=true; };
window.updateSaleCustomerPhoneManual=()=>{ window.__saleCustomerPhoneManual=true; };
function syncSaleCustomerContact(force=false){
  const c=findCustomerBySearch();
  if(c){
    if(force || !window.__saleCustomerPhoneManual){ if($('saleCustomerPhone')) $('saleCustomerPhone').value=customerInfo(c).phone||''; window.__saleCustomerPhoneManual=false; }
    if(force || !window.__saleCustomerAddressManual){ if($('saleCustomerAddress')) $('saleCustomerAddress').value=customerInfo(c).address||''; window.__saleCustomerAddressManual=false; }
  }
}

function saleCustomerType(){return $('saleCustomerType')?.value||findCustomerBySearch()?.type||'Khách lẻ'}
window.saleCustomerChanged=()=>{
  const raw=($('saleCustomerSearch')?.value||'').trim();
  const c=findCustomerBySearch();
  if(c){
    const i=customerInfo(c);
    const exactByCode=searchKey(raw)===searchKey(i.code||'');
    const exactByPhone=normalizePhone(raw) && normalizePhone(raw)===normalizePhone(i.phone||'');
    const exactByFull=searchKey(raw)===searchKey(customerSearchValue(c));
    const exactByName=searchKey(raw)===searchKey(i.name||'') && data.customers.filter(x=>searchKey(customerInfo(x).name)===searchKey(i.name||'')).length===1;
    if(exactByCode||exactByPhone||exactByFull||exactByName) setSaleCustomerFields(c,{forceContact:true});
    else { if($('saleCustomerId'))$('saleCustomerId').value=c.id||''; }
  }else{
    if($('saleCustomerId'))$('saleCustomerId').value='';
  }
  // Không tự đổi đơn giá/chiết khấu sản phẩm khi chỉ thay đổi khách; tránh trường hợp dòng hàng bị đưa về 0 hoặc sai giá.
  updateSaleTotals();
}
window.saleCustomerTypeChanged=()=>{refreshSaleItemPricesByCustomerType()}
setTimeout(()=>$('saleDate')?.addEventListener('change',()=>{saleDateValue();refreshSaleItemPricesByCustomerType()}),0);
function refreshSaleItemPricesByCustomerType(){const type=saleCustomerType();const c=findCustomerBySearch();[...$('saleItems').querySelectorAll('tr')].forEach(tr=>{const code=productCodeFromInput(tr.children[0]?.querySelector('input')?.value||'');if(!code)return;const p=data.products.find(x=>x.code===code)||{};const bp=activePriceFor(code,type,saleDateValue());tr.children[3].querySelector('input').value=bp?.price||p.price||0;if(c)tr.children[5].querySelector('input').value=c.discount||0;});updateSaleTotals()}

async function syncReceiptsForSaleCustomer(saleId,salePayload={},oldSale={}){
  const receiptMap=new Map();
  const before={...oldSale,id:saleId};
  try{receiptsForSale(before).forEach(r=>receiptMap.set(r.id,r));}catch(e){}
  data.receipts.filter(r=>r.saleId===saleId || (Array.isArray(r.allocations)&&r.allocations.some(a=>a.saleId===saleId))).forEach(r=>receiptMap.set(r.id,r));
  const list=[...receiptMap.values()].filter(r=>r&&r.id);
  if(!list.length) return;
  let batch=writeBatch(db), count=0;
  for(const r of list){
    const patch={
      saleId:r.saleId||saleId,
      customerId:salePayload.customerId||'',customerCode:salePayload.customerCode||'',customerName:salePayload.customerName||'',customerPhone:salePayload.customerPhone||'',customerAddress:salePayload.customerAddress||'',customerType:salePayload.customerType||'',updatedAt:serverTimestamp()
    };
    batch.update(doc(db,'receipts',r.id),patch);
    count++; if(count>=450){await batch.commit(); batch=writeBatch(db); count=0;}
  }
  if(count>0) await batch.commit();
}

async function syncRelatedDocsForSaleCustomer(saleId,salePayload={},oldSale={}){
  // Đồng bộ thông tin khách của CHÍNH phiếu bán đang sửa sang các chứng từ phát sinh từ phiếu đó.
  // Không cập nhật hồ sơ khách hàng và không cập nhật các phiếu bán khác.
  if(!saleId) return;
  const saleCode=salePayload.code||oldSale.code||'';
  const patchBase={
    customerId:salePayload.customerId||'',
    customerCode:salePayload.customerCode||'',
    customerName:salePayload.customerName||'',
    customerPhone:salePayload.customerPhone||'',
    customerAddress:salePayload.customerAddress||'',
    customerType:salePayload.customerType||'',
    updatedAt:serverTimestamp()
  };

  await syncReceiptsForSaleCustomer(saleId,salePayload,oldSale);

  const stockList=data.stockVouchers.filter(v=>v.id && (v.saleId===saleId || (!!saleCode && v.saleCode===saleCode)));
  const warrantyList=data.warranties.filter(w=>w.id && (w.saleId===saleId || (!!saleCode && w.saleCode===saleCode)));
  let batch=writeBatch(db), count=0;

  for(const v of stockList){
    batch.update(doc(db,'stockVouchers',v.id),{
      customerId:patchBase.customerId,
      customerCode:patchBase.customerCode,
      customerName:patchBase.customerName,
      customerPhone:patchBase.customerPhone,
      customerAddress:patchBase.customerAddress,
      customerType:patchBase.customerType,
      updatedAt:serverTimestamp()
    });
    count++; if(count>=450){await batch.commit(); batch=writeBatch(db); count=0;}
  }
  for(const w of warrantyList){
    batch.update(doc(db,'warranties',w.id),{
      customer:patchBase.customerName,
      customerName:patchBase.customerName,
      phone:patchBase.customerPhone,
      customerPhone:patchBase.customerPhone,
      address:patchBase.customerAddress,
      customerAddress:patchBase.customerAddress,
      customerCode:patchBase.customerCode,
      customerType:patchBase.customerType,
      updatedAt:serverTimestamp()
    });
    count++; if(count>=450){await batch.commit(); batch=writeBatch(db); count=0;}
  }
  if(count>0) await batch.commit();
}
window.saveSale=async()=>{let customer=findCustomerBySearch();if(!customer){quickCreateCustomer();return alert('Chưa có khách hàng hợp lệ. Vui lòng kiểm tra Tên/SĐT rồi bấm Lưu khách trong form Thêm khách hàng.')}let items=saleItems();if(!items.length)return alert('Chưa có sản phẩm'); const inactiveItem=items.find(it=>(data.products.find(p=>p.code===it.code)||{}).active==='inactive'); if(inactiveItem)return alert('Model '+inactiveItem.code+' đang ngừng bán, không thể lưu phiếu bán.');
  const exportStock=!!$('saleExportStock')?.checked;
  const saleWarehouse=$('saleWarehouse')?.value||'Kho Văn Phòng';
  let oldSale=editingSale?data.sales.find(x=>x.id===editingSale):null;
  const oldSalePay=oldSale?salePaymentInfo(oldSale):null;
  let excludeVoucherId=oldSale?.stockVoucherId||'';
  if(exportStock){for(const it of items){const available=stockOf(it.code,excludeVoucherId,saleWarehouse); if(it.qty>available && !confirm(`Sản phẩm ${it.code} tồn tại kho ${saleWarehouse} hiện có ${available}, vẫn lưu đơn kiêm xuất kho?`)) return;}}
  const saleDateVal=saleDateValue();
  const paidForTotals=editingSale?(oldSalePay?.paidTotal||0):(+($('salePaid')?.value||0)||0);
  let totals=calcSaleTotals(items,$('saleVatMode').value,paidForTotals,$('saleSurcharge')?.value||0,$('saleOrderDiscountType')?.value||'none',$('saleOrderDiscountValue')?.value||0);let installCompletedDate=($('saleInstallCompletedDate')?.value||'').slice(0,10);let installStatus=$('saleInstallStatus')?.value||((installCompletedDate||exportStock)?'Đã lắp':'Chưa lắp');let cost=items.reduce((a,it)=>a+costFor(it.code,saleDateVal)*it.qty,0);let commissionPercent=+($('saleCommissionPercent')?.value||0)||0;let saleCommission=calcCommission(totals,commissionPercent);let techCost=+($('saleTechCost')?.value||0)||0;let techFuel=+($('saleTechFuel')?.value||0)||0;let commissionBase=calcCommissionBase(totals);let snap=customerSnapshotFromCustomer(customer,saleCustomerType()); snap.phone=saleCustomerPhoneValue(customer)||snap.phone; snap.address=saleCustomerAddressValue(customer); let o={code:$('saleCode').value,date:saleDateVal,...customerSnapshotPayload(snap),staffId:$('saleStaff').value,staffName:data.staff.find(x=>x.id===$('saleStaff').value)?.name||'',techId:$('saleTech').value,techName:data.staff.find(x=>x.id===$('saleTech').value)?.name||'',commissionPercent,commissionBase,saleCommission,techCost,techFuel,vatMode:$('saleVatMode').value,paid:editingSale?(+(oldSale?.paid||0)||0):paidForTotals,paidSource:editingSale?(oldSale?.paidSource||''):(paidForTotals>0?'sale_form':''),paidEntryKey:editingSale?(oldSale?.paidEntryKey||oldSale?.paidSaleCode||''):(paidForTotals>0?$('saleCode').value:''),paymentMethod:editingSale?(oldSale?.paymentMethod||$('salePaymentMethod')?.value||'Tiền mặt'):($('salePaymentMethod')?.value||'Tiền mặt'),directPaidLocked:editingSale?(oldSale?.directPaidLocked===true):(paidForTotals>0),note:$('saleNote').value,items,...totals,cost,profit:commissionBase-cost-saleCommission-techCost-techFuel,status:totals.debt>0?(paidForTotals>0?'Thanh toán một phần':'Chưa thu tiền'):'Đã thu tiền',paymentStatus:totals.debt>0?(paidForTotals>0?'Thanh toán một phần':'Chưa thu tiền'):'Đã thu tiền',paidTotal:paidForTotals,debtLeft:totals.debt,installStatus,installCompletedDate,warehouse:saleWarehouse,stockExported:exportStock,stockVoucherId:oldSale?.stockVoucherId||'',updatedAt:serverTimestamp()};
  let financialEditReason='';
  if(editingSale){
    if(!has('editSales'))return alert('Không có quyền sửa đơn');
    try{ financialEditReason=await requireSaleFinancialEditReason(oldSale,o); }
    catch(err){ alert(err.message||err); return; }
    await updateDoc(doc(db,'sales',editingSale),o);
    if(financialEditReason) await logSaleFinancialEdit(oldSale,o,financialEditReason);
    if(oldSale && oldSale.customerId!==o.customerId){
      await syncReceiptsForSaleCustomer(editingSale,o,oldSale);
    }
    await logAction('Sửa đơn bán',`${o.code}${financialEditReason?' - '+financialEditReason:''}`)
  }else{const saleRef=await addDoc(col('sales'),{...o,createdAt:serverTimestamp()});editingSale=saleRef.id;await logAction('Tạo đơn bán',o.code);}
  const savedSaleId=editingSale;
  // Kiêm xuất kho: tạo/cập nhật phiếu xuất kho OUT riêng để trừ tồn kho. Không tick thì chưa xuất kho.
  if(exportStock){
    const voucher={code:oldSale?.stockVoucherCode||nextCode('XK',data.stockVouchers),date:o.date,type:'OUT',warehouse:saleWarehouse,saleId:editingSale,saleCode:o.code,customerId:o.customerId||'',customerCode:o.customerCode||'',customerName:o.customerName,customerPhone:o.customerPhone||'',customerAddress:o.customerAddress||'',customerType:o.customerType||'',note:`Xuất kho theo đơn bán ${o.code}`,items:voucherItemsFromSaleItems(items),value:cost,updatedAt:serverTimestamp()};
    if(o.stockVoucherId){await updateDoc(doc(db,'stockVouchers',o.stockVoucherId),voucher)}
    else{const vr=await addDoc(col('stockVouchers'),{...voucher,createdAt:serverTimestamp()});await updateDoc(doc(db,'sales',editingSale),{stockVoucherId:vr.id,stockVoucherCode:voucher.code,orderStatus:'Hoàn tất'})}
  }else if(oldSale?.stockVoucherId){
    await deleteDoc(doc(db,'stockVouchers',oldSale.stockVoucherId));
    await updateDoc(doc(db,'sales',editingSale),{stockVoucherId:'',stockVoucherCode:'',stockExported:false,orderStatus:'Chưa xuất kho'});
  }
  const refreshIds=[customer.id, oldSale?.customerId].filter(Boolean);
  editingSale=null;await loadAll();
  for(const cid of [...new Set(refreshIds)]) await updatePaymentStatusesForCustomer(cid);
  await loadAll();resetSaleForm();return savedSaleId}
window.saveSaleAndPrint=async()=>{const id=await saveSale(); if(id) setTimeout(()=>printSale(id),600)}
function renderSales(){
  let q=($('saleSearch')?.value||'').toLowerCase();
  const rows=data.sales
    .filter(s=>(s.code+(s.customerCode||'')+s.customerName+(s.customerPhone||'')+(s.customerType||'')+(s.cancelReason||'')+(saleItemSummary(s).models||'')).toLowerCase().includes(q))
    .sort((a,b)=>{
      const ta=isSaleToday(a)?1:0, tb=isSaleToday(b)?1:0;
      if(ta!==tb) return tb-ta; // phiếu hôm nay luôn lên đầu
      const d=String(b.date||'').localeCompare(String(a.date||''));
      if(d) return d;
      return String(b.code||'').localeCompare(String(a.code||''));
    });
  const totalQty=rows.reduce((a,s)=>a+(isSaleCanceled(s)?0:saleItemSummary(s).totalQty),0);
  const totalGrand=rows.reduce((a,s)=>a+(isSaleCanceled(s)?0:(+s.grand||0)),0);
  const totalPaid=rows.reduce((a,s)=>a+(isSaleCanceled(s)?0:salePaymentInfo(s).paidTotal),0);
  const totalDebt=rows.reduce((a,s)=>a+(isSaleCanceled(s)?0:salePaymentInfo(s).debtLeft),0);
  const todayCount=rows.filter(isSaleToday).length;
  if($('saleListHint'))$('saleListHint').innerHTML=`${todayCount?`<span class="sale-new-count">${todayCount} phiếu hôm nay</span>`:'Không có phiếu mới hôm nay'} · Danh sách đã ưu tiên phiếu hôm nay lên trước.`;
  $('saleTable').innerHTML=rows.map((s,idx)=>{
    const canceled=isSaleCanceled(s);
    const isNew=isSaleToday(s);
    const pay=salePaymentInfo(s);
    const sv=stockVoucherForSale(s);
    const stockStatus=!!sv;
    const ci=saleCustomerInfo(s);
    const itemSum=saleItemSummary(s);
    const productTip=productQtyTooltipFromItems(s.items||[]);
    const debtBadgeClass=canceled?'red':(pay.debtLeft>0?(pay.paidTotal>0?'orange':'red'):'green');
    const stockHtml=canceled?'<span class="mini-status red">Đã hủy</span>':(s.hasReturn?'<span class="mini-status orange">Có trả hàng</span> ':'')+(stockStatus?'<span class="mini-status green">Đã xuất</span>':(saleNeedSupplementStock(s)?'<span class="mini-status red">Cần xuất bổ sung</span>':'<span class="mini-status orange">Chưa xuất</span>'));
    return `<tr class="sale-row ${canceled?'row-canceled':''} ${isNew?'sale-row-new':''}">
      <td class="text-center sale-index">${idx+1}</td>
      <td class="sale-code-cell"><div><b>${htmlesc(s.code||'')}</b>${isNew?'<span class="new-sticker">NEW</span>':''}</div>${canceled?'<span class="mini-status red">Đã hủy</span>':''}</td>
      <td class="sale-date-cell"><b>${htmlesc(s.date||'')}</b>${isNew?'<small>Hôm nay</small>':''}</td>
      <td class="sale-customer-code">${htmlesc(ci.code||'')}</td>
      <td class="sale-customer-cell"><b>${htmlesc(ci.name||'')}</b><small>${htmlesc(ci.phone||'')}${ci.address?' · '+htmlesc(ci.address):''}</small></td>
      <td class="text-center sale-qty"><b>${canceled?0:itemSum.totalQty}</b><small>bộ</small></td>
      <td class="sale-products-cell" title="${htmlesc(productTip)}"><div class="product-chip-wrap">${saleProductChipHtml(s)}</div></td>
      <td class="money-cell"><b>${money(canceled?0:s.grand)}</b></td>
      <td class="money-cell">${money(pay.paidTotal)}</td>
      <td class="money-cell"><b class="${pay.debtLeft>0?'text-danger':''}">${money(pay.debtLeft)}</b></td>
      <td>${paymentMethodBadge(s.paymentMethod||s.payMethod)}</td>
      <td class="view-cost money-cell">${money(saleCommissionValue(s))}</td>
      <td class="view-cost money-cell">${money(saleProfitValue(s))}</td>
      <td><span class="mini-status ${debtBadgeClass}">${canceled?'Đã hủy':pay.paymentStatus}</span></td>
      <td>${stockHtml}</td>
      <td class="sale-actions"><button class="btn ghost" onclick="viewSaleDetail('${s.id}')">Chi tiết</button><button class="btn ghost" onclick="printSale('${s.id}')">In A5</button>${has('editSales')&&!canceled?`<button class="btn ghost" onclick="editSale('${s.id}')">Sửa</button>`:''}${has('deleteSales')&&!canceled?`<button class="btn danger" onclick="cancelSale('${s.id}')">Hủy</button>`:''}</td>
    </tr>`}).join('')||'<tr><td colspan="16">Chưa có phiếu bán</td></tr>';
  if($('saleListSummary'))$('saleListSummary').innerHTML=`<div><span>Tổng phiếu</span><b>${rows.length}</b></div><div><span>Phiếu hôm nay</span><b>${todayCount}</b></div><div><span>Tổng bộ khóa</span><b>${totalQty}</b></div><div><span>Doanh số</span><b>${money(totalGrand)}</b></div><div><span>Đã thu</span><b>${money(totalPaid)}</b></div><div><span>Còn nợ</span><b class="${totalDebt>0?'text-danger':''}">${money(totalDebt)}</b></div>`;
}

window.viewSaleDetail=id=>{
  const s=data.sales.find(x=>x.id===id); if(!s)return;
  const pay=salePaymentInfo(s); const sv=stockVoucherForSale(s); const recs=receiptsForSale(s); const returns=saleReturnVouchers(s); const ci=saleCustomerInfo(s);
  const returnHtml=returns.length?`<div class="receipt-list"><h4>Phiếu trả hàng bán</h4><table><thead><tr><th>Mã phiếu</th><th>Ngày</th><th>Kho nhập lại</th><th>Số dòng</th><th>Ghi chú</th><th></th></tr></thead><tbody>${returns.map(v=>`<tr><td>${v.code||''}</td><td>${v.date||''}</td><td>${voucherWarehouse(v)}</td><td>${(v.items||[]).map(it=>`${it.code}: ${it.qty}`).join('<br>')}</td><td>${v.note||''}</td><td><button class="btn ghost" onclick="printStock('${v.id}')">In phiếu</button></td></tr>`).join('')}</tbody></table></div>`:'';
  const receiptHtml=recs.length?`<div class="receipt-list"><h4>Phiếu thu liên quan</h4><table><thead><tr><th>Mã PT</th><th>Ngày</th><th>Số tiền phân bổ</th><th>PTTT</th><th>Ghi chú</th><th></th></tr></thead><tbody>${recs.map(r=>`<tr><td>${r.code||''}</td><td>${r.date||''}</td><td><b>${money(r.allocatedAmount||r.amount)}</b></td><td>${paymentMethodText(receiptEffectivePaymentMethod(r))}</td><td>${r.note||''}</td><td><button class="btn ghost" onclick="printReceipt('${r.id}')">In PT</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="receipt-list"><h4>Phiếu thu liên quan</h4><p>Chưa có phiếu thu được phân bổ cho đơn này.</p></div>`;
  let html=`<div class="modal-backdrop" id="saleDetailModal"><div class="modal-card"><div class="panel-head"><h3>Chi tiết đơn ${s.code}</h3><button class="btn ghost" onclick="document.getElementById('saleDetailModal').remove()">Đóng</button></div>${isSaleCanceled(s)?`<div class="alert danger"><b>Phiếu đã hủy</b><br>Lý do: ${s.cancelReason||''}</div>`:''}<div class="sale-detail-grid"><div><b>Khách hàng</b><p><b>${ci.name}</b><br>Mã KH: ${ci.code||''}<br>SĐT: ${ci.phone||''}<br>Đ/c: ${ci.address||''}<br>Loại khách: ${ci.type||''}<br><button class="btn ghost" style="margin-top:8px" onclick="editSaleCustomerFromSale('${s.id}')">Sửa thông tin KH</button></p></div><div><b>Trạng thái công nợ</b><p><span class="badge ${pay.debtLeft>0?(pay.paidTotal>0?'orange':'red'):'green'}">${pay.paymentStatus}</span><br>Tổng tiền: <b>${money(s.grand)}</b><br>Đã thu: <b>${money(pay.paidTotal)}</b><br>Còn nợ: <b>${money(pay.debtLeft)}</b><br>PTTT: <b>${paymentMethodText(s.paymentMethod||s.payMethod)}</b><br>${saleMoneyStatus(s).overPaid>0?`Tiền dư: <b>${money(saleMoneyStatus(s).overPaid)}</b><br><span class="badge orange">${saleMoneyStatus(s).label}</span>`:''}</p></div><div><b>Kho</b><p>${sv?`<span class="badge green">Đã xuất kho</span><br>Kho xuất: <b>${voucherWarehouse(sv)}</b><br>Mã phiếu: <b>${sv.code||''}</b><br><button class="btn ghost" onclick="printStock('${sv.id}')">Xem/In phiếu xuất kho</button><br><button class="btn primary" style="margin-top:6px" onclick="openSaleReturn('${s.id}')">Trả lại hàng bán</button>`:`<span class="badge ${saleNeedSupplementStock(s)?'red':'orange'}">${saleNeedSupplementStock(s)?'Cần xuất kho bổ sung':'Chưa xuất kho'}</span><br>Đơn này chưa tạo phiếu xuất kho.<br><button class="btn primary" onclick="createSupplementStockVoucher('${s.id}')">Tạo phiếu xuất kho bổ sung</button>`}</p></div></div><table><thead><tr><th>Model</th><th>Tên sản phẩm</th><th>SL</th><th>Đơn giá</th><th>CK dòng</th><th>Thành tiền</th></tr></thead><tbody>${(s.items||[]).map(it=>`<tr><td>${it.code}</td><td>${it.name||''}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${it.discountType==='amount'?money(it.discount||0):((it.discount||0)+'%')}</td><td>${money(lineNet(it))}</td></tr>`).join('')}</tbody></table><div class="total-box"><div>Tiền hàng gốc: <b>${money(s.goodsBeforeDiscount||0)}</b></div><div>CK dòng: <b>${money(s.lineDiscountTotal||0)}</b></div><div>CK tổng đơn: <b>${money(s.orderDiscountTotal||0)}</b></div><div>Tiền sau CK: <b>${money(s.subtotal||0)}</b></div><div>Phụ thu: <b>${money(s.surcharge||0)}</b></div><div>Tổng tiền: <b>${money(s.grand)}</b></div><div>Đã thu: <b>${money(pay.paidTotal)}</b></div><div>Còn nợ: <b>${money(pay.debtLeft)}</b></div></div>${returnHtml}${receiptHtml}</div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
window.editSale=id=>{
  const s=data.sales.find(x=>x.id===id);
  if(!s) return alert('Không tìm thấy phiếu bán cần sửa');

  // Phiếu đã thu tiền / đã xuất kho vẫn cho sửa thông tin khách hàng.
  // Để tránh lệch công nợ và tồn kho, nhân viên không được sửa tiền hàng/sản phẩm/kho trên phiếu đã khóa.
  if(saleLocked(s)&&currentPerm.role!=='Admin'){
    if(typeof window.editSaleCustomerFromSale==='function'){
      return window.editSaleCustomerFromSale(id);
    }
    return alert('Phiếu đã thu tiền hoặc đã xuất kho. Bạn chỉ được sửa thông tin khách hàng trên phiếu này.');
  }

  editingSale=id;
  if($('saleCode')) $('saleCode').value=s.code||'';
  if($('saleDate')) $('saleDate').value=s.date||today();
  const ci=saleCustomerInfo(s);
  if($('saleCustomerId')) $('saleCustomerId').value=s.customerId||'';
  if($('saleCustomerSearch')) $('saleCustomerSearch').value=ci.name||'';
  if($('saleCustomerPhone')) { $('saleCustomerPhone').value=ci.phone||''; window.__saleCustomerPhoneManual=false; }
  if($('saleCustomerType')) $('saleCustomerType').value=s.customerType||s.customerGroup||ci.type||'Khách lẻ';
  if($('saleCustomerAddress')) { $('saleCustomerAddress').value=ci.address||''; window.__saleCustomerAddressManual=false; }
  if($('saleStaff')) $('saleStaff').value=s.staffId||'';
  if($('saleTech')) $('saleTech').value=s.techId||'';
  if($('saleWarehouse')) $('saleWarehouse').value=s.warehouse||stockVoucherForSale(s)?.warehouse||defaultWarehouse();
  if($('saleVatMode')) $('saleVatMode').value=s.vatMode||'none';
  if($('salePaid')) $('salePaid').value=s.paid||0;
  if($('salePaymentMethod')) $('salePaymentMethod').value=s.paymentMethod||s.payMethod||'Tiền mặt';
  if($('saleCommissionPercent')) $('saleCommissionPercent').value=s.commissionPercent??salePercentDefault(s.staffId);if($('saleInstallStatus'))$('saleInstallStatus').value=s.installStatus||inferSaleInstallStatus(s);if($('saleInstallCompletedDate'))$('saleInstallCompletedDate').value=s.installCompletedDate||s.installCompleteDate||s.completedInstallDate||s.installedAt||s.installDate||'';
  if($('saleTechCost')) $('saleTechCost').value=s.techCost??techFeeDefault(s.techId);
  if($('saleTechFuel')) $('saleTechFuel').value=s.techFuel||0;
  if($('saleSurcharge')) $('saleSurcharge').value=s.surcharge||0;
  if($('saleOrderDiscountType')) $('saleOrderDiscountType').value=s.orderDiscountType||'none';
  if($('saleOrderDiscountValue')) $('saleOrderDiscountValue').value=s.orderDiscountValue||0;
  if($('saleExportStock')) $('saleExportStock').checked=!!s.stockExported;
  if($('saleExportStockSticky')) $('saleExportStockSticky').checked=!!s.stockExported;
  if($('saleNote')) $('saleNote').value=s.note||'';
  if($('saleItems')){
    $('saleItems').innerHTML='';
    (s.items||[]).forEach(addSaleItem);
  }
  updateSaleTotals();

  // Khi bấm Sửa từ Danh sách phiếu bán: tự chuyển về tab Phiếu bán hàng, không hiện popup hướng dẫn.
  showPage('sales');
  if(typeof window.showSalesTab==='function') window.showSalesTab('form');
  setTimeout(()=>{
    document.getElementById('salesFormTab')?.scrollIntoView({behavior:'smooth',block:'start'});
    document.getElementById('saleCustomerSearch')?.focus();
  },80);
  if(typeof showToast==='function') showToast('Đang sửa phiếu '+(s.code||''));
}
window.printSale=id=>{
  let s=data.sales.find(x=>x.id===id);
  if(!s) return alert('Không tìm thấy phiếu bán');
  let pay=salePaymentInfo(s);
  let staff=data.staff.find(x=>x.id===s.staffId)||{};
  let tech=data.staff.find(x=>x.id===s.techId)||{};
  let ci=saleCustomerInfo(s);let customerType=ci.type||s.customerType||s.customerGroup||'';
  let html=`<div class="print-a5">${printHeader('PHIẾU BÁN HÀNG')}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;border-bottom:1px solid #999;padding-bottom:8px;margin-bottom:8px;line-height:1.55">
    <div>
      <div><b>Mã phiếu:</b> ${s.code||''}</div>
      <div><b>Ngày:</b> ${s.date||''}</div>
      <div><b>Khách hàng:</b> ${ci.name||''}</div>
      <div><b>SĐT:</b> ${ci.phone||''}</div>
      <div><b>Mã KH:</b> ${ci.code||''}</div>
    </div>
    <div>
      <div><b>Đ/c:</b> ${ci.address||''}</div>
      <div><b>Loại khách:</b> ${customerType||''}</div>
      <div><b>Sale:</b> ${staff.name||''}</div>
      <div><b>Kỹ thuật:</b> ${tech.name||''}</div>
      <div><b>PTTT:</b> ${paymentMethodText(s.paymentMethod||s.payMethod)}</div>
    </div>
  </div>
  <table><thead><tr><th>STT</th><th>Model</th><th>Tên SP</th><th>SL</th><th>Đơn giá</th><th>CK</th><th>Thành tiền</th></tr></thead><tbody>${(s.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.code||''}</td><td>${it.name||''}</td><td>${it.qty||0}</td><td>${money(it.price||0)}</td><td>${it.discountType==='amount'?money(it.discount||0):((it.discount||0)+'%')}</td><td>${money(lineNet(it))}</td></tr>`).join('')}</tbody></table>
  <div style="display:flex;justify-content:flex-end;margin-top:10px">
    <div style="min-width:230px;line-height:1.65">
      <div style="display:flex;justify-content:space-between"><b>Tiền hàng:</b><span>${money(s.subtotal||s.grand)}</span></div>
      ${(s.discountTotal||0)>0?`<div style="display:flex;justify-content:space-between"><b>Giảm giá:</b><span>${money(s.discountTotal)}</span></div>`:''}
      ${(s.surcharge||0)>0?`<div style="display:flex;justify-content:space-between"><b>Phụ thu:</b><span>${money(s.surcharge)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:1px dashed #999;padding-top:4px;margin-top:4px"><span>Tổng thanh toán:</span><span>${money(s.grand)}</span></div>
      <div style="display:flex;justify-content:space-between"><b>Đã thu:</b><span>${money(pay.paidTotal)}</span></div>
      <div style="display:flex;justify-content:space-between"><b>Còn nợ:</b><span>${money(pay.debtLeft)}</span></div>
      <div style="display:flex;justify-content:space-between"><b>PTTT:</b><span>${paymentMethodText(s.paymentMethod||s.payMethod)}</span></div>
    </div>
  </div>
  <div style="border:1px solid #999;border-radius:4px;margin-top:12px;padding:10px;min-height:44px;line-height:1.5">
    <b>Số tiền bằng chữ:</b> ${numberToVietnamese(s.grand)}
  </div>
  <div style="display:flex;justify-content:space-between;text-align:center;margin-top:35px">
    <div>Khách hàng<br><small>(Ký, ghi rõ họ tên)</small><br><br><br></div>
    <div>Người bán<br><small>(Ký, ghi rõ họ tên)</small><br><br><br></div>
    <div>Kỹ thuật<br><small>(Ký, ghi rõ họ tên)</small><br><br><br></div>
  </div></div>`;
  doPrint(html)
}

function periodRange(period){
  const d=new Date();
  const iso=x=>x.toISOString().slice(0,10);
  if(period==='day') return {from:iso(d),to:iso(d)};
  if(period==='week'){
    const day=(d.getDay()+6)%7;
    const start=new Date(d); start.setDate(d.getDate()-day);
    const end=new Date(start); end.setDate(start.getDate()+6);
    return {from:iso(start),to:iso(end)};
  }
  if(period==='month'){
    const y=d.getFullYear(),m=d.getMonth();
    return {from:iso(new Date(y,m,1)),to:iso(new Date(y,m+1,0))};
  }
  if(period==='year'){
    const y=d.getFullYear();
    return {from:`${y}-01-01`,to:`${y}-12-31`};
  }
  return {from:'',to:''};
}

function readCommissionFilterFromForm(){
  const period=$('commissionPeriod')?.value||'all';
  const range=period==='custom'?{from:$('commissionFrom')?.value||'',to:$('commissionTo')?.value||''}:periodRange(period);
  if(period!=='custom'){
    if($('commissionFrom')) $('commissionFrom').value=range.from;
    if($('commissionTo')) $('commissionTo').value=range.to;
  }
  let staffId=$('commissionStaff')?.value||'';
  if(!canViewAllCommissions()){
    const own=currentStaffMatchIds();
    staffId=own[0]||'__NO_STAFF__';
    if($('commissionStaff')) $('commissionStaff').value=staffId;
  }
  return {
    q:($('commissionSearch')?.value||'').toLowerCase().trim(),
    dept:$('commissionDept')?.value||'',
    staffId,
    period,
    from:range.from||'',
    to:range.to||''
  };
}
window.refreshCommissionStaffOptions=()=>{
  const el=$('commissionStaff'); if(!el)return;
  const old=el.value;
  const dept=$('commissionDept')?.value||'';
  let list=data.staff.filter(x=>!dept||x.dept===dept);
  if(dept==='Sale') list=data.staff.filter(x=>x.dept==='Sale'||x.dept==='Quản lý');
  if(!canViewAllCommissions()){
    const own=currentStaffMatchIds();
    list=list.filter(x=>own.includes(x.id));
    el.disabled=true;
    el.innerHTML=list.length?list.map(x=>`<option value="${x.id}">${x.name} - ${x.dept||''}</option>`).join(''):'<option value="__NO_STAFF__">Chưa liên kết hồ sơ nhân viên</option>';
    if(list.length) el.value=list[0].id;
    return;
  }
  el.disabled=false;
  el.innerHTML='<option value="">Tất cả nhân viên</option>'+list.map(x=>`<option value="${x.id}">${x.name} - ${x.dept||''}</option>`).join('');
  if([...el.options].some(o=>o.value===old)) el.value=old;
};
window.commissionPeriodChanged=()=>{
  const period=$('commissionPeriod')?.value||'all';
  if(period!=='custom'){
    const range=periodRange(period);
    if($('commissionFrom')) $('commissionFrom').value=range.from;
    if($('commissionTo')) $('commissionTo').value=range.to;
  }
};
window.applyCommissionFilter=()=>{commissionAppliedFilter=readCommissionFilterFromForm();renderCommissions();};
window.resetCommissionFilter=()=>{
  if($('commissionSearch'))$('commissionSearch').value='';
  if($('commissionDept'))$('commissionDept').value='';
  refreshCommissionStaffOptions();
  if($('commissionStaff'))$('commissionStaff').value=canViewAllCommissions()?'':(currentStaffMatchIds()[0]||'__NO_STAFF__');
  if($('commissionPeriod'))$('commissionPeriod').value='all';
  if($('commissionFrom'))$('commissionFrom').value='';
  if($('commissionTo'))$('commissionTo').value='';
  commissionAppliedFilter={q:'',dept:'',staffId:'',period:'all',from:'',to:''};
  renderCommissions();
};
window.viewCommissionStaff=(staffId,dept='Sale')=>{
  if($('commissionDept'))$('commissionDept').value=dept;
  refreshCommissionStaffOptions();
  if($('commissionStaff'))$('commissionStaff').value=staffId;
  commissionAppliedFilter=readCommissionFilterFromForm();
  renderCommissions();
  $('commissionByOrder')?.closest('.panel')?.scrollIntoView({behavior:'smooth',block:'start'});
};
function commissionFilteredSales(){
  const f=commissionAppliedFilter||{q:'',dept:'',staffId:'',from:'',to:''};
  return commissionEligibleSales().filter(s=>{
    let d=String(s.date||'');
    if(f.from && d<f.from) return false;
    if(f.to && d>f.to) return false;
    if(f.dept==='Sale' && !s.staffId) return false;
    if(f.dept==='Kỹ thuật' && !s.techId) return false;
    if(f.staffId){
      if(f.dept==='Sale' && s.staffId!==f.staffId) return false;
      if(f.dept==='Kỹ thuật' && s.techId!==f.staffId) return false;
      if(!f.dept && s.staffId!==f.staffId && s.techId!==f.staffId) return false;
    }
    if(f.q){
      let txt=[s.code,s.customerName,s.customerPhone,s.customerCode,s.staffName,s.techName].join(' ').toLowerCase();
      if(!txt.includes(f.q)) return false;
    }
    return true;
  });
}
let incomeActiveTab='sale';
window.showIncomeTab=(tab)=>{incomeActiveTab=tab||'sale';document.querySelectorAll('.income-tab').forEach(el=>el.style.display='none');document.querySelectorAll('.income-'+incomeActiveTab).forEach(el=>el.style.display='block');};
function salaryBonusDeductByStaff(from='',to=''){const m={};data.salaries.forEach(x=>{if(from&&String(x.date||'')<from)return;if(to&&String(x.date||'')>to)return;const id=x.staffId||x.staffName||'none';m[id]=m[id]||{bonus:0,deduct:0};m[id].bonus+=+x.bonus||0;m[id].deduct+=+x.deduct||0;});return m;}
function employeeIncomeRows(){const f=commissionAppliedFilter||{};const sales=commissionFilteredSales();const map={};const add=(id,name)=>{id=id||name||'none';map[id]=map[id]||{id,name:name||'Chưa chọn',saleCommission:0,techCost:0,techFuel:0,bonus:0,deduct:0,total:0};return map[id];};sales.forEach(s=>{add(s.staffId,s.staffName||data.staff.find(x=>x.id===s.staffId)?.name).saleCommission+=saleCommissionValue(s);const t=add(s.techId,s.techName||data.staff.find(x=>x.id===s.techId)?.name);t.techCost+=+s.techCost||0;t.techFuel+=+s.techFuel||0;});const bd=salaryBonusDeductByStaff(f.from,f.to);Object.entries(bd).forEach(([id,v])=>{const st=data.staff.find(x=>x.id===id)||{};const r=add(id,st.name||id);r.bonus+=v.bonus;r.deduct+=v.deduct;});return Object.values(map).map(r=>({...r,total:(+r.saleCommission||0)+(+r.techCost||0)+(+r.techFuel||0)+(+r.bonus||0)-(+r.deduct||0)})).sort((a,b)=>b.total-a.total);}
function techPerformanceRows(){const rows=commissionFilteredSales();const map={};rows.forEach(s=>{const id=s.techId||'none';const name=s.techName||data.staff.find(x=>x.id===s.techId)?.name||'Chưa chọn kỹ thuật';map[id]=map[id]||{id,name,count:0,qty:0,techCost:0,techFuel:0,warranty:0};map[id].count++;map[id].qty+=(s.items||[]).reduce((a,it)=>a+(+it.qty||0),0);map[id].techCost+=+s.techCost||0;map[id].techFuel+=+s.techFuel||0;});activeWarranties().forEach(w=>{const sid=w.techId||'';let id=sid||Object.keys(map).find(k=>map[k].name&&map[k].name===w.techName)||'';if(!id)return;map[id]=map[id]||{id,name:w.techName||'Kỹ thuật',count:0,qty:0,techCost:0,techFuel:0,warranty:0};map[id].warranty++;});return Object.values(map).sort((a,b)=>b.count-a.count||b.qty-a.qty);}
function renderCommissions(){
  if(!$('commissionByStaff')||!$('commissionByOrder'))return;

  const rows=commissionFilteredSales();
  const bySale={};
  const byTech={};
  let totalRevenue=0,totalCommissionBase=0,totalSurcharge=0,totalDiscount=0,totalSaleCommission=0,totalTechCost=0,totalTechFuel=0;

  rows.forEach(s=>{
    const commissionBase=saleCommissionBaseValue(s);
    const saleCommissionAmt=saleCommissionValue(s);
    totalRevenue+=+s.grand||0;
    totalCommissionBase+=commissionBase;
    totalSurcharge+=+s.surcharge||0;
    totalDiscount+=+s.discountTotal||0;
    totalSaleCommission+=saleCommissionAmt;
    totalTechCost+=+s.techCost||0;
    totalTechFuel+=+s.techFuel||0;
    let saleKey=s.staffId||'none';
    let saleName=s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||'Chưa chọn sale';
    bySale[saleKey]=bySale[saleKey]||{id:saleKey,name:saleName,count:0,revenue:0,commissionBase:0,surcharge:0,discount:0,commission:0};
    bySale[saleKey].count++;
    bySale[saleKey].revenue+=+s.grand||0;
    bySale[saleKey].commissionBase+=commissionBase;
    bySale[saleKey].surcharge+=+s.surcharge||0;
    bySale[saleKey].discount+=+s.discountTotal||0;
    bySale[saleKey].commission+=saleCommissionAmt;

    let techKey=s.techId||'none';
    let techName=s.techName||data.staff.find(x=>x.id===s.techId)?.name||'Chưa chọn kỹ thuật';
    byTech[techKey]=byTech[techKey]||{name:techName,count:0,revenue:0,techCost:0,techFuel:0};
    byTech[techKey].count++;
    byTech[techKey].revenue+=+s.grand||0;
    byTech[techKey].techCost+=+s.techCost||0;
    byTech[techKey].techFuel+=+s.techFuel||0;
  });

  if($('commissionSummary')) $('commissionSummary').innerHTML=`<div>Tổng doanh thu đã thu đủ: <b>${money(totalRevenue)}</b></div><div>Doanh số tính HH: <b>${money(totalCommissionBase)}</b></div><div>Tổng phụ thu: <b>${money(totalSurcharge)}</b></div><div>Tổng chiết khấu: <b>${money(totalDiscount)}</b></div><div>Hoa hồng Sale: <b>${money(totalSaleCommission)}</b></div><div>Công kỹ thuật: <b>${money(totalTechCost)}</b></div><div>Tiền xăng KT: <b>${money(totalTechFuel)}</b></div><div>Tổng chi: <b>${money(totalSaleCommission+totalTechCost+totalTechFuel)}</b></div><div class="muted-small full">Chỉ tính hoa hồng cho phiếu bán đã thu đủ 100%.</div>`;

  $('commissionByStaff').innerHTML=Object.values(bySale)
    .sort((a,b)=>b.commission-a.commission)
    .map(v=>`<tr><td>${v.name}</td><td>${v.count}</td><td>${money(v.revenue)}</td><td>${money(v.commissionBase)}</td><td>${money(v.surcharge)}</td><td>${money(v.discount)}</td><td><b>${money(v.commission)}</b></td><td>${v.id==='none'?'':`<button class="btn ghost" onclick="viewCommissionStaff('${v.id}','Sale')">Xem chi tiết</button>`}</td></tr>`)
    .join('')||'<tr><td colspan="8">Không có dữ liệu hoa hồng Sale theo bộ lọc</td></tr>';

  if($('commissionByTech')){
    $('commissionByTech').innerHTML=Object.values(byTech)
      .sort((a,b)=>b.techCost-a.techCost)
      .map(v=>`<tr><td>${v.name}</td><td>${v.count}</td><td>${money(v.revenue)}</td><td><b>${money(v.techCost)}</b></td><td><b>${money(v.techFuel)}</b></td><td><b>${money((+v.techCost||0)+(+v.techFuel||0))}</b></td></tr>`)
      .join('')||'<tr><td colspan="6">Không có dữ liệu công kỹ thuật theo bộ lọc</td></tr>'; 
  }

  if($('commissionOrderTitle')){
    const f=commissionAppliedFilter||{};
    const staff=data.staff.find(x=>x.id===f.staffId);
    $('commissionOrderTitle').textContent=`🧾 Chi tiết đơn hàng (${rows.length} đơn${staff?' - '+staff.name:''})`;
  }
  $('commissionByOrder').innerHTML=rows.slice()
    .sort((a,b)=>String(b.date).localeCompare(String(a.date)))
    .map((s,idx)=>{const saleCom=saleCommissionValue(s);const itemSum=saleItemSummary(s);return `<tr><td class="text-center">${idx+1}</td><td>${s.date||''}</td><td>${s.code}</td><td>${saleCustomerInfo(s).name||''}</td><td>${itemSum.models||''}</td><td>${itemSum.qtyText||itemSum.totalQty||''}</td><td>${s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||''}</td><td>${s.techName||data.staff.find(x=>x.id===s.techId)?.name||''}</td><td>${money(s.grand)}</td><td>${money(s.surcharge||0)}</td><td>${money(s.discountTotal||0)}</td><td>${money(saleCommissionBaseValue(s))}</td><td>${s.commissionPercent||0}%</td><td><b>${money(saleCom)}</b></td><td><b>${money(s.techCost||0)}</b></td><td><b>${money(s.techFuel||0)}</b></td><td><b>${money(saleCom+(+s.techCost||0)+(+s.techFuel||0))}</b></td></tr>`})
    .join('')||'<tr><td colspan="17">Không có đơn bán theo bộ lọc</td></tr>'; 
  if($('employeeIncomeTable'))$('employeeIncomeTable').innerHTML=employeeIncomeRows().map(r=>`<tr><td><b>${r.name}</b></td><td>${money(r.saleCommission)}</td><td>${money(r.techCost)}</td><td>${money(r.techFuel)}</td><td>${money(r.bonus)}</td><td>${money(r.deduct)}</td><td><b>${money(r.total)}</b></td></tr>`).join('')||'<tr><td colspan="7">Không có dữ liệu thu nhập theo bộ lọc</td></tr>';
  if($('techPerformanceTable'))$('techPerformanceTable').innerHTML=techPerformanceRows().map(r=>`<tr><td><b>${r.name}</b></td><td>${r.count}</td><td>${r.qty}</td><td>${money(r.techCost)}</td><td>${money(r.techFuel)}</td><td>${r.warranty||0}</td></tr>`).join('')||'<tr><td colspan="6">Không có dữ liệu hiệu suất kỹ thuật</td></tr>';
  showIncomeTab(incomeActiveTab||'sale');
}
window.resetExpenseForm=()=>{editingExpense=null;$('exDate').value=today();renderExpenseCategoryOptions();$('exCategory').value=systemCategoryNames('expenseCategory')[0]||'Tiền điện';$('exAmount').value='';renderPaymentMethodOptions();if($('exPaymentMethod'))$('exPaymentMethod').value='Tiền mặt';$('exNote').value=''}
function isSalaryCategory(c){return /lương|luong|salary|payroll/i.test(String(c||''))}

let editingSalary=null;
window.resetSalaryForm=()=>{editingSalary=null;['salId','salDate','salStaff','salBase','salAllowance','salBonus','salDeduct','salNote'].forEach(i=>{if($(i))$(i).value=''});if($('salDate'))$('salDate').value=today();renderSalaries();}
window.saveSalary=async()=>{
  if(!has('manageSalary'))return alert('Bạn không có quyền quản lý lương');
  const base=+$('salBase').value||0, allowance=+$('salAllowance').value||0, bonus=+$('salBonus').value||0, deduct=+$('salDeduct').value||0;
  const total=base+allowance+bonus-deduct;
  const staff=data.staff.find(x=>x.id===$('salStaff').value)||{};
  const o={date:$('salDate').value||today(),staffId:$('salStaff').value||'',staffName:staff.name||'',base,allowance,bonus,deduct,total,note:$('salNote').value||'',updatedAt:serverTimestamp()};
  if(!o.staffId)return alert('Chọn nhân viên');
  if(total<0)return alert('Tổng lương không hợp lệ');
  if(editingSalary)await updateDoc(doc(db,'salaries',editingSalary),o);else await addDoc(col('salaries'),{...o,createdAt:serverTimestamp()});
  await logAction(editingSalary?'Sửa lương':'Thêm lương',`${o.staffName} ${o.total}`);
  resetSalaryForm();await loadAll();
}
function renderSalaries(){
  if(!$('salaryTable'))return;
  if(!has('viewSalary')&&!has('manageSalary'))return;
  fillSelect($('salStaff'),data.staff,s=>s.name+' - '+(s.dept||''),s=>s.id);
  const total=data.salaries.reduce((a,e)=>a+(+e.total||+e.amount||0),0);
  $('salaryTotal').textContent=money(total);
  const q=($('salarySearch')?.value||'').toLowerCase().trim();
  const rows=data.salaries.filter(e=>matchSearchText(q,e.date,e.staffName,e.base,e.allowance,e.bonus,e.deduct,e.total,e.amount,money(e.total||e.amount),e.note)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  if($('salarySearchCount'))$('salarySearchCount').textContent=`Hiển thị ${rows.length}/${data.salaries.length}`;
  $('salaryTable').innerHTML=rows.map(e=>`<tr><td>${e.date||''}</td><td>${e.staffName||''}</td><td>${money(e.base)}</td><td>${money(e.allowance)}</td><td>${money(e.bonus)}</td><td>${money(e.deduct)}</td><td><b>${money(e.total||e.amount)}</b></td><td>${e.note||''}</td><td>${has('manageSalary')?`<button class="btn ghost" onclick="editSalary('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('salaries','${e.id}')">Xóa</button>`:''}</td></tr>`).join('')||'<tr><td colspan="9">Không tìm thấy lương phù hợp</td></tr>';
}
window.clearSalarySearch=()=>{if($('salarySearch'))$('salarySearch').value='';renderSalaries();}
window.editSalary=id=>{if(!has('manageSalary'))return alert('Bạn không có quyền sửa lương');let e=data.salaries.find(x=>x.id===id);if(!e)return;editingSalary=id;$('salId').value=id;$('salDate').value=e.date||today();$('salStaff').value=e.staffId||'';$('salBase').value=e.base||0;$('salAllowance').value=e.allowance||0;$('salBonus').value=e.bonus||0;$('salDeduct').value=e.deduct||0;$('salNote').value=e.note||'';showPage('salaries')}

window.saveExpense=async()=>{let o={date:$('exDate').value||today(),category:$('exCategory').value,amount:+$('exAmount').value||0,paymentMethod:$('exPaymentMethod')?.value||'Tiền mặt',note:$('exNote').value||'',updatedAt:serverTimestamp()};if(!o.amount)return alert('Nhập số tiền chi phí');if(isSalaryCategory(o.category))return alert('Chi phí lương đã được tách sang mục Lương nhân viên. Vui lòng nhập tại menu Lương nhân viên.');if(editingExpense)await updateDoc(doc(db,'expenses',editingExpense),o);else await addDoc(col('expenses'),{...o,createdAt:serverTimestamp()});await logAction(editingExpense?'Sửa chi phí':'Thêm chi phí',o.category+' '+o.amount);resetExpenseForm();await loadAll()}
function renderExpenses(){if(!$('expenseTable'))return;let visibleExpenses=data.expenses.filter(e=>!isSalaryCategory(e.category));let total=visibleExpenses.reduce((a,e)=>a+(+e.amount||0),0);$('expenseTotal').textContent=money(total);const q=($('expenseSearch')?.value||'').toLowerCase().trim();let rows=visibleExpenses.filter(e=>matchSearchText(q,e.date,e.category,e.amount,money(e.amount),e.paymentMethod,e.note)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));if($('expenseSearchCount'))$('expenseSearchCount').textContent=`Hiển thị ${rows.length}/${visibleExpenses.length}`;$('expenseTable').innerHTML=rows.map(e=>`<tr><td>${e.date||''}</td><td>${e.category||''}</td><td>${money(e.amount)}</td><td>${paymentMethodBadge(e.paymentMethod||'Tiền mặt')}</td><td>${e.note||''}</td><td><button class="btn ghost" onclick="editExpense('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('expenses','${e.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="6">Không tìm thấy chi phí phù hợp</td></tr>'}
window.clearExpenseSearch=()=>{if($('expenseSearch'))$('expenseSearch').value='';renderExpenses();}
window.editExpense=id=>{let e=data.expenses.find(x=>x.id===id);if(!e)return;editingExpense=id;$('exDate').value=e.date||today();$('exCategory').value=e.category||'Khác';$('exAmount').value=e.amount||0;if($('exPaymentMethod'))$('exPaymentMethod').value=e.paymentMethod||'Tiền mặt';$('exNote').value=e.note||'';showPage('expenses')}


function debtClean(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ')}
function debtAddressKey(v){return debtClean(v).replace(/[.,;:]/g,'').replace(/\s+/g,' ')}
function debtSnapshotKey(o={}){
  const phone=normalizePhone(o.customerPhone||o.phone||'');
  const address=debtAddressKey(o.customerAddress||o.address||'');
  const code=debtClean(o.customerCode||o.code||'');
  const id=debtClean(o.customerId||o.id||'');
  if(phone && address) return `snap:${phone}|${address}`;
  if(phone) return `phone:${phone}`;
  if(code && address) return `snapcode:${code}|${address}`;
  if(code) return `code:${code}`;
  if(id) return `id:${id}`;
  return `tmp:${uid()}`;
}
function customerDebtKeyFromCustomer(c={}){return debtSnapshotKey({customerId:c.id,customerCode:ensureCustomerCode(c)||c.customerCode,customerPhone:c.phone,customerAddress:c.address})}
function findCustomerForSale(s={}){
  const sid=debtClean(s.customerId||'');
  if(sid){const c=data.customers.find(x=>debtClean(x.id)===sid); if(c) return c;}
  const phone=normalizePhone(s.customerPhone||s.phone||'');
  const address=debtAddressKey(s.customerAddress||s.address||'');
  if(phone && address){const c=data.customers.find(x=>normalizePhone(x.phone)===phone && debtAddressKey(x.address)===address); if(c) return c;}
  const code=debtClean(s.customerCode||'');
  if(code){const c=data.customers.find(x=>debtClean(ensureCustomerCode(x))===code); if(c) return c;}
  if(phone){const c=data.customers.find(x=>normalizePhone(x.phone)===phone); if(c) return c;}
  return null;
}
function findCustomerForReceipt(r={}){
  const sid=receiptSaleId(r);
  if(sid){const s=data.sales.find(x=>x.id===sid); if(s){const c=findCustomerForSale(s); if(c) return c;}}
  const rid=debtClean(r.customerId||'');
  if(rid){const c=data.customers.find(x=>debtClean(x.id)===rid); if(c) return c;}
  const phone=normalizePhone(r.customerPhone||r.phone||'');
  const address=debtAddressKey(r.customerAddress||r.address||'');
  if(phone && address){const c=data.customers.find(x=>normalizePhone(x.phone)===phone && debtAddressKey(x.address)===address); if(c) return c;}
  const code=debtClean(r.customerCode||'');
  if(code){const c=data.customers.find(x=>debtClean(ensureCustomerCode(x))===code); if(c) return c;}
  return null;
}
function saleDebtKey(s={}){return `sale:${s.id||s.code||uid()}`;}
function receiptDebtKey(r={}){
  const sid=receiptSaleId(r);
  if(sid) return `sale:${sid}`;
  if(r.debtKey && String(r.debtKey).startsWith('sale:')) return String(r.debtKey);
  // Phiếu thu cũ không có saleId không được tự động trừ vào công nợ để tránh trừ nhầm khách trùng tên.
  return `receipt:${r.id||uid()}`;
}
function debtGroupProducts(g){
  const m={};
  (g.sales||[]).forEach(s=>(s.items||[]).forEach(it=>{const code=it.code||it.model||''; if(!code)return; m[code]=(m[code]||0)+(+it.qty||0)}));
  return Object.entries(m).map(([code,qty])=>`${code} x${qty}`).join(', ');
}

function debtTotalQty(g){
  return (g?.sales||[]).reduce((sum,s)=>sum+(saleItemSummary(s).totalQty||0),0);
}
function debtGroupProductModels(g){
  const m={};
  (g?.sales||[]).forEach(s=>(s.items||[]).forEach(it=>{const code=it.code||it.model||''; if(!code)return; m[code]=(m[code]||0)+(+it.qty||0)}));
  return Object.keys(m).join(', ');
}
function productQtyTooltipFromItems(items=[]){
  const map={};
  items.forEach(it=>{const code=it.code||it.model||''; if(!code)return; map[code]=(map[code]||0)+(+it.qty||0)});
  return Object.entries(map).map(([code,qty])=>`${code} × ${qty}`).join(' | ');
}
function saleProductChipHtml(s){
  const sum=saleItemSummary(s);
  const chips=sum.items.slice(0,4).map(it=>`<span class="product-chip"><b>${htmlesc(it.code)}</b><em>×${+it.qty||0}</em></span>`).join('');
  const more=sum.items.length>4?`<span class="product-chip more">+${sum.items.length-4}</span>`:'';
  return chips+more || '<span class="muted-small">-</span>';
}
function isSaleToday(s){return String(s?.date||'')===today()}
function debtProductQtyTooltip(g){
  const map={};
  (g?.sales||[]).forEach(s=>(s.items||[]).forEach(it=>{const code=it.code||it.model||''; if(!code)return; map[code]=(map[code]||0)+(+it.qty||0)}));
  return Object.entries(map).map(([code,qty])=>`${code} × ${qty}`).join(' | ');
}

function customerFromDebtGroup(g){
  if(g.customer) return g.customer;
  const firstSale=g.sales?.[0]||{};
  const firstReceipt=g.receipts?.[0]||{};
  return {id:firstSale.customerId||firstReceipt.customerId||g.key,customerCode:firstSale.customerCode||firstReceipt.customerCode||'',name:firstSale.customerName||firstReceipt.customerName||'Chưa cập nhật tên khách',phone:firstSale.customerPhone||firstReceipt.customerPhone||'',address:firstSale.customerAddress||firstReceipt.customerAddress||'',type:firstSale.customerType||firstReceipt.customerType||firstSale.customerGroup||'Khách lẻ',openingDebt:0};
}
function calcDebtRows(){
  const rows=[];
  // Mỗi phiếu bán là một dòng công nợ riêng. Tuyệt đối không gom theo tên/khách.
  activeSales().forEach(s=>{
    const c=findCustomerForSale(s)||customerFromDebtGroup({key:saleDebtKey(s),sales:[s],receipts:[]});
    const receipts=receiptsForSalePayment(s);
    const total=+s.grand||0;
    const paid=saleDirectPaid(s)+receipts.reduce((a,r)=>a+(+r.amount||0),0);
    const rawDebt=total-paid;
    rows.push({debtKey:saleDebtKey(s),saleId:s.id,saleCode:s.code,customer:c,total,paid,debt:Math.max(0,rawDebt),overPaid:Math.max(0,-rawDebt),settled:total>0&&rawDebt<=0,sales:[s],receipts});
  });
  // Công nợ đầu kỳ nếu có thì là dòng riêng, không trộn vào phiếu bán.
  data.customers.filter(c=>(+c.openingDebt||0)>0).forEach(c=>{
    const related=activeReceipts().filter(r=>!receiptSaleId(r) && receiptDebtKey(r)===`opening:${c.id}`);
    const paid=related.reduce((a,r)=>a+(+r.amount||0),0);
    const total=+c.openingDebt||0;
    const rawDebt=total-paid;
    rows.push({debtKey:`opening:${c.id}`,saleId:'',saleCode:'Công nợ đầu kỳ',customer:c,total,paid,debt:Math.max(0,rawDebt),overPaid:Math.max(0,-rawDebt),settled:total>0&&rawDebt<=0,sales:[],receipts:related});
  });
  return rows.filter(x=>x.total||x.paid||x.debt||x.overPaid);
}
function calcDebts(){return calcDebtRows().filter(x=>x.debt>0)}
function calcSettledDebts(){return calcDebtRows().filter(x=>x.settled).sort((a,b)=>String(a.saleCode||'').localeCompare(String(b.saleCode||'')))}
function dateDaysBetween(a,b){const da=new Date(a||today()), db=new Date(b||today());if(isNaN(da)||isNaN(db))return 0;return Math.floor((db-da)/(24*3600*1000));}
function debtSaleDate(d){return d.sales?.[0]?.date||'';}
function debtOverdueDays(d){return d.debt>0?Math.max(0,dateDaysBetween(debtSaleDate(d),today())-30):0;}
function debtSettledDate(d){const dates=(d.receipts||[]).map(r=>r.date).filter(Boolean).sort();return dates[dates.length-1]||'';}
function debtCurrentFilter(){return document.querySelector('input[name="debtStatusFilter"]:checked')?.value||'deposit_pending_install';}

function fillReceiptCustomerOptions(includeAll=false, includeSettled=false){
  const el=$('receiptCustomer'); if(!el)return;
  const rows=(includeSettled?calcDebtRows():calcDebts()).sort((a,b)=>String(a.saleCode||'').localeCompare(String(b.saleCode||'')) || (b.debt-a.debt));
  if(!includeAll){
    el.innerHTML='<option value="">-- Chọn công nợ theo từng phiếu bán --</option>'+rows.map(d=>{const ci=customerInfo(d.customer);const st=d.debt>0?`Còn nợ ${money(d.debt)}`:(d.overPaid>0?`Thu dư ${money(d.overPaid)}`:'Đã tất toán');return `<option value="debtkey:${encodeURIComponent(d.debtKey)}">${d.saleCode||''} | ${ci.code} - ${ci.name}${ci.phone?' - '+ci.phone:''}${ci.address?' - '+ci.address:''} | ${st}</option>`}).join('');
    return;
  }
  el.innerHTML='<option value="">-- Chọn khách --</option>'+data.customers.map(c=>`<option value="${c.id}">${customerShortLabel(c)}</option>`).join('');
}
function debtRowText(d){const ci=customerInfo(d.customer);return [ci.code,ci.name,ci.phone,ci.address,ci.type,debtGroupProducts(d),d.total,d.paid,d.debt,money(d.total),money(d.paid),money(d.debt)].join(' ').toLowerCase()}
function renderDebts(){
  const q=($('debtSearch')?.value||'').toLowerCase().trim();
  const activeAll=calcDebts().sort((a,b)=>b.debt-a.debt);
  const settledAll=calcSettledDebts();
  const allRows=calcDebtRows().sort((a,b)=>String(b.saleCode||'').localeCompare(String(a.saleCode||'')));
  const filter=debtCurrentFilter();
  const depositPendingAll=activeAll.filter(d=>debtWorkflowType(d)==='deposit_pending_install');
  const installedUnpaidAll=activeAll.filter(d=>debtWorkflowType(d)==='installed_unpaid');
  const visibleBase=filter==='deposit_pending_install'?depositPendingAll:(filter==='installed_unpaid'?installedUnpaidAll:(filter==='settled'?settledAll:(filter==='all'?allRows:activeAll)));
  const rows=visibleBase.filter(d=>!q||debtRowText(d).includes(q));
  const settled=settledAll.filter(d=>!q||debtRowText(d).includes(q));
  const overdue=activeAll.filter(d=>debtOverdueDays(d)>0);
  if($('debtActiveCount'))$('debtActiveCount').textContent=activeAll.length;
  if($('debtActiveTotal'))$('debtActiveTotal').textContent=money(activeAll.reduce((a,d)=>a+d.debt,0));
  if($('debtSettledCount'))$('debtSettledCount').textContent=settledAll.length;
  if($('debtOverdueTotal'))$('debtOverdueTotal').textContent=money(overdue.reduce((a,d)=>a+d.debt,0));
  if($('debtStatsBox'))$('debtStatsBox').innerHTML=`<div><span>Đã cọc - Chưa lắp</span><b>${money(depositPendingAll.reduce((a,d)=>a+d.debt,0))}</b><small>${depositPendingAll.length} phiếu</small></div><div><span>Đã lắp - Chưa thanh toán</span><b>${money(installedUnpaidAll.reduce((a,d)=>a+d.debt,0))}</b><small>${installedUnpaidAll.length} phiếu</small></div><div><span>Tổng công nợ</span><b>${money(activeAll.reduce((a,d)=>a+d.debt,0))}</b></div><div><span>Đã tất toán</span><b>${money(settledAll.reduce((a,d)=>a+d.total,0))}</b></div><div><span>Quá hạn</span><b>${money(overdue.reduce((a,d)=>a+d.debt,0))}</b></div>`;
  document.querySelectorAll('.debt-active-panel').forEach(el=>el.style.display=(filter==='settled')?'none':'');
  document.querySelectorAll('.settled-panel').forEach(el=>el.style.display=(filter==='settled'||filter==='all')?'':'none');
  if($('debtSearchCount'))$('debtSearchCount').textContent=`Hiển thị ${rows.length}/${visibleBase.length} dòng`;
  $('debtTable').innerHTML=rows.map(d=>{const ci=customerInfo(d.customer);const productText=debtGroupProductModels(d)||'-';const productTip=debtProductQtyTooltip(d);const qty=debtTotalQty(d);const od=debtOverdueDays(d);return `<tr>
    <td><b>${d.saleCode||''}</b><small>${ci.code||''}</small></td>
    <td><b>${ci.name}</b><small>${ci.phone||''}${ci.address?' • '+ci.address:''}</small></td>
    <td class="text-center"><b>${qty}</b></td>
    <td class="debt-products" title="${productTip}"><small>${productText}</small><br>${debtWorkflowBadge(d)}</td>
    <td>${money(d.total)}</td>
    <td>${money(d.paid)}</td>
    <td><b class="${d.debt>0?'text-danger debt-money':''}">${money(d.debt)}</b></td>
    <td>${debtSaleDate(d)||''}</td>
    <td>${od?`<span class="badge red">${od} ngày</span>`:'-'}</td>
    <td>${d.debt>0?`<button class="btn primary debt-action" onclick="receiptFor('${encodeURIComponent(d.debtKey)}')">Thu tiền</button>`:'<span class="badge green">Đã tất toán</span>'}</td>
  </tr>`}).join('')||'<tr><td colspan="10">Không tìm thấy công nợ phù hợp</td></tr>';
  if($('settledDebtTable'))$('settledDebtTable').innerHTML=settled.map((d,idx)=>{const ci=customerInfo(d.customer);const productText=debtGroupProductModels(d)||'-';const productTip=debtProductQtyTooltip(d);return `<tr class="settled-row"><td>${idx+1}</td><td>${d.saleCode||''}</td><td><b>${ci.name}</b><small>${ci.code||''}</small></td><td>${ci.phone||''}</td><td class="text-center"><b>${debtTotalQty(d)}</b></td><td title="${productTip}"><small>${productText}</small></td><td>${money(d.total)}</td><td>${money(d.paid)}</td><td>${debtSettledDate(d)}</td></tr>`}).join('')||'<tr><td colspan="9">Không tìm thấy công nợ đã tất toán phù hợp</td></tr>';
}
window.clearDebtSearch=()=>{if($('debtSearch'))$('debtSearch').value='';renderDebts();}
window.resetReceiptForm=()=>{editingReceipt=null;fillReceiptCustomerOptions();$('receiptCustomer').value='';$('receiptAmount').value='';renderPaymentMethodOptions();if($('receiptPaymentMethod'))$('receiptPaymentMethod').value=DEFAULT_RECEIPT_PAYMENT_METHOD;$('receiptDate').value=today();$('receiptNote').value=''}
window.receiptFor=keyEnc=>{const key=decodeURIComponent(keyEnc||'');let d=calcDebts().find(x=>x.debtKey===key)||calcDebtRows().find(x=>x.debtKey===key);if(d&&d.debt<=0)return alert('Phiếu này đã thu đủ tiền. Admin có thể sửa phiếu thu trong danh sách Phiếu thu nếu nhập sai.');resetReceiptForm();if(d){$('receiptCustomer').value='debtkey:'+encodeURIComponent(d.debtKey);if(d.debt>0)$('receiptAmount').value=d.debt;}$('receiptDate').value=today();showPage('debts');setTimeout(()=>$('receiptAmount')?.focus(),0)};window.openReceiptForm=()=>{resetReceiptForm();showPage('debts');setTimeout(()=>$('receiptCustomer')?.focus(),0)}
function receiptDebtRowForEdit(r={}){const sid=receiptSaleId(r);let key=r.debtKey||'';if(sid)key=`sale:${sid}`;if(key)return calcDebtRows().find(x=>x.debtKey===key)||null;if(r.saleCode){const s=data.sales.find(x=>x.code===r.saleCode);if(s)return calcDebtRows().find(x=>x.saleId===s.id)||null;}return null;}
window.saveReceipt=async()=>{let cid=$('receiptCustomer').value,amount=+$('receiptAmount').value||0;if(!cid||!amount)return alert('Chọn đúng phiếu công nợ và nhập số tiền');let d=null,c=null,ci=null,receiptKey='',oldReceipt=editingReceipt?data.receipts.find(x=>x.id===editingReceipt):null;if(editingReceipt&&currentPerm.role!=='Admin')return alert('Chỉ Admin được sửa phiếu thu đã lưu để đảm bảo doanh thu, công nợ và hoa hồng không bị lệch.');if(String(cid).startsWith('debtkey:')){receiptKey=decodeURIComponent(String(cid).slice(8));d=calcDebtRows().find(x=>x.debtKey===receiptKey);if(!d)return alert('Không tìm thấy công nợ cần thu. Vui lòng tải lại màn hình.');ci=customerInfo(d.customer);c=data.customers.find(x=>x.id===d.customer.id)||{};}else{return alert('Vui lòng chọn một dòng công nợ theo phiếu bán. Không thu tiền theo tên khách để tránh trừ nhầm.')}if(d&&d.debt<=0&&!editingReceipt)return alert('Phiếu này đã thu đủ tiền, không còn công nợ phải thu.');const oldAmount=editingReceipt?(+oldReceipt?.amount||0):0;const available=(+d.debt||0)+oldAmount;if(d&&amount>available&&!confirm(`Số tiền thu ${money(amount)} lớn hơn số còn có thể thu ${money(available)}. Nếu tiếp tục, phiếu sẽ bị thu dư. Vẫn lưu?`))return;if(editingReceipt){const changed=oldAmount!==amount || String(oldReceipt?.date||'')!==String($('receiptDate').value||today());if(changed){const reason=prompt('Nhập lý do sửa phiếu thu (bắt buộc):','');if(!String(reason||'').trim())return alert('Sửa phiếu thu bắt buộc nhập lý do.');$('receiptNote').value=(`${$('receiptNote').value||''} | Lý do sửa: ${reason}`).trim();}}
const firstSale=d?.sales?.[0]||{};let o={customerId:c.id||firstSale.customerId||'',customerCode:ci.code,customerName:ci.name,customerPhone:ci.phone,customerAddress:ci.address,customerType:ci.type,amount,paymentMethod:normalizePaymentMethod($('receiptPaymentMethod')?.value)||DEFAULT_RECEIPT_PAYMENT_METHOD,date:$('receiptDate').value||today(),note:$('receiptNote').value||'',debtKey:receiptKey||'',saleId:firstSale.id||'',saleCode:firstSale.code||'',updatedAt:serverTimestamp()};if(editingReceipt){await updateDoc(doc(db,'receipts',editingReceipt),o);await logAction('Sửa phiếu thu',`${o.saleCode||''} ${o.customerName} ${money(oldAmount)} -> ${money(o.amount)} | ${o.note||''}`)}else{await addDoc(col('receipts'),{code:nextCode('PT',data.receipts),...o,createdAt:serverTimestamp()});await logAction('Thêm phiếu thu',`${o.saleCode||''} ${o.customerName} ${o.amount}`)}resetReceiptForm();await loadAll();if(o.saleId) await updatePaymentStatusForSaleSnapshot(o.saleId);await loadAll()}
window.editReceipt=id=>{let r=data.receipts.find(x=>x.id===id);if(!r)return;if(currentPerm.role!=='Admin')return alert('Chỉ Admin được sửa phiếu thu đã lưu.');editingReceipt=id;fillReceiptCustomerOptions(false,true);let d=receiptDebtRowForEdit(r);let key=d?.debtKey||r.debtKey||(r.saleId?`sale:${r.saleId}`:'');if(key&&!([...$('receiptCustomer').options].some(o=>o.value==='debtkey:'+encodeURIComponent(key)))){const ci=customerInfo(d?.customer||findCustomerForReceipt(r)||{});$('receiptCustomer').insertAdjacentHTML('beforeend',`<option value="debtkey:${encodeURIComponent(key)}">${r.saleCode||d?.saleCode||''} | ${ci.code||r.customerCode||''} - ${ci.name||r.customerName||''} | Phiếu đang sửa</option>`);}$('receiptCustomer').value=key?'debtkey:'+encodeURIComponent(key):'';$('receiptAmount').value=r.amount||0;if($('receiptPaymentMethod'))$('receiptPaymentMethod').value=receiptEffectivePaymentMethod(r);$('receiptDate').value=r.date||today();$('receiptNote').value=r.note||'';showPage('debts');setTimeout(()=>$('receiptAmount')?.focus(),0)}
function receiptsForSale(s){
  // ERP-FIX V4: Phiếu thu chỉ đi theo đúng phiếu bán.
  // Không phân bổ theo customerId/tên/SĐT để tránh khách trùng tên hoặc nhiều đơn của cùng khách bị trừ nhầm.
  if(isSaleCanceled(s))return [];
  return receiptsForSalePayment(s).map(r=>({...r, allocatedAmount:+r.amount||0}));
}
window.printReceipt=id=>{
  let r=data.receipts.find(x=>x.id===id);
  if(!r)return alert('Không tìm thấy phiếu thu');
  let c=data.customers.find(x=>x.id===r.customerId)||{};
  let s=data.sales.find(x=>(r.saleId&&x.id===r.saleId)||(r.saleCode&&x.code===r.saleCode))||{};
  let ci=s.id?saleCustomerInfo(s):customerInfo(c);
  ci={...ci,code:r.customerCode||ci.code||ensureCustomerCode(c)||'',name:r.customerName||ci.name||'',phone:r.customerPhone||ci.phone||'',address:r.customerAddress||ci.address||'',type:r.customerType||ci.type||''};
  let salePay=s.id?salePaymentInfo(s):null;
  let paidBefore=salePay?Math.max(0,(+salePay.paid||0)-(+r.amount||0)):'';
  let debtAfter=salePay?salePay.debtLeft:'';
  let debtBefore=salePay?(debtAfter+(+r.amount||0)):'';
  let items=(s.items||[]);
  let itemRows=items.length?items.map((it,i)=>`<tr><td class="c">${i+1}</td><td><b>${htmlesc(it.code||'')}</b><br><small>${htmlesc(it.name||'')}</small></td><td class="c">${it.qty||0}</td><td class="r">${money(lineNet(it))}</td></tr>`).join(''):`<tr><td class="c">1</td><td><b>${htmlesc(r.saleCode||r.code||'')}</b><br><small>Thu tiền công nợ / thanh toán</small></td><td class="c">1</td><td class="r">${money(r.amount)}</td></tr>`;
  let purpose = r.note || (s.code ? `Thu tiền theo phiếu bán ${s.code}` : 'Thu tiền khách hàng');
  let html=`<div class="print-a5 receipt-a5">
    <div class="receipt-brand">
      <div><b>SIMILOCK ĐÀ NẴNG</b><br><span>Đ/c: 223 Trường Chinh, P. An Khê, TP. Đà Nẵng</span><br><span>CN HCM: 403 Nguyễn Thái Bình, P. Bảy Hiền, TP.HCM</span><br><span>Hotline: 0905.244.009</span></div>
      <div class="receipt-code"><b>${r.code||''}</b><span>${r.date||''}</span></div>
    </div>
    <h2>PHIẾU THU</h2>
    <div class="receipt-sub">Khổ in A5 • Giá trị thu tiền / công nợ</div>

    <div class="receipt-info">
      <div class="box"><h4>Thông tin khách hàng</h4>
        <p><b>Mã KH:</b> ${htmlesc(ci.code||'')}</p>
        <p><b>Khách hàng:</b> ${htmlesc(ci.name||'')}</p>
        <p><b>SĐT:</b> ${htmlesc(ci.phone||'')}</p>
        <p><b>Địa chỉ:</b> ${htmlesc(ci.address||'')}</p>
      </div>
      <div class="box"><h4>Thông tin thanh toán</h4>
        <p><b>Phiếu bán:</b> ${htmlesc(r.saleCode||s.code||'')}</p>
        <p><b>Phương thức:</b> ${paymentMethodText(receiptEffectivePaymentMethod(r))}</p>
        <p><b>Người thu:</b> ${htmlesc(currentUser?.email||'')}</p>
        <p><b>Loại khách:</b> ${htmlesc(ci.type||'')}</p>
      </div>
    </div>

    <div class="receipt-purpose"><b>Nội dung thu:</b> ${htmlesc(purpose)}</div>
    <table class="receipt-items"><thead><tr><th style="width:10%">STT</th><th>Nội dung / Model</th><th style="width:12%">SL</th><th style="width:25%">Số tiền</th></tr></thead><tbody>${itemRows}</tbody></table>

    <div class="receipt-bottom">
      <div class="receipt-words"><b>Số tiền bằng chữ:</b><br>${numberToVietnamese(r.amount)}</div>
      <div class="receipt-total">
        ${s.id?`<p><span>Doanh số phiếu bán</span><b>${money(s.grand||0)}</b></p>`:''}
        ${salePay?`<p><span>Đã thu trước phiếu này</span><b>${money(paidBefore)}</b></p>`:''}
        ${salePay?`<p><span>Công nợ trước thu</span><b>${money(debtBefore)}</b></p>`:''}
        <p class="main"><span>Số tiền thu</span><b>${money(r.amount)}</b></p>
        ${salePay?`<p><span>Còn nợ sau thu</span><b>${money(debtAfter)}</b></p>`:''}
      </div>
    </div>

    <div class="receipt-note"><b>Ghi chú:</b> ${htmlesc(r.note||'')}</div>
    <div class="sign-row"><div>Người nộp tiền<br><small>(Ký, ghi rõ họ tên)</small></div><div>Người thu tiền<br><small>(Ký, ghi rõ họ tên)</small></div><div>Kế toán / Quản lý<br><small>(Ký, ghi rõ họ tên)</small></div></div>
  </div>`;
  doPrint(html)
}
function renderReceipts(){
  const q=($('receiptSearch')?.value||'').toLowerCase().trim();
  const rows=activeReceipts().filter(r=>{const c=data.customers.find(x=>x.id===r.customerId)||{};const ci=customerInfo(c);return matchSearchText(q,r.code,r.date,r.customerCode,ci.code,r.customerName,ci.name,r.customerPhone,ci.phone,r.customerAddress,ci.address,r.amount,money(r.amount),receiptEffectivePaymentMethod(r),r.paymentMethod,r.note)}).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  if($('receiptSearchCount'))$('receiptSearchCount').textContent=`Hiển thị ${rows.length}/${activeReceipts().length}`;
  $('receiptTable').innerHTML=rows.map(r=>{const c=data.customers.find(x=>x.id===r.customerId)||{};const ci=customerInfo(c);return `<tr><td>${r.code||''}</td><td>${r.date||''}</td><td>${r.customerCode||ci.code||''}</td><td>${r.customerName||ci.name||''}</td><td>${money(r.amount)}</td><td>${paymentMethodBadge(receiptEffectivePaymentMethod(r))}</td><td>${r.note||''}</td><td><button class="btn ghost" onclick="printReceipt('${r.id}')">In</button> ${currentPerm.role==='Admin'?`<button class="btn ghost" onclick="editReceipt('${r.id}')">Sửa</button>`:''} <button class="btn danger" onclick="removeDoc('receipts','${r.id}')">Xóa</button></td></tr>`}).join('')||'<tr><td colspan="8">Không tìm thấy phiếu thu phù hợp</td></tr>'
}
window.clearReceiptSearch=()=>{if($('receiptSearch'))$('receiptSearch').value='';renderReceipts();}

function cashbookRange(){
  const from=$('cashbookFrom')?.value||monthStart();
  const to=$('cashbookTo')?.value||monthEnd();
  return {from,to};
}
function saleForReceipt(r={}){
  const sid=receiptSaleId(r);
  if(sid){const s=data.sales.find(x=>String(x.id||'')===String(sid)); if(s)return s;}
  if(r.saleCode){const s=data.sales.find(x=>String(x.code||'')===String(r.saleCode)); if(s)return s;}
  if(r.debtKey && String(r.debtKey).startsWith('sale:')){const id=String(r.debtKey).slice(5); const s=data.sales.find(x=>String(x.id||'')===id); if(s)return s;}
  return null;
}
function normalizePaymentMethod(v){
  const m=String(v??'').trim();
  if(isUnknownPaymentMethod(m))return '';
  return m;
}
function receiptEffectivePaymentMethod(r={}){
  const direct=normalizePaymentMethod(r.paymentMethod||r.payMethod||r.method);
  if(direct)return direct;
  const s=saleForReceipt(r);
  const fromSale=normalizePaymentMethod(s?.paymentMethod||s?.payMethod||s?.method);
  if(fromSale)return fromSale;
  // Theo yêu cầu V95: mọi phiếu thu chưa xác định phương thức được quy về Chuyển khoản.
  return DEFAULT_RECEIPT_PAYMENT_METHOD;
}
async function normalizeUnknownReceiptPaymentMethods(){
  if(!db || !Array.isArray(data.receipts) || !data.receipts.length)return;
  const rows=data.receipts.filter(r=>r && r.id && !isReceiptCanceled(r) && isUnknownPaymentMethod(r.paymentMethod||r.payMethod||r.method));
  if(!rows.length)return;
  for(const r of rows){
    try{
      await updateDoc(doc(db,'receipts',r.id),{paymentMethod:DEFAULT_RECEIPT_PAYMENT_METHOD,updatedAt:serverTimestamp()});
      r.paymentMethod=DEFAULT_RECEIPT_PAYMENT_METHOD;
    }catch(e){console.warn('Không cập nhật phương thức thanh toán phiếu thu '+(r.code||r.id),e.message)}
  }
}
function financeDocDate(obj={}){
  return reportDateValue(obj.date||obj.paymentDate||obj.createdDate||obj.createdAt||'');
}
function cashbookRows(from='',to=''){
  from=from||$('cashbookFrom')?.value||monthStart();
  to=to||$('cashbookTo')?.value||monthEnd();
  const rows=[];
  const seen=new Set();
  const pushRow=(r)=>{
    if(!r.date || r.date<from || r.date>to)return;
    const key=[r.source,r.id||'',r.code||'',r.type,r.date,r.income||0,r.expense||0].join('|');
    if(seen.has(key))return;
    seen.add(key);
    rows.push(r);
  };

  // 1) Phiếu thu: tiền vào đã lập chứng từ thu.
  // Không dùng ngày mặc định nếu phiếu thiếu ngày để tránh cộng nhầm vào kỳ hiện tại.
  uniqueReceiptsForFinance(activeReceipts()).forEach(r=>{
    const amount=+r.amount||0; if(amount<=0)return;
    const date=financeDocDate(r); if(!date)return;
    const customer=r.customerName||customerInfo(data.customers.find(c=>c.id===r.customerId)||{}).name||'';
    const sale=saleForReceipt(r);
    pushRow({
      id:r.id||'',date,code:r.code||'',type:'Thu',
      content:`Phiếu thu ${r.saleCode||sale?.code?('cho '+(r.saleCode||sale?.code||'')):''}${customer?(' - '+customer):''}`.trim(),
      paymentMethod:receiptEffectivePaymentMethod(r),income:amount,expense:0,source:'receipt'
    });
  });

  // 2) Thu trực tiếp trên Phiếu bán: đây cũng là tiền thực nhận nếu người dùng nhập "Đã thu" ngay khi tạo phiếu.
  // Không được bỏ khỏi Sổ quỹ, nếu không Dashboard Thu theo đơn và Sổ quỹ sẽ thấp hơn thực tế.
  // Dữ liệu hiện tại KHÔNG tự sinh Phiếu thu khi nhập đã thu ở Phiếu bán, nên cần ghi dòng tiền riêng.
  activeSales().forEach(s=>{
    const amount=saleDirectPaid(s); if(amount<=0)return;
    const date=financeDocDate({date:s.date,createdDate:s.createdDate,createdAt:s.createdAt}); if(!date)return;
    const ci=saleCustomerInfo(s);
    pushRow({
      id:s.id||'',date,code:s.code||'',type:'Thu',
      content:`Thu trực tiếp trên phiếu bán ${s.code||''}${ci.name?(' - '+ci.name):''}`.trim(),
      paymentMethod:normalizePaymentMethod(s.paymentMethod||s.payMethod||s.method)||'Tiền mặt',income:amount,expense:0,source:'sale_direct'
    });
  });

  // 3) Phiếu chi/chi phí. Chỉ lấy chứng từ có ngày hợp lệ.
  data.expenses.filter(e=>!isSalaryCategory(e.category)).forEach(e=>{
    const amount=+e.amount||0; if(amount<=0)return;
    const date=financeDocDate(e); if(!date)return;
    pushRow({id:e.id||'',date,code:e.code||'',type:'Chi',content:`Phiếu chi ${e.category||'Khác'}${e.note?' - '+e.note:''}`,paymentMethod:normalizePaymentMethod(e.paymentMethod)||'Tiền mặt',income:0,expense:amount,source:'expense'});
  });

  // 4) Chi lương.
  data.salaries.forEach(e=>{
    const amount=+(e.total||e.amount)||0; if(amount<=0)return;
    const date=financeDocDate(e); if(!date)return;
    pushRow({id:e.id||'',date,code:e.code||'',type:'Chi',content:`Chi lương ${e.staffName||''}${e.note?' - '+e.note:''}`,paymentMethod:normalizePaymentMethod(e.paymentMethod)||'Tiền mặt',income:0,expense:amount,source:'salary'});
  });

  return rows.sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.code).localeCompare(String(b.code)));
}

function paymentMethodSummary(from,to){
  const map={};
  cashbookRows(from,to).forEach(r=>{const k=paymentMethodText(r.paymentMethod);map[k]=map[k]||{method:k,income:0,expense:0,net:0,count:0};map[k].income+=r.income;map[k].expense+=r.expense;map[k].net+=r.income-r.expense;map[k].count++});
  return Object.values(map).sort((a,b)=>b.income-a.income||b.net-a.net);
}
function renderCashbook(){
  if(!$('cashbookTable'))return;
  if(!$('cashbookFrom').value)$('cashbookFrom').value=monthStart();
  if(!$('cashbookTo').value)$('cashbookTo').value=monthEnd();
  const {from,to}=cashbookRange(); const method=$('cashbookMethod')?.value||'ALL'; const q=($('cashbookSearch')?.value||'').toLowerCase().trim();
  let rows=cashbookRows(from,to).filter(r=>(method==='ALL'||r.paymentMethod===method)&&matchSearchText(q,r.date,r.code,r.type,r.content,r.paymentMethod,r.income,r.expense,money(r.income),money(r.expense)));
  const income=rows.reduce((a,r)=>a+r.income,0), expense=rows.reduce((a,r)=>a+r.expense,0), net=income-expense;
  const opening=+$('cashbookOpening')?.value||0;
  const closing=opening+net;
  $('cashbookSummary').innerHTML=`<div class="report-card">Số dư đầu kỳ<b>${money(opening)}</b><small>Nhập tay theo số quỹ thực tế đầu kỳ</small></div><div class="report-card">Tổng thu sổ quỹ<b>${money(income)}</b><small>Dòng tiền vào theo ngày thu: Phiếu thu + thu trực tiếp hợp lệ</small></div><div class="report-card">Tổng chi sổ quỹ<b>${money(expense)}</b><small>Chỉ lấy Phiếu chi + lương theo ngày chứng từ</small></div><div class="report-card">Số dư cuối kỳ<b>${money(closing)}</b><small>= Số dư đầu kỳ + Thu - Chi</small></div><div class="report-card">Giao dịch thu / chi<b>${rows.filter(r=>r.income>0).length} / ${rows.filter(r=>r.expense>0).length}</b></div>`;
  let run=opening;
  $('cashbookTable').innerHTML=rows.map(r=>{run+=r.income-r.expense;return `<tr><td>${r.date}</td><td><b>${r.code}</b></td><td><span class="badge ${r.type==='Thu'?'green':'orange'}">${r.type}</span></td><td>${htmlesc(r.content)}</td><td>${paymentMethodBadge(r.paymentMethod)}</td><td><b>${r.income?money(r.income):''}</b></td><td><b>${r.expense?money(r.expense):''}</b></td><td><b>${money(run)}</b></td></tr>`}).join('')||'<tr><td colspan="8">Không có phát sinh sổ quỹ trong kỳ</td></tr>';
}
window.renderCashbook=renderCashbook;
window.clearCashbookFilter=()=>{if($('cashbookFrom'))$('cashbookFrom').value=monthStart();if($('cashbookTo'))$('cashbookTo').value=monthEnd();if($('cashbookOpening'))$('cashbookOpening').value=0;if($('cashbookMethod'))$('cashbookMethod').value='ALL';if($('cashbookSearch'))$('cashbookSearch').value='';renderCashbook();}
window.printCashbook=()=>{
  const {from,to}=cashbookRange(); const rows=cashbookRows(from,to); const income=rows.reduce((a,r)=>a+r.income,0), expense=rows.reduce((a,r)=>a+r.expense,0); const opening=+$('cashbookOpening')?.value||0; const closing=opening+income-expense;
  const html=`<div class="print-a5"><div style="text-align:center"><b>SIMILOCK ĐÀ NẴNG</b><br>Đ/c: 223 Trường Chinh, P. An Khê, TP. Đà Nẵng<br>Hotline: 0905.244.009<h2>SỔ QUỸ</h2><div>Từ ${from} đến ${to}</div></div><table><thead><tr><th>Ngày</th><th>Chứng từ</th><th>Nội dung</th><th>Thu</th><th>Chi</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.date}</td><td>${r.code}</td><td>${htmlesc(r.content)}<br><small>${r.paymentMethod}</small></td><td>${r.income?money(r.income):''}</td><td>${r.expense?money(r.expense):''}</td></tr>`).join('')}</tbody></table><p><b>Số dư đầu kỳ:</b> ${money(opening)}<br><b>Tổng thu theo phiếu thu:</b> ${money(income)}<br><b>Tổng chi trong kỳ:</b> ${money(expense)}<br><b>Số dư cuối kỳ:</b> ${money(closing)}<br><small>Số dư cuối kỳ = số dư đầu kỳ + thu - chi. Tiền vào quỹ trên Dashboard dùng cùng nguồn với Tổng thu sổ quỹ; Thu theo đơn là chỉ số quản trị bán hàng nên có thể khác khi thu công nợ cũ.</small></p><div style="display:flex;justify-content:space-between;text-align:center;margin-top:30px"><div>Người lập<br><br><br></div><div>Kế toán<br><br><br></div><div>Quản lý<br><br><br></div></div></div>`;
  doPrint(html);
}



window.setStockMode=(type)=>{if($('stockType')){$('stockType').value=type;resetStockForm();}};
window.resetStockForm=()=>{editingStock=null;$('stockCode').value=nextCode(prefixByStockType($('stockType').value||'IN'),data.stockVouchers);$('stockDate').value=today();$('stockType').value=$('stockType').value||'IN';$('stockWarehouse').innerHTML=warehouseOptions(defaultWarehouse());$('stockWarehouse').value=defaultWarehouse();if($('stockToWarehouse')){$('stockToWarehouse').innerHTML=warehouseOptions(WAREHOUSES.find(w=>w!==defaultWarehouse())||defaultWarehouse(),WAREHOUSES);$('stockToWarehouse').value=WAREHOUSES.find(w=>w!==defaultWarehouse())||defaultWarehouse();}$('stockNote').value='';$('stockItems').innerHTML='';addStockItem();updateStockHeader()};
$('stockType').addEventListener('change',()=>{ $('stockCode').value=nextCode(prefixByStockType($('stockType').value),data.stockVouchers); updateStockHeader(); });
function updateStockHeader(){
  const type=$('stockType').value;
  const isCheck=type==='CHECK';
  const isTransfer=type==='TRANSFER';
  const toWrap=$('stockToWarehouseWrap');
  const whLabel=$('stockWarehouseLabel');
  if(toWrap) toWrap.style.display=isTransfer?'block':'none';
  if(whLabel) whLabel.textContent=isTransfer?'Kho chuyển đi':'Kho';
  const ths=document.querySelectorAll('#inventory table.editable thead th');
  if(ths[2]) ths[2].textContent=isCheck?'Tồn thực tế':(isTransfer?'Số lượng chuyển':(type==='OUT'?'Số lượng xuất':(type==='RETURN'?'Số lượng trả':(type==='ADJUST'?'SL điều chỉnh (+/-)':'Số lượng nhập'))));
  if(ths[4]) ths[4].textContent=isCheck?'Ghi chú kiểm kê':(isTransfer?'Ghi chú chuyển kho':(type==='OUT'?'Lý do xuất':(type==='RETURN'?'Lý do trả hàng':(type==='ADJUST'?'Lý do điều chỉnh':'Ghi chú'))));
  document.querySelectorAll('#stockItems tr td:nth-child(3) input').forEach(inp=>{ if(type==='ADJUST') inp.removeAttribute('min'); else inp.setAttribute('min','0'); });
}
window.addStockItem=(it={})=>{ensureProductDatalist();let tr=document.createElement('tr');tr.innerHTML=`<td><input list="productCodesList" placeholder="Tìm model / tên SP" value="${it.code||''}" onchange="stockProductChanged(this)" oninput="stockProductChanged(this)"></td><td><input value="${it.name||''}" readonly></td><td><input type="number" value="${it.actualQty??it.inputQty??it.qty??1}"></td><td><input class="view-cost" type="number" value="${it.cost||0}"></td><td><input value="${it.note||''}"></td><td><button class="btn danger" onclick="this.closest('tr').remove()">X</button></td>`;$('stockItems').appendChild(tr);applyPermissions();updateStockHeader()}
window.stockProductChanged=sel=>{let p=productByInput(sel.value)||{};if(!p.code)return;let tr=sel.closest('tr');tr.children[1].querySelector('input').value=p.name||'';tr.children[3].querySelector('input').value=p.cost||0;}
function stockItems(){return [...$('stockItems').querySelectorAll('tr')].map(tr=>{const inp=[...tr.querySelectorAll('input')];return{code:productCodeFromInput(inp[0]?.value||''),name:inp[1]?.value||'',inputQty:+(inp[2]?.value||0)||0,cost:+(inp[3]?.value||0)||0,note:inp[4]?.value||''}}).filter(x=>x.code)}
window.saveStockVoucher=async()=>{
  let raw=stockItems();if(!raw.length)return alert('Chưa có mã hàng');
  let type=$('stockType').value, editingId=editingStock||'', warehouse=$('stockWarehouse')?.value||defaultWarehouse(), toWarehouse=$('stockToWarehouse')?.value||'Kho Văn Phòng';
  if(!canAccessWarehouse(warehouse))return alert('Bạn không có quyền thao tác kho: '+warehouse);
  if(type==='TRANSFER' && !canAccessWarehouse(warehouse))return alert('Bạn chỉ được điều chuyển từ kho mình quản lý');
  if(type==='TRANSFER' && warehouse===toWarehouse)return alert('Kho chuyển đi và kho nhận phải khác nhau');
  let items=[];
  for(const it of raw){
    if(type!=='ADJUST' && it.inputQty<0)return alert('Số lượng không hợp lệ: '+it.code);
    if((type==='OUT'||type==='TRANSFER') && it.inputQty>stockOf(it.code,editingId,warehouse)) return alert(`Không đủ tồn kho cho ${it.code} tại ${warehouse}. Tồn hiện có: ${stockOf(it.code,editingId,warehouse)}`);
    if(type==='CHECK'){
      const systemQty=stockOf(it.code,editingId,warehouse); const delta=it.inputQty-systemQty;
      items.push({...it,actualQty:it.inputQty,systemQty,qty:delta,note:it.note||`Kiểm kê: hệ thống ${systemQty}, thực tế ${it.inputQty}, lệch ${delta}`});
    }else{
      items.push({...it,qty:it.inputQty});
    }
  }
  let o={code:$('stockCode').value,date:$('stockDate').value,type,warehouse:warehouse,fromWarehouse:warehouse,toWarehouse:type==='TRANSFER'?toWarehouse:'',note:$('stockNote').value,items,value:items.reduce((a,it)=>a+Math.abs(+it.qty||0)*(+it.cost||0),0),updatedAt:serverTimestamp()};
  if(type==='ADJUST' && items.some(it=>!String(it.note||o.note||'').trim()))return alert('Phiếu điều chỉnh kho bắt buộc nhập lý do điều chỉnh cho từng dòng hoặc ghi chú chung.');
  if(editingStock){if(!has('editStock'))return alert('Không có quyền sửa kho');const oldV=data.stockVouchers.find(x=>x.id===editingStock);if(stockVoucherLocked(oldV)&&currentPerm.role!=='Admin')return alert('Phiếu kho đã liên kết đơn bán/đã khóa. Chỉ Admin được sửa.');await updateDoc(doc(db,'stockVouchers',editingStock),o);await logAction('Sửa phiếu kho',`${o.code} - ${stockTypeName(type)}`)}
  else {await addDoc(col('stockVouchers'),{...o,locked:!!o.saleId,createdAt:serverTimestamp()});await logAction('Tạo phiếu kho',`${o.code} - ${stockTypeName(type)}`)}
  await loadAll();resetStockForm()
}
function stockVoucherText(v){return [v.code,v.date,stockTypeName(v.type),voucherWarehouse(v),v.fromWarehouse,v.toWarehouse,v.note,(v.items||[]).map(it=>[it.code,it.name,it.qty,it.inputQty,it.actualQty,it.note].join(' ')).join(' ')].join(' ').toLowerCase()}
window.editStock=id=>{
  const v=data.stockVouchers.find(x=>x.id===id);
  if(!v)return alert('Không tìm thấy chứng từ kho');
  if(!has('editStock'))return alert('Không có quyền sửa phiếu kho');
  if(stockVoucherLocked(v)&&currentPerm.role!=='Admin')return alert('Phiếu kho đã liên kết đơn bán/đã khóa. Chỉ Admin được sửa.');
  editingStock=id;
  $('stockCode').value=v.code||'';
  $('stockDate').value=v.date||today();
  $('stockType').value=v.type||'IN';
  $('stockWarehouse').innerHTML=warehouseOptions(v.fromWarehouse||v.warehouse||defaultWarehouse());
  $('stockWarehouse').value=v.fromWarehouse||v.warehouse||defaultWarehouse();
  if($('stockToWarehouse')){
    $('stockToWarehouse').innerHTML=warehouseOptions(v.toWarehouse||WAREHOUSES.find(w=>w!==($('stockWarehouse').value))||defaultWarehouse(),WAREHOUSES);
    $('stockToWarehouse').value=v.toWarehouse||WAREHOUSES.find(w=>w!==($('stockWarehouse').value))||defaultWarehouse();
  }
  $('stockNote').value=v.note||'';
  $('stockItems').innerHTML='';
  (v.items||[]).forEach(it=>addStockItem({...it,inputQty:it.actualQty??it.inputQty??Math.abs(+it.qty||0)}));
  if(!(v.items||[]).length)addStockItem();
  updateStockHeader();
  document.getElementById('inventory')?.scrollIntoView({behavior:'smooth',block:'start'});
};
window.printStock=id=>{
  const v=data.stockVouchers.find(x=>x.id===id);
  if(!v)return alert('Không tìm thấy chứng từ kho');
  const wh=v.type==='TRANSFER'?`${v.fromWarehouse||v.warehouse||''} → ${v.toWarehouse||''}`:voucherWarehouse(v);
  const html=`<div class="print-a5">${printHeader(stockTypeName(v.type).toUpperCase())}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;border-bottom:1px solid #999;padding-bottom:8px;margin-bottom:8px;line-height:1.55">
      <div><b>Mã phiếu:</b> ${v.code||''}</div><div><b>Ngày:</b> ${v.date||''}</div>
      <div><b>Kho:</b> ${wh}</div><div><b>Ghi chú:</b> ${v.note||''}</div>
    </div>
    <table><thead><tr><th>STT</th><th>Model</th><th>Tên sản phẩm</th><th>SL</th><th class="view-cost">Giá vốn</th><th>Ghi chú</th></tr></thead><tbody>${(v.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.code||''}</td><td>${it.name||''}</td><td>${it.actualQty??it.inputQty??it.qty??0}</td><td>${money(it.cost||0)}</td><td>${it.note||''}</td></tr>`).join('')}</tbody></table>
    <div style="display:flex;justify-content:space-between;text-align:center;margin-top:35px"><div>Người lập phiếu<br><br><br></div><div>Thủ kho<br><br><br></div><div>Người nhận/giao<br><br><br></div></div>
  </div>`;
  doPrint(html);
};

function renderStock(){
  const q=($('stockVoucherSearch')?.value||'').toLowerCase().trim();
  const all=activeStockVouchers().filter(canAccessVoucher).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const rows=all.filter(v=>!q||stockVoucherText(v).includes(q));
  if($('stockVoucherSearchCount'))$('stockVoucherSearchCount').textContent=`Hiển thị ${rows.length}/${all.length}`;
  $('stockVoucherTable').innerHTML=rows.map(v=>{const locked=stockVoucherLocked(v);const canEdit=has('editStock')&&(!locked||currentPerm.role==='Admin');const canDelete=has('deleteStock')&&(!locked||currentPerm.role==='Admin');return `<tr><td>${v.code}</td><td>${v.date}</td><td>${stockTypeName(v.type)}${locked?'<br><small>Đã khóa</small>':''}</td><td>${v.type==='TRANSFER'?`${v.fromWarehouse||v.warehouse||''} → ${v.toWarehouse||''}`:voucherWarehouse(v)}</td><td>${(v.items||[]).length}</td><td>${has('viewCost')?money(v.value):'Ẩn'}</td><td><button class="btn ghost" onclick="printStock('${v.id}')">In A5</button> ${canEdit?`<button class="btn ghost" onclick="editStock('${v.id}')">Sửa</button>`:''} ${canDelete?`<button class="btn danger" onclick="removeDoc('stockVouchers','${v.id}')">Xóa</button>`:''}</td></tr>`}).join('')||'<tr><td colspan="7">Không tìm thấy chứng từ kho phù hợp</td></tr>'
}
window.clearStockVoucherSearch=()=>{if($('stockVoucherSearch'))$('stockVoucherSearch').value='';renderStock();}

function stockBookDateFilter(){
  const from=($('stockBookFrom')?.value||'').trim();
  const to=($('stockBookTo')?.value||'').trim();
  return {from,to,active:!!(from||to)};
}
function stockDateInRange(date,from,to){
  const d=String(date||'').slice(0,10);
  if(!d)return false;
  if(from && d<from)return false;
  if(to && d>to)return false;
  return true;
}
window.clearStockBookDateFilter=()=>{
  if($('stockBookFrom'))$('stockBookFrom').value='';
  if($('stockBookTo'))$('stockBookTo').value='';
  renderStockBook();
}

function renderStockBook(){
  const dateFilter=stockBookDateFilter();
  const ledgerRows=stockLedgerRows().filter(r=>stockDateInRange(r.date,dateFilter.from,dateFilter.to));
  const ledgerBody=$('stockLedgerTable');
  if(ledgerBody){ledgerBody.innerHTML=ledgerRows.slice(0,300).map(r=>`<tr><td>${r.date||''}</td><td>${r.code||''}</td><td>${r.type||''}</td><td>${r.warehouse||''}</td><td>${r.product||''}</td><td>${r.name||''}</td><td><b>${r.qty>0?'+':''}${r.qty}</b></td><td>${r.note||''}</td></tr>`).join('')||'<tr><td colspan="8">Chưa có phát sinh kho</td></tr>'}
  const allowed=userWarehouses();
  const whFilter=$('stockBookWarehouse')?.value||'ALL';
  if(whFilter!=='ALL' && !allowed.includes(whFilter)){
    $('stockBookWarehouse').value='ALL';
  }
  const activeWh=$('stockBookWarehouse')?.value||'ALL';
  const q=($('stockBookSearch')?.value||'').trim().toLowerCase();
  const status=$('stockBookStatus')?.value||'ALL';
  const showMain=allowed.includes('Kho Chính') && (activeWh==='ALL'||activeWh==='Kho Chính');
  const showOffice=allowed.includes('Kho Văn Phòng') && (activeWh==='ALL'||activeWh==='Kho Văn Phòng');
  const head=$('stockBookHead')||document.querySelector('#stockbook thead tr');
  if(head)head.innerHTML=`<th>Model</th><th>Sản phẩm</th><th>Nhập</th><th>Xuất</th><th>Chuyển kho</th><th>Điều chỉnh</th>${showMain?'<th>Kho Chính</th>':''}${showOffice?'<th>Kho Văn Phòng</th>':''}<th>Tổng tồn</th><th>Trạng thái</th><th class="view-cost">Giá vốn</th><th class="view-cost">Giá trị tồn</th>`;
  let rows=stockBookRows(dateFilter.from,dateFilter.to).map(r=>{
    let visibleStock=activeWh==='Kho Chính'?r.khoChinh:(activeWh==='Kho Văn Phòng'?r.khoVanPhong:r.stock);
    return {...r,visibleStock,visibleValue:visibleStock*r.cost};
  }).filter(r=>{
    const text=(r.code+' '+r.name).toLowerCase();
    if(q && !text.includes(q))return false;
    if(status==='IN_STOCK' && !(r.visibleStock>0))return false;
    if(status==='LOW' && !(r.visibleStock>0 && r.visibleStock<=r.minStock))return false;
    if(status==='OUT' && r.visibleStock!==0)return false;
    if(dateFilter.active && !r.periodMovement)return false;
    return true;
  });
  const sumModel=rows.length;
  const sumMain=rows.reduce((a,r)=>a+r.khoChinh,0);
  const sumOffice=rows.reduce((a,r)=>a+r.khoVanPhong,0);
  const sumStock=rows.reduce((a,r)=>a+r.visibleStock,0);
  const sumValue=rows.reduce((a,r)=>a+r.visibleValue,0);
  if($('stockBookSummary'))$('stockBookSummary').innerHTML=`
    <div class="stock-summary-card"><span>Tổng model</span><b>${sumModel}</b></div>
    ${dateFilter.active?`<div class="stock-summary-card"><span>Khoảng ngày</span><b>${dateFilter.from||'...'} → ${dateFilter.to||'...'}</b></div>`:''}
    ${showMain?`<div class="stock-summary-card"><span>Kho Chính</span><b>${sumMain}</b></div>`:''}
    ${showOffice?`<div class="stock-summary-card"><span>Kho Văn Phòng</span><b>${sumOffice}</b></div>`:''}
    <div class="stock-summary-card"><span>Tổng tồn đang xem</span><b>${sumStock}</b></div>
    ${has('viewCost')?`<div class="stock-summary-card"><span>Giá trị tồn</span><b>${money(sumValue)}</b></div>`:''}`;
  if($('stockBookTable'))$('stockBookTable').innerHTML=rows.map(r=>`<tr><td><b>${r.code}</b></td><td>${r.name}</td><td>${r.totalIn}</td><td>${r.totalOut}</td><td>${r.totalTransfer}</td><td>${r.totalAdj}</td>${showMain?`<td><b>${r.khoChinh}</b></td>`:''}${showOffice?`<td><b>${r.khoVanPhong}</b></td>`:''}<td><b>${r.visibleStock}</b></td><td>${stockStatusBadge(r.visibleStock,r.minStock)}</td><td class="view-cost">${money(r.cost)}</td><td class="view-cost"><b>${money(r.visibleValue)}</b></td></tr>`).join('')||'<tr><td colspan="12">Không tìm thấy tồn kho phù hợp</td></tr>';
  applyPermissions();
}




const DEFAULT_WARRANTY_REASONS=['Không nhận vân tay','Không mở bằng App','Kẹt chốt','Hết pin','Khóa tự mở','Không nhận thẻ','Lỗi Wifi','Lỗi FaceID','Lỗi nguồn','Lỗi Motor','Lỗi bo mạch','Bảo trì định kỳ','Khác'];
function warrantyReasonList(){
  const custom=(data.warrantyReasons||[]).map(r=>r.name||r.reason||r.title).filter(Boolean);
  const list=[];
  [...systemCategoryNames('warrantyReason'),...custom].forEach(r=>{ if(r&&!list.includes(r)) list.push(r); });
  return list;
}
function selectedWarrantyReasons(){
  const val=String($('wReasonSelect')?.value||'').trim();
  if(!val || val==='Khác') return [];
  return [val];
}
function setWarrantyReasons(list){
  const arr=Array.isArray(list)?list.filter(Boolean):[];
  const sel=$('wReasonSelect');
  if(!sel) return;
  const first=arr[0]||'';
  if(first && warrantyReasonList().includes(first)) sel.value=first;
  else if(first){ sel.value='Khác'; if($('wReasonOther'))$('wReasonOther').value=first; }
  else sel.value='';
  handleWarrantyReasonChange();
}
function renderWarrantyReasonOptions(){
  const sel=$('wReasonSelect'); if(!sel) return;
  const current=sel.value;
  sel.innerHTML='<option value="">-- Chọn lý do --</option>'+warrantyReasonList().map(r=>`<option value="${htmlesc(r)}">${htmlesc(r)}</option>`).join('');
  if(current) sel.value=current;
  handleWarrantyReasonChange();
}
window.handleWarrantyReasonChange=function(){
  const wrap=$('wReasonOtherWrap');
  const other=$('wReasonOther');
  const isOther=String($('wReasonSelect')?.value||'')==='Khác';
  if(wrap) wrap.style.display=isOther?'block':'none';
  if(!isOther && other) other.value='';
};
function warrantyReasonsText(w){
  const arr=Array.isArray(w?.reasons)?w.reasons:[];
  const other=String(w?.reasonOther||'').trim();
  return [...arr,other].filter(Boolean).join(', ');
}
function renderWarrantyReasonCategories(){
  const tb=$('wReasonTable'); if(!tb) return;
  const rows=(data.warrantyReasons||[]).slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'vi'));
  tb.innerHTML=rows.map((r,i)=>`<tr><td>${i+1}</td><td>${htmlesc(r.name||'')}</td><td><button class="btn danger" onclick="deleteWarrantyReasonCategory('${r.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="3">Chưa có lý do tùy chỉnh</td></tr>';
}
window.saveWarrantyReasonCategory=async()=>{
  const name=String($('wrName')?.value||'').trim();
  if(!name)return alert('Vui lòng nhập lý do bảo hành');
  if(warrantyReasonList().some(x=>searchKey(x)===searchKey(name)))return alert('Lý do này đã tồn tại');
  await addDoc(col('warrantyReasons'),{name,createdAt:serverTimestamp()});
  if($('wrName'))$('wrName').value='';
  await loadAll();
};
window.deleteWarrantyReasonCategory=async(id)=>{
  if(!confirm('Xóa lý do bảo hành này?'))return;
  await deleteDoc(doc(db,'warrantyReasons',id));
  await loadAll();
};
function warrantyCode(w){return w?.code||w?.warrantyCode||('BH-'+String(w?.id||'').slice(0,6));}
function warrantyEmployeeOptions(){return '<option value="">-- Chọn --</option>'+data.staff.map(s=>`<option value="${htmlesc(s.id)}">${htmlesc(s.name||'')}</option>`).join('')}
function renderWarrantyStaffSelectors(){
  if($('wReceiver'))$('wReceiver').innerHTML=warrantyEmployeeOptions();
  if($('wTech'))$('wTech').innerHTML=warrantyEmployeeOptions();
}
function warrantyStaffName(id){return data.staff.find(s=>s.id===id)?.name||''}
window.showWarrantyTab=function(tab){
  ['coverage','form','history','report','reasons'].forEach(t=>{
    const el=$('warranty'+t.charAt(0).toUpperCase()+t.slice(1)+'Tab');
    if(el)el.classList.toggle('hidden',t!==tab);
  });
  document.querySelectorAll('.warranty-tabs button').forEach(btn=>btn.classList.remove('active'));
  const idx={coverage:0,form:1,history:2,report:3,reasons:4}[tab]||0;
  document.querySelectorAll('.warranty-tabs button')[idx]?.classList.add('active');
  if(tab==='coverage')renderWarrantyCoverage();
  if(tab==='history')renderWarrantyHistory();
  if(tab==='report')renderWarrantyReport();
  if(tab==='reasons')renderWarrantyReasonCategories();
};
window.resetWarrantyForm=function(){
  editingWarranty=null;
  ['wSale','wSaleSearch','wCustomer','wPhone','wAddress','wSerial','wReasonOther','wProblem','wResult','wNote'].forEach(i=>{if($(i))$(i).value=''});
  if($('wStart'))$('wStart').value='';
  if($('wReceiveDate'))$('wReceiveDate').value=today();
  if($('wCompleteDate'))$('wCompleteDate').value='';
  if($('wMonths'))$('wMonths').value=24;
  if($('wStatus'))$('wStatus').value='Mới tiếp nhận';
  if($('wPriority'))$('wPriority').value='Bình thường';
  if($('wReceiver'))$('wReceiver').value='';
  if($('wTech'))$('wTech').value='';
  setWarrantyReasons([]);
};


function warrantyMonthsFromSale(s){
  const explicit=+(s.warrantyMonths||s.monthsWarranty||0);
  if(explicit>0) return explicit;
  return 24;
}
function warrantyEndFromStart(start, months=24){
  if(!start) return '';
  const d=new Date(start);
  if(Number.isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth()+(+months||24));
  return d.toISOString().slice(0,10);
}
function saleWarrantyModelsText(s){
  return (s.items||[]).map(i=>`${i.code||''}${i.name?` - ${i.name}`:''}${i.qty?` x${i.qty}`:''}`).filter(Boolean).join(', ');
}
function warrantyCoverageRows(){
  return activeSales()
    .filter(s=>String(warrantyStartFromSale(s)||'').trim())
    .map(s=>{
      const ci=saleCustomerInfo(s);
      const start=warrantyStartFromSale(s);
      const months=warrantyMonthsFromSale(s);
      const end=warrantyEndFromStart(start,months);
      const isExpired=end && end<today();
      return {sale:s,ci,start,months,end,isExpired,models:saleWarrantyModelsText(s)};
    })
    .sort((a,b)=>String(b.start||'').localeCompare(String(a.start||'')) || String(b.sale.code||'').localeCompare(String(a.sale.code||'')));
}
function renderWarrantyCoverage(){
  const tb=$('warrantyCoverageTable'); if(!tb) return;
  const q=searchKey($('wCoverageSearch')?.value||'');
  const rows=warrantyCoverageRows().filter(r=>searchKey([r.sale.code,r.ci.code,r.ci.name,r.ci.phone,r.ci.address,r.models,r.start,r.end].join(' ')).includes(q));
  tb.innerHTML=rows.map((r,idx)=>`<tr><td class="text-center">${idx+1}</td><td><b>${htmlesc(r.sale.code||'')}</b></td><td>${htmlesc(r.ci.name||'')}</td><td>${htmlesc(r.ci.phone||'')}</td><td>${htmlesc(r.ci.address||'')}</td><td>${htmlesc(r.models||'')}</td><td>${htmlesc(r.start||'')}</td><td>${htmlesc(r.end||'')}</td><td><span class="badge ${r.isExpired?'red':'green'}">${r.isExpired?'Hết bảo hành':'Còn bảo hành'}</span><br><small>${r.months} tháng</small></td><td><button class="btn primary" onclick="createWarrantyFromSale('${htmlesc(r.sale.id||'')}')">Tạo phiếu BH</button></td></tr>`).join('')||'<tr><td colspan="10">Chưa có đơn hàng đã hoàn thành lắp đặt phù hợp</td></tr>';
}
window.renderWarrantyCoverage=renderWarrantyCoverage;
window.createWarrantyFromSale=function(id){
  const s=data.sales.find(x=>x.id===id);
  if(!s) return alert('Không tìm thấy phiếu bán');
  resetWarrantyForm();
  populateWarrantyFromSale(s);
  showWarrantyTab('form');
  setTimeout(()=>$('wReasonSelect')?.focus(),100);
};

function saleWarrantyLabel(s){
  const ci=saleCustomerInfo(s);
  const models=(s.items||[]).map(i=>`${i.code||''}${i.qty?` x${i.qty}`:''}`).filter(Boolean).join(', ');
  return `${s.code||''} | ${ci.name||''} | ${ci.phone||''} | ${models}`;
}
function warrantySaleMatches(q='',limit=20){
  const raw=String(q||'').trim();
  const key=searchKey(raw);
  const phone=normalizePhone(raw);
  let rows=activeSales().slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  if(raw){
    rows=rows.filter(s=>{
      const ci=saleCustomerInfo(s);
      const models=(s.items||[]).map(i=>[i.code,i.name,i.qty].join(' ')).join(' ');
      const hay=searchKey([s.code,ci.code,ci.name,ci.phone,ci.address,models].filter(Boolean).join(' '));
      const p=normalizePhone(ci.phone||'');
      return hay.includes(key) || (phone && (p.includes(phone)||phone.includes(p)));
    });
  }
  return rows.slice(0,limit);
}
function renderWarrantySaleSearchResults(){
  const box=$('wSaleResults'); if(!box) return;
  const rows=warrantySaleMatches($('wSaleSearch')?.value||'',20);
  if(!rows.length){box.innerHTML='<div class="sale-customer-no-result">Không tìm thấy phiếu bán phù hợp</div>';box.classList.add('show');return;}
  box.innerHTML=rows.map(s=>{
    const ci=saleCustomerInfo(s);
    const models=(s.items||[]).map(i=>`${i.code||''}${i.qty?` x${i.qty}`:''}`).filter(Boolean).join(', ');
    const paid=salePaymentInfo(s);
    return `<button type="button" class="sale-customer-result-row" onclick="selectWarrantySaleById('${htmlesc(s.id||'')}')"><b>${htmlesc(s.code||'')}</b><small>${htmlesc(ci.name||'')} · ${htmlesc(ci.phone||'')} · ${money(s.grand||0)} · ${htmlesc(paid.paymentStatus||'')}</small><small>${htmlesc(models||'')} ${ci.address?`· ${htmlesc(ci.address)}`:''}</small></button>`;
  }).join('');
  box.classList.add('show');
}
window.renderWarrantySaleSearchResults=renderWarrantySaleSearchResults;
window.handleWarrantySaleSearchInput=()=>{if($('wSale'))$('wSale').value='';renderWarrantySaleSearchResults();};
function populateWarrantyFromSale(s){
  if(!s) return;
  const ci=saleCustomerInfo(s);
  if($('wSale')) $('wSale').value=s.id||'';
  if($('wSaleSearch')) $('wSaleSearch').value=saleWarrantyLabel(s);
  if($('wCustomer')) $('wCustomer').value=ci.name||'';
  if($('wPhone')) $('wPhone').value=ci.phone||'';
  if($('wAddress')) $('wAddress').value=ci.address||'';
  if($('wSerial')) $('wSerial').value=(s.items||[]).map(i=>`${i.code||''}${i.name?` - ${i.name}`:''}${i.qty?` x${i.qty}`:''}`).filter(Boolean).join(', ');
  if($('wStart')) $('wStart').value=warrantyStartFromSale(s)||s.date||today();
  if($('wMonths')) $('wMonths').value=warrantyMonthsFromSale(s);
  if($('wReceiveDate') && !$('wReceiveDate').value) $('wReceiveDate').value=today();
}
window.selectWarrantySaleById=(id)=>{
  const s=data.sales.find(x=>x.id===id);
  if(!s) return alert('Không tìm thấy phiếu bán đã chọn');
  populateWarrantyFromSale(s);
  $('wSaleResults')?.classList.remove('show');
};
document.addEventListener('click',e=>{
  const box=$('wSaleResults');
  if(!box) return;
  if(!e.target.closest('.warranty-sale-search-wrap')) box.classList.remove('show');
});
window.saveWarranty=async()=>{
  let sale=data.sales.find(x=>x.id===$('wSale')?.value)||{};
  if(!sale.id) return alert('Vui lòng chọn phiếu bán từ danh sách tìm kiếm');
  let start=$('wStart').value||warrantyStartFromSale(sale)||today();
  let months=+($('wMonths')?.value||warrantyMonthsFromSale(sale)||24)||24;
  let end=new Date(start);end.setMonth(end.getMonth()+months);
  const ci=saleCustomerInfo(sale);
  const reasonOther=($('wReasonOther')?.value||'').trim();
  const reasons=selectedWarrantyReasons();
  if(!reasons.length && !reasonOther) return alert('Vui lòng chọn hoặc nhập lý do bảo hành');
  let o={
    code: editingWarranty?(data.warranties.find(x=>x.id===editingWarranty)?.code||data.warranties.find(x=>x.id===editingWarranty)?.warrantyCode||''):nextCode('BH',data.warranties),
    saleId:sale.id,
    saleCode:sale.code||'',
    customerId:sale.customerId||'',
    customerCode:ci.code||'',
    customer:$('wCustomer')?.value||ci.name||'',
    phone:$('wPhone')?.value||ci.phone||'',
    address:$('wAddress')?.value||ci.address||'',
    serial:$('wSerial')?.value||'',
    start,
    end:end.toISOString().slice(0,10),
    months,
    receiveDate:$('wReceiveDate')?.value||today(),
    receiverId:$('wReceiver')?.value||'',
    receiverName:warrantyStaffName($('wReceiver')?.value||''),
    techId:$('wTech')?.value||'',
    techName:warrantyStaffName($('wTech')?.value||''),
    priority:$('wPriority')?.value||'Bình thường',
    status:$('wStatus')?.value||'Mới tiếp nhận',
    completeDate:$('wCompleteDate')?.value||'',
    reasons,
    reasonOther,
    problem:$('wProblem')?.value||'',
    result:$('wResult')?.value||'',
    note:$('wNote')?.value||'',
    updatedAt:serverTimestamp()
  };
  if(editingWarranty) await updateDoc(doc(db,'warranties',editingWarranty),o); else await addDoc(col('warranties'),{...o,createdAt:serverTimestamp()});
  await logAction(editingWarranty?'Sửa phiếu bảo hành':'Tạo phiếu bảo hành',`${o.code} ${o.saleCode} ${o.customer} | ${warrantyReasonsText(o)}`);
  resetWarrantyForm();
  await loadAll();
};
function renderWarranties(){
  let q=searchKey($('wSearch')?.value||'');
  const rows=activeWarranties().filter(w=>searchKey([w.code,w.warrantyCode,w.saleCode,w.customer,w.phone,w.serial,w.address,w.status,w.priority,w.receiverName,w.techName,warrantyReasonsText(w),w.problem,w.result,w.note].join(' ')).includes(q));
  if(!$('warrantyTable'))return;
  $('warrantyTable').innerHTML=rows.map((w,idx)=>`<tr><td class="text-center">${idx+1}</td><td><b>${warrantyCode(w)}</b></td><td><b>${w.saleCode||''}</b></td><td>${w.customer||''}<br><small>${w.address||''}</small></td><td>${w.phone||''}</td><td>${w.serial||''}</td><td>${w.start||''}</td><td>${w.end||''}</td><td>${warrantyReasonsText(w)||''}</td><td><span class="badge ${w.status==='Hoàn thành'||w.status==='Đã trả khách'?'green':(w.status==='Hết bảo hành'?'red':'orange')}">${w.status||''}</span><br><small>${w.techName||''}</small></td><td><button class="btn ghost" onclick="editWarranty('${w.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('warranties','${w.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="11">Không tìm thấy phiếu bảo hành</td></tr>';
}
window.editWarranty=id=>{
  let w=data.warranties.find(x=>x.id===id); if(!w)return;
  editingWarranty=id;
  if($('wSale'))$('wSale').value=w.saleId||'';
  let s=data.sales.find(x=>x.id===w.saleId);
  if($('wSaleSearch'))$('wSaleSearch').value=s?saleWarrantyLabel(s):(w.saleCode||w.saleId||'');
  if($('wCustomer'))$('wCustomer').value=w.customer||'';
  if($('wPhone'))$('wPhone').value=w.phone||'';
  if($('wAddress'))$('wAddress').value=w.address||'';
  if($('wSerial'))$('wSerial').value=w.serial||'';
  if($('wStart'))$('wStart').value=w.start||'';
  if($('wMonths'))$('wMonths').value=w.months||24;
  if($('wReceiveDate'))$('wReceiveDate').value=w.receiveDate||w.createdDate||today();
  if($('wReceiver'))$('wReceiver').value=w.receiverId||'';
  if($('wTech'))$('wTech').value=w.techId||'';
  if($('wPriority'))$('wPriority').value=w.priority||'Bình thường';
  if($('wStatus'))$('wStatus').value=w.status||'Mới tiếp nhận';
  if($('wCompleteDate'))$('wCompleteDate').value=w.completeDate||'';
  setWarrantyReasons(w.reasons||[]);
  if((!Array.isArray(w.reasons)||!w.reasons.length) && w.reasonOther && $('wReasonSelect')){$('wReasonSelect').value='Khác';handleWarrantyReasonChange();}
  if($('wReasonOther'))$('wReasonOther').value=w.reasonOther||'';
  if($('wProblem'))$('wProblem').value=w.problem||'';
  if($('wResult'))$('wResult').value=w.result||'';
  if($('wNote'))$('wNote').value=w.note||'';
  showWarrantyTab('form');
  document.getElementById('warranty')?.scrollIntoView({behavior:'smooth',block:'start'});
};
function renderWarrantyHistory(){
  const box=$('warrantyHistoryBox'); if(!box)return;
  const q=searchKey($('wHistorySearch')?.value||'');
  const rows=activeWarranties().filter(w=>searchKey([w.code,w.saleCode,w.customer,w.phone,w.address,w.serial,warrantyReasonsText(w),w.problem,w.result,w.status].join(' ')).includes(q)).sort((a,b)=>String(b.receiveDate||b.start||'').localeCompare(String(a.receiveDate||a.start||'')));
  box.innerHTML=rows.map(w=>`<div class="warranty-history-card"><div><b>${w.customer||''}</b> <span class="badge ${w.status==='Hoàn thành'||w.status==='Đã trả khách'?'green':'orange'}">${w.status||''}</span></div><small>${w.phone||''} · ${w.address||''}</small><div><b>${warrantyCode(w)}</b> · Phiếu ${w.saleCode||''} · ${w.serial||''}</div><div>Tiếp nhận: ${w.receiveDate||''} | Lắp: ${w.start||''} | Hết BH: ${w.end||''}</div><div><b>Lý do:</b> ${warrantyReasonsText(w)||''}</div>${w.problem?`<div><b>Mô tả:</b> ${htmlesc(w.problem)}</div>`:''}${w.result?`<div><b>Kết quả:</b> ${htmlesc(w.result)}</div>`:''}<div><small>Tiếp nhận: ${w.receiverName||''} · Kỹ thuật: ${w.techName||''}</small></div></div>`).join('')||'<div class="empty-state">Chưa có lịch sử bảo hành phù hợp</div>';
}
window.renderWarrantyHistory=renderWarrantyHistory;
function renderWarrantyReport(){
  const box=$('warrantyReportBox'); if(!box)return;
  const rows=activeWarranties();
  const byStatus={}, byReason={}, byModel={};
  rows.forEach(w=>{
    byStatus[w.status||'Khác']=(byStatus[w.status||'Khác']||0)+1;
    (Array.isArray(w.reasons)&&w.reasons.length?w.reasons:[w.reasonOther||'Khác']).forEach(r=>byReason[r]=(byReason[r]||0)+1);
    String(w.serial||'Khác').split(',').map(x=>x.trim()).filter(Boolean).forEach(m=>{const code=m.split(' ')[0]||m;byModel[code]=(byModel[code]||0)+1});
  });
  const card=(title,obj)=>`<div class="warranty-report-card"><h4>${title}</h4>${Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`<p><span>${htmlesc(k)}</span><b>${v}</b></p>`).join('')||'<small>Chưa có dữ liệu</small>'}</div>`;
  box.innerHTML=`<div class="warranty-report-card primary"><h4>Tổng phiếu bảo hành</h4><strong>${rows.length}</strong></div>${card('Theo trạng thái',byStatus)}${card('Theo lý do',byReason)}${card('Theo model',byModel)}`;
}
window.renderWarrantyReport=renderWarrantyReport;

function reportDateValue(v){return String(v||'').slice(0,10)}
function dateAdd(d,days){let x=new Date(d);x.setDate(x.getDate()+days);return x.toISOString().slice(0,10)}
function monthStart(d=today()){return String(d).slice(0,7)+'-01'}
function monthEnd(d=today()){let x=new Date(String(d).slice(0,7)+'-01');x.setMonth(x.getMonth()+1);x.setDate(0);return x.toISOString().slice(0,10)}
function yearStart(d=today()){return String(d).slice(0,4)+'-01-01'}
function yearEnd(d=today()){return String(d).slice(0,4)+'-12-31'}
function weekRange(d=today()){let x=new Date(d);let day=x.getDay()||7;x.setDate(x.getDate()-day+1);let from=x.toISOString().slice(0,10);x.setDate(x.getDate()+6);return{from,to:x.toISOString().slice(0,10)}}
window.setReportQuickRange=()=>{
  if(!$('reportPeriod'))return;
  let p=$('reportPeriod').value, ref=$('reportFrom')?.value||today(), from=today(), to=today();
  if(p==='day'){from=to=ref}
  else if(p==='week'){let r=weekRange(ref);from=r.from;to=r.to}
  else if(p==='month'){from=monthStart(ref);to=monthEnd(ref)}
  else if(p==='year'){from=yearStart(ref);to=yearEnd(ref)}
  else return;
  $('reportFrom').value=from;$('reportTo').value=to;
}
function reportRange(){
  if($('reportFrom')&&!$('reportFrom').value)setReportQuickRange();
  let from=$('reportFrom')?.value||monthStart(),to=$('reportTo')?.value||monthEnd();
  if(from>to){let t=from;from=to;to=t}
  return{from,to,period:$('reportPeriod')?.value||'month'}
}
function inReportRange(date,from,to){let d=reportDateValue(date);return d&&d>=from&&d<=to}
function weekKey(date){let r=weekRange(date);return `${r.from} → ${r.to}`}
function groupKeyByPeriod(date,period){
  let d=reportDateValue(date);
  if(period==='year')return d.slice(0,4);
  if(period==='month')return d.slice(0,7);
  if(period==='week')return weekKey(d);
  return d;
}

let currentReportTab='revenue';
window.setReportTab=(tab='revenue')=>{
  currentReportTab=tab;
  document.querySelectorAll('.report-tabs button[id^="reportTab"]').forEach(b=>b.classList.remove('active'));
  const map={revenue:'Revenue',profit:'Profit',stock:'Stock',debts:'Debts',payment:'Payment',commissions:'Commissions',warranty:'Warranty'};
  const btn=$(`reportTab${map[tab]||'Revenue'}`); if(btn)btn.classList.add('active');

  // Chỉ hiển thị đúng nhóm báo cáo đang chọn.
  // Những phần báo cáo khác được ẩn hoàn toàn để người dùng không phải kéo xuống dưới mới thấy nội dung tab.
  document.querySelectorAll('#reports .report-section').forEach(el=>{
    const show=el.classList.contains(`report-section-${tab}`);
    el.hidden=!show;
    el.style.display=show?'':'none';
  });

  renderReports();

  // Sau khi đổi tab, tự đưa màn hình về ngay đầu nội dung báo cáo đang chọn.
  // Giữ lại bộ lọc ngày + thanh tab ở phía trên, không cuộn xuống các báo cáo cũ.
  setTimeout(()=>{
    const anchor=$('reportContentTop') || document.querySelector('#reports .report-tabs');
    if(anchor) anchor.scrollIntoView({behavior:'smooth',block:'start'});
  },30);
};

window.clearReportStockFilter=()=>{
  if($('reportStockWarehouse'))$('reportStockWarehouse').value='ALL';
  if($('reportStockStatus'))$('reportStockStatus').value='ALL';
  if($('reportStockSearch'))$('reportStockSearch').value='';
  renderReports();
}
function stockReportVoucherRows(from,to,typeFilter=''){
  const rows=[];
  activeStockVouchers().filter(canAccessVoucher).forEach(v=>{
    const d=reportDateValue(v.date);
    if(d<from||d>to)return;
    if(typeFilter && v.type!==typeFilter)return;
    (v.items||[]).forEach(it=>{
      rows.push({
        date:d, code:v.code||'', type:v.type||'', typeName:stockTypeName(v.type),
        warehouse:voucherWarehouse(v), fromWarehouse:v.fromWarehouse||v.warehouse||'', toWarehouse:v.toWarehouse||'',
        customer:v.customerName||'', saleCode:v.saleCode||'', product:it.code||'', name:it.name||'',
        qty:+(it.actualQty??it.inputQty??it.qty??0)||0, cost:+(it.cost||0)||0,
        amount:(+(it.actualQty??it.inputQty??it.qty??0)||0)*(+(it.cost||0)||0), note:it.note||v.note||''
      });
    });
  });
  return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.code).localeCompare(String(a.code)));
}
function renderStockReports(from,to){
  if(!$('reportStockSummary'))return;
  const allowed=userWarehouses();
  const whSel=$('reportStockWarehouse');
  if(whSel && whSel.value!=='ALL' && !allowed.includes(whSel.value))whSel.value='ALL';
  const wh=whSel?.value||'ALL';
  const status=$('reportStockStatus')?.value||'ALL';
  const q=($('reportStockSearch')?.value||$('reportProductSearch')?.value||'').trim().toLowerCase();
  const rows=stockBookRows('', '').map(r=>{
    const visibleStock=wh==='Kho Chính'?r.khoChinh:(wh==='Kho Văn Phòng'?r.khoVanPhong:r.stock);
    return {...r,visibleStock,visibleValue:visibleStock*r.cost};
  }).filter(r=>{
    if(q && !(String(r.code+' '+r.name).toLowerCase().includes(q)))return false;
    if(status==='IN_STOCK' && !(r.visibleStock>0))return false;
    if(status==='LOW' && !(r.visibleStock>0 && r.visibleStock<=r.minStock))return false;
    if(status==='OUT' && r.visibleStock!==0)return false;
    return true;
  });
  const inRows=stockReportVoucherRows(from,to,'IN').filter(r=>wh==='ALL'||r.warehouse===wh).filter(r=>!q||String(r.product+' '+r.name).toLowerCase().includes(q));
  const outRows=stockReportVoucherRows(from,to,'OUT').filter(r=>wh==='ALL'||r.warehouse===wh).filter(r=>!q||String(r.product+' '+r.name).toLowerCase().includes(q));
  const moveRows=stockReportVoucherRows(from,to).filter(r=>['TRANSFER','ADJUST','CHECK'].includes(r.type)).filter(r=>wh==='ALL'||r.warehouse===wh||r.fromWarehouse===wh||r.toWarehouse===wh).filter(r=>!q||String(r.product+' '+r.name).toLowerCase().includes(q));
  const ledger=stockLedgerRows().filter(r=>stockDateInRange(r.date,from,to)).filter(r=>wh==='ALL'||r.warehouse===wh).filter(r=>!q||String(r.product+' '+r.name).toLowerCase().includes(q));
  const totalStock=rows.reduce((a,r)=>a+r.visibleStock,0);
  const totalValue=rows.reduce((a,r)=>a+r.visibleValue,0);
  const lowRows=rows.filter(r=>r.visibleStock>0 && r.visibleStock<=r.minStock).sort((a,b)=>a.visibleStock-b.visibleStock);
  const outOfStock=rows.filter(r=>r.visibleStock===0).length;
  const inQty=inRows.reduce((a,r)=>a+r.qty,0), outQty=outRows.reduce((a,r)=>a+r.qty,0);
  $('reportStockSummary').innerHTML=`
    <div class="report-card">Tổng model đang xem<b>${rows.length}</b></div>
    <div class="report-card">Tổng tồn<b>${totalStock}</b></div>
    <div class="report-card view-cost">Giá trị tồn<b>${money(totalValue)}</b></div>
    <div class="report-card">Nhập trong kỳ<b>${inQty}</b></div>
    <div class="report-card">Xuất trong kỳ<b>${outQty}</b></div>
    <div class="report-card">Sắp hết / Hết hàng<b>${lowRows.length} / ${outOfStock}</b></div>`;
  renderChartHtml('reportStockCharts',
    modernBarChart('Top tồn kho theo model',rows.slice().sort((a,b)=>b.visibleStock-a.visibleStock).map(r=>({label:r.code,value:r.visibleStock})),{sub:'Số lượng tồn hiện tại',limit:8})+
    modernDonutChart('Nhập / xuất trong kỳ',[{label:'Nhập kho',value:inQty},{label:'Xuất kho',value:outQty}],{sub:'So sánh luân chuyển kho'})+
    modernBarChart('Giá trị tồn kho cao nhất',rows.slice().sort((a,b)=>b.visibleValue-a.visibleValue).map(r=>({label:r.code,value:r.visibleValue})),{sub:'Tính theo giá vốn',money:true,limit:8})
  );
  const showMain=allowed.includes('Kho Chính') && (wh==='ALL'||wh==='Kho Chính');
  const showOffice=allowed.includes('Kho Văn Phòng') && (wh==='ALL'||wh==='Kho Văn Phòng');
  if($('reportStockHead'))$('reportStockHead').innerHTML=`<tr><th>Model</th><th>Sản phẩm</th>${showMain?'<th>Kho Chính</th>':''}${showOffice?'<th>Kho Văn Phòng</th>':''}<th>Tổng tồn</th><th>Trạng thái</th><th class="view-cost">Giá vốn</th><th class="view-cost">Giá trị tồn</th></tr>`;
  if($('reportStockTable'))$('reportStockTable').innerHTML=rows.map(r=>`<tr><td><b>${r.code}</b></td><td>${r.name||''}</td>${showMain?`<td>${r.khoChinh}</td>`:''}${showOffice?`<td>${r.khoVanPhong}</td>`:''}<td><b>${r.visibleStock}</b></td><td>${stockStatusBadge(r.visibleStock,r.minStock)}</td><td class="view-cost">${money(r.cost)}</td><td class="view-cost"><b>${money(r.visibleValue)}</b></td></tr>`).join('')||'<tr><td colspan="8">Không tìm thấy tồn kho phù hợp</td></tr>';
  const renderVoucher=(arr,kind)=>arr.slice(0,400).map(r=> kind==='out'
    ? `<tr><td>${r.date}</td><td>${r.code}</td><td>${r.warehouse}</td><td>${r.customer||r.saleCode||''}</td><td><b>${r.product}</b></td><td>${r.name}</td><td>${r.qty}</td><td class="view-cost">${money(r.amount)}</td><td>${r.note}</td></tr>`
    : `<tr><td>${r.date}</td><td>${r.code}</td><td>${r.warehouse}</td><td><b>${r.product}</b></td><td>${r.name}</td><td>${r.qty}</td><td class="view-cost">${money(r.amount)}</td><td>${r.note}</td></tr>`).join('');
  if($('reportStockInTable'))$('reportStockInTable').innerHTML=renderVoucher(inRows,'in')||'<tr><td colspan="8">Chưa có nhập kho trong kỳ</td></tr>';
  if($('reportStockOutTable'))$('reportStockOutTable').innerHTML=renderVoucher(outRows,'out')||'<tr><td colspan="9">Chưa có xuất kho trong kỳ</td></tr>';
  if($('reportStockMoveTable'))$('reportStockMoveTable').innerHTML=moveRows.slice(0,400).map(r=>`<tr><td>${r.date}</td><td>${r.code}</td><td>${r.typeName}</td><td>${r.fromWarehouse||''}</td><td>${r.toWarehouse||r.warehouse||''}</td><td><b>${r.product}</b></td><td>${r.qty}</td><td>${r.note}</td></tr>`).join('')||'<tr><td colspan="8">Chưa có điều chuyển / điều chỉnh trong kỳ</td></tr>';
  if($('reportStockLedgerTable'))$('reportStockLedgerTable').innerHTML=ledger.slice(0,500).map(r=>`<tr><td>${r.date||''}</td><td>${r.code||''}</td><td>${r.type||''}</td><td>${r.warehouse||''}</td><td><b>${r.product||''}</b></td><td>${r.name||''}</td><td><b>${r.qty>0?'+':''}${r.qty}</b></td><td>${r.note||''}</td></tr>`).join('')||'<tr><td colspan="8">Chưa có nhật ký kho trong kỳ</td></tr>';
  if($('reportLowStockTable'))$('reportLowStockTable').innerHTML=lowRows.slice(0,80).map(r=>`<tr><td><b>${r.code}</b></td><td>${r.name||''}</td><td>${r.visibleStock}</td><td>${r.minStock}</td></tr>`).join('')||'<tr><td colspan="4">Không có sản phẩm sắp hết</td></tr>';
  const lastOut=new Map();
  stockReportVoucherRows('1900-01-01',today(),'OUT').forEach(r=>{if(!lastOut.has(r.product)||r.date>lastOut.get(r.product))lastOut.set(r.product,r.date)});
  const now=new Date(today());
  const slow=rows.filter(r=>r.visibleStock>0).map(r=>{const d=lastOut.get(r.code);const days=d?Math.floor((now-new Date(d))/86400000):999;return{...r,days}}).filter(r=>r.days>=60).sort((a,b)=>b.days-a.days);
  if($('reportSlowStockTable'))$('reportSlowStockTable').innerHTML=slow.slice(0,80).map(r=>`<tr><td><b>${r.code}</b></td><td>${r.name||''}</td><td>${r.visibleStock}</td><td>${r.days===999?'Chưa từng xuất':r.days+' ngày'}</td></tr>`).join('')||'<tr><td colspan="4">Không có sản phẩm tồn lâu trên 60 ngày</td></tr>';
}


function compactMoney(v){v=+v||0;const a=Math.abs(v);if(a>=1000000000)return (v/1000000000).toFixed(a>=10000000000?0:1)+' tỷ';if(a>=1000000)return (v/1000000).toFixed(a>=10000000?0:1)+' tr';if(a>=1000)return (v/1000).toFixed(a>=10000?0:1)+'k';return String(Math.round(v));}
function chartNoData(title,sub='Chưa có dữ liệu để vẽ biểu đồ'){return `<div class="modern-chart-card"><div class="chart-head"><div><h4>${htmlesc(title)}</h4><small>${htmlesc(sub)}</small></div></div><div class="chart-empty">Chưa có dữ liệu</div></div>`}
function modernBarChart(title,rows,opt={}){
  rows=(rows||[]).filter(r=>Number.isFinite(+r.value)).slice(0,opt.limit||8);
  if(!rows.length)return chartNoData(title,opt.sub||'');
  const max=Math.max(...rows.map(r=>Math.abs(+r.value||0)),1);
  return `<div class="modern-chart-card"><div class="chart-head"><div><h4>${htmlesc(title)}</h4><small>${htmlesc(opt.sub||'')}</small></div>${opt.badge?`<span class="chart-badge">${htmlesc(opt.badge)}</span>`:''}</div><div class="modern-bars">${rows.map(r=>{const pct=Math.max(3,Math.min(100,Math.abs((+r.value||0)/max*100)));return `<div class="bar-row"><div class="bar-label" title="${htmlesc(r.label||'')}">${htmlesc(r.label||'')}</div><div class="bar-track"><span style="width:${pct}%"></span></div><b>${opt.money?compactMoney(r.value):(r.value||0)}</b></div>`}).join('')}</div></div>`;
}
function modernLineChart(title,rows,opt={}){
  rows=(rows||[]).filter(r=>Number.isFinite(+r.value));
  if(rows.length<2)return modernBarChart(title,rows,{...opt,limit:6});
  rows=rows.slice(-10);
  const vals=rows.map(r=>+r.value||0), max=Math.max(...vals,1), min=Math.min(...vals,0), span=Math.max(max-min,1);
  const pts=rows.map((r,i)=>{const x=8+(i*(284/(rows.length-1)));const y=92-((+r.value-min)/span*74);return `${x.toFixed(1)},${y.toFixed(1)}`}).join(' ');
  return `<div class="modern-chart-card"><div class="chart-head"><div><h4>${htmlesc(title)}</h4><small>${htmlesc(opt.sub||'')}</small></div>${opt.badge?`<span class="chart-badge">${htmlesc(opt.badge)}</span>`:''}</div><div class="line-chart-wrap"><svg viewBox="0 0 300 110" preserveAspectRatio="none"><defs><linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-opacity=".26"/><stop offset="1" stop-opacity="0"/></linearGradient></defs><polyline class="line-grid" points="0,92 300,92"></polyline><polyline class="line-area" points="8,92 ${pts} 292,92"></polyline><polyline class="line-stroke" points="${pts}"></polyline></svg></div><div class="chart-axis-mini"><span>${htmlesc(rows[0].label||'')}</span><b>${opt.money?compactMoney(vals[vals.length-1]):vals[vals.length-1]}</b><span>${htmlesc(rows[rows.length-1].label||'')}</span></div></div>`;
}
function modernDonutChart(title,rows,opt={}){
  rows=(rows||[]).filter(r=>(+r.value||0)>0).slice(0,5);
  if(!rows.length)return chartNoData(title,opt.sub||'');
  const total=rows.reduce((a,r)=>a+(+r.value||0),0)||1;
  const segments=['#2563eb','#16a34a','#f97316','#dc2626','#7c3aed'];
  let start=0;
  const grad=rows.map((r,i)=>{const pct=(+r.value||0)/total*100;const seg=`${segments[i%segments.length]} ${start}% ${start+pct}%`;start+=pct;return seg}).join(',');
  return `<div class="modern-chart-card"><div class="chart-head"><div><h4>${htmlesc(title)}</h4><small>${htmlesc(opt.sub||'')}</small></div><span class="chart-badge">${opt.money?compactMoney(total):total}</span></div><div class="donut-layout"><div class="donut" style="background:conic-gradient(${grad})"><span>${opt.money?compactMoney(total):total}</span></div><div class="donut-legend">${rows.map((r,i)=>`<p><i style="background:${segments[i%segments.length]}"></i><span>${htmlesc(r.label||'')}</span><b>${opt.money?compactMoney(r.value):r.value}</b></p>`).join('')}</div></div></div>`;
}
function renderChartHtml(id,html){const el=$(id);if(el)el.innerHTML=html;}

function reportSearchQ(){return ($('reportProductSearch')?.value||'').trim().toLowerCase();}
function renderDebtReports(from,to){
  if(!$('reportDebtSummary'))return;
  const q=reportSearchQ();
  const all=calcDebtRows().filter(d=>{
    const sd=debtSaleDate(d)||debtSettledDate(d)||'';
    if(sd && (sd<from||sd>to)) return false;
    return !q || debtRowText(d).includes(q) || String(d.saleCode||'').toLowerCase().includes(q);
  });
  const active=all.filter(d=>d.debt>0);
  const settled=all.filter(d=>d.settled);
  const overdue=active.filter(d=>debtOverdueDays(d)>0);
  const total=all.reduce((a,d)=>a+(+d.total||0),0), paid=all.reduce((a,d)=>a+(+d.paid||0),0), debt=active.reduce((a,d)=>a+(+d.debt||0),0), overdueAmt=overdue.reduce((a,d)=>a+(+d.debt||0),0);
  $('reportDebtSummary').innerHTML=`<div class="report-card">Tổng phiếu công nợ<b>${all.length}</b></div><div class="report-card">Đang nợ<b>${active.length} phiếu</b><small>${money(debt)}</small></div><div class="report-card">Đã tất toán<b>${settled.length} phiếu</b><small>${money(settled.reduce((a,d)=>a+(+d.total||0),0))}</small></div><div class="report-card">Quá hạn<b>${overdue.length} phiếu</b><small>${money(overdueAmt)}</small></div><div class="report-card">Tổng tiền<b>${money(total)}</b></div><div class="report-card">Đã thu<b>${money(paid)}</b></div>`;
  const row=(name,arr)=>`<tr><td><b>${name}</b></td><td>${arr.length}</td><td>${money(arr.reduce((a,d)=>a+(+d.total||0),0))}</td><td>${money(arr.reduce((a,d)=>a+(+d.paid||0),0))}</td><td>${money(arr.reduce((a,d)=>a+(+d.debt||0),0))}</td><td>${arr.filter(d=>debtOverdueDays(d)>0).length}</td></tr>`;
  if($('reportDebtStatusTable'))$('reportDebtStatusTable').innerHTML=row('Đang nợ',active)+row('Đã tất toán',settled)+row('Tất cả',all);
  if($('reportDebtDetailTable'))$('reportDebtDetailTable').innerHTML=all.sort((a,b)=>(b.debt-a.debt)||String(b.saleCode).localeCompare(String(a.saleCode))).slice(0,500).map(d=>{const ci=customerInfo(d.customer);return `<tr><td><b>${d.saleCode||''}</b></td><td>${ci.name||''}</td><td>${ci.phone||''}</td><td class="text-center"><b>${debtTotalQty(d)}</b></td><td><small>${debtGroupProductModels(d)||''}</small></td><td>${money(d.total)}</td><td>${money(d.paid)}</td><td><b class="${d.debt>0?'text-danger':''}">${money(d.debt)}</b></td><td>${debtSaleDate(d)||''}</td><td>${d.debt>0?(debtOverdueDays(d)>0?`<span class="badge red">Quá hạn ${debtOverdueDays(d)} ngày</span>`:'<span class="badge orange">Đang nợ</span>'):'<span class="badge green">Đã tất toán</span>'}</td></tr>`}).join('')||'<tr><td colspan="10">Không có công nợ trong kỳ</td></tr>';
}
function reportEmployeeIncomeRows(from,to){
  const old=commissionAppliedFilter;
  commissionAppliedFilter={q:reportSearchQ(),dept:'',staffId:'',from,to};
  const rows=employeeIncomeRows();
  commissionAppliedFilter=old;
  return rows;
}
function reportTechPerformanceRows(from,to){
  const old=commissionAppliedFilter;
  commissionAppliedFilter={q:reportSearchQ(),dept:'Kỹ thuật',staffId:'',from,to};
  const rows=techPerformanceRows();
  commissionAppliedFilter=old;
  return rows;
}
function renderCommissionReports(from,to){
  if(!$('reportIncomeSummary'))return;
  const rows=reportEmployeeIncomeRows(from,to);
  const totalSale=rows.reduce((a,r)=>a+(+r.saleCommission||0),0), totalTech=rows.reduce((a,r)=>a+(+r.techCost||0),0), totalFuel=rows.reduce((a,r)=>a+(+r.techFuel||0),0), totalBonus=rows.reduce((a,r)=>a+(+r.bonus||0),0), totalDeduct=rows.reduce((a,r)=>a+(+r.deduct||0),0), total=rows.reduce((a,r)=>a+(+r.total||0),0);
  $('reportIncomeSummary').innerHTML=`<div class="report-card">Nhân viên phát sinh<b>${rows.length}</b></div><div class="report-card">Hoa hồng Sale<b>${money(totalSale)}</b></div><div class="report-card">Công kỹ thuật<b>${money(totalTech)}</b></div><div class="report-card">Tiền xăng<b>${money(totalFuel)}</b></div><div class="report-card">Thưởng / Phạt<b>${money(totalBonus)} / ${money(totalDeduct)}</b></div><div class="report-card">Tổng thu nhập<b>${money(total)}</b></div>`;
  renderChartHtml('reportIncomeCharts',
    modernBarChart('Top thu nhập nhân viên',rows.slice().sort((a,b)=>b.total-a.total).map(r=>({label:r.name,value:r.total})),{sub:'Tổng thu nhập trong kỳ',money:true,limit:8})+
    modernDonutChart('Cơ cấu thu nhập',[{label:'Hoa hồng Sale',value:totalSale},{label:'Công kỹ thuật',value:totalTech},{label:'Tiền xăng',value:totalFuel},{label:'Thưởng',value:totalBonus}],{sub:'Tỷ trọng các khoản thu nhập',money:true})
  );
  if($('reportIncomeTable'))$('reportIncomeTable').innerHTML=rows.map(r=>`<tr><td><b>${r.name}</b></td><td>${money(r.saleCommission)}</td><td>${money(r.techCost)}</td><td>${money(r.techFuel)}</td><td>${money(r.bonus)}</td><td>${money(r.deduct)}</td><td><b>${money(r.total)}</b></td></tr>`).join('')||'<tr><td colspan="7">Không có dữ liệu thu nhập trong kỳ</td></tr>';
  const techRows=reportTechPerformanceRows(from,to);
  if($('reportTechPerformanceTable'))$('reportTechPerformanceTable').innerHTML=techRows.map(r=>`<tr><td><b>${r.name}</b></td><td>${r.count}</td><td>${r.qty}</td><td>${money(r.techCost)}</td><td>${money(r.techFuel)}</td><td>${r.warranty||0}</td></tr>`).join('')||'<tr><td colspan="6">Không có dữ liệu hiệu suất kỹ thuật trong kỳ</td></tr>';
}
function warrantyReportDate(w){return reportDateValue(w.receiveDate||w.start||w.createdAt||'')}
function renderWarrantyReports(from,to){
  if(!$('reportWarrantySummary'))return;
  const q=reportSearchQ();
  const rows=activeWarranties().filter(w=>{const d=warrantyReportDate(w); if(d && (d<from||d>to))return false; const txt=searchKey([w.code,w.warrantyCode,w.saleCode,w.customer,w.phone,w.address,w.serial,warrantyReasonsText(w),w.problem,w.result,w.status,w.techName].join(' ')); return !q||txt.includes(searchKey(q));});
  const byStatus={}, byReason={};
  rows.forEach(w=>{byStatus[w.status||'Khác']=(byStatus[w.status||'Khác']||0)+1;(Array.isArray(w.reasons)&&w.reasons.length?w.reasons:[w.reasonOther||'Khác']).forEach(r=>byReason[r]=(byReason[r]||0)+1);});
  const pending=rows.filter(w=>!['Hoàn thành','Đã trả khách'].includes(w.status||'')).length;
  $('reportWarrantySummary').innerHTML=`<div class="report-card">Tổng phiếu bảo hành<b>${rows.length}</b></div><div class="report-card">Đang xử lý<b>${pending}</b></div><div class="report-card">Hoàn thành<b>${rows.length-pending}</b></div><div class="report-card">Khách phát sinh<b>${new Set(rows.map(w=>w.phone||w.customer).filter(Boolean)).size}</b></div>`;
  renderChartHtml('reportWarrantyCharts',
    modernDonutChart('Trạng thái bảo hành',Object.entries(byStatus).map(([label,value])=>({label,value})),{sub:'Tỷ lệ xử lý theo trạng thái'})+
    modernBarChart('Lý do bảo hành nhiều nhất',Object.entries(byReason).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label,value})),{sub:'Top lý do phát sinh',limit:8})
  );
  const makeRows=obj=>Object.entries(obj).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${htmlesc(k)}</td><td><b>${v}</b></td></tr>`).join('');
  if($('reportWarrantyStatusTable'))$('reportWarrantyStatusTable').innerHTML=makeRows(byStatus)||'<tr><td colspan="2">Chưa có dữ liệu</td></tr>';
  if($('reportWarrantyReasonTable'))$('reportWarrantyReasonTable').innerHTML=makeRows(byReason)||'<tr><td colspan="2">Chưa có dữ liệu</td></tr>';
  if($('reportWarrantyDetailTable'))$('reportWarrantyDetailTable').innerHTML=rows.sort((a,b)=>String(warrantyReportDate(b)).localeCompare(String(warrantyReportDate(a)))).slice(0,400).map(w=>`<tr><td>${warrantyReportDate(w)||''}</td><td><b>${warrantyCode(w)}</b></td><td>${w.saleCode||''}</td><td>${htmlesc(w.customer||'')}</td><td>${htmlesc(w.phone||'')}</td><td>${htmlesc(w.serial||'')}</td><td><small>${warrantyReasonsText(w)||''}</small></td><td>${w.status||''}</td><td>${w.techName||warrantyStaffName(w.techId)||''}</td></tr>`).join('')||'<tr><td colspan="9">Không có bảo hành trong kỳ</td></tr>';
}


function renderPaymentReports(from,to){
  if(!$('reportPaymentSummary'))return;
  const rows=cashbookRows(from,to);
  const income=rows.reduce((a,r)=>a+r.income,0), expense=rows.reduce((a,r)=>a+r.expense,0), net=income-expense;
  const receiptCount=rows.filter(r=>r.income>0).length, expenseCount=rows.filter(r=>r.expense>0).length;
  $('reportPaymentSummary').innerHTML=`<div class="report-card">Tiền vào<b>${money(income)}</b><small>Phiếu thu + thu trực tiếp</small></div><div class="report-card">Tổng chi<b>${money(expense)}</b><small>Phiếu chi + lương</small></div><div class="report-card">Thu - chi<b>${money(net)}</b><small>Phát sinh ròng trong kỳ</small></div><div class="report-card">Giao dịch thu / chi<b>${receiptCount} / ${expenseCount}</b></div>`;
  const methods=paymentMethodSummary(from,to);
  if($('reportPaymentMethodTable'))$('reportPaymentMethodTable').innerHTML=methods.map(m=>`<tr><td>${paymentMethodBadge(m.method)}</td><td><b>${money(m.income)}</b></td><td>${money(m.expense)}</td><td><b class="${m.net<0?'text-red':'text-green'}">${money(m.net)}</b></td><td>${m.count}</td></tr>`).join('')||'<tr><td colspan="5">Chưa có phát sinh thanh toán trong kỳ</td></tr>';
  const daily={};
  rows.forEach(r=>{daily[r.date]=daily[r.date]||{date:r.date,income:0,expense:0,count:0};daily[r.date].income+=r.income;daily[r.date].expense+=r.expense;daily[r.date].count++});
  const days=Object.values(daily).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  if($('reportPaymentDailyTable'))$('reportPaymentDailyTable').innerHTML=days.map(d=>`<tr><td><b>${d.date}</b></td><td>${money(d.income)}</td><td>${money(d.expense)}</td><td><b class="${d.income-d.expense<0?'text-red':'text-green'}">${money(d.income-d.expense)}</b></td><td>${d.count}</td></tr>`).join('')||'<tr><td colspan="5">Chưa có dữ liệu đối chiếu ngày</td></tr>';
  renderChartHtml('reportPaymentCharts',
    modernDonutChart('Cơ cấu thu theo phương thức',methods.map(x=>({label:x.method,value:x.income})),{sub:'Dòng tiền thu theo phương thức',money:true})+
    modernBarChart('Thu - chi theo ngày',days.slice().reverse().map(x=>({label:x.date,value:x.income-x.expense})),{sub:'Chênh lệch thu chi từng ngày',money:true,limit:14})+
    modernBarChart('Dòng tiền thu theo phương thức',methods.map(x=>({label:x.method,value:x.income})),{sub:'Xếp hạng nguồn tiền thu',money:true,limit:8})
  );
}

function renderReports(){
  if(!$('reportBox'))return;
  if($('reportFrom')&&!$('reportFrom').value)setReportQuickRange();
  const {from,to,period}=reportRange();
  if(currentReportTab==='stock')renderStockReports(from,to);
  if(currentReportTab==='debts')renderDebtReports(from,to);
  if(currentReportTab==='payment')renderPaymentReports(from,to);
  if(currentReportTab==='commissions')renderCommissionReports(from,to);
  if(currentReportTab==='warranty')renderWarrantyReports(from,to);
  const productQ=($('reportProductSearch')?.value||'').trim().toLowerCase();
  const sales=activeSales().filter(s=>inReportRange(s.date,from,to));
  const expenses=data.expenses.filter(e=>inReportRange(e.date,from,to)&&!isSalaryCategory(e.category));
  const salaries=data.salaries.filter(e=>inReportRange(e.date,from,to));
  const rev=sales.reduce((a,s)=>a+(+s.grand||0),0);
  const revenueBeforeVat=sales.reduce((a,s)=>a+calcCommissionBase(s),0);
  // Công nợ/đã thu phải lấy theo phân bổ phiếu thu hiện tại, không chỉ lấy số tiền nhập lúc tạo đơn.
  const paid=sales.reduce((a,s)=>a+(+salePaymentInfo(s).paidTotal||0),0);
  const debt=sales.reduce((a,s)=>a+(+salePaymentInfo(s).debtLeft||0),0);
  const totalCost=sales.reduce((a,s)=>a+(+s.cost||((s.items||[]).reduce((b,it)=>b+costFor(it.code,s.date||today())*(+it.qty||0),0))),0);
  const grossMargin=revenueBeforeVat-totalCost;
  const comm=sales.reduce((a,s)=>a+saleCommissionValue(s),0);
  const techCostOnly=sales.reduce((a,s)=>a+(+s.techCost||0),0);
  const techFuelOnly=sales.reduce((a,s)=>a+(+s.techFuel||0),0);
  const tech=techCostOnly+techFuelOnly;
  const grossProfit=sales.reduce((a,s)=>a+saleProfitValue(s),0);
  const op=expenses.reduce((a,e)=>a+(+e.amount||0),0);
  const sal=salaries.reduce((a,e)=>a+(+e.total||+e.amount||0),0);
  const totalCompanyCost=op+sal;
  const profit=grossProfit-totalCompanyCost;
  const surchargeTotal=sales.reduce((a,s)=>a+(+s.surcharge||0),0);
  const qty=sales.reduce((a,s)=>a+(s.items||[]).reduce((b,it)=>b+(+it.qty||0),0),0);
  $('reportBox').innerHTML=`
    <div class="report-card">Doanh số kỳ này<small>${from} → ${to}</small><b>${money(rev)}</b></div>
    <div class="report-card">Số đơn / Sản phẩm<b>${sales.length} đơn / ${qty} SP</b></div>
    <div class="report-card">Đã thu<b>${money(paid)}</b></div>
    <div class="report-card">Còn nợ<b>${money(debt)}</b></div>
    <div class="report-card view-cost">Giá vốn<b>${money(totalCost)}</b></div>
    <div class="report-card view-cost">Lãi gộp<b>${money(grossMargin)}</b></div>
    <div class="report-card view-cost">Lợi nhuận đơn hàng<b>${money(grossProfit)}</b></div>
    <div class="report-card view-cost">Chi phí vận hành<b>${money(op)}</b></div><div class="report-card salary-only">Lương nhân viên<b>${money(sal)}</b></div><div class="report-card view-cost">Tổng chi phí CTY<b>${money(totalCompanyCost)}</b></div>
    <div class="report-card view-cost">Lợi nhuận ròng<b>${money(profit)}</b></div>
    <div class="report-card">Tổng phụ thu<b>${money(surchargeTotal)}</b></div><div class="report-card view-cost">Sale + Kỹ thuật<b>${money(comm+tech)}</b></div>`;
  if($('reportProfitBreakdownTable'))$('reportProfitBreakdownTable').innerHTML=[
    ['Doanh số trên đơn', rev, 'Tổng tiền khách phải trả theo phiếu bán sau chiết khấu, gồm phụ thu và VAT nếu có'],
    ['Doanh số trước VAT', revenueBeforeVat, 'Cơ sở tính lợi nhuận và hoa hồng'],
    ['Giá vốn sản phẩm', -totalCost, 'Lấy từ Bảng giá vốn hiệu lực, nếu không có thì lấy Giá vốn trong Sản phẩm'],
    ['Lãi gộp', grossMargin, 'Doanh số trước VAT - Giá vốn'],
    ['Hoa hồng Sale', -comm, 'Theo % hoa hồng trên đơn hàng'],
    ['Công kỹ thuật', -techCostOnly, 'Tiền công lắp đặt nhập trong phiếu bán'],
    ['Tiền xăng kỹ thuật', -techFuelOnly, 'Tiền xăng nhập trong phiếu bán'],
    ['Lợi nhuận đơn hàng', grossProfit, 'Lãi gộp - hoa hồng - công kỹ thuật - tiền xăng'],
    ['Chi phí vận hành', -op, 'Điện, nước, vận chuyển, marketing, văn phòng...'],
    ['Lương nhân viên', -sal, 'Mục lương riêng, chỉ người có quyền được xem'],
    ['Lợi nhuận ròng', profit, 'Lợi nhuận đơn hàng - chi phí vận hành - lương']
  ].map(([name,val,note])=>`<tr><td><b>${name}</b></td><td class="${val<0?'text-red':'text-green'}"><b>${money(val)}</b></td><td>${note}</td></tr>`).join('');

  const byProduct={};
  sales.forEach(s=>(s.items||[]).forEach(it=>{
    const code=it.code||''; const p=data.products.find(x=>x.code===code)||{};
    const name=it.name||p.name||'';
    const line=lineNet(it);
    const cost=costFor(code,s.date||today())*(+it.qty||0);
    byProduct[code]=byProduct[code]||{code,name,qty:0,revenue:0,cost:0};
    byProduct[code].qty+=+it.qty||0;byProduct[code].revenue+=line;byProduct[code].cost+=cost;
  }));
  let productRows=Object.values(byProduct).filter(x=>(x.code+' '+x.name).toLowerCase().includes(productQ)).sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue);
  if($('reportProductTable'))$('reportProductTable').innerHTML=productRows.map(x=>`<tr><td><b>${x.code}</b></td><td>${x.name}</td><td>${x.qty}</td><td>${money(x.revenue)}</td><td class="view-cost">${money(x.cost)}</td><td class="view-cost">${money(x.revenue-x.cost)}</td></tr>`).join('')||'<tr><td colspan="6">Chưa có sản phẩm bán ra trong kỳ</td></tr>';

  const byTime={};
  sales.forEach(s=>{
    const k=groupKeyByPeriod(s.date,period);
    byTime[k]=byTime[k]||{key:k,orders:0,qty:0,revenue:0,surcharge:0,paid:0,debt:0,comm:0,tech:0,profit:0};
    const pay=salePaymentInfo(s);byTime[k].orders++;byTime[k].qty+=(s.items||[]).reduce((a,it)=>a+(+it.qty||0),0);byTime[k].revenue+=+s.grand||0;byTime[k].surcharge+=+s.surcharge||0;byTime[k].paid+=+pay.paidTotal||0;byTime[k].debt+=+pay.debtLeft||0;byTime[k].comm+=saleCommissionValue(s);byTime[k].tech+=(+s.techCost||0)+(+s.techFuel||0);byTime[k].profit+=saleProfitValue(s);
  });
  if($('reportRevenueTable'))$('reportRevenueTable').innerHTML=Object.values(byTime).sort((a,b)=>String(b.key).localeCompare(String(a.key))).map(x=>`<tr><td><b>${x.key}</b></td><td>${x.orders}</td><td>${x.qty}</td><td>${money(x.revenue)}</td><td>${money(x.surcharge)}</td><td>${money(x.paid)}</td><td>${money(x.debt)}</td><td class="view-cost">${money(x.comm)}</td><td class="view-cost">${money(x.tech)}</td><td class="view-cost">${money(x.profit)}</td></tr>`).join('')||'<tr><td colspan="10">Chưa có doanh số trong kỳ</td></tr>';
  const timeAsc=Object.values(byTime).sort((a,b)=>String(a.key).localeCompare(String(b.key)));
  renderChartHtml('reportRevenueCharts',
    modernLineChart('Xu hướng doanh số',timeAsc.map(x=>({label:x.key,value:x.revenue})),{sub:'Doanh số theo mốc thời gian',money:true,badge:money(rev)})+
    modernBarChart('Top model bán chạy',productRows.map(x=>({label:x.code,value:x.qty})),{sub:'Số lượng bán ra theo model',limit:8})+
    modernBarChart('Doanh số theo model',productRows.map(x=>({label:x.code,value:x.revenue})),{sub:'Top model tạo doanh số',money:true,limit:8})
  );
  renderChartHtml('reportProfitCharts',
    modernBarChart('Cơ cấu lợi nhuận',[{label:'Doanh số trước VAT',value:revenueBeforeVat},{label:'Giá vốn',value:totalCost},{label:'Lãi gộp',value:grossMargin},{label:'Hoa hồng Sale',value:comm},{label:'Công + xăng KT',value:tech},{label:'Chi phí CTY',value:totalCompanyCost},{label:'Lợi nhuận ròng',value:profit}],{sub:'Các chỉ tiêu chính trong kỳ',money:true,limit:8})+
    modernLineChart('Lợi nhuận đơn hàng theo thời gian',timeAsc.map(x=>({label:x.key,value:x.profit})),{sub:'Lợi nhuận trước chi phí vận hành',money:true,badge:money(grossProfit)})+
    modernDonutChart('Chi phí vận hành',[{label:'Chi phí khác',value:op},{label:'Lương nhân viên',value:sal},{label:'Hoa hồng Sale',value:comm},{label:'Kỹ thuật + xăng',value:tech}],{sub:'Các khoản chi phí chính',money:true})
  );

  const byCat={};
  expenses.forEach(e=>{const k=e.category||'Khác';byCat[k]=byCat[k]||{category:k,count:0,amount:0};byCat[k].count++;byCat[k].amount+=+e.amount||0});
  if($('reportExpenseCategoryTable'))$('reportExpenseCategoryTable').innerHTML=Object.values(byCat).sort((a,b)=>b.amount-a.amount).map(x=>`<tr><td>${x.category}</td><td>${x.count}</td><td><b>${money(x.amount)}</b></td></tr>`).join('')||'<tr><td colspan="3">Chưa có chi phí trong kỳ</td></tr>';
  if($('reportExpenseDetailTable'))$('reportExpenseDetailTable').innerHTML=expenses.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<tr><td>${e.date||''}</td><td>${e.category||''}</td><td>${money(e.amount)}</td><td>${e.note||''}</td></tr>`).join('')||'<tr><td colspan="4">Chưa có chi phí vận hành trong kỳ</td></tr>';
  if($('reportSalaryDetailTable'))$('reportSalaryDetailTable').innerHTML=salaries.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<tr><td>${e.date||''}</td><td>${e.staffName||''}</td><td>${money(e.base)}</td><td>${money(e.allowance)}</td><td>${money(e.bonus)}</td><td>${money(e.deduct)}</td><td>${money(e.total||e.amount)}</td><td>${e.note||''}</td></tr>`).join('')||'<tr><td colspan="8">Chưa có lương trong kỳ</td></tr>';

  const returnVouchers=activeStockVouchers().filter(v=>v.type==='RETURN'&&inReportRange(v.date,from,to)&&canAccessVoucher(v));
  const returnRows=[];
  returnVouchers.forEach(v=>(v.items||[]).forEach(it=>{
    const sale=data.sales.find(s=>s.id===v.saleId||s.code===v.saleCode)||{};
    const priceLine=(sale.items||[]).find(x=>x.code===it.code)||{};
    returnRows.push({date:v.date,code:v.code,saleCode:v.saleCode||sale.code||'',customer:v.customerName||saleCustomerInfo(sale).name||'',warehouse:voucherWarehouse(v),product:it.code,name:it.name||'',qty:+it.qty||0,amount:lineNet({...priceLine,qty:+it.qty||0}),settlement:v.settlement||sale.returnSettlement||'',note:v.note||''});
  }));
  if($('reportReturnSummary'))$('reportReturnSummary').innerHTML=`<div class="report-card">Số phiếu trả hàng<b>${returnVouchers.length}</b></div><div class="report-card">Số lượng trả<b>${returnRows.reduce((a,r)=>a+r.qty,0)} SP</b></div><div class="report-card">Giá trị hàng trả<b>${money(returnRows.reduce((a,r)=>a+r.amount,0))}</b></div>`;
  if($('reportReturnTable'))$('reportReturnTable').innerHTML=returnRows.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(r=>`<tr><td>${r.date||''}</td><td>${r.code||''}</td><td>${r.saleCode||''}</td><td>${r.customer||''}</td><td>${r.warehouse||''}</td><td><b>${r.product}</b><br><small>${r.name}</small></td><td>${r.qty}</td><td>${money(r.amount)}</td><td>${r.settlement||''}</td><td>${r.note||''}</td></tr>`).join('')||'<tr><td colspan="10">Chưa có hàng bán bị trả lại trong kỳ</td></tr>';
  applyPermissions();
}
window.renderReports=renderReports;
function initPermissionChooser(selected=[]){
  const selectedSet=new Set(selected||[]);
  const permBox=document.getElementById('permBox');
  if(permBox){
    permBox.innerHTML=permissionGroupHtml([...selectedSet]);
  }
  const whBox=document.getElementById('warehouseAccessBox');
  if(whBox){
    const current=[...whBox.querySelectorAll('input:checked')].map(i=>i.value);
    const whSet=new Set(current);
    whBox.innerHTML=WAREHOUSES.map(w=>`<label class="warehouse-check"><input type="checkbox" value="${w}" ${whSet.has(w)?'checked':''}> ${w}</label>`).join('');
  }
}
function renderPermissions(){
  if(!$('uUid') && $('uEmail')) $('uEmail').insertAdjacentHTML('beforebegin','<input id="uUid" type="hidden">');
  const selected=[...document.querySelectorAll('#permBox input:checked')].map(i=>i.value);
  initPermissionChooser(selected);
  const q=($('permissionSearch')?.value||'').toLowerCase().trim();
  const rows=(data.users||[]).filter(u=>matchSearchText(q,u.email,u.name,u.role,(u.perms||[]).map(p=>permLabels[p]||p).join(' '),(u.warehouseAccess||[]).join(' ')));
  if($('permissionSearchCount'))$('permissionSearchCount').textContent=`Hiển thị ${rows.length}/${(data.users||[]).length}`;
  if($('permissionTable'))$('permissionTable').innerHTML=rows.map(u=>`<tr><td><b>${u.email||''}</b><br><small>UID: ${u.id}</small></td><td>${u.name||''}</td><td><span class="badge green">${u.role||''}</span></td><td><div class="perm-chip-wrap">${permissionSummary(u.perms||[])}</div></td><td>${(u.warehouseAccess||[]).map(w=>`<span class="perm-chip">${w}</span>`).join('')||'<span class="muted-small">Không giới hạn/Chưa chọn</span>'}</td><td><button class="btn ghost" onclick="editPermission('${u.id}')">Sửa</button> <button class="btn ghost admin-only" onclick="adminSendPasswordReset('${u.id}')">Reset mật khẩu</button></td></tr>`).join('')||'<tr><td colspan="6">Không tìm thấy phân quyền phù hợp</td></tr>';
  applyPermissions();
}
window.clearPermissionSearch=()=>{if($('permissionSearch'))$('permissionSearch').value='';renderPermissions();}
$('uRole')?.addEventListener('change',()=>applyRolePreset());
window.saveUserPermission=async()=>{
  let email=normEmail($('uEmail').value),role=$('uRole').value;
  if(!email)return alert('Nhập email');
  let existing=data.users.find(x=>x.id===$('uUid')?.value)||data.users.find(x=>normEmail(x.email)===email);
  if(!existing)return alert('Chưa có UID cho email này. Hãy bấm Tạo tài khoản nhân viên bằng email đó trước, sau đó quay lại Phân quyền để cấp quyền.');
  let perms=[...document.querySelectorAll('#permBox input:checked')].map(i=>i.value);
  let warehouseAccess=[...document.querySelectorAll('#warehouseAccessBox input:checked')].map(i=>i.value);
  if(role==='Admin')warehouseAccess=WAREHOUSES;
  if((role==='Kho Chính'||role==='Kho Văn Phòng')&&!warehouseAccess.length)warehouseAccess=[role];
  await setDoc(doc(db,'users',existing.id),{uid:existing.id,email,name:$('uName').value,role,perms,warehouseAccess,updatedAt:serverTimestamp()},{merge:true});
  $('uUid').value=existing.id;
  await loadAll()
}
window.editPermission=id=>{
  let u=data.users.find(x=>x.id===id);
  if(!u)return alert('Không tìm thấy user UID: '+id);
  $('uUid').value=u.id;$('uEmail').value=u.email||'';$('uName').value=u.name||'';$('uRole').value=u.role||'Sale';
  initPermissionChooser(u.perms||[]);
  document.querySelectorAll('#permBox input').forEach(i=>i.checked=(u.perms||[]).includes(i.value));
  document.querySelectorAll('#warehouseAccessBox input').forEach(i=>i.checked=((u.warehouseAccess||[]).includes(i.value) || u.role==='Admin'));
  $('permissions')?.scrollIntoView({behavior:'smooth',block:'start'});
  $('uName')?.focus();
}


window.adminSendPasswordReset=async(id)=>{
  try{
    if(currentPerm.role!=='Admin') return alert('Chỉ Admin mới được gửi yêu cầu reset mật khẩu.');
    const u=data.users.find(x=>x.id===id);
    const email=normEmail(u?.email||'');
    if(!email) return alert('User này chưa có email để reset mật khẩu.');
    if(!confirm('Gửi email reset mật khẩu cho '+email+'?')) return;
    await sendPasswordResetEmail(auth,email);
    await logAction('Admin reset mật khẩu','Gửi email reset mật khẩu cho '+email);
    alert('Đã gửi email reset mật khẩu cho '+email+'. Nhân viên mở email và tự đặt mật khẩu mới.');
  }catch(e){
    alert('Không gửi được email reset mật khẩu: '+authMsg(e));
  }
};



async function cancelRelatedSaleDocs(s,reason){
  const batch=writeBatch(db);
  const patch={canceled:true,isCanceled:true,status:'Đã hủy',cancelReason:reason||'',cancelledAt:serverTimestamp(),updatedAt:serverTimestamp()};
  try{receiptsForSale(s).forEach(r=>batch.update(doc(db,'receipts',r.id),{...patch,saleId:s.id,saleCode:s.code,note:[r.note||'',`Hủy theo phiếu bán ${s.code}: ${reason}`].filter(Boolean).join(' | ')}));}catch(e){console.warn(e)}
  data.stockVouchers.filter(v=>v.saleId===s.id||v.saleCode===s.code||v.id===s.stockVoucherId).forEach(v=>batch.update(doc(db,'stockVouchers',v.id),{...patch,note:[v.note||'',`Hủy theo phiếu bán ${s.code}: ${reason}`].filter(Boolean).join(' | ')}));
  data.warranties.filter(w=>w.saleId===s.id||w.saleCode===s.code).forEach(w=>batch.update(doc(db,'warranties',w.id),{...patch,note:[w.note||'',`Hủy theo phiếu bán ${s.code}: ${reason}`].filter(Boolean).join(' | ')}));
  await batch.commit();
}
window.cancelSale=async(id)=>{
  if(!has('deleteSales'))return alert('Bạn không có quyền hủy phiếu bán');
  const s=data.sales.find(x=>x.id===id);
  if(!s)return alert('Không tìm thấy phiếu bán');
  if(isSaleCanceled(s))return alert('Phiếu này đã hủy');
  const pay=salePaymentInfo(s);
  const sv=stockVoucherForSale(s);
  const reason=prompt(`Bạn đang HỦY phiếu ${s.code}.\n\nHệ thống sẽ:\n- Trừ doanh thu và lợi nhuận của phiếu khỏi báo cáo\n- Trừ hoa hồng Sale/Kỹ thuật\n- Hủy phiếu thu liên quan để không còn tính đã thu\n- Hủy phiếu xuất kho liên quan để hoàn tồn kho trên báo cáo tồn\n- Hủy bảo hành liên quan\n- Ghi nhật ký thao tác\n\nTổng tiền: ${money(s.grand)}\nĐã thu: ${money(pay.paidTotal)}\nPhiếu kho: ${sv?sv.code||'Có':'Chưa xuất kho'}\n\nNhập lý do hủy:`,'Nhập sai phiếu bán');
  if(!reason||!reason.trim())return alert('Bắt buộc nhập lý do hủy phiếu');
  if(!confirm(`Xác nhận hủy phiếu ${s.code}? Hành động này không xóa dữ liệu gốc mà chuyển trạng thái Đã hủy để truy vết.`))return;
  await updateDoc(doc(db,'sales',id),{canceled:true,isCanceled:true,status:'Đã hủy',paymentStatus:'Đã hủy',orderStatus:'Đã hủy',cancelReason:reason.trim(),cancelledAt:serverTimestamp(),cancelledBy:currentUser?.email||'',paidTotal:0,debtLeft:0,updatedAt:serverTimestamp()});
  await cancelRelatedSaleDocs(s,reason.trim());
  await logAction('Hủy phiếu bán',`${s.code} | ${reason.trim()} | Doanh thu -${money(s.grand)} | HH -${money(saleCommissionValue(s))}`);
  await loadAll();
  if(s.customerId) await updatePaymentStatusesForCustomer(s.customerId);
  await loadAll();
  alert('Đã hủy phiếu. Doanh số, công nợ, hoa hồng, tồn kho, phiếu thu và bảo hành liên quan đã được loại khỏi số liệu hiệu lực.');
};
window.removeDoc=async(name,id)=>{
  const label={sales:'đơn bán',stockVouchers:'phiếu kho',customers:'khách hàng',products:'sản phẩm',prices:'bảng giá',staff:'nhân viên',warranties:'bảo hành',expenses:'chi phí',receipts:'phiếu thu'}[name]||name;
  const code=prompt(`Bạn đang xóa ${label}. Nhập XOA để xác nhận:`);
  if(code!=='XOA')return;
  let customerToRefresh='';
  if(name==='sales'){
    return cancelSale(id);
  }
  if(name==='stockVouchers'){
    const v=data.stockVouchers.find(x=>x.id===id);
    if(stockVoucherLocked(v)&&currentPerm.role!=='Admin')return alert('Phiếu kho đã liên kết đơn bán/đã khóa. Chỉ Admin được xóa.');
  }
  if(name==='receipts'){
    const r=data.receipts.find(x=>x.id===id);
    customerToRefresh=r?.customerId||'';
  }
  await deleteDoc(doc(db,name,id));await logAction('Xóa '+label,id);await loadAll();
  if(customerToRefresh){await updatePaymentStatusesForCustomer(customerToRefresh);await loadAll()}
}
function doPrint(html){let w=window.open('','PRINT','width=800,height=900');w.document.write(`<!doctype html><html><head><title>In phiếu</title><style>body{font-family:Arial;margin:0;color:#111}.print-a5{width:148mm;min-height:210mm;padding:7mm 8mm;font-size:11.5px;box-sizing:border-box;page-break-after:always}table{width:100%;border-collapse:collapse;margin-top:6px;table-layout:fixed}th,td{border:1px solid #222;padding:4px;text-align:left;vertical-align:top;word-break:break-word}th{background:#f1f5f9}p{line-height:1.4}.print-a5 h2{font-size:17px;margin:3px 0 7px}.receipt-a5{font-size:11px;color:#0f172a}.receipt-brand{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;border-bottom:2px solid #0f172a;padding-bottom:6px}.receipt-brand b{font-size:13px}.receipt-brand span{font-size:10.5px}.receipt-code{text-align:right;border:1px solid #cbd5e1;border-radius:6px;padding:6px 8px;min-width:34mm}.receipt-code b{display:block;font-size:14px}.receipt-code span{font-size:11px}.receipt-a5 h2{text-align:center;font-size:20px;letter-spacing:.5px;margin:8px 0 2px}.receipt-sub{text-align:center;color:#475569;font-size:10.5px;margin-bottom:7px}.receipt-info{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}.receipt-info .box{border:1px solid #cbd5e1;border-radius:6px;padding:6px;background:#f8fafc}.receipt-info h4{margin:0 0 4px;font-size:11.5px}.receipt-info p{margin:2px 0;line-height:1.35}.receipt-purpose{border:1px dashed #94a3b8;border-radius:6px;padding:6px;margin:6px 0;background:#fff}.receipt-items th,.receipt-items td{font-size:10.8px}.receipt-items .c{text-align:center}.receipt-items .r{text-align:right}.receipt-bottom{display:grid;grid-template-columns:1fr 58mm;gap:8px;margin-top:8px;align-items:start}.receipt-words,.receipt-note{border:1px solid #cbd5e1;border-radius:6px;padding:7px;min-height:26px}.receipt-total{border:1px solid #0f172a;border-radius:6px;overflow:hidden}.receipt-total p{display:flex;justify-content:space-between;gap:8px;margin:0;padding:5px 7px;border-bottom:1px solid #e2e8f0}.receipt-total p:last-child{border-bottom:0}.receipt-total .main{background:#0f172a;color:white;font-size:12.5px;font-weight:bold}.receipt-note{margin-top:7px}.sign-row{display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center;gap:10px;margin-top:18mm}.sign-row small{font-size:10px;color:#334155}@page{size:A5 portrait;margin:0}@media print{html,body{width:148mm;min-height:210mm}.print-a5{width:148mm;min-height:210mm}}</style></head><body>${html}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script></body></html>`);w.document.close()}

function excelReady(){return !!window.XLSX}
function assertExcel(){if(!excelReady())throw new Error('Thư viện Excel chưa tải xong. Kiểm tra Internet hoặc tải lại trang.');}
const excelSchemas={
  customers:{sheet:'Khach_hang',headers:['customerCode','name','type','phone','address','email','contact','source','birthday','note','discount','openingDebt'],sample:[{customerCode:'KL0902950816',name:'Nguyễn Văn A',type:'Khách lẻ',phone:'0902950816',address:'Đà Nẵng',email:'',contact:'',source:'Facebook',birthday:'',note:'',discount:0,openingDebt:0}]},
  products:{sheet:'San_pham',headers:['code','name','category','cost','price','minStock','active'],sample:[{code:'F07',name:'Khóa thông minh F07',category:'Khóa thông minh',cost:950000,price:1850000,minStock:3,active:'active'}]},
  prices:{sheet:'Bang_gia',headers:['listName','code','type','price','validFrom','validTo','active','note'],sample:[{listName:'Bảng giá bán lẻ tháng hiện hành',code:'F07',type:'Khách lẻ',price:1850000,validFrom:today(),validTo:'',active:true,note:'Giá bán lẻ'}]},
  costPrices:{sheet:'Bang_gia_von',headers:['listName','code','cost','validFrom','validTo','active','note'],sample:[{listName:'Giá vốn tháng hiện hành',code:'F07',cost:950000,validFrom:today(),validTo:'',active:true,note:'Giá vốn tháng hiện hành'}]},
  staff:{sheet:'Nhan_vien',headers:['name','dept','functions','phone','commissionPercent','techFee'],sample:[{name:'Nguyễn Sale + Kỹ thuật',dept:'Sale',functions:'Sale;Kỹ thuật',phone:'0900000001',commissionPercent:5,techFee:100000},{name:'Lê Kỹ Thuật',dept:'Kỹ thuật',functions:'Kỹ thuật',phone:'0900000002',commissionPercent:0,techFee:100000}]},
  expenses:{sheet:'Phieu_chi_Chi_phi',headers:['date','category','amount','paymentMethod','note'],sample:[{date:today(),category:'Tiền điện',amount:1500000,paymentMethod:'Tiền mặt',note:'Tiền điện tháng'}]},
  salaries:{sheet:'Luong_nhan_vien',headers:['date','staffName','base','allowance','bonus','deduct','total','note'],sample:[{date:today(),staffName:'Nguyễn Văn A',base:8000000,allowance:0,bonus:0,deduct:0,total:8000000,note:'Lương tháng'}]},
  warranties:{sheet:'Bao_hanh',headers:['code','saleCode','customer','phone','address','serial','start','months','end','receiveDate','receiverName','techName','priority','status','reasons','reasonOther','problem','result','completeDate','note'],sample:[{code:'BH000001',saleCode:'BH000001',customer:'Nguyễn Văn A',phone:'0902950816',address:'Đà Nẵng',serial:'F07 x1',start:today(),months:24,end:'',receiveDate:today(),receiverName:'',techName:'',priority:'Bình thường',status:'Mới tiếp nhận',reasons:'Không nhận vân tay;Kẹt chốt',reasonOther:'',problem:'Khách báo lỗi',result:'',completeDate:'',note:''}]},
  stockVouchers:{sheet:'Chung_tu_kho',headers:['code','date','type','warehouse','productCode','productName','qty','cost','note'],sample:[{code:'NK000001',date:today(),type:'IN',warehouse:defaultWarehouse(),productCode:'F07',productName:'Khóa thông minh F07',qty:10,cost:950000,note:'Nhập kho'}]},
  sales:{sheet:'Ban_hang',headers:['code','date','customerCode','customerName','customerPhone','staffName','techName','goodsBeforeDiscount','lineDiscountTotal','orderDiscountType','orderDiscountValue','orderDiscountTotal','discountTotal','grand','paid','debt','paymentMethod','commissionPercent','saleCommission','techCost','techFuel','surcharge','profit','itemsJson','note'],sample:[{code:'BH000001',date:today(),customerCode:'KL0902950816',customerName:'Nguyễn Văn A',customerPhone:'0902950816',staffName:'Nguyễn Sale',techName:'Lê Kỹ Thuật',grand:1850000,paid:1850000,debt:0,paymentMethod:'Chuyển khoản',commissionPercent:5,saleCommission:85648,techCost:100000,techFuel:0,surcharge:0,goodsBeforeDiscount:1850000,lineDiscountTotal:0,orderDiscountType:'none',orderDiscountValue:0,orderDiscountTotal:0,discountTotal:0,profit:577315,itemsJson:'[{"code":"F07","name":"Khóa thông minh F07","qty":1,"price":1850000,"discount":0}]',note:''}]},
  commissions:{sheet:'Hoa_hong',headers:['date','code','customer','saleStaff','techStaff','grand','commissionPercent','saleCommission','techCost','techFuel','totalCommission'],sample:[]},
  stockbook:{sheet:'So_kho',headers:['code','name','inQty','outQty','transferQty','adjustQty','khoChinh','khoVanPhong','stock'],sample:[]},
  debtsSettled:{sheet:'Cong_no_da_tat_toan',headers:['STT','Phiếu','Khách hàng','SĐT','Model','Tổng tiền','Đã thu','Ngày thanh toán'],sample:[]},
  techPerformance:{sheet:'Hieu_suat_ky_thuat',headers:['Kỹ thuật','Số phiếu','Số bộ','Công','Tiền xăng','Bảo hành phát sinh'],sample:[]},
  employeeIncome:{sheet:'Tong_thu_nhap',headers:['Nhân viên','Hoa hồng Sale','Công kỹ thuật','Tiền xăng','Thưởng','Phạt','Tổng thu nhập'],sample:[]},
  returns:{sheet:'Hang_tra_lai',headers:['date','voucherCode','saleCode','customer','warehouse','code','name','qty','amount','settlement','note'],sample:[]},
  cashbook:{sheet:'So_quy',headers:['date','code','type','content','paymentMethod','income','expense','balance'],sample:[]},
  paymentReport:{sheet:'Bao_cao_thanh_toan',headers:['method','income','expense','net','count'],sample:[]},
  logs:{sheet:'Nhat_ky',headers:['time','email','action','detail'],sample:[]}
};
function exportRows(type){let rows=[];
  if(type==='customers')rows=data.customers.map(c=>({customerCode:ensureCustomerCode(c),name:c.name,type:c.type,phone:c.phone,address:c.address,discount:c.discount,openingDebt:c.openingDebt}));
  if(type==='products')rows=data.products.map(p=>({code:p.code,name:p.name,category:p.category,cost:p.cost,price:p.price,minStock:p.minStock,active:p.active||'active',stock:stockOf(p.code)}));
  if(type==='prices')rows=data.prices.map(p=>({listName:p.listName||'',code:p.code,type:p.type,price:p.price,validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||''}));
  if(type==='costPrices')rows=(data.costPrices||[]).map(p=>({listName:p.listName||'',code:p.code,cost:p.cost,validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||''}));
  if(type==='staff')rows=data.staff.map(e=>({name:e.name,dept:e.dept,functions:staffFunctionText(e),phone:e.phone,commissionPercent:e.commissionPercent||0,techFee:e.techFee||0}));
  if(type==='expenses')rows=data.expenses.filter(e=>!isSalaryCategory(e.category)).map(e=>({date:e.date,category:e.category,amount:e.amount,paymentMethod:e.paymentMethod||'Tiền mặt',note:e.note}));
  if(type==='salaries')rows=data.salaries.map(e=>({date:e.date,staffName:e.staffName,base:e.base,allowance:e.allowance,bonus:e.bonus,deduct:e.deduct,total:e.total,note:e.note}));
  if(type==='warranties')rows=activeWarranties().map(w=>({code:warrantyCode(w),saleCode:w.saleCode||'',customer:w.customer||'',phone:w.phone||'',address:w.address||'',serial:w.serial||'',start:w.start||'',months:w.months||24,end:w.end||'',receiveDate:w.receiveDate||'',receiverName:w.receiverName||'',techName:w.techName||'',priority:w.priority||'',status:w.status||'',reasons:(w.reasons||[]).join(';'),reasonOther:w.reasonOther||'',problem:w.problem||'',result:w.result||'',completeDate:w.completeDate||'',note:w.note||''}));
  if(type==='stockVouchers')rows=activeStockVouchers().flatMap(v=>(v.items||[]).map(it=>({code:v.code,date:v.date,type:v.type,warehouse:voucherWarehouse(v),productCode:it.code,productName:it.name,qty:it.actualQty??it.inputQty??it.qty,cost:it.cost,note:it.note||v.note||''})));
  if(type==='sales')rows=activeSales().map(s=>({code:s.code,date:s.date,customerCode:s.customerCode||'',customerName:saleCustomerInfo(s).name,customerPhone:saleCustomerInfo(s).phone||'',staffName:s.staffName,techName:s.techName,goodsBeforeDiscount:s.goodsBeforeDiscount||0,lineDiscountTotal:s.lineDiscountTotal||0,orderDiscountType:s.orderDiscountType||'none',orderDiscountValue:s.orderDiscountValue||0,orderDiscountTotal:s.orderDiscountTotal||0,discountTotal:s.discountTotal||0,grand:s.grand,paid:s.paid,debt:s.debt,paymentMethod:s.paymentMethod||'',commissionPercent:s.commissionPercent,saleCommission:saleCommissionValue(s),techCost:s.techCost,techFuel:s.techFuel||0,surcharge:s.surcharge||0,profit:saleProfitValue(s),itemsJson:JSON.stringify(s.items||[]),note:s.note||''}));
  if(type==='commissions')rows=commissionEligibleSales().map(s=>{const saleCom=saleCommissionValue(s);const itemSum=saleItemSummary(s);return {date:s.date,code:s.code,customer:saleCustomerInfo(s).name,model:itemSum.models,qty:itemSum.totalQty,qtyDetail:itemSum.qtyText,saleStaff:s.staffName,techStaff:s.techName,grand:s.grand,surcharge:s.surcharge||0,discountTotal:s.discountTotal||0,commissionBase:saleCommissionBaseValue(s),commissionPercent:s.commissionPercent,saleCommission:saleCom,techCost:s.techCost,techFuel:s.techFuel||0,totalCommission:saleCom+(+s.techCost||0)+(+s.techFuel||0)}});
  if(type==='debtsSettled')rows=calcSettledDebts().map((d,idx)=>{const ci=customerInfo(d.customer);return {'STT':idx+1,'Phiếu':d.saleCode||'','Khách hàng':ci.name||'','SĐT':ci.phone||'','SL':debtTotalQty(d),'Model':debtGroupProductModels(d)||'','Tổng tiền':d.total||0,'Đã thu':d.paid||0,'Ngày thanh toán':debtSettledDate(d)}});
  if(type==='techPerformance')rows=techPerformanceRows().map(r=>({'Kỹ thuật':r.name,'Số phiếu':r.count,'Số bộ':r.qty,'Công':r.techCost,'Tiền xăng':r.techFuel,'Bảo hành phát sinh':r.warranty||0}));
  if(type==='employeeIncome')rows=employeeIncomeRows().map(r=>({'Nhân viên':r.name,'Hoa hồng Sale':r.saleCommission,'Công kỹ thuật':r.techCost,'Tiền xăng':r.techFuel,'Thưởng':r.bonus,'Phạt':r.deduct,'Tổng thu nhập':r.total}));
  if(type==='returns'){rows=activeStockVouchers().filter(v=>v.type==='RETURN'&&canAccessVoucher(v)).flatMap(v=>(v.items||[]).map(it=>{const sale=data.sales.find(s=>s.id===v.saleId||s.code===v.saleCode)||{};const priceLine=(sale.items||[]).find(x=>x.code===it.code)||{};return{date:v.date||'',voucherCode:v.code||'',saleCode:v.saleCode||sale.code||'',customer:v.customerName||saleCustomerInfo(sale).name||'',warehouse:voucherWarehouse(v),code:it.code||'',name:it.name||'',qty:+it.qty||0,amount:lineNet({...priceLine,qty:+it.qty||0}),settlement:v.settlement||sale.returnSettlement||'',note:v.note||''}}));}
  if(type==='cashbook')rows=cashbookRows().map(r=>({date:r.date,code:r.code,type:r.type,content:r.content,paymentMethod:r.paymentMethod,income:r.income,expense:r.expense,balance:r.balance}));
  if(type==='paymentReport')rows=paymentMethodSummary(reportRange().from,reportRange().to).map(r=>({method:r.method,income:r.income,expense:r.expense,net:r.net,count:r.count}));
  if(type==='logs')rows=(data.logs||[]).map(l=>({time:logTime(l.at),email:l.email||'',action:l.action||'',detail:l.detail||''}));
  if(type==='stockbook'){const df=stockBookDateFilter();rows=stockBookRows(df.from,df.to).filter(r=>!df.active||r.periodMovement).map(r=>({tuNgay:df.from||'',denNgay:df.to||'',model:r.code,sanPham:r.name,nhap:r.totalIn,xuat:r.totalOut,chuyenKho:r.totalTransfer,dieuChinh:r.totalAdj,khoChinh:canAccessWarehouse('Kho Chính')?r.khoChinh:'Ẩn',khoVanPhong:canAccessWarehouse('Kho Văn Phòng')?r.khoVanPhong:'Ẩn',tongTonHienTai:r.stock,giaVon:has('viewCost')?r.cost:'Ẩn',giaTriTon:has('viewCost')?r.value:'Ẩn'}));}
  return rows;
}
function stockQtyByType(code,type){let q=0;activeStockVouchers().forEach(v=>{if(v.type!==type)return;(v.items||[]).forEach(it=>{if(it.code===code)q+=+it.qty||0})});return q}
function makeWorkbook(sheets){assertExcel();const wb=XLSX.utils.book_new();Object.entries(sheets).forEach(([name,rows])=>{const ws=XLSX.utils.json_to_sheet(rows.length?rows:[{}]);XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));});return wb;}

function safeSheetName(name){return String(name||'Nhan_vien').replace(/[\/?*\[\]:]/g,' ').slice(0,31)||'Nhan_vien'}
function commissionExportRowsForSales(rows){
  return rows.slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).map((s,idx)=>{const saleCom=saleCommissionValue(s);return {
    STT:idx+1,
    'Ngày':s.date||'',
    'Mã phiếu':s.code||'',
    'Khách hàng':saleCustomerInfo(s).name||'',
    'SĐT':saleCustomerInfo(s).phone||'',
    'Model':saleItemSummary(s).models,
    'Số lượng':saleItemSummary(s).totalQty,
    'Chi tiết SL':saleItemSummary(s).qtyText,
    'Sale':s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||'',
    'Kỹ thuật':s.techName||data.staff.find(x=>x.id===s.techId)?.name||'',
    'Tiền hàng':+(s.subtotal||0)||0,
    'Phụ thu':+(s.surcharge||0)||0,
    'Chiết khấu':+(s.discountTotal||0)||0,
    'Doanh số tính HH':saleCommissionBaseValue(s),
    '% HH':+(s.commissionPercent||0)||0,
    'Hoa hồng Sale':saleCom,
    'Công kỹ thuật':+(s.techCost||0)||0,
    'Tiền xăng KT':+(s.techFuel||0)||0,
    'Tổng nhận':saleCom+(+s.techCost||0)+(+s.techFuel||0)
  }});
}
function commissionSummaryRows(rows){
  const total=(key)=>rows.reduce((a,r)=>a+(+r[key]||0),0);
  return [{STT:'', 'Ngày':'', 'Mã phiếu':'TỔNG', 'Khách hàng':'', 'SĐT':'', 'Model':'', 'Số lượng':total('Số lượng'), 'Chi tiết SL':'', 'Sale':'', 'Kỹ thuật':'', 'Tiền hàng':total('Tiền hàng'), 'Phụ thu':total('Phụ thu'), 'Chiết khấu':total('Chiết khấu'), 'Doanh số tính HH':total('Doanh số tính HH'), '% HH':'', 'Hoa hồng Sale':total('Hoa hồng Sale'), 'Công kỹ thuật':total('Công kỹ thuật'), 'Tiền xăng KT':total('Tiền xăng KT'), 'Tổng nhận':total('Tổng nhận')}];
}
window.exportCommissionByStaff=()=>{try{
  assertExcel();
  // Xuất đúng 01 file cho nhân viên đang được chọn trên bộ lọc.
  // Không xuất toàn bộ nhân viên một lần để tránh nhầm khi đối chiếu lương/hoa hồng.
  commissionAppliedFilter=readCommissionFilterFromForm();
  const f=commissionAppliedFilter||{};
  if(!f.staffId){
    return alert('Vui lòng chọn 1 nhân viên trước khi xuất Excel hoa hồng.');
  }
  const staff=data.staff.find(x=>x.id===f.staffId);
  const rows=commissionFilteredSales();
  if(!rows.length){
    return alert('Không có dữ liệu hoa hồng của nhân viên đã chọn theo bộ lọc hiện tại.');
  }
  const detail=commissionExportRowsForSales(rows);
  const out=detail.concat(commissionSummaryRows(detail));
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(out),safeSheetName(staff?.name||'Hoa_hong'));
  const staffName=(staff?.name||'Nhan_vien').replace(/[^a-zA-Z0-9À-ỹ]+/g,'_').replace(/^_+|_+$/g,'');
  const rangeName=[f.from,f.to].filter(Boolean).join('_den_')||today();
  XLSX.writeFile(wb,`Hoa_hong_${staffName}_${rangeName}.xlsx`);
  renderCommissions();
}catch(err){alert(err.message)}};

window.exportExcel=(type)=>{try{const schema=excelSchemas[type]||{sheet:type};const rows=exportRows(type);const wb=makeWorkbook({[schema.sheet||type]:rows.length?rows:(schema.sample||[])});XLSX.writeFile(wb,`${type}_${today()}.xlsx`);}catch(err){alert(err.message)}};
window.downloadTemplateExcel=(type)=>{try{const schema=excelSchemas[type];if(!schema)return alert('Chưa có mẫu Excel cho mục này');const sample=schema.sample?.length?schema.sample:[Object.fromEntries(schema.headers.map(h=>[h,'']))];const wb=makeWorkbook({[schema.sheet]:sample});XLSX.writeFile(wb,`mau_import_${type}.xlsx`);}catch(err){alert(err.message)}};
window.exportAllExcel=()=>{try{const sheets={};['customers','products','prices','staff','sales','stockVouchers','expenses','salaries','warranties','commissions','stockbook','returns','logs'].forEach(t=>{sheets[excelSchemas[t]?.sheet||t]=exportRows(t)});const wb=makeWorkbook(sheets);XLSX.writeFile(wb,`Similock_Da_Nang_Toan_bo_${today()}.xlsx`);}catch(err){alert(err.message)}};
function rowsFromCsvText(text){const rows=parseCSV(text);if(rows.length<2)return[];const heads=rows.shift().map(x=>x.trim());return rows.map(r=>{let o={};heads.forEach((h,i)=>o[h]=r[i]??'');return o})}
async function readImportRows(file){if(/\.csv$/i.test(file.name))return rowsFromCsvText(await file.text());assertExcel();const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array',cellDates:false});const ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(ws,{defval:''});}
window.importExcel=async(e,type)=>{
  let file=e.target.files[0];if(!file)return;
  let rows=[];try{rows=await readImportRows(file)}catch(err){alert('Không đọc được file Excel/CSV: '+err.message);return}
  if(!rows.length){e.target.value='';return alert('File import không có dữ liệu')}
  let ok=0,skip=0,errors=[];
  const existingByPhone=new Map(data.customers.map(x=>[normalizePhone(x.phone),x]));
  const existingByCode=new Map(data.products.map(x=>[String(x.code||'').toUpperCase(),x]));
  const existingStaff=new Map(data.staff.map(x=>[String(x.name||'').trim().toLowerCase(),x]));
  const existingPriceKey=new Map(data.prices.map(x=>[`${String(x.code||'').toUpperCase()}|${x.type}|${x.validFrom||''}|${x.validTo||''}`,x]));
  const stockGroup=new Map();
  for(let r=0;r<rows.length;r++){
    let obj={...rows[r]};
    try{
      if(type==='customers'){
        obj.name=String(obj.name||obj['Tên khách']||'').trim(); obj.phone=String(obj.phone||obj['SĐT']||'').trim();
        if(!obj.name){skip++;errors.push(`Dòng ${r+2}: thiếu tên khách`);continue}
        obj.customerCode=String(obj.customerCode||customerCodeFromPhone(obj.phone)).trim();obj.type=obj.type||'Khách lẻ';obj.discount=safeNum(obj.discount);obj.openingDebt=safeNum(obj.openingDebt);obj.address=obj.address||'';
        const key=normalizePhone(obj.phone);
        if(key&&existingByPhone.has(key)){await updateDoc(doc(db,'customers',existingByPhone.get(key).id),obj);}
        else await addDoc(col('customers'),{...obj,createdAt:serverTimestamp()});
      }else if(type==='products'){
        obj.code=String(obj.code||obj.model||'').trim().toUpperCase();obj.name=String(obj.name||'').trim();
        if(!obj.code||!obj.name){skip++;errors.push(`Dòng ${r+2}: thiếu model/tên sản phẩm`);continue}
        obj.category=obj.category||'Khóa thông minh';obj.cost=safeNum(obj.cost);obj.price=safeNum(obj.price);obj.minStock=safeNum(obj.minStock)||3;obj.active=obj.active||'active';
        if(existingByCode.has(obj.code)) await updateDoc(doc(db,'products',existingByCode.get(obj.code).id),obj);
        else await addDoc(col('products'),{...obj,createdAt:serverTimestamp()});
      }else if(type==='prices'){
        obj.listName=String(obj.listName||obj.name||'Bảng giá nhập Excel').trim();obj.code=String(obj.code||'').trim().toUpperCase();obj.type=obj.type||'Khách lẻ';obj.price=safeNum(obj.price);obj.validFrom=String(obj.validFrom||'');obj.validTo=String(obj.validTo||'');obj.active=String(obj.active).toLowerCase()!=='false';obj.note=obj.note||'';
        if(!obj.code||!obj.price){skip++;errors.push(`Dòng ${r+2}: thiếu model/giá`);continue}
        if(!validateDate(obj.validFrom)||!validateDate(obj.validTo)){skip++;errors.push(`Dòng ${r+2}: sai định dạng ngày YYYY-MM-DD`);continue}
        if(obj.validFrom&&obj.validTo&&obj.validFrom>obj.validTo){skip++;errors.push(`Dòng ${r+2}: ngày bắt đầu lớn hơn ngày kết thúc`);continue}
        const key=`${obj.code}|${obj.type}|${obj.validFrom}|${obj.validTo}`;
        if(existingPriceKey.has(key)) await updateDoc(doc(db,'prices',existingPriceKey.get(key).id),obj);
        else await addDoc(col('prices'),{...obj,createdAt:serverTimestamp()});
      }else if(type==='staff'){
        obj.name=String(obj.name||'').trim();obj.dept=obj.dept||obj.department||'Sale';obj.phone=String(obj.phone||'').trim();obj.functions=String(obj.functions||obj.chucNang||obj.chuc_nang||'').split(/[;,]/).map(x=>x.trim()).filter(Boolean);obj.commissionPercent=safeNum(obj.commissionPercent);obj.techFee=safeNum(obj.techFee);
        if(!obj.name){skip++;errors.push(`Dòng ${r+2}: thiếu tên nhân viên`);continue}
        if(!obj.functions.length){if(obj.dept==='Sale'||obj.dept==='Quản lý')obj.functions=['Sale'];else if(obj.dept==='Kỹ thuật')obj.functions=['Kỹ thuật'];else if(String(obj.dept).includes('Kho'))obj.functions=['Kho'];else obj.functions=[obj.dept]}
        if(obj.functions.includes('Sale')||obj.functions.includes('Quản lý')){if(!obj.commissionPercent)obj.commissionPercent=5}else obj.commissionPercent=0;
        if(obj.functions.includes('Kỹ thuật')){if(!obj.techFee)obj.techFee=100000}else obj.techFee=0;
        const key=obj.name.toLowerCase();if(existingStaff.has(key)) await updateDoc(doc(db,'staff',existingStaff.get(key).id),obj);else await addDoc(col('staff'),obj);
      }else if(type==='expenses'){
        obj.date=String(obj.date||today());obj.category=obj.category||'Khác';obj.amount=safeNum(obj.amount);obj.note=obj.note||'';
        if(!validateDate(obj.date)||!obj.amount){skip++;errors.push(`Dòng ${r+2}: thiếu ngày hoặc số tiền`);continue}
        await addDoc(col('expenses'),{...obj,createdAt:serverTimestamp()});
      }else if(type==='warranties'){
        obj.code=String(obj.code||obj.warrantyCode||'').trim();obj.saleCode=String(obj.saleCode||'').trim();obj.customer=String(obj.customer||'').trim();obj.phone=String(obj.phone||'').trim();obj.address=String(obj.address||'').trim();obj.serial=String(obj.serial||'').trim();obj.start=String(obj.start||today());obj.months=safeNum(obj.months)||24;obj.receiveDate=String(obj.receiveDate||today());obj.receiverName=String(obj.receiverName||'').trim();obj.techName=String(obj.techName||'').trim();obj.priority=obj.priority||'Bình thường';obj.status=obj.status||'Mới tiếp nhận';obj.reasons=String(obj.reasons||'').split(/[;,]/).map(x=>x.trim()).filter(Boolean);obj.reasonOther=String(obj.reasonOther||'').trim();obj.problem=obj.problem||'';obj.result=obj.result||'';obj.completeDate=obj.completeDate||'';obj.note=obj.note||'';obj.saleId=obj.saleId||'';
        if(!obj.customer||!obj.serial){skip++;errors.push(`Dòng ${r+2}: thiếu khách hoặc serial/model`);continue}
        let end=obj.end;if(!end){let d=new Date(obj.start);d.setMonth(d.getMonth()+obj.months);end=d.toISOString().slice(0,10)}
        await addDoc(col('warranties'),{...obj,end,createdAt:serverTimestamp()});
      }else if(type==='costPrices'){
        if(!has('viewCost')){skip++;continue;}
        const o={listName:String(obj.listName||obj.name||'Bảng giá vốn nhập Excel').trim(),code:String(obj.code||obj.productCode||'').trim().toUpperCase(),cost:safeNum(obj.cost),validFrom:String(obj.validFrom||''),validTo:String(obj.validTo||''),active:String(obj.active).toLowerCase()!=='false',note:obj.note||'',createdAt:serverTimestamp()};
        if(!o.code||!o.cost){skip++;continue;}
        await addDoc(col('costPrices'),o);ok++;continue;
      }
      if(type==='stockVouchers'){
        const code=String(obj.code||nextCode(prefixByStockType(obj.type||'IN'),data.stockVouchers)).trim();
        const key=code+'|'+(obj.type||'IN')+'|'+(obj.date||today())+'|'+(obj.warehouse||defaultWarehouse());
        const item={code:String(obj.productCode||obj.codeProduct||'').trim().toUpperCase(),name:obj.productName||obj.name||'',qty:safeNum(obj.qty),cost:safeNum(obj.cost),note:obj.note||''};
        if(!item.code||!item.qty){skip++;errors.push(`Dòng ${r+2}: thiếu model hoặc số lượng`);continue}
        if(!stockGroup.has(key)) stockGroup.set(key,{code,date:String(obj.date||today()),type:obj.type||'IN',warehouse:obj.warehouse||defaultWarehouse(),note:obj.note||'',items:[]});
        stockGroup.get(key).items.push(item);
        ok++;continue;
      }else if(type==='sales'){
        let items=[];try{items=obj.itemsJson?JSON.parse(obj.itemsJson):[]}catch(_){items=[]}
        if(!items.length){skip++;errors.push(`Dòng ${r+2}: thiếu itemsJson`);continue}
        const totals=calcSaleTotals(items,obj.vatMode||'included8',safeNum(obj.paid),safeNum(obj.surcharge),obj.orderDiscountType||'none',safeNum(obj.orderDiscountValue));
        const grand=safeNum(obj.grand)||totals.grand;
        const o={code:obj.code||nextCode('BH',data.sales),date:String(obj.date||today()),customerCode:obj.customerCode||customerCodeFromPhone(obj.customerPhone),customerName:obj.customerName||'',customerPhone:obj.customerPhone||'',staffName:obj.staffName||'',techName:obj.techName||'',items,...totals,grand,paid:safeNum(obj.paid),debt:safeNum(obj.debt)||grand-safeNum(obj.paid),paymentMethod:obj.paymentMethod||'Tiền mặt',commissionPercent:safeNum(obj.commissionPercent),saleCommission:safeNum(obj.saleCommission),techCost:safeNum(obj.techCost),techFuel:safeNum(obj.techFuel),surcharge:safeNum(obj.surcharge),profit:safeNum(obj.profit),note:obj.note||'',createdAt:serverTimestamp()};
        await addDoc(col('sales'),o);
      }else{skip++;errors.push(`Mục ${type} chưa hỗ trợ nhập Excel`);continue}
      ok++;
    }catch(err){skip++;errors.push(`Dòng ${r+2}: ${err.message}`)}
  }
  if(type==='stockVouchers'){
    for(const v of stockGroup.values()){v.value=(v.items||[]).reduce((a,it)=>a+Math.abs(+it.qty||0)*(+it.cost||0),0);await addDoc(col('stockVouchers'),{...v,createdAt:serverTimestamp()});}
  }
  await logAction('Import Excel '+type,`Thành công ${ok}, bỏ qua ${skip}`);
  await loadAll();e.target.value='';alert(`Import Excel xong: ${ok} dòng. Bỏ qua: ${skip}`+(errors.length?'\n'+errors.slice(0,8).join('\n'):''));
};
window.exportCSV=(type)=>window.exportExcel(type);
window.importCSV=(e,type)=>window.importExcel(e,type);


window.exportBackup=()=>{
  const pack={exportedAt:new Date().toISOString(),customers:data.customers,products:data.products,prices:data.prices,staff:data.staff,sales:data.sales,stockVouchers:data.stockVouchers,receipts:data.receipts,warranties:data.warranties,warrantyReasons:data.warrantyReasons,systemCategories:data.systemCategories,expenses:data.expenses,salaries:data.salaries,users:data.users,logs:data.logs,version:'v30'};
  let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(pack,null,2)],{type:'application/json'}));a.download='similock-da-nang-backup-'+today()+'.json';a.click()
}


async function deleteCollectionDocs(collectionName){
  // Firestore giới hạn 500 thao tác/1 batch. Dùng 450 để an toàn.
  const snap=await getDocs(col(collectionName));
  let deleted=0;
  for(let i=0;i<snap.docs.length;i+=450){
    const batch=writeBatch(db);
    const part=snap.docs.slice(i,i+450);
    part.forEach(d=>batch.delete(doc(db,collectionName,d.id)));
    await batch.commit();
    deleted+=part.length;
  }
  return deleted;
}
function resetLocalDataAfterClear(){
  ['customers','products','staff','prices','costPrices','sales','stockVouchers','receipts','warranties','warrantyReasons','systemCategories','expenses','salaries','logs'].forEach(n=>{data[n]=[]});
}
window.clearAllData=async()=>{
  if(currentPerm.role!=='Admin') return alert('Chỉ Admin mới được Clear Data');
  const first=confirm('⚠️ CẢNH BÁO LẦN 1\n\nBạn sắp xóa toàn bộ dữ liệu vận hành của hệ thống. Hành động này không thể hoàn tác.\n\nTiếp tục?');
  if(!first) return;
  const confirmText=prompt('⚠️ XÁC NHẬN LẦN 2\n\nNhập đúng: XOA_TOAN_BO_DU_LIEU');
  if(confirmText!=='XOA_TOAN_BO_DU_LIEU') return alert('Đã hủy. Mã xác nhận không đúng.');
  const password=prompt('🔐 Nhập mật khẩu Admin để xác thực lần cuối:');
  if(!password) return alert('Đã hủy. Chưa nhập mật khẩu Admin.');
  try{
    const credential=EmailAuthProvider.credential(auth.currentUser.email,password);
    await reauthenticateWithCredential(auth.currentUser,credential);

    // Chỉ xóa dữ liệu vận hành. Giữ lại tài khoản và phân quyền để còn đăng nhập lại.
    const collectionsToClear=['customers','products','prices','costPrices','staff','sales','stockVouchers','receipts','warranties','warrantyReasons','systemCategories','expenses','salaries','logs'];
    let result=[];
    for(const name of collectionsToClear){
      const count=await deleteCollectionDocs(name);
      result.push(`${name}: ${count}`);
    }

    // Không ghi log sau khi Clear Data, vì sẽ làm collection logs xuất hiện lại 1 dòng.
    resetLocalDataAfterClear();
    await loadAll();
    alert('Đã Clear Data thành công. Đã xóa dữ liệu vận hành và nhật ký. Không xóa users/settings/roles/permissions.\n\nChi tiết: '+result.join(', '));
  }catch(e){
    alert('Clear Data thất bại: '+authMsg(e));
  }
}



function logTime(v){
  try{
    if(v?.toDate) return v.toDate().toLocaleString('vi-VN');
    if(v?.seconds) return new Date(v.seconds*1000).toLocaleString('vi-VN');
    if(typeof v==='string') return new Date(v).toLocaleString('vi-VN');
  }catch(e){}
  return '';
}
function renderAuditLogs(){
  const table=document.getElementById('auditTable');
  if(!table) return;
  if(!(currentPerm.role==='Admin'||has('audit'))){ table.innerHTML='<tr><td colspan="4">Bạn không có quyền xem nhật ký thao tác</td></tr>'; return; }
  const q=String(document.getElementById('auditSearch')?.value||'').trim().toLowerCase();
  const rows=[...(data.logs||[])].sort((a,b)=>{
    const ta=a.at?.seconds||0, tb=b.at?.seconds||0; return tb-ta;
  }).filter(l=>!q || [l.email,l.action,l.detail,logTime(l.at)].join(' ').toLowerCase().includes(q));
  if(document.getElementById('auditSearchCount')) document.getElementById('auditSearchCount').textContent=`Hiển thị ${rows.length}/${(data.logs||[]).length}`;
  table.innerHTML=rows.slice(0,500).map(l=>`<tr><td>${logTime(l.at)}</td><td>${l.email||''}</td><td><b>${l.action||''}</b></td><td>${l.detail||''}</td></tr>`).join('')||'<tr><td colspan="4">Chưa có nhật ký thao tác</td></tr>';
}
window.renderAuditLogs=renderAuditLogs;
window.clearAuditSearch=()=>{ if(document.getElementById('auditSearch')) document.getElementById('auditSearch').value=''; renderAuditLogs(); };


/* CUSTOMER_SEARCH_FIX_V28: gắn sự kiện tìm kiếm khách hàng chắc chắn, kể cả khi trình duyệt không bắt inline oninput */
document.addEventListener('input', function(e){
  if(e && e.target && e.target.id === 'customerSearch') renderCustomers();
});
document.addEventListener('DOMContentLoaded', function(){
  try{initPermissionChooser([]);}catch(e){}
  const cs=document.getElementById('customerSearch');
  if(cs && !cs.__customerSearchBound){
    cs.__customerSearchBound=true;
    cs.addEventListener('keyup', renderCustomers);
    cs.addEventListener('search', renderCustomers);
    cs.addEventListener('change', renderCustomers);
  }
});


/* V35_STABLE_GLOBAL_EXPORTS: đảm bảo các hàm gọi từ HTML inline onclick/oninput hoạt động trong ES module */
Object.assign(window,{
  renderCustomers, renderProducts, renderPrices, renderCostPrices, renderStaff, renderSales, renderCommissions,
  renderExpenses, renderSalaries, renderDebts, renderReceipts, renderStock, renderStockBook, renderWarranties,
  renderReports, renderPermissions, renderAuditLogs
});

/* SIMILOCK_SAVE_TOAST_V13: thông báo lưu thành công + chống bấm lưu nhiều lần */
(function(){
  const savingMap = new Map();
  function toast(message, type='success', sub=''){
    const box = document.getElementById('toastContainer');
    if(!box){ try{ alert(message); }catch(e){} return; }
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'success');
    const icon = type==='error' ? '❌' : (type==='info' ? '⏳' : '✅');
    el.innerHTML = `<span class="toast-icon">${icon}</span><div>${message}${sub?`<small>${sub}</small>`:''}</div>`;
    box.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(-6px)'; }, 2300);
    setTimeout(()=>el.remove(), 2700);
  }
  window.showToast = toast;
  function currentSaveButton(fnName){
    const ev = window.event;
    const btn = ev && ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if(btn && (btn.getAttribute('onclick')||'').includes(fnName)) return btn;
    return null;
  }
  function wrapSave(fnName, successText){
    const original = window[fnName];
    if(typeof original !== 'function' || original.__wrappedSaveToast) return;
    const wrapped = async function(...args){
      if(savingMap.get(fnName)){
        toast('Đang lưu dữ liệu, vui lòng chờ...', 'info');
        return;
      }
      const btn = currentSaveButton(fnName);
      const oldText = btn ? btn.innerHTML : '';
      try{
        savingMap.set(fnName, true);
        if(btn){ btn.disabled = true; btn.classList.add('saving'); btn.innerHTML = 'Đang lưu...'; }
        const start = Date.now();
        const result = await original.apply(this,args);
        const elapsed = Date.now() - start;
        // Không hiện thông báo thành công cho các nhánh kiểm tra lỗi trả về quá nhanh.
        if(elapsed > 80 || result){ toast(successText || 'Đã lưu dữ liệu thành công'); }
        return result;
      }catch(err){
        console.error(err);
        toast('Lưu dữ liệu chưa thành công', 'error', err && err.message ? err.message : 'Vui lòng kiểm tra lại dữ liệu hoặc quyền truy cập.');
        throw err;
      }finally{
        savingMap.set(fnName, false);
        if(btn){ btn.disabled = false; btn.classList.remove('saving'); btn.innerHTML = oldText; }
      }
    };
    wrapped.__wrappedSaveToast = true;
    window[fnName] = wrapped;
  }
  [
    ['saveUserPermission','Đã lưu phân quyền thành công'],
    ['saveSale','Đã lưu phiếu bán thành công'],
    ['saveSaleAndPrint','Đã lưu phiếu bán và chuẩn bị in'],
    ['saveSaleReturn','Đã lưu phiếu trả hàng thành công'],
    ['saveReceipt','Đã lưu phiếu thu thành công'],
    ['saveStockVoucher','Đã lưu chứng từ kho thành công'],
    ['saveExpense','Đã lưu chi phí thành công'],
    ['saveSalary','Đã lưu lương nhân viên thành công'],
    ['saveWarranty','Đã lưu bảo hành thành công'],
    ['saveCustomer','Đã lưu khách hàng thành công'],
    ['saveProduct','Đã lưu sản phẩm thành công'],
    ['savePrice','Đã lưu bảng giá bán thành công'],
    ['saveCostPrice','Đã lưu bảng giá vốn thành công'],
    ['saveStaff','Đã lưu nhân viên thành công'],
    ['changeMyPassword','Đã đổi mật khẩu thành công']
  ].forEach(([fn,msg])=>wrapSave(fn,msg));
})();

/* V39 - Tab riêng cho Bán hàng và Danh sách phiếu bán */
window.showSalesTab = function(tab){
  const isList = tab === 'list';
  const form = document.getElementById('salesFormTab');
  const list = document.getElementById('salesListTab');
  const formBtn = document.getElementById('salesTabFormBtn');
  const listBtn = document.getElementById('salesTabListBtn');
  if(form) form.classList.toggle('active', !isList);
  if(list) list.classList.toggle('active', isList);
  if(formBtn) formBtn.classList.toggle('active', !isList);
  if(listBtn) listBtn.classList.toggle('active', isList);
  if(isList && typeof window.renderSales === 'function'){
    try{ window.renderSales(); }catch(e){ console.warn('Không render được danh sách phiếu bán:', e); }
  }
};
