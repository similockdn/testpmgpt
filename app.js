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
const data={customers:[],products:[],staff:[],prices:[],costPrices:[],sales:[],stockVouchers:[],receipts:[],warranties:[],expenses:[],salaries:[],users:[],logs:[]};
function userWarehouses(){return currentPerm.role==='Admin'?WAREHOUSES:((currentPerm.warehouseAccess&&currentPerm.warehouseAccess.length)?currentPerm.warehouseAccess:WAREHOUSES)}
function canAccessWarehouse(w){return currentPerm.role==='Admin'||userWarehouses().includes(w)}
function canAccessVoucher(v){if(currentPerm.role==='Admin')return true; if(!has('inventory')&&!has('stockbook'))return false; if(v.type==='TRANSFER')return canAccessWarehouse(v.fromWarehouse||v.warehouse||'Kho Chính')||canAccessWarehouse(v.toWarehouse||'Kho Văn Phòng'); return canAccessWarehouse(voucherWarehouse(v));}
function warehouseOptions(selected='',allowed=userWarehouses()){return allowed.map(w=>`<option value="${w}" ${w===selected?'selected':''}>${w}</option>`).join('')}
function defaultWarehouse(){return userWarehouses()[0]||WAREHOUSES[0]}
function voucherWarehouse(v){return v.warehouse||v.fromWarehouse||defaultWarehouse()}
function voucherToWarehouse(v){return v.toWarehouse||''}
function isTransferVoucher(v){return v.type==='TRANSFER'}
const modules=['dashboard','sales','commissions','expenses','salaries','debts','inventory','stockbook','warranty','customers','products','prices','staff','reports','permissions','system','audit'];
const permissionMap={
 Admin:modules.concat(['viewCost','viewSalary','manageSalary','editSales','deleteSales','editStock','deleteStock','audit']),
 Sale:['dashboard','sales','commissions','customers','products','warranty'],
 'Kỹ thuật':['dashboard','warranty','customers','products'],
 Kho:['dashboard','inventory','stockbook','products'],
 'Kho Chính':['dashboard','inventory','stockbook','products'],
 'Kho Văn Phòng':['dashboard','inventory','stockbook','products'],
 'Kế toán':['dashboard','expenses','commissions','debts','reports','sales','customers','products']
};
const permLabels={dashboard:'Dashboard',sales:'Bán hàng',commissions:'Hoa hồng',expenses:'Chi phí',debts:'Công nợ',inventory:'Kho',stockbook:'Sổ kho',warranty:'Bảo hành',customers:'Khách hàng',products:'Sản phẩm',prices:'Bảng giá',staff:'Nhân viên',reports:'Báo cáo',permissions:'Phân quyền',system:'Hệ thống',viewCost:'Xem giá vốn/lợi nhuận',editSales:'Sửa đơn bán',deleteSales:'Xóa đơn bán',editStock:'Sửa phiếu kho',deleteStock:'Xóa phiếu kho',audit:'Xem nhật ký thao tác',salaries:'Lương nhân viên',viewSalary:'Xem lương',manageSalary:'Quản lý lương'};

const permissionGroups=[
  {title:'Tổng quan',desc:'Các màn hình điều hành chung',keys:['dashboard','reports','audit']},
  {title:'Bán hàng & khách hàng',desc:'Tạo đơn, khách hàng, công nợ, bảo hành',keys:['sales','editSales','deleteSales','customers','debts','warranty','commissions']},
  {title:'Kho & sản phẩm',desc:'Sản phẩm, tồn kho và chứng từ kho',keys:['products','inventory','stockbook','editStock','deleteStock']},
  {title:'Tài chính nhạy cảm',desc:'Giá vốn, lợi nhuận, lương, chi phí',keys:['expenses','salaries','viewSalary','manageSalary','viewCost']},
  {title:'Quản trị hệ thống',desc:'Nhân viên, phân quyền và thiết lập hệ thống',keys:['staff','prices','permissions','system']}
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
function col(n){return collection(db,n)}
async function loadCol(n){try{const s=await getDocs(col(n));data[n]=s.docs.map(d=>({id:d.id,...d.data()}));}catch(e){console.warn('Không tải được collection '+n,e.message);data[n]=[];}}
async function loadAll(){for(const n of ['customers','products','staff','prices','costPrices','sales','stockVouchers','receipts','warranties','expenses','salaries','users','logs']) await loadCol(n); renderAll();}
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
function saleLocked(s){const pay=salePaymentInfo(s);return pay.paidTotal>0||!!stockVoucherForSale(s)}
function stockLedgerRows(){
  const rows=[];
  data.stockVouchers.forEach(v=>{
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
  (data.stockVouchers||[]).forEach(v=>{
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
  const phone=c.phone||'';
  const name=cleanCustomerName(c.name,phone,code)||'Chưa cập nhật tên';
  return {name,code,phone,address:c.address||'',type:c.type||'Khách lẻ'};
}
function saleCustomerRecord(s={}){
  return data.customers.find(c=>(s.customerId&&c.id===s.customerId)||(s.customerCode&&ensureCustomerCode(c)===s.customerCode)||(s.customerPhone&&normalizePhone(c.phone)===normalizePhone(s.customerPhone)))||{};
}
function saleCustomerInfo(s={}){
  const c=saleCustomerRecord(s);
  const code=s.customerCode||ensureCustomerCode(c)||'';
  const phone=s.customerPhone||c.phone||'';
  const address=s.customerAddress||c.address||'';
  const type=s.customerType||s.customerGroup||c.type||'Khách lẻ';
  const name=cleanCustomerName(s.customerName||c.name,phone,code)||cleanCustomerName(c.name,phone,code)||'Chưa cập nhật tên';
  return {name,code,phone,address,type};
}
function customerSearchValue(c={}){const i=customerInfo(c);return `${i.code} | ${i.name} | ${i.phone} | ${i.type} | ${i.address}`;}
function customerShortLabel(c={}){const i=customerInfo(c);return `${i.code} - ${i.name}${i.phone?' - '+i.phone:''}`;}
function validateDate(v){return !v || /^\d{4}-\d{2}-\d{2}$/.test(v)}
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
function calcCommission(totals,percent){let base=Math.max(0,calcCommissionBase(totals)-(+totals?.surcharge||0));return Math.round(base*(+percent||0)/100)}
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
function showPage(id){if(!has(id))return alert('Tài khoản chưa được phân quyền');document.querySelectorAll('#menu button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));document.querySelectorAll('#menu .menu-group').forEach(g=>g.classList.toggle('active-group',[...g.querySelectorAll('button[data-page]')].some(b=>b.dataset.page===id)));const activeBtn=document.querySelector(`#menu button[data-page="${id}"]`);if(activeBtn)activeBtn.closest('.menu-group')?.classList.add('open');document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));$('pageTitle').textContent=btnTitle(id);$('pageSub').textContent='Similock Đà Nẵng - Quản lý bán hàng, kho, công nợ, bảo hành'}
function btnTitle(id){return ({dashboard:'Dashboard điều hành',sales:'Bán hàng',commissions:'Hoa hồng',expenses:'Chi phí vận hành',salaries:'Lương nhân viên',debts:'Công nợ',inventory:'Kho hàng',stockbook:'Sổ kho',warranty:'Bảo hành',customers:'Khách hàng',products:'Sản phẩm',prices:'Bảng giá',staff:'Nhân viên',reports:'Báo cáo',permissions:'Phân quyền',system:'Hệ thống',audit:'Nhật ký thao tác'}[id]||id)}

function renderAll(){
  const steps=[
    ['applyPermissions',applyPermissions],['renderSelectors',renderSelectors],['renderDashboard',renderDashboard],['renderCustomers',renderCustomers],['renderProducts',renderProducts],['renderPriceProductPicker',renderPriceProductPicker],['renderCostProductPicker',renderCostProductPicker],['renderPrices',renderPrices],['renderCostPrices',renderCostPrices],['renderStaff',renderStaff],['renderSales',renderSales],['renderCommissions',renderCommissions],['renderExpenses',renderExpenses],['renderSalaries',renderSalaries],['renderDebts',renderDebts],['renderReceipts',renderReceipts],['renderStock',renderStock],['renderStockBook',renderStockBook],['renderWarranties',renderWarranties],['renderReports',renderReports],['renderPermissions',renderPermissions],['renderAuditLogs',renderAuditLogs],['staffDeptChanged',staffDeptChanged],['resetSaleForm',resetSaleForm],['resetStockForm',resetStockForm]
  ];
  const errors=[];
  for(const [name,fn] of steps){
    try{ if(typeof fn==='function') fn(); }
    catch(e){ console.error('RENDER ERROR '+name+':',e); errors.push(name+': '+(e.message||e)); }
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
  box.innerHTML=rows.length?rows.map(p=>`<label><input type="checkbox" value="${p.code}" ${old.has(p.code)?'checked':''} onchange="updateProductPickerHint('${boxId}','${hintId}')"><span>${p.code}<small>${p.name||''}</small></span></label>`).join(''):`<div class="empty">Không tìm thấy model phù hợp</div>`;
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
function renderSelectors(){fillSelect($('saleStaff'),data.staff.filter(x=>staffHasFunction(x,'Sale')||staffHasFunction(x,'Quản lý')),x=>`${x.name}${staffHasFunction(x,'Kỹ thuật')?' (Sale + Kỹ thuật)':''}`);fillSelect($('saleTech'),data.staff.filter(x=>staffHasFunction(x,'Kỹ thuật')),x=>`${x.name}${staffHasFunction(x,'Sale')?' (Kỹ thuật + Sale)':''}`);refreshCommissionStaffOptions();ensureProductDatalist();fillReceiptCustomerOptions();fillSelect($('wSale'),data.sales,x=>`${x.code} - ${saleCustomerInfo(x).name}`);if($('saleWarehouse'))$('saleWarehouse').innerHTML=warehouseOptions($('saleWarehouse').value||defaultWarehouse());if($('stockWarehouse'))$('stockWarehouse').innerHTML=warehouseOptions($('stockWarehouse').value||defaultWarehouse());if($('stockToWarehouse'))$('stockToWarehouse').innerHTML=warehouseOptions($('stockToWarehouse').value||defaultWarehouse(),WAREHOUSES);$('customerList').innerHTML=data.customers.map(c=>`<option value="${customerSearchValue(c)}"></option>`).join('')}
function renderDashboard(){let month=new Date().toISOString().slice(0,7);let sales=data.sales.filter(s=>String(s.date||'').startsWith(month));let monthlyExpenses=data.expenses.filter(e=>String(e.date||'').startsWith(month)&&!isSalaryCategory(e.category));let monthlySalaries=data.salaries.filter(e=>String(e.date||'').startsWith(month));let rev=sales.reduce((a,s)=>a+(+s.grand||0),0);let orderProfit=sales.reduce((a,s)=>a+(+s.profit||0),0);let expense=monthlyExpenses.reduce((a,e)=>a+(+e.amount||0),0)+monthlySalaries.reduce((a,e)=>a+(+e.total||+e.amount||0),0);let profit=orderProfit-expense;let debt=calcDebts().reduce((a,d)=>a+d.debt,0);let low=data.products.filter(p=>stockOf(p.code)<=(+p.minStock||3));$('kpiRevenue').textContent=money(rev);$('kpiProfit').textContent=money(profit);$('kpiDebt').textContent=money(debt);$('kpiLowStock').textContent=low.length;const best={};data.sales.forEach(s=>(s.items||[]).forEach(it=>best[it.code]=(best[it.code]||0)+(+it.qty||0)));let rows=Object.entries(best).sort((a,b)=>b[1]-a[1]).slice(0,8);let max=Math.max(1,...rows.map(r=>r[1]));$('bestProducts').innerHTML=rows.length?rows.map(([code,qty])=>{let p=data.products.find(x=>x.code===code)||{};return `<div class="bar-row"><b>${code}</b><div><small>${p.name||''}</small><div class="bar"><i style="width:${qty/max*100}%"></i></div></div><b>${qty}</b></div>`}).join(''):'Chưa có dữ liệu';const st={};data.sales.forEach(s=>{let n=data.staff.find(x=>x.id===s.staffId)?.name||'Khác';st[n]=st[n]||{rev:0,count:0};st[n].rev+=+s.grand||0;st[n].count++});$('topStaff').innerHTML=Object.entries(st).sort((a,b)=>b[1].rev-a[1].rev).slice(0,5).map(([n,v])=>`<tr><td>${n}</td><td>${money(v.rev)}</td><td>${v.count}</td></tr>`).join('');$('latestSales').innerHTML=data.sales.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6).map(s=>{const ci=saleCustomerInfo(s);return `<tr><td>${s.code}</td><td>${ci.code}</td><td>${ci.name}</td><td>${money(s.grand)}</td></tr>`}).join('');$('lowStockRows').innerHTML=low.map(p=>`<tr><td>${p.code}</td><td>${p.name}</td><td><span class="badge red">${stockOf(p.code)}</span></td></tr>`).join('')||'<tr><td colspan="3">Kho ổn định</td></tr>'}

window.saveCustomer=async()=>{let phone=($('cPhone').value||'').trim();let o={customerCode:($('cCode').value||customerCodeFromPhone(phone)).trim(),name:($('cName').value||'').trim(),type:$('cType').value,phone,address:$('cAddress').value,email:$('cEmail')?.value||'',contact:$('cContact')?.value||'',source:$('cSource')?.value||'',birthday:$('cBirthday')?.value||'',note:$('cNote')?.value||'',discount:+$('cDiscount').value||0,openingDebt:+$('cOpeningDebt').value||0};if(!o.name)return alert('Nhập tên khách hàng');if(!o.phone)return alert('Nhập số điện thoại khách hàng');let id=$('cId').value;if(id){await updateDoc(doc(db,'customers',id),o);await logAction('Sửa khách hàng',o.name)}else {await addDoc(col('customers'),{...o,createdAt:serverTimestamp()});await logAction('Tạo khách hàng',o.name)}clearCustomer();await loadAll()}
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
window.quickCreateCustomer=async()=>{let raw=($('saleCustomerSearch').value||'').trim();let parts=raw.split('|').map(x=>x.trim()).filter(Boolean);let suggestedName=(parts[1]&&!/^[0-9+ .-]+$/.test(parts[1]))?parts[1]:'';let suggestedPhone=parts.find(x=>/\d{8,}/.test(x))||'';let name=(prompt('Tên khách hàng:',suggestedName)||'').trim();if(!name)return alert('Bắt buộc nhập tên khách hàng');let phone=(prompt('SĐT khách hàng:',suggestedPhone)||'').trim();if(!phone)return alert('Bắt buộc nhập số điện thoại khách hàng');let type=(prompt('Loại khách: Khách lẻ / CTV / Đại lý','Khách lẻ')||'Khách lẻ').trim();if(!['Khách lẻ','CTV','Đại lý'].includes(type))type='Khách lẻ';let address=prompt('Địa chỉ:', parts[4]||parts[3]||'')||'';let customerCode=customerCodeFromPhone(phone);await addDoc(col('customers'),{customerCode,name,type,phone,address,email:'',contact:'',source:'',birthday:'',note:'',discount:0,openingDebt:0,createdAt:serverTimestamp()});await loadAll();$('saleCustomerSearch').value=`${customerCode} | ${name} | ${phone} | ${type} | ${address}`;if($('saleCustomerType'))$('saleCustomerType').value=type}

window.saveProduct=async()=>{let old=$('pId').value?data.products.find(x=>x.id===$('pId').value):{};let o={code:$('pCode').value.trim(),name:$('pName').value,category:$('pCategory').value,cost:has('viewCost')?(+$('pCost').value||0):(+old?.cost||0),price:+$('pPrice').value||0,minStock:+$('pMinStock').value||3,active:($('pActive')?.value||'active')};if(!o.code||!o.name)return alert('Nhập model và tên');let id=$('pId').value;if(id){await updateDoc(doc(db,'products',id),o);await logAction('Sửa sản phẩm',o.code)}else {await addDoc(col('products'),{...o,createdAt:serverTimestamp()});await logAction('Tạo sản phẩm',o.code)}clearProduct();await loadAll()}
function clearProduct(){['pId','pCode','pName'].forEach(i=>$(i).value='');$('pCategory').value='Khóa thông minh';$('pCost').value='';$('pPrice').value='';$('pMinStock').value=3;if($('pActive'))$('pActive').value='active'}
function renderProducts(){
  const input=document.getElementById('productSearch');
  const table=document.getElementById('productTable');
  if(!table) return;
  const q=String(input?.value||'').trim().toLowerCase();
  const rows=data.products.filter(p=>{
    const hay=[p.code,p.name,p.category,p.price,p.cost,stockOf(p.code),(p.active==='inactive'?'ngừng bán':'đang kinh doanh')].join(' ').toLowerCase();
    return !q||hay.includes(q);
  });
  table.innerHTML=rows.map(p=>`<tr><td>${p.code}</td><td>${p.name}</td><td>${p.category||''}</td><td class="view-cost">${money(p.cost)}</td><td>${money(p.price)}</td><td>${stockOf(p.code)}</td><td>${p.active==='inactive'?'<span class="badge red">Ngừng bán</span>':'<span class="badge green">Đang bán</span>'}</td><td><button class="btn ghost" onclick="editProduct('${p.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('products','${p.id}')">Xóa</button></td></tr>`).join('') || `<tr><td colspan="8">Không tìm thấy sản phẩm phù hợp</td></tr>`;
  applyPermissions();
}
window.renderProducts=renderProducts;
window.clearProductSearch=()=>{const input=document.getElementById('productSearch'); if(input) input.value=''; renderProducts();};
window.editProduct=id=>{let p=data.products.find(x=>x.id===id);$('pId').value=id;$('pCode').value=p.code||'';$('pName').value=p.name||'';$('pCategory').value=p.category||'';$('pCost').value=p.cost||0;$('pPrice').value=p.price||0;$('pMinStock').value=p.minStock||3;if($('pActive'))$('pActive').value=p.active||'active'}


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
  clearPriceProducts(); if($('priceDraftRows'))$('priceDraftRows').innerHTML='<tr><td colspan="4">Chưa có sản phẩm trong bảng giá</td></tr>';
}
window.createPriceDraftRows=()=>{
  const codes=selectedPriceCodes();
  if(!codes.length)return alert('Chọn ít nhất 1 model trước');
  const tb=$('priceDraftRows'); if(!tb)return;
  const existing=new Map([...tb.querySelectorAll('tr[data-code]')].map(tr=>[tr.dataset.code,tr.querySelector('input')?.value||'']));
  const all=[...new Set([...existing.keys(),...codes])];
  tb.innerHTML=all.map(code=>{
    const prod=data.products.find(p=>p.code===code)||{};
    const old=existing.get(code);
    const val=old!==undefined?old:(prod.price||'');
    return `<tr data-code="${code}"><td><b>${code}</b></td><td>${prod.name||''}</td><td><input type="number" value="${val}" placeholder="Nhập giá bán"></td><td><button class="btn danger" onclick="this.closest('tr').remove();if(!document.querySelector('#priceDraftRows tr[data-code]'))document.getElementById('priceDraftRows').innerHTML='<tr><td colspan=\'4\'>Chưa có sản phẩm trong bảng giá</td></tr>'">X</button></td></tr>`;
  }).join('');
}
function priceDraftItems(){
  const rows=[...($('priceDraftRows')?.querySelectorAll('tr[data-code]')||[])];
  return rows.map(tr=>({code:tr.dataset.code,price:+(tr.querySelector('input')?.value||0)||0})).filter(x=>x.code);
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
    if(old) await updateDoc(doc(db,'prices',old.id),{...base,code:it.code,price:it.price});
    else await addDoc(col('prices'),{...base,code:it.code,price:it.price,createdAt:serverTimestamp()});
  }
  await logAction(oldKey?'Sửa bảng giá':'Thêm bảng giá',`${base.listName} - ${items.length} model`);
  newPriceList(); await loadAll();
}
function renderPrices(){
  const q=String($('priceSearch')?.value||'').trim().toLowerCase();
  const tb=$('priceTable'); if(!tb)return;
  let groups=groupPrices(data.prices).filter(g=>{const productText=g.items.map(p=>{const prod=data.products.find(x=>x.code===p.code)||{};return `${p.code} ${prod.name||''} ${p.price}`}).join(' ');const hay=[g.listName,g.type,g.validFrom,g.validTo,g.note,productText].join(' ').toLowerCase();return !q||hay.includes(q)});
  tb.innerHTML=groups.map(g=>{let st=priceStatus(g);let models=g.items.map(x=>x.code).join(', ');return`<tr><td><b>${g.listName||''}</b><small>${models}</small><span class="badge ${st[1]}">${st[0]}</span></td><td>${g.type}</td><td><b>${g.items.length}</b></td><td><button class="btn ghost" onclick="editPriceGroup('${encodeURIComponent(g.key)}')">Mở</button><button class="btn danger" onclick="deletePriceGroup('${encodeURIComponent(g.key)}')">Xóa</button></td></tr>`}).join('')||'<tr><td colspan="4">Không tìm thấy bảng giá phù hợp</td></tr>';
}
window.editPriceGroup=(keyEnc)=>{const key=decodeURIComponent(keyEnc);const rows=data.prices.filter(p=>priceGroupKeyOf(p)===key);if(!rows.length)return alert('Không tìm thấy bảng giá');const p=rows[0];$('priceGroupKey').value=key;$('priceId').value='';$('priceProduct').value='';if($('priceListName'))$('priceListName').value=p.listName||'';$('priceType').value=p.type;$('priceFrom').value=p.validFrom||'';$('priceTo').value=p.validTo||'';$('priceActive').value=String(p.active)!=='false'?'true':'false';$('priceNote').value=p.note||'';renderPriceProductPicker();const codes=rows.map(x=>x.code);const box=$('priceProductPicker');if(box)box.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=codes.includes(x.value));updateProductPickerHint('priceProductPicker','priceSelectedHint');if($('priceDraftRows')){$('priceDraftRows').innerHTML=rows.map(p=>`<tr data-code="${p.code}"><td><b>${p.code}</b></td><td>${(data.products.find(x=>x.code===p.code)||{}).name||''}</td><td><input type="number" value="${p.price||0}"></td><td><button class="btn danger" onclick="this.closest('tr').remove();if(!document.querySelector('#priceDraftRows tr[data-code]'))document.getElementById('priceDraftRows').innerHTML='<tr><td colspan=\'4\'>Chưa có sản phẩm trong bảng giá</td></tr>'">X</button></td></tr>`).join('');}showPage('prices')}
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
window.newCostPriceList=()=>{if(!has('viewCost'))return alert('Chỉ Admin được xem/sửa bảng giá vốn');['costId','costGroupKey','costProduct','costListName','costFrom','costTo','costNote'].forEach(i=>{if($(i))$(i).value=''});if($('costActive'))$('costActive').value='true';clearCostProducts();if($('costDraftRows'))$('costDraftRows').innerHTML='<tr><td colspan="4">Chưa có sản phẩm trong bảng giá vốn</td></tr>';}
window.createCostDraftRows=()=>{
  if(!has('viewCost'))return alert('Chỉ Admin được xem/sửa bảng giá vốn');
  const picked=checkedCodesFromBox('costProductPicker');
  const fallback=productCodeFromInput($('costProduct')?.value||'');
  const codes=[...new Set(picked.length?picked:(fallback?[fallback]:[]))].filter(Boolean);
  if(!codes.length)return alert('Chọn ít nhất 1 model trước');
  const tb=$('costDraftRows'); if(!tb)return;
  const existing=new Map([...tb.querySelectorAll('tr[data-code]')].map(tr=>[tr.dataset.code,tr.querySelector('input')?.value||'']));
  const all=[...new Set([...existing.keys(),...codes])];
  tb.innerHTML=all.map(code=>{const prod=data.products.find(p=>p.code===code)||{};const old=existing.get(code);const val=old!==undefined?old:(prod.cost||'');return `<tr data-code="${code}"><td><b>${code}</b></td><td>${prod.name||''}</td><td><input type="number" value="${val}" placeholder="Nhập giá vốn"></td><td><button class="btn danger" onclick="this.closest('tr').remove();if(!document.querySelector('#costDraftRows tr[data-code]'))document.getElementById('costDraftRows').innerHTML='<tr><td colspan=\'4\'>Chưa có sản phẩm trong bảng giá vốn</td></tr>'">X</button></td></tr>`;}).join('');
}
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
  tb.innerHTML=groups.map(g=>{let st=priceStatus(g);let models=g.items.map(x=>x.code).join(', ');return`<tr><td><b>${g.listName||''}</b><small>${models}</small><span class="badge ${st[1]}">${st[0]}</span></td><td><b>${g.items.length}</b></td><td>${g.validFrom||'Không giới hạn'} → ${g.validTo||'Không giới hạn'}</td><td><button class="btn ghost" onclick="editCostPriceGroup('${encodeURIComponent(g.key)}')">Mở</button><button class="btn danger" onclick="deleteCostPriceGroup('${encodeURIComponent(g.key)}')">Xóa</button></td></tr>`}).join('')||'<tr><td colspan="4">Không tìm thấy giá vốn phù hợp</td></tr>';
}
window.editCostPriceGroup=(keyEnc)=>{if(!has('viewCost'))return alert('Chỉ Admin được sửa bảng giá vốn');const key=decodeURIComponent(keyEnc);const rows=data.costPrices.filter(p=>costGroupKeyOf(p)===key);if(!rows.length)return alert('Không tìm thấy bảng giá vốn');const p=rows[0];$('costGroupKey').value=key;$('costId').value='';$('costProduct').value='';if($('costListName'))$('costListName').value=p.listName||'';$('costFrom').value=p.validFrom||'';$('costTo').value=p.validTo||'';$('costActive').value=String(p.active)!=='false'?'true':'false';$('costNote').value=p.note||'';renderCostProductPicker();const codes=rows.map(x=>x.code);const box=$('costProductPicker');if(box)box.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=codes.includes(x.value));updateProductPickerHint('costProductPicker','costSelectedHint');if($('costDraftRows')){$('costDraftRows').innerHTML=rows.map(p=>`<tr data-code="${p.code}"><td><b>${p.code}</b></td><td>${(data.products.find(x=>x.code===p.code)||{}).name||''}</td><td><input type="number" value="${p.cost||0}"></td><td><button class="btn danger" onclick="this.closest('tr').remove();if(!document.querySelector('#costDraftRows tr[data-code]'))document.getElementById('costDraftRows').innerHTML='<tr><td colspan=\'4\'>Chưa có sản phẩm trong bảng giá vốn</td></tr>'">X</button></td></tr>`).join('');}showPage('prices')}
window.editCostPrice=id=>{if(!has('viewCost'))return alert('Chỉ Admin được sửa bảng giá vốn');let p=data.costPrices.find(x=>x.id===id); if(p) editCostPriceGroup(encodeURIComponent(costGroupKeyOf(p)));}
window.deleteCostPriceGroup=async(keyEnc)=>{if(!has('viewCost'))return alert('Chỉ Admin được xóa bảng giá vốn');const key=decodeURIComponent(keyEnc);const rows=data.costPrices.filter(p=>costGroupKeyOf(p)===key);if(!rows.length)return;if(!confirm(`Xóa toàn bộ bảng giá vốn này (${rows.length} model)?`))return;for(const r of rows) await deleteDoc(doc(db,'costPrices',r.id));await logAction('Xóa bảng giá vốn',rows[0].listName||key);await loadAll();}

function renderStaff(){const q=($('staffSearch')?.value||'').toLowerCase().trim();const rows=data.staff.filter(e=>matchSearchText(q,e.name,e.dept,staffFunctionText(e),e.phone,e.commissionPercent,e.techFee));if($('staffSearchCount'))$('staffSearchCount').textContent=`Hiển thị ${rows.length}/${data.staff.length}`;$('staffTable').innerHTML=rows.map(e=>`<tr><td>${e.name}</td><td>${e.dept||''}</td><td>${staffFunctionText(e)}</td><td>${e.phone||''}</td><td>${staffHasFunction(e,'Sale')?((e.commissionPercent??5)+'%'):''}</td><td>${staffHasFunction(e,'Kỹ thuật')?money(e.techFee??100000):''}</td><td><button class="btn ghost" onclick="editStaff('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('staff','${e.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="7">Không tìm thấy nhân viên phù hợp</td></tr>'}
function selectedStaffFunctions(){return [...document.querySelectorAll('.staff-fn:checked')].map(x=>x.value)}
function setStaffFunctions(list){const set=new Set(list||[]);document.querySelectorAll('.staff-fn').forEach(x=>x.checked=set.has(x.value));staffDeptChanged()}
window.staffDeptChanged=()=>{let funcs=selectedStaffFunctions();let dept=$('eDept')?.value||'Sale';if(!funcs.length&&dept){if(dept==='Sale'||dept==='Quản lý')funcs.push('Sale');else if(dept==='Kỹ thuật')funcs.push('Kỹ thuật');else if(dept.includes('Kho'))funcs.push('Kho');else funcs.push(dept)}if($('saleCommissionBox'))$('saleCommissionBox').style.display=(funcs.includes('Sale')||funcs.includes('Quản lý'))?'block':'none';if($('techFeeBox'))$('techFeeBox').style.display=funcs.includes('Kỹ thuật')?'block':'none'}
window.saveStaff=async()=>{let dept=$('eDept').value;let functions=selectedStaffFunctions();if(!functions.length){if(dept==='Sale'||dept==='Quản lý')functions=['Sale'];else if(dept==='Kỹ thuật')functions=['Kỹ thuật'];else if(dept.includes('Kho'))functions=['Kho'];else functions=[dept]}let o={name:$('eName').value.trim(),dept,functions,phone:$('ePhone').value,commissionPercent:+($('eCommissionPercent')?.value||0),techFee:+($('eTechFee')?.value||0)};if(functions.includes('Sale')||functions.includes('Quản lý')){if(!o.commissionPercent)o.commissionPercent=5}else{o.commissionPercent=0}if(functions.includes('Kỹ thuật')){if(!o.techFee)o.techFee=100000}else{o.techFee=0}if(!o.name)return alert('Nhập tên nhân viên');let id=$('eId').value;if(id){await updateDoc(doc(db,'staff',id),o);await logAction('Sửa nhân viên',o.name)}else {await addDoc(col('staff'),o);await logAction('Tạo nhân viên',o.name)}$('eId').value='';$('eName').value='';$('ePhone').value='';$('eCommissionPercent').value=5;$('eTechFee').value=100000;$('eDept').value='Sale';setStaffFunctions(['Sale']);await loadAll()}

window.clearStaffSearch=()=>{if($('staffSearch'))$('staffSearch').value='';renderStaff();}
window.editStaff=id=>{let e=data.staff.find(x=>x.id===id);$('eId').value=id;$('eName').value=e.name;$('eDept').value=e.dept||'Sale';$('ePhone').value=e.phone||'';if($('eCommissionPercent'))$('eCommissionPercent').value=e.commissionPercent??5;if($('eTechFee'))$('eTechFee').value=e.techFee??100000;setStaffFunctions(staffFunctions(e))}


function allocationForCustomer(customerId){
  const sales=data.sales.filter(x=>x.customerId===customerId).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.code||'').localeCompare(String(b.code||'')));
  let totalPaid=sales.reduce((a,x)=>a+(+x.paid||0),0)+data.receipts.filter(r=>r.customerId===customerId).reduce((a,r)=>a+(+r.amount||0),0);
  const map={};
  sales.forEach(x=>{const grand=+x.grand||0;const paid=Math.min(grand,Math.max(0,totalPaid));const debt=Math.max(0,grand-paid);map[x.id]={paidTotal:paid,debtLeft:debt,paymentStatus:debt<=0?'Đã thu tiền':(paid>0?'Thanh toán một phần':'Chưa thu tiền')};totalPaid-=paid;});
  return map;
}
function salePaymentInfo(s){return allocationForCustomer(s.customerId||'')[s.id]||{paidTotal:+s.paid||0,debtLeft:+s.debt||0,paymentStatus:s.status||'Chưa thu tiền'};}
function saleMoneyStatus(s){
  const pay=salePaymentInfo(s);
  const paid=+pay.paidTotal||0, grand=+s.grand||0, over=Math.max(0,paid-grand);
  if(over>0) return {overPaid:over,label:s.returnSettlement||s.moneyStatus||'Khách đang dư tiền',badge:'orange'};
  if((+pay.debtLeft||0)>0) return {overPaid:0,label:'Còn nợ',badge:paid>0?'orange':'red'};
  return {overPaid:0,label:'Đã thu đủ',badge:'green'};
}
async function updatePaymentStatusesForCustomer(customerId){
  const map=allocationForCustomer(customerId);
  for(const [id,st] of Object.entries(map)){
    try{await updateDoc(doc(db,'sales',id),{paidTotal:st.paidTotal,debtLeft:st.debtLeft,paymentStatus:st.paymentStatus,status:st.paymentStatus,updatedAt:serverTimestamp()});}catch(e){console.warn('Không cập nhật trạng thái công nợ đơn '+id,e.message)}
  }
}
function stockVoucherForSale(s){return data.stockVouchers.find(v=>v.id===s.stockVoucherId)||data.stockVouchers.find(v=>v.saleId===s.id)||null;}

function saleReturnVouchers(s){return data.stockVouchers.filter(v=>v.type==='RETURN' && (v.saleId===s.id || v.saleCode===s.code));}
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
  const voucher={code:nextCode('TH',data.stockVouchers),date:$('returnDate')?.value||today(),type:'RETURN',warehouse:wh,saleId:s.id,saleCode:s.code,customerName:saleCustomerInfo(s).name,note:$('returnNote')?.value||`Trả lại hàng bán từ đơn ${s.code}`,settlement:$('returnSettlement')?.value||'Khách đang dư tiền',items:returnItems,value:returnItems.reduce((a,it)=>a+(+it.qty||0)*(+it.cost||0),0),locked:true,updatedAt:serverTimestamp()};
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
  const voucher={
    code:nextCode('XK',data.stockVouchers),date:today(),type:'OUT',warehouse,saleId:s.id,saleCode:s.code,customerName:saleCustomerInfo(s).name,
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

window.resetSaleForm=()=>{editingSale=null;$('saleCode').value=nextCode('BH',data.sales);$('saleDate').value=today();$('saleCustomerSearch').value='';if($('saleCustomerType'))$('saleCustomerType').value='Khách lẻ';if($('saleVatMode'))$('saleVatMode').value='included8';$('salePaid').value=0;if($('saleCommissionPercent'))$('saleCommissionPercent').value=salePercentDefault($('saleStaff')?.value);if($('saleTechCost'))$('saleTechCost').value=techFeeDefault($('saleTech')?.value);if($('saleTechFuel'))$('saleTechFuel').value=0;if($('saleSurcharge'))$('saleSurcharge').value=0;if($('saleOrderDiscountType'))$('saleOrderDiscountType').value='none';if($('saleOrderDiscountValue'))$('saleOrderDiscountValue').value=0;$('saleNote').value='';if($('saleWarehouse'))$('saleWarehouse').value='Kho Văn Phòng';if($('saleExportStock'))$('saleExportStock').checked=false;if($('saleExportStockSticky'))$('saleExportStockSticky').checked=false;ensureProductDatalist();$('saleItems').innerHTML='';addSaleItem();updateSaleTotals()}
window.addSaleItem=(it={})=>{let tr=document.createElement('tr');tr.innerHTML=`<td><input list="productCodesList" placeholder="Tìm model..." value="${it.code||''}" onchange="saleProductChanged(this)" oninput="saleProductChanged(this)"></td><td><input value="${it.name||''}" readonly></td><td><input type="number" value="${it.qty||1}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td><input type="number" value="${it.price||0}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td><select onchange="updateSaleTotals()"><option value="percent" ${(it.discountType||'percent')==='percent'?'selected':''}>%</option><option value="amount" ${(it.discountType||'percent')==='amount'?'selected':''}>VNĐ</option></select></td><td><input type="number" value="${it.discount||0}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td class="line-total">0</td><td><button class="btn danger" onclick="this.closest('tr').remove();updateSaleTotals()">X</button></td>`;$('saleItems').appendChild(tr);updateSaleTotals();setTimeout(()=>tr.querySelector('input')?.focus(),30);return tr}
window.saleItemKeyNav=(e,el)=>{if(e.key!=='Enter')return;e.preventDefault();const tr=el.closest('tr');const inputs=[...tr.querySelectorAll('input:not([readonly]),select')];let i=inputs.indexOf(el);if(i<inputs.length-1){inputs[i+1].focus();inputs[i+1].select?.();}else{addSaleItem();}}
window.addQuickSaleModel=(code)=>{let p=data.products.find(x=>String(x.code).toLowerCase()===String(code).toLowerCase() || String(x.code).toLowerCase().includes(String(code).toLowerCase()));if(!p)return alert('Chưa có model '+code+' trong danh mục sản phẩm'); if(p.active==='inactive')return alert('Model '+p.code+' đang ngừng bán, không thể thêm vào phiếu bán.');let customer=findCustomerBySearch();let bp=activePriceFor(p.code,saleCustomerType(),$('saleDate')?.value||today());let tr=addSaleItem({code:p.code,name:p.name,qty:1,price:bp?.price||p.price||0,discount:customer?.discount||0});saleProductChanged(tr.children[0].querySelector('input'));setTimeout(()=>tr.children[2].querySelector('input')?.focus(),30)}
window.syncSaleExportStockFromSticky=()=>{if($('saleExportStock')&&$('saleExportStockSticky'))$('saleExportStock').checked=$('saleExportStockSticky').checked}
window.syncSaleExportStockToSticky=()=>{if($('saleExportStock')&&$('saleExportStockSticky'))$('saleExportStockSticky').checked=$('saleExportStock').checked}
window.saleProductChanged=sel=>{let p=productByInput(sel.value)||{};if(!p.code)return;if(p.active==='inactive'){alert('Model '+p.code+' đang ngừng bán, không thể bán.');sel.value='';return;}let tr=sel.closest('tr');tr.children[1].querySelector('input').value=p.name||'';let customer=findCustomerBySearch();let bp=activePriceFor(p.code,saleCustomerType(),$('saleDate')?.value||today());let price=bp?.price||p.price||0;tr.children[3].querySelector('input').value=price;tr.children[4].querySelector('select').value='percent';tr.children[5].querySelector('input').value=customer?.discount||0;updateSaleTotals()}
function saleItems(){return [...$('saleItems').querySelectorAll('tr')].map(tr=>{const inp=[...tr.querySelectorAll('input')];return{code:productCodeFromInput(inp[0]?.value||''),name:inp[1]?.value||'',qty:+(inp[2]?.value||0)||0,price:+(inp[3]?.value||0)||0,discountType:tr.children[4]?.querySelector('select')?.value||'percent',discount:+(inp[4]?.value||0)||0}}).filter(x=>x.code&&x.qty>0)}
window.updateSaleTotals=()=>{let t=calcSaleTotals(saleItems(),$('saleVatMode')?.value||'included8',$('salePaid')?.value||0,$('saleSurcharge')?.value||0,$('saleOrderDiscountType')?.value||'none',$('saleOrderDiscountValue')?.value||0);[...$('saleItems').querySelectorAll('tr')].forEach(tr=>{const inp=[...tr.querySelectorAll('input')];let it={qty:+(inp[2]?.value||0)||0,price:+(inp[3]?.value||0)||0,discountType:tr.children[4]?.querySelector('select')?.value||'percent',discount:+(inp[4]?.value||0)||0};const line=tr.querySelector('.line-total'); if(line) line.textContent=money(lineNet(it))});if($('saleGoodsBeforeDiscount'))$('saleGoodsBeforeDiscount').textContent=money(t.goodsBeforeDiscount);if($('saleDiscountText'))$('saleDiscountText').textContent=money(t.discountTotal);$('saleSubTotal').textContent=money(t.subtotal);$('saleVat').textContent=money(t.vat);if($('saleSurchargeText'))$('saleSurchargeText').textContent=money(t.surcharge);$('saleGrand').textContent=money(t.grand);$('saleDebt').textContent=money(t.debt);if($('saleGrandSticky'))$('saleGrandSticky').textContent=money(t.grand);if($('saleDebtSticky'))$('saleDebtSticky').textContent=money(t.debt);syncSaleExportStockToSticky()};['saleVatMode','salePaid','saleCustomerSearch','saleCommissionPercent','saleTechCost','saleSurcharge','saleTechFuel','saleOrderDiscountType','saleOrderDiscountValue'].forEach(id=>setTimeout(()=>$(id)?.addEventListener('input',updateSaleTotals),0));setTimeout(()=>$('saleStaff')?.addEventListener('change',()=>{if($('saleCommissionPercent'))$('saleCommissionPercent').value=salePercentDefault($('saleStaff').value);updateSaleTotals()}),0);setTimeout(()=>$('saleTech')?.addEventListener('change',()=>{if($('saleTechCost'))$('saleTechCost').value=suggestedTechCost()||techFeeDefault($('saleTech').value);updateSaleTotals()}),0);
function findCustomerBySearch(){let s=($('saleCustomerSearch').value||'').toLowerCase();return data.customers.find(c=>s.includes((ensureCustomerCode(c)||'zzzz').toLowerCase())||s.includes((c.phone||'zzzz').toLowerCase())||s.includes((c.name||'zzzz').toLowerCase())||s.includes((c.address||'zzzz').toLowerCase()))}
function saleCustomerType(){return $('saleCustomerType')?.value||findCustomerBySearch()?.type||'Khách lẻ'}
window.saleCustomerChanged=()=>{const c=findCustomerBySearch();if(c && $('saleCustomerType'))$('saleCustomerType').value=(['Khách lẻ','CTV','Đại lý'].includes(c.type)?c.type:'Khách lẻ');refreshSaleItemPricesByCustomerType()}
window.saleCustomerTypeChanged=()=>{refreshSaleItemPricesByCustomerType()}
function refreshSaleItemPricesByCustomerType(){const type=saleCustomerType();const c=findCustomerBySearch();[...$('saleItems').querySelectorAll('tr')].forEach(tr=>{const code=productCodeFromInput(tr.children[0]?.querySelector('input')?.value||'');if(!code)return;const p=data.products.find(x=>x.code===code)||{};const bp=activePriceFor(code,type,$('saleDate')?.value||today());tr.children[3].querySelector('input').value=bp?.price||p.price||0;if(c)tr.children[5].querySelector('input').value=c.discount||0;});updateSaleTotals()}
window.saveSale=async()=>{let customer=findCustomerBySearch();if(!customer){await quickCreateCustomer();customer=findCustomerBySearch()}let items=saleItems();if(!items.length)return alert('Chưa có sản phẩm'); const inactiveItem=items.find(it=>(data.products.find(p=>p.code===it.code)||{}).active==='inactive'); if(inactiveItem)return alert('Model '+inactiveItem.code+' đang ngừng bán, không thể lưu phiếu bán.');
  const exportStock=!!$('saleExportStock')?.checked;
  const saleWarehouse=$('saleWarehouse')?.value||'Kho Văn Phòng';
  let oldSale=editingSale?data.sales.find(x=>x.id===editingSale):null;
  let excludeVoucherId=oldSale?.stockVoucherId||'';
  if(exportStock){for(const it of items){const available=stockOf(it.code,excludeVoucherId,saleWarehouse); if(it.qty>available && !confirm(`Sản phẩm ${it.code} tồn tại kho ${saleWarehouse} hiện có ${available}, vẫn lưu đơn kiêm xuất kho?`)) return;}}
  let totals=calcSaleTotals(items,$('saleVatMode').value,$('salePaid').value,$('saleSurcharge')?.value||0,$('saleOrderDiscountType')?.value||'none',$('saleOrderDiscountValue')?.value||0);let cost=items.reduce((a,it)=>a+costFor(it.code,$('saleDate').value)*it.qty,0);let commissionPercent=+($('saleCommissionPercent')?.value||0)||0;let saleCommission=calcCommission(totals,commissionPercent);let techCost=+($('saleTechCost')?.value||0)||0;let techFuel=+($('saleTechFuel')?.value||0)||0;let commissionBase=calcCommissionBase(totals);let o={code:$('saleCode').value,date:$('saleDate').value,customerId:customer.id,customerCode:ensureCustomerCode(customer),customerName:customerInfo(customer).name,customerPhone:customer.phone||'',customerAddress:customer.address||'',customerType:saleCustomerType(),customerGroup:saleCustomerType(),staffId:$('saleStaff').value,staffName:data.staff.find(x=>x.id===$('saleStaff').value)?.name||'',techId:$('saleTech').value,techName:data.staff.find(x=>x.id===$('saleTech').value)?.name||'',commissionPercent,commissionBase,saleCommission,techCost,techFuel,vatMode:$('saleVatMode').value,paid:+$('salePaid').value||0,note:$('saleNote').value,items,...totals,cost,profit:commissionBase-cost-saleCommission-techCost-techFuel,status:totals.debt>0?'Còn nợ':'Đã thu tiền',paymentStatus:totals.debt>0?(((+$('salePaid').value||0)>0)?'Thanh toán một phần':'Chưa thu tiền'):'Đã thu tiền',paidTotal:+$('salePaid').value||0,debtLeft:totals.debt,warehouse:saleWarehouse,stockExported:exportStock,stockVoucherId:oldSale?.stockVoucherId||'',updatedAt:serverTimestamp()};
  if(editingSale){if(!has('editSales'))return alert('Không có quyền sửa đơn');await updateDoc(doc(db,'sales',editingSale),o);await logAction('Sửa đơn bán',o.code)}else{const saleRef=await addDoc(col('sales'),{...o,createdAt:serverTimestamp()});editingSale=saleRef.id;await logAction('Tạo đơn bán',o.code);}
  const savedSaleId=editingSale;
  // Kiêm xuất kho: tạo/cập nhật phiếu xuất kho OUT riêng để trừ tồn kho. Không tick thì chưa xuất kho.
  if(exportStock){
    const voucher={code:oldSale?.stockVoucherCode||nextCode('XK',data.stockVouchers),date:o.date,type:'OUT',warehouse:saleWarehouse,saleId:editingSale,saleCode:o.code,customerName:o.customerName,note:`Xuất kho theo đơn bán ${o.code}`,items:voucherItemsFromSaleItems(items),value:cost,updatedAt:serverTimestamp()};
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
  const rows=data.sales.filter(s=>(s.code+(s.customerCode||'')+s.customerName+(s.customerPhone||'')+(s.customerType||'')).toLowerCase().includes(q)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  $('saleTable').innerHTML=rows.map(s=>{const pay=salePaymentInfo(s);const sv=stockVoucherForSale(s);const stockStatus=!!sv;const ci=saleCustomerInfo(s);return `<tr><td><b>${s.code}</b></td><td>${s.date||''}</td><td>${ci.code||''}</td><td><b>${ci.name}</b><br><small>${ci.phone||''}</small></td><td><b>${money(s.grand)}</b></td><td>${money(pay.paidTotal)}</td><td><b>${money(pay.debtLeft)}</b></td><td class="view-cost">${money(s.saleCommission||0)}</td><td class="view-cost">${money(s.profit||0)}</td><td><span class="badge ${pay.debtLeft>0?(pay.paidTotal>0?'orange':'red'):'green'}">${pay.paymentStatus}</span></td><td>${s.hasReturn?'<span class="badge orange">Có trả hàng</span><br>':''}${stockStatus?'<span class="badge green">Đã xuất kho</span>':(saleNeedSupplementStock(s)?'<span class="badge red">Cần xuất kho bổ sung</span>':'<span class="badge orange">Chưa xuất kho</span>')}</td><td><button class="btn ghost" onclick="viewSaleDetail('${s.id}')">Chi tiết</button> <button class="btn ghost" onclick="printSale('${s.id}')">In A5</button> ${has('editSales')?`<button class="btn ghost" onclick="editSale('${s.id}')">Sửa</button>`:''} ${has('deleteSales')?`<button class="btn danger" onclick="removeDoc('sales','${s.id}')">Xóa</button>`:''}</td></tr>`}).join('')||'<tr><td colspan="12">Chưa có phiếu bán</td></tr>';
}
window.viewSaleDetail=id=>{
  const s=data.sales.find(x=>x.id===id); if(!s)return;
  const pay=salePaymentInfo(s); const sv=stockVoucherForSale(s); const recs=receiptsForSale(s); const returns=saleReturnVouchers(s); const ci=saleCustomerInfo(s);
  const returnHtml=returns.length?`<div class="receipt-list"><h4>Phiếu trả hàng bán</h4><table><thead><tr><th>Mã phiếu</th><th>Ngày</th><th>Kho nhập lại</th><th>Số dòng</th><th>Ghi chú</th><th></th></tr></thead><tbody>${returns.map(v=>`<tr><td>${v.code||''}</td><td>${v.date||''}</td><td>${voucherWarehouse(v)}</td><td>${(v.items||[]).map(it=>`${it.code}: ${it.qty}`).join('<br>')}</td><td>${v.note||''}</td><td><button class="btn ghost" onclick="printStock('${v.id}')">In phiếu</button></td></tr>`).join('')}</tbody></table></div>`:'';
  const receiptHtml=recs.length?`<div class="receipt-list"><h4>Phiếu thu liên quan</h4><table><thead><tr><th>Mã PT</th><th>Ngày</th><th>Số tiền phân bổ</th><th>Ghi chú</th><th></th></tr></thead><tbody>${recs.map(r=>`<tr><td>${r.code||''}</td><td>${r.date||''}</td><td><b>${money(r.allocatedAmount||r.amount)}</b></td><td>${r.note||''}</td><td><button class="btn ghost" onclick="printReceipt('${r.id}')">In PT</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="receipt-list"><h4>Phiếu thu liên quan</h4><p>Chưa có phiếu thu được phân bổ cho đơn này.</p></div>`;
  let html=`<div class="modal-backdrop" id="saleDetailModal"><div class="modal-card"><div class="panel-head"><h3>Chi tiết đơn ${s.code}</h3><button class="btn ghost" onclick="document.getElementById('saleDetailModal').remove()">Đóng</button></div><div class="sale-detail-grid"><div><b>Khách hàng</b><p><b>${ci.name}</b><br>Mã KH: ${ci.code||''}<br>SĐT: ${ci.phone||''}<br>Đ/c: ${ci.address||''}<br>Loại khách: ${ci.type||''}</p></div><div><b>Trạng thái công nợ</b><p><span class="badge ${pay.debtLeft>0?(pay.paidTotal>0?'orange':'red'):'green'}">${pay.paymentStatus}</span><br>Tổng tiền: <b>${money(s.grand)}</b><br>Đã thu: <b>${money(pay.paidTotal)}</b><br>Còn nợ: <b>${money(pay.debtLeft)}</b><br>${saleMoneyStatus(s).overPaid>0?`Tiền dư: <b>${money(saleMoneyStatus(s).overPaid)}</b><br><span class="badge orange">${saleMoneyStatus(s).label}</span>`:''}</p></div><div><b>Kho</b><p>${sv?`<span class="badge green">Đã xuất kho</span><br>Kho xuất: <b>${voucherWarehouse(sv)}</b><br>Mã phiếu: <b>${sv.code||''}</b><br><button class="btn ghost" onclick="printStock('${sv.id}')">Xem/In phiếu xuất kho</button><br><button class="btn primary" style="margin-top:6px" onclick="openSaleReturn('${s.id}')">Trả lại hàng bán</button>`:`<span class="badge ${saleNeedSupplementStock(s)?'red':'orange'}">${saleNeedSupplementStock(s)?'Cần xuất kho bổ sung':'Chưa xuất kho'}</span><br>Đơn này chưa tạo phiếu xuất kho.<br><button class="btn primary" onclick="createSupplementStockVoucher('${s.id}')">Tạo phiếu xuất kho bổ sung</button>`}</p></div></div><table><thead><tr><th>Model</th><th>Tên sản phẩm</th><th>SL</th><th>Đơn giá</th><th>CK dòng</th><th>Thành tiền</th></tr></thead><tbody>${(s.items||[]).map(it=>`<tr><td>${it.code}</td><td>${it.name||''}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${it.discountType==='amount'?money(it.discount||0):((it.discount||0)+'%')}</td><td>${money(lineNet(it))}</td></tr>`).join('')}</tbody></table><div class="total-box"><div>Tiền hàng gốc: <b>${money(s.goodsBeforeDiscount||0)}</b></div><div>CK dòng: <b>${money(s.lineDiscountTotal||0)}</b></div><div>CK tổng đơn: <b>${money(s.orderDiscountTotal||0)}</b></div><div>Tiền sau CK: <b>${money(s.subtotal||0)}</b></div><div>Phụ thu: <b>${money(s.surcharge||0)}</b></div><div>Tổng tiền: <b>${money(s.grand)}</b></div><div>Đã thu: <b>${money(pay.paidTotal)}</b></div><div>Còn nợ: <b>${money(pay.debtLeft)}</b></div></div>${returnHtml}${receiptHtml}</div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
window.editSale=id=>{let s=data.sales.find(x=>x.id===id);if(saleLocked(s)&&currentPerm.role!=='Admin')return alert('Đơn đã thu tiền hoặc đã xuất kho. Chỉ Admin được mở khóa/sửa để tránh lệch công nợ và tồn kho.');editingSale=id;$('saleCode').value=s.code;$('saleDate').value=s.date;{const ci=saleCustomerInfo(s);$('saleCustomerSearch').value=`${ci.code||''} | ${ci.name||''} | ${ci.phone||''} | ${ci.type||''} | ${ci.address||''}`;} if($('saleCustomerType'))$('saleCustomerType').value=s.customerType||s.customerGroup||'Khách lẻ';$('saleStaff').value=s.staffId||'';$('saleTech').value=s.techId||'';if($('saleWarehouse'))$('saleWarehouse').value=s.warehouse||stockVoucherForSale(s)?.warehouse||defaultWarehouse();$('saleVatMode').value=s.vatMode||'none';$('salePaid').value=s.paid||0;if($('saleCommissionPercent'))$('saleCommissionPercent').value=s.commissionPercent??salePercentDefault(s.staffId);if($('saleTechCost'))$('saleTechCost').value=s.techCost??techFeeDefault(s.techId);if($('saleTechFuel'))$('saleTechFuel').value=s.techFuel||0;if($('saleSurcharge'))$('saleSurcharge').value=s.surcharge||0;if($('saleOrderDiscountType'))$('saleOrderDiscountType').value=s.orderDiscountType||'none';if($('saleOrderDiscountValue'))$('saleOrderDiscountValue').value=s.orderDiscountValue||0;if($('saleExportStock'))$('saleExportStock').checked=!!s.stockExported;if($('saleExportStockSticky'))$('saleExportStockSticky').checked=!!s.stockExported;$('saleNote').value=s.note||'';$('saleItems').innerHTML='';(s.items||[]).forEach(addSaleItem);updateSaleTotals();showPage('sales')}
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
    </div>
  </div>
  <table><thead><tr><th>STT</th><th>Model</th><th>Tên SP</th><th>SL</th><th>Đơn giá</th><th>CK</th><th>Thành tiền</th></tr></thead><tbody>${(s.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.code||''}</td><td>${it.name||''}</td><td>${it.qty||0}</td><td>${money(it.price||0)}</td><td>${it.discountType==='amount'?money(it.discount||0):((it.discount||0)+'%')}</td><td>${money(lineNet(it))}</td></tr>`).join('')}</tbody></table>
  <div style="display:flex;justify-content:flex-end;margin-top:10px">
    <div style="min-width:230px;line-height:1.65">
      <div style="display:flex;justify-content:space-between"><b>Tiền hàng:</b><span>${money(s.subtotal||s.grand)}</span></div>
      ${(s.discountTotal||0)>0?`<div style="display:flex;justify-content:space-between"><b>Giảm giá:</b><span>${money(s.discountTotal)}</span></div>`:''}
      ${(s.surcharge||0)>0?`<div style="display:flex;justify-content:space-between"><b>Phụ thu:</b><span>${money(s.surcharge)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:1px dashed #999;padding-top:4px;margin-top:4px"><span>Tổng thanh toán:</span><span>${money(s.grand)}</span></div>
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
  return {
    q:($('commissionSearch')?.value||'').toLowerCase().trim(),
    dept:$('commissionDept')?.value||'',
    staffId:$('commissionStaff')?.value||'',
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
  if($('commissionStaff'))$('commissionStaff').value='';
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
  return data.sales.filter(s=>{
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
function renderCommissions(){
  if(!$('commissionByStaff')||!$('commissionByOrder'))return;

  const rows=commissionFilteredSales();
  const bySale={};
  const byTech={};
  let totalRevenue=0,totalSaleCommission=0,totalTechCost=0,totalTechFuel=0;

  rows.forEach(s=>{
    totalRevenue+=+s.grand||0;
    totalSaleCommission+=+s.saleCommission||0;
    totalTechCost+=+s.techCost||0;
    totalTechFuel+=+s.techFuel||0;
    let saleKey=s.staffId||'none';
    let saleName=s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||'Chưa chọn sale';
    bySale[saleKey]=bySale[saleKey]||{id:saleKey,name:saleName,count:0,revenue:0,commission:0};
    bySale[saleKey].count++;
    bySale[saleKey].revenue+=+s.grand||0;
    bySale[saleKey].commission+=+s.saleCommission||0;

    let techKey=s.techId||'none';
    let techName=s.techName||data.staff.find(x=>x.id===s.techId)?.name||'Chưa chọn kỹ thuật';
    byTech[techKey]=byTech[techKey]||{name:techName,count:0,revenue:0,techCost:0,techFuel:0};
    byTech[techKey].count++;
    byTech[techKey].revenue+=+s.grand||0;
    byTech[techKey].techCost+=+s.techCost||0;
    byTech[techKey].techFuel+=+s.techFuel||0;
  });

  if($('commissionSummary')) $('commissionSummary').innerHTML=`<div>Tổng doanh thu: <b>${money(totalRevenue)}</b></div><div>Hoa hồng Sale: <b>${money(totalSaleCommission)}</b></div><div>Công kỹ thuật: <b>${money(totalTechCost)}</b></div><div>Tiền xăng KT: <b>${money(totalTechFuel)}</b></div><div>Tổng chi: <b>${money(totalSaleCommission+totalTechCost+totalTechFuel)}</b></div>`;

  $('commissionByStaff').innerHTML=Object.values(bySale)
    .sort((a,b)=>b.commission-a.commission)
    .map(v=>`<tr><td>${v.name}</td><td>${v.count}</td><td>${money(v.revenue)}</td><td><b>${money(v.commission)}</b></td><td>${v.id==='none'?'':`<button class="btn ghost" onclick="viewCommissionStaff('${v.id}','Sale')">Xem chi tiết</button>`}</td></tr>`)
    .join('')||'<tr><td colspan="5">Không có dữ liệu hoa hồng Sale theo bộ lọc</td></tr>';

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
    .map(s=>`<tr><td>${s.date||''}</td><td>${s.code}</td><td>${saleCustomerInfo(s).name||''}</td><td>${s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||''}</td><td>${s.techName||data.staff.find(x=>x.id===s.techId)?.name||''}</td><td>${money(s.grand)}</td><td>${money(s.surcharge||0)}</td><td>${s.commissionPercent||0}%</td><td><b>${money(s.saleCommission||0)}</b></td><td><b>${money(s.techCost||0)}</b></td><td><b>${money(s.techFuel||0)}</b></td><td><b>${money((+s.saleCommission||0)+(+s.techCost||0)+(+s.techFuel||0))}</b></td></tr>`)
    .join('')||'<tr><td colspan="12">Không có đơn bán theo bộ lọc</td></tr>'; 
}
window.resetExpenseForm=()=>{editingExpense=null;$('exDate').value=today();$('exCategory').value='Tiền điện';$('exAmount').value='';$('exNote').value=''}
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

window.saveExpense=async()=>{let o={date:$('exDate').value||today(),category:$('exCategory').value,amount:+$('exAmount').value||0,note:$('exNote').value||'',updatedAt:serverTimestamp()};if(!o.amount)return alert('Nhập số tiền chi phí');if(isSalaryCategory(o.category))return alert('Chi phí lương đã được tách sang mục Lương nhân viên. Vui lòng nhập tại menu Lương nhân viên.');if(editingExpense)await updateDoc(doc(db,'expenses',editingExpense),o);else await addDoc(col('expenses'),{...o,createdAt:serverTimestamp()});await logAction(editingExpense?'Sửa chi phí':'Thêm chi phí',o.category+' '+o.amount);resetExpenseForm();await loadAll()}
function renderExpenses(){if(!$('expenseTable'))return;let visibleExpenses=data.expenses.filter(e=>!isSalaryCategory(e.category));let total=visibleExpenses.reduce((a,e)=>a+(+e.amount||0),0);$('expenseTotal').textContent=money(total);const q=($('expenseSearch')?.value||'').toLowerCase().trim();let rows=visibleExpenses.filter(e=>matchSearchText(q,e.date,e.category,e.amount,money(e.amount),e.note)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));if($('expenseSearchCount'))$('expenseSearchCount').textContent=`Hiển thị ${rows.length}/${visibleExpenses.length}`;$('expenseTable').innerHTML=rows.map(e=>`<tr><td>${e.date||''}</td><td>${e.category||''}</td><td>${money(e.amount)}</td><td>${e.note||''}</td><td><button class="btn ghost" onclick="editExpense('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('expenses','${e.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="5">Không tìm thấy chi phí phù hợp</td></tr>'}
window.clearExpenseSearch=()=>{if($('expenseSearch'))$('expenseSearch').value='';renderExpenses();}
window.editExpense=id=>{let e=data.expenses.find(x=>x.id===id);if(!e)return;editingExpense=id;$('exDate').value=e.date||today();$('exCategory').value=e.category||'Khác';$('exAmount').value=e.amount||0;$('exNote').value=e.note||'';showPage('expenses')}

function calcDebtRows(){
  return data.customers.map(c=>{
    let sales=data.sales.filter(s=>s.customerId===c.id);
    let total=sales.reduce((a,s)=>a+(+s.grand||0),0)+(+c.openingDebt||0);
    let paid=sales.reduce((a,s)=>a+(+s.paid||0),0)+data.receipts.filter(r=>r.customerId===c.id).reduce((a,r)=>a+(+r.amount||0),0);
    let rawDebt=total-paid;
    return{customer:c,total,paid,debt:Math.max(0,rawDebt),overPaid:Math.max(0,-rawDebt),settled:total>0&&rawDebt<=0};
  }).filter(x=>x.total||x.paid||x.debt||x.overPaid)
}
function calcDebts(){return calcDebtRows().filter(x=>x.debt>0)}
function calcSettledDebts(){return calcDebtRows().filter(x=>x.settled).sort((a,b)=>String(ensureCustomerCode(a.customer)).localeCompare(String(ensureCustomerCode(b.customer))))}
function fillReceiptCustomerOptions(includeAll=false){
  const el=$('receiptCustomer'); if(!el)return;
  const activeIds=new Set(calcDebts().map(d=>d.customer.id));
  const customers=includeAll?data.customers:data.customers.filter(c=>activeIds.has(c.id));
  el.innerHTML='<option value="">-- Chọn khách còn công nợ --</option>'+customers.map(c=>`<option value="${c.id}">${customerShortLabel(c)}</option>`).join('');
}
function debtRowText(d){const ci=customerInfo(d.customer);return [ci.code,ci.name,ci.phone,ci.address,ci.type,d.total,d.paid,d.debt,money(d.total),money(d.paid),money(d.debt)].join(' ').toLowerCase()}
function renderDebts(){
  const q=($('debtSearch')?.value||'').toLowerCase().trim();
  const activeAll=calcDebts().sort((a,b)=>b.debt-a.debt);
  const settledAll=calcSettledDebts();
  const active=activeAll.filter(d=>!q||debtRowText(d).includes(q));
  const settled=settledAll.filter(d=>!q||debtRowText(d).includes(q));
  if($('debtActiveCount'))$('debtActiveCount').textContent=activeAll.length;
  if($('debtActiveTotal'))$('debtActiveTotal').textContent=money(activeAll.reduce((a,d)=>a+d.debt,0));
  if($('debtSettledCount'))$('debtSettledCount').textContent=settledAll.length;
  if($('debtSearchCount'))$('debtSearchCount').textContent=`Hiển thị ${active.length}/${activeAll.length} công nợ phải thu`;
  $('debtTable').innerHTML=active.map(d=>{const ci=customerInfo(d.customer);return `<tr><td><b>${ci.code}</b></td><td><b>${ci.name}</b><br><small>${ci.phone||''}</small></td><td>${money(d.total)}</td><td>${money(d.paid)}</td><td><b class="text-danger debt-money">${money(d.debt)}</b></td><td><button class="btn primary debt-action" onclick="receiptFor('${d.customer.id}')">Thu tiền</button></td></tr>`}).join('')||'<tr><td colspan="6">Không tìm thấy công nợ phù hợp</td></tr>';
  if($('settledDebtTable'))$('settledDebtTable').innerHTML=settled.map(d=>{const ci=customerInfo(d.customer);return `<tr class="settled-row"><td>${ci.code}</td><td><b>${ci.name}</b><br><small>${ci.phone||''}</small></td><td>${money(d.total)}</td><td>${money(d.paid)}</td><td><span class="badge green">Đã thu đủ</span>${d.overPaid?` <span class="badge orange">Thu dư ${money(d.overPaid)}</span>`:''}</td></tr>`}).join('')||'<tr><td colspan="5">Không tìm thấy công nợ đã tất toán phù hợp</td></tr>';
}
window.clearDebtSearch=()=>{if($('debtSearch'))$('debtSearch').value='';renderDebts();}
window.resetReceiptForm=()=>{editingReceipt=null;fillReceiptCustomerOptions();$('receiptCustomer').value='';$('receiptAmount').value='';$('receiptDate').value=today();$('receiptNote').value=''}
window.receiptFor=id=>{let d=calcDebtRows().find(x=>x.customer.id===id);if(d&&d.debt<=0)return alert('Khách hàng này đã thu đủ tiền. Phiếu thu được lưu trong lịch sử đã tất toán.');resetReceiptForm();$('receiptCustomer').value=id;$('receiptDate').value=today();if(d&&d.debt>0)$('receiptAmount').value=d.debt;showPage('debts');setTimeout(()=>$('receiptAmount')?.focus(),0)};window.openReceiptForm=()=>{resetReceiptForm();showPage('debts');setTimeout(()=>$('receiptCustomer')?.focus(),0)}
window.saveReceipt=async()=>{let cid=$('receiptCustomer').value,amount=+$('receiptAmount').value||0;if(!cid||!amount)return alert('Chọn khách và nhập số tiền');let d=calcDebtRows().find(x=>x.customer.id===cid);if(d&&d.debt<=0&&!editingReceipt)return alert('Khách hàng này đã thu đủ tiền, không còn công nợ phải thu.');if(d&&amount>d.debt&&!confirm(`Số tiền thu ${money(amount)} lớn hơn công nợ còn lại ${money(d.debt)}. Vẫn lưu phiếu thu?`))return;let c=data.customers.find(x=>x.id===cid)||{};let ci=customerInfo(c);let o={customerId:cid,customerCode:ci.code,customerName:ci.name,amount,date:$('receiptDate').value||today(),note:$('receiptNote').value||'',updatedAt:serverTimestamp()};if(editingReceipt){await updateDoc(doc(db,'receipts',editingReceipt),o);await logAction('Sửa phiếu thu',o.customerName+' '+o.amount)}else{await addDoc(col('receipts'),{code:nextCode('PT',data.receipts),...o,createdAt:serverTimestamp()});await logAction('Thêm phiếu thu',o.customerName+' '+o.amount)}resetReceiptForm();await loadAll();await updatePaymentStatusesForCustomer(cid);await loadAll()}
window.editReceipt=id=>{let r=data.receipts.find(x=>x.id===id);if(!r)return;editingReceipt=id;$('receiptCustomer').value=r.customerId||'';$('receiptAmount').value=r.amount||0;$('receiptDate').value=r.date||today();$('receiptNote').value=r.note||'';showPage('debts')}
function receiptsForSale(s){
  const sameCustomer=data.receipts.filter(r=>r.customerId===s.customerId).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.code||'').localeCompare(String(b.code||'')));
  let remain=+s.grand||0; const out=[];
  const earlier=data.sales.filter(x=>x.customerId===s.customerId).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.code||'').localeCompare(String(b.code||'')));
  let before=0; for(const x of earlier){ if(x.id===s.id) break; before+=Math.max(0,(+x.grand||0)-(+x.paid||0)); }
  for(const r of sameCustomer){
    let amt=+r.amount||0;
    if(before>0){ const use=Math.min(before,amt); before-=use; amt-=use; }
    if(amt>0 && remain>0){ const use=Math.min(remain,amt); out.push({...r,allocatedAmount:use}); remain-=use; }
  }
  return out;
}
window.printReceipt=id=>{let r=data.receipts.find(x=>x.id===id);if(!r)return alert('Không tìm thấy phiếu thu');let c=data.customers.find(x=>x.id===r.customerId)||{};let html=`<div class="print-a5">${printHeader('PHIẾU THU')}<p><b>Mã phiếu thu:</b> ${r.code||''} &nbsp; <b>Ngày:</b> ${r.date||''}<br><b>Mã KH:</b> ${r.customerCode||ensureCustomerCode(c)||''}<br><b>Khách hàng:</b> ${r.customerName||customerInfo(c).name||''}<br><b>Số tiền thu:</b> ${money(r.amount)}<br><b>Bằng chữ:</b> ${numberToVietnamese(r.amount)}<br><b>Ghi chú:</b> ${r.note||''}</p><div style="display:flex;justify-content:space-between;text-align:center;margin-top:50px"><div>Người nộp tiền<br><br><br></div><div>Người thu tiền<br><br><br></div></div></div>`;doPrint(html)}
function renderReceipts(){
  const q=($('receiptSearch')?.value||'').toLowerCase().trim();
  const rows=data.receipts.filter(r=>{const c=data.customers.find(x=>x.id===r.customerId)||{};const ci=customerInfo(c);return matchSearchText(q,r.code,r.date,r.customerCode,ci.code,r.customerName,ci.name,ci.phone,ci.address,r.amount,money(r.amount),r.note)}).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  if($('receiptSearchCount'))$('receiptSearchCount').textContent=`Hiển thị ${rows.length}/${data.receipts.length}`;
  $('receiptTable').innerHTML=rows.map(r=>{const c=data.customers.find(x=>x.id===r.customerId)||{};const ci=customerInfo(c);return `<tr><td>${r.code||''}</td><td>${r.date||''}</td><td>${r.customerCode||ci.code||''}</td><td>${r.customerName||ci.name||''}</td><td>${money(r.amount)}</td><td>${r.note||''}</td><td><button class="btn ghost" onclick="printReceipt('${r.id}')">In</button> <button class="btn ghost" onclick="editReceipt('${r.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('receipts','${r.id}')">Xóa</button></td></tr>`}).join('')||'<tr><td colspan="7">Không tìm thấy phiếu thu phù hợp</td></tr>'
}
window.clearReceiptSearch=()=>{if($('receiptSearch'))$('receiptSearch').value='';renderReceipts();}


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
  const all=data.stockVouchers.filter(canAccessVoucher).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
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



window.saveWarranty=async()=>{let start=$('wStart').value||today();let end=new Date(start);end.setMonth(end.getMonth()+(+$('wMonths').value||24));let o={saleId:$('wSale').value,customer:$('wCustomer').value,phone:$('wPhone').value,serial:$('wSerial').value,start,end:end.toISOString().slice(0,10),months:+$('wMonths').value||24,status:$('wStatus').value,note:$('wNote').value};if(editingWarranty)await updateDoc(doc(db,'warranties',editingWarranty),o);else await addDoc(col('warranties'),o);editingWarranty=null;['wCustomer','wPhone','wSerial','wNote'].forEach(i=>$(i).value='');await loadAll()};$('wSale').addEventListener('change',()=>{let s=data.sales.find(x=>x.id===$('wSale').value);if(s){const ci=saleCustomerInfo(s);$('wCustomer').value=ci.name;$('wPhone').value=ci.phone||'';$('wSerial').value=(s.items||[]).map(i=>i.code).join(', ');$('wStart').value=s.date||today()}});
function renderWarranties(){let q=($('wSearch')?.value||'').toLowerCase();$('warrantyTable').innerHTML=data.warranties.filter(w=>(w.customer+w.phone+w.serial).toLowerCase().includes(q)).map(w=>`<tr><td>${w.customer}</td><td>${w.phone||''}</td><td>${w.serial||''}</td><td>${w.start}</td><td>${w.end}</td><td><span class="badge green">${w.status}</span></td><td><button class="btn ghost" onclick="editWarranty('${w.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('warranties','${w.id}')">Xóa</button></td></tr>`).join('')}
window.editWarranty=id=>{let w=data.warranties.find(x=>x.id===id);editingWarranty=id;$('wSale').value=w.saleId||'';$('wCustomer').value=w.customer;$('wPhone').value=w.phone||'';$('wSerial').value=w.serial||'';$('wStart').value=w.start;$('wMonths').value=w.months||24;$('wStatus').value=w.status;$('wNote').value=w.note||''}

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
function renderReports(){
  if(!$('reportBox'))return;
  if($('reportFrom')&&!$('reportFrom').value)setReportQuickRange();
  const {from,to,period}=reportRange();
  const productQ=($('reportProductSearch')?.value||'').trim().toLowerCase();
  const sales=data.sales.filter(s=>inReportRange(s.date,from,to));
  const expenses=data.expenses.filter(e=>inReportRange(e.date,from,to)&&!isSalaryCategory(e.category));
  const salaries=data.salaries.filter(e=>inReportRange(e.date,from,to));
  const rev=sales.reduce((a,s)=>a+(+s.grand||0),0);
  const revenueBeforeVat=sales.reduce((a,s)=>a+calcCommissionBase(s),0);
  // Công nợ/đã thu phải lấy theo phân bổ phiếu thu hiện tại, không chỉ lấy số tiền nhập lúc tạo đơn.
  const paid=sales.reduce((a,s)=>a+(+salePaymentInfo(s).paidTotal||0),0);
  const debt=sales.reduce((a,s)=>a+(+salePaymentInfo(s).debtLeft||0),0);
  const totalCost=sales.reduce((a,s)=>a+(+s.cost||((s.items||[]).reduce((b,it)=>b+costFor(it.code,s.date||today())*(+it.qty||0),0))),0);
  const grossMargin=revenueBeforeVat-totalCost;
  const comm=sales.reduce((a,s)=>a+(+s.saleCommission||0),0);
  const techCostOnly=sales.reduce((a,s)=>a+(+s.techCost||0),0);
  const techFuelOnly=sales.reduce((a,s)=>a+(+s.techFuel||0),0);
  const tech=techCostOnly+techFuelOnly;
  const grossProfit=sales.reduce((a,s)=>a+(+s.profit||0),0);
  const op=expenses.reduce((a,e)=>a+(+e.amount||0),0);
  const sal=salaries.reduce((a,e)=>a+(+e.total||+e.amount||0),0);
  const totalCompanyCost=op+sal;
  const profit=grossProfit-totalCompanyCost;
  const surchargeTotal=sales.reduce((a,s)=>a+(+s.surcharge||0),0);
  const qty=sales.reduce((a,s)=>a+(s.items||[]).reduce((b,it)=>b+(+it.qty||0),0),0);
  $('reportBox').innerHTML=`
    <div class="report-card">Doanh thu kỳ này<small>${from} → ${to}</small><b>${money(rev)}</b></div>
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
    ['Doanh thu trên đơn', rev, 'Tổng tiền khách phải trả sau chiết khấu, gồm phụ thu và VAT nếu có'],
    ['Doanh thu trước VAT', revenueBeforeVat, 'Cơ sở tính lợi nhuận và hoa hồng'],
    ['Giá vốn sản phẩm', -totalCost, 'Lấy từ Bảng giá vốn hiệu lực, nếu không có thì lấy Giá vốn trong Sản phẩm'],
    ['Lãi gộp', grossMargin, 'Doanh thu trước VAT - Giá vốn'],
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
    const pay=salePaymentInfo(s);byTime[k].orders++;byTime[k].qty+=(s.items||[]).reduce((a,it)=>a+(+it.qty||0),0);byTime[k].revenue+=+s.grand||0;byTime[k].surcharge+=+s.surcharge||0;byTime[k].paid+=+pay.paidTotal||0;byTime[k].debt+=+pay.debtLeft||0;byTime[k].comm+=+s.saleCommission||0;byTime[k].tech+=(+s.techCost||0)+(+s.techFuel||0);byTime[k].profit+=+s.profit||0;
  });
  if($('reportRevenueTable'))$('reportRevenueTable').innerHTML=Object.values(byTime).sort((a,b)=>String(b.key).localeCompare(String(a.key))).map(x=>`<tr><td><b>${x.key}</b></td><td>${x.orders}</td><td>${x.qty}</td><td>${money(x.revenue)}</td><td>${money(x.surcharge)}</td><td>${money(x.paid)}</td><td>${money(x.debt)}</td><td class="view-cost">${money(x.comm)}</td><td class="view-cost">${money(x.tech)}</td><td class="view-cost">${money(x.profit)}</td></tr>`).join('')||'<tr><td colspan="10">Chưa có doanh thu trong kỳ</td></tr>';

  const byCat={};
  expenses.forEach(e=>{const k=e.category||'Khác';byCat[k]=byCat[k]||{category:k,count:0,amount:0};byCat[k].count++;byCat[k].amount+=+e.amount||0});
  if($('reportExpenseCategoryTable'))$('reportExpenseCategoryTable').innerHTML=Object.values(byCat).sort((a,b)=>b.amount-a.amount).map(x=>`<tr><td>${x.category}</td><td>${x.count}</td><td><b>${money(x.amount)}</b></td></tr>`).join('')||'<tr><td colspan="3">Chưa có chi phí trong kỳ</td></tr>';
  if($('reportExpenseDetailTable'))$('reportExpenseDetailTable').innerHTML=expenses.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<tr><td>${e.date||''}</td><td>${e.category||''}</td><td>${money(e.amount)}</td><td>${e.note||''}</td></tr>`).join('')||'<tr><td colspan="4">Chưa có chi phí vận hành trong kỳ</td></tr>';
  if($('reportSalaryDetailTable'))$('reportSalaryDetailTable').innerHTML=salaries.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<tr><td>${e.date||''}</td><td>${e.staffName||''}</td><td>${money(e.base)}</td><td>${money(e.allowance)}</td><td>${money(e.bonus)}</td><td>${money(e.deduct)}</td><td>${money(e.total||e.amount)}</td><td>${e.note||''}</td></tr>`).join('')||'<tr><td colspan="8">Chưa có lương trong kỳ</td></tr>';

  const returnVouchers=data.stockVouchers.filter(v=>v.type==='RETURN'&&inReportRange(v.date,from,to)&&canAccessVoucher(v));
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


window.removeDoc=async(name,id)=>{
  const label={sales:'đơn bán',stockVouchers:'phiếu kho',customers:'khách hàng',products:'sản phẩm',prices:'bảng giá',staff:'nhân viên',warranties:'bảo hành',expenses:'chi phí',receipts:'phiếu thu'}[name]||name;
  const code=prompt(`Bạn đang xóa ${label}. Nhập XOA để xác nhận:`);
  if(code!=='XOA')return;
  let customerToRefresh='';
  if(name==='sales'){
    const s=data.sales.find(x=>x.id===id);
    customerToRefresh=s?.customerId||'';
    if(saleLocked(s)&&currentPerm.role!=='Admin')return alert('Đơn đã thu tiền hoặc đã xuất kho. Chỉ Admin được xóa/mở khóa.');
    if(s?.stockVoucherId) await deleteDoc(doc(db,'stockVouchers',s.stockVoucherId));
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
function doPrint(html){let w=window.open('','PRINT','width=800,height=900');w.document.write(`<!doctype html><html><head><title>In phiếu</title><style>body{font-family:Arial;margin:0;color:#111}.print-a5{width:148mm;min-height:210mm;padding:7mm 8mm;font-size:11.5px;box-sizing:border-box;page-break-after:always}table{width:100%;border-collapse:collapse;margin-top:6px;table-layout:fixed}th,td{border:1px solid #222;padding:4px;text-align:left;vertical-align:top;word-break:break-word}th{background:#f1f5f9}p{line-height:1.4}.print-a5 h2{font-size:17px;margin:3px 0 7px}@page{size:A5 portrait;margin:0}@media print{html,body{width:148mm;min-height:210mm}.print-a5{width:148mm;min-height:210mm}}</style></head><body>${html}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script></body></html>`);w.document.close()}

function excelReady(){return !!window.XLSX}
function assertExcel(){if(!excelReady())throw new Error('Thư viện Excel chưa tải xong. Kiểm tra Internet hoặc tải lại trang.');}
const excelSchemas={
  customers:{sheet:'Khach_hang',headers:['customerCode','name','type','phone','address','email','contact','source','birthday','note','discount','openingDebt'],sample:[{customerCode:'KL0902950816',name:'Nguyễn Văn A',type:'Khách lẻ',phone:'0902950816',address:'Đà Nẵng',email:'',contact:'',source:'Facebook',birthday:'',note:'',discount:0,openingDebt:0}]},
  products:{sheet:'San_pham',headers:['code','name','category','cost','price','minStock','active'],sample:[{code:'F07',name:'Khóa thông minh F07',category:'Khóa thông minh',cost:950000,price:1850000,minStock:3,active:'active'}]},
  prices:{sheet:'Bang_gia',headers:['listName','code','type','price','validFrom','validTo','active','note'],sample:[{listName:'Bảng giá bán lẻ tháng hiện hành',code:'F07',type:'Khách lẻ',price:1850000,validFrom:today(),validTo:'',active:true,note:'Giá bán lẻ'}]},
  costPrices:{sheet:'Bang_gia_von',headers:['listName','code','cost','validFrom','validTo','active','note'],sample:[{listName:'Giá vốn tháng hiện hành',code:'F07',cost:950000,validFrom:today(),validTo:'',active:true,note:'Giá vốn tháng hiện hành'}]},
  staff:{sheet:'Nhan_vien',headers:['name','dept','functions','phone','commissionPercent','techFee'],sample:[{name:'Nguyễn Sale + Kỹ thuật',dept:'Sale',functions:'Sale;Kỹ thuật',phone:'0900000001',commissionPercent:5,techFee:100000},{name:'Lê Kỹ Thuật',dept:'Kỹ thuật',functions:'Kỹ thuật',phone:'0900000002',commissionPercent:0,techFee:100000}]},
  expenses:{sheet:'Chi_phi_van_hanh',headers:['date','category','amount','note'],sample:[{date:today(),category:'Tiền điện',amount:1500000,note:'Tiền điện tháng'}]},
  salaries:{sheet:'Luong_nhan_vien',headers:['date','staffName','base','allowance','bonus','deduct','total','note'],sample:[{date:today(),staffName:'Nguyễn Văn A',base:8000000,allowance:0,bonus:0,deduct:0,total:8000000,note:'Lương tháng'}]},
  warranties:{sheet:'Bao_hanh',headers:['saleId','customer','phone','serial','start','months','end','status','note'],sample:[{saleId:'',customer:'Nguyễn Văn A',phone:'0902950816',serial:'F07-001',start:today(),months:24,end:'',status:'Còn bảo hành',note:''}]},
  stockVouchers:{sheet:'Chung_tu_kho',headers:['code','date','type','warehouse','productCode','productName','qty','cost','note'],sample:[{code:'NK000001',date:today(),type:'IN',warehouse:defaultWarehouse(),productCode:'F07',productName:'Khóa thông minh F07',qty:10,cost:950000,note:'Nhập kho'}]},
  sales:{sheet:'Ban_hang',headers:['code','date','customerCode','customerName','customerPhone','staffName','techName','goodsBeforeDiscount','lineDiscountTotal','orderDiscountType','orderDiscountValue','orderDiscountTotal','discountTotal','grand','paid','debt','commissionPercent','saleCommission','techCost','techFuel','surcharge','profit','itemsJson','note'],sample:[{code:'BH000001',date:today(),customerCode:'KL0902950816',customerName:'Nguyễn Văn A',customerPhone:'0902950816',staffName:'Nguyễn Sale',techName:'Lê Kỹ Thuật',grand:1850000,paid:1850000,debt:0,commissionPercent:5,saleCommission:85648,techCost:100000,techFuel:0,surcharge:0,goodsBeforeDiscount:1850000,lineDiscountTotal:0,orderDiscountType:'none',orderDiscountValue:0,orderDiscountTotal:0,discountTotal:0,profit:577315,itemsJson:'[{"code":"F07","name":"Khóa thông minh F07","qty":1,"price":1850000,"discount":0}]',note:''}]},
  commissions:{sheet:'Hoa_hong',headers:['date','code','customer','saleStaff','techStaff','grand','commissionPercent','saleCommission','techCost','techFuel','totalCommission'],sample:[]},
  stockbook:{sheet:'So_kho',headers:['code','name','inQty','outQty','transferQty','adjustQty','khoChinh','khoVanPhong','stock'],sample:[]},
  returns:{sheet:'Hang_tra_lai',headers:['date','voucherCode','saleCode','customer','warehouse','code','name','qty','amount','settlement','note'],sample:[]},
  logs:{sheet:'Nhat_ky',headers:['time','email','action','detail'],sample:[]}
};
function exportRows(type){let rows=[];
  if(type==='customers')rows=data.customers.map(c=>({customerCode:ensureCustomerCode(c),name:c.name,type:c.type,phone:c.phone,address:c.address,discount:c.discount,openingDebt:c.openingDebt}));
  if(type==='products')rows=data.products.map(p=>({code:p.code,name:p.name,category:p.category,cost:p.cost,price:p.price,minStock:p.minStock,active:p.active||'active',stock:stockOf(p.code)}));
  if(type==='prices')rows=data.prices.map(p=>({listName:p.listName||'',code:p.code,type:p.type,price:p.price,validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||''}));
  if(type==='costPrices')rows=(data.costPrices||[]).map(p=>({listName:p.listName||'',code:p.code,cost:p.cost,validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||''}));
  if(type==='staff')rows=data.staff.map(e=>({name:e.name,dept:e.dept,functions:staffFunctionText(e),phone:e.phone,commissionPercent:e.commissionPercent||0,techFee:e.techFee||0}));
  if(type==='expenses')rows=data.expenses.filter(e=>!isSalaryCategory(e.category)).map(e=>({date:e.date,category:e.category,amount:e.amount,note:e.note}));
  if(type==='salaries')rows=data.salaries.map(e=>({date:e.date,staffName:e.staffName,base:e.base,allowance:e.allowance,bonus:e.bonus,deduct:e.deduct,total:e.total,note:e.note}));
  if(type==='warranties')rows=data.warranties.map(w=>({saleId:w.saleId||'',customer:w.customer,phone:w.phone,serial:w.serial,start:w.start,months:w.months,end:w.end,status:w.status,note:w.note}));
  if(type==='stockVouchers')rows=data.stockVouchers.flatMap(v=>(v.items||[]).map(it=>({code:v.code,date:v.date,type:v.type,warehouse:voucherWarehouse(v),productCode:it.code,productName:it.name,qty:it.actualQty??it.inputQty??it.qty,cost:it.cost,note:it.note||v.note||''})));
  if(type==='sales')rows=data.sales.map(s=>({code:s.code,date:s.date,customerCode:s.customerCode||'',customerName:saleCustomerInfo(s).name,customerPhone:saleCustomerInfo(s).phone||'',staffName:s.staffName,techName:s.techName,goodsBeforeDiscount:s.goodsBeforeDiscount||0,lineDiscountTotal:s.lineDiscountTotal||0,orderDiscountType:s.orderDiscountType||'none',orderDiscountValue:s.orderDiscountValue||0,orderDiscountTotal:s.orderDiscountTotal||0,discountTotal:s.discountTotal||0,grand:s.grand,paid:s.paid,debt:s.debt,commissionPercent:s.commissionPercent,saleCommission:s.saleCommission,techCost:s.techCost,techFuel:s.techFuel||0,surcharge:s.surcharge||0,profit:s.profit,itemsJson:JSON.stringify(s.items||[]),note:s.note||''}));
  if(type==='commissions')rows=data.sales.map(s=>({date:s.date,code:s.code,customer:saleCustomerInfo(s).name,saleStaff:s.staffName,techStaff:s.techName,grand:s.grand,commissionPercent:s.commissionPercent,saleCommission:s.saleCommission,techCost:s.techCost,techFuel:s.techFuel||0,totalCommission:(+s.saleCommission||0)+(+s.techCost||0)+(+s.techFuel||0)}));
  if(type==='returns'){rows=data.stockVouchers.filter(v=>v.type==='RETURN'&&canAccessVoucher(v)).flatMap(v=>(v.items||[]).map(it=>{const sale=data.sales.find(s=>s.id===v.saleId||s.code===v.saleCode)||{};const priceLine=(sale.items||[]).find(x=>x.code===it.code)||{};return{date:v.date||'',voucherCode:v.code||'',saleCode:v.saleCode||sale.code||'',customer:v.customerName||saleCustomerInfo(sale).name||'',warehouse:voucherWarehouse(v),code:it.code||'',name:it.name||'',qty:+it.qty||0,amount:lineNet({...priceLine,qty:+it.qty||0}),settlement:v.settlement||sale.returnSettlement||'',note:v.note||''}}));}
  if(type==='logs')rows=(data.logs||[]).map(l=>({time:logTime(l.at),email:l.email||'',action:l.action||'',detail:l.detail||''}));
  if(type==='stockbook'){const df=stockBookDateFilter();rows=stockBookRows(df.from,df.to).filter(r=>!df.active||r.periodMovement).map(r=>({tuNgay:df.from||'',denNgay:df.to||'',model:r.code,sanPham:r.name,nhap:r.totalIn,xuat:r.totalOut,chuyenKho:r.totalTransfer,dieuChinh:r.totalAdj,khoChinh:canAccessWarehouse('Kho Chính')?r.khoChinh:'Ẩn',khoVanPhong:canAccessWarehouse('Kho Văn Phòng')?r.khoVanPhong:'Ẩn',tongTonHienTai:r.stock,giaVon:has('viewCost')?r.cost:'Ẩn',giaTriTon:has('viewCost')?r.value:'Ẩn'}));}
  return rows;
}
function stockQtyByType(code,type){let q=0;data.stockVouchers.forEach(v=>{if(v.type!==type)return;(v.items||[]).forEach(it=>{if(it.code===code)q+=+it.qty||0})});return q}
function makeWorkbook(sheets){assertExcel();const wb=XLSX.utils.book_new();Object.entries(sheets).forEach(([name,rows])=>{const ws=XLSX.utils.json_to_sheet(rows.length?rows:[{}]);XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));});return wb;}
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
        obj.customer=String(obj.customer||'').trim();obj.phone=String(obj.phone||'').trim();obj.serial=String(obj.serial||'').trim();obj.start=String(obj.start||today());obj.months=safeNum(obj.months)||24;obj.status=obj.status||'Còn bảo hành';obj.note=obj.note||'';obj.saleId=obj.saleId||'';
        if(!obj.customer||!obj.serial){skip++;errors.push(`Dòng ${r+2}: thiếu khách hoặc serial/model`);continue}
        let end=obj.end;if(!end){let d=new Date(obj.start);d.setMonth(d.getMonth()+obj.months);end=d.toISOString().slice(0,10)}
        await addDoc(col('warranties'),{...obj,end});
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
        const o={code:obj.code||nextCode('BH',data.sales),date:String(obj.date||today()),customerCode:obj.customerCode||customerCodeFromPhone(obj.customerPhone),customerName:obj.customerName||'',customerPhone:obj.customerPhone||'',staffName:obj.staffName||'',techName:obj.techName||'',items,...totals,grand,paid:safeNum(obj.paid),debt:safeNum(obj.debt)||grand-safeNum(obj.paid),commissionPercent:safeNum(obj.commissionPercent),saleCommission:safeNum(obj.saleCommission),techCost:safeNum(obj.techCost),techFuel:safeNum(obj.techFuel),surcharge:safeNum(obj.surcharge),profit:safeNum(obj.profit),note:obj.note||'',createdAt:serverTimestamp()};
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
  const pack={exportedAt:new Date().toISOString(),customers:data.customers,products:data.products,prices:data.prices,staff:data.staff,sales:data.sales,stockVouchers:data.stockVouchers,receipts:data.receipts,warranties:data.warranties,expenses:data.expenses,salaries:data.salaries,users:data.users,logs:data.logs,version:'v30'};
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
  ['customers','products','staff','prices','costPrices','sales','stockVouchers','receipts','warranties','expenses','salaries','logs'].forEach(n=>{data[n]=[]});
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
    const collectionsToClear=['customers','products','prices','costPrices','staff','sales','stockVouchers','receipts','warranties','expenses','salaries','logs'];
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
