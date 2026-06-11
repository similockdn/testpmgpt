import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';
import { collection, addDoc, setDoc, doc, deleteDoc, getDocs, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

const $=id=>document.getElementById(id);const money=n=>(Number(n)||0).toLocaleString('vi-VN')+'đ';const today=()=>new Date().toISOString().slice(0,10);const uid=()=>Math.random().toString(36).slice(2,9);const normEmail=v=>String(v||'').trim().toLowerCase();
const ADMIN_EMAIL='similockdn@gmail.com';
const userDocRef = (u)=>doc(db,'users',u.uid);
const userProfileData = (u, extra={})=>({uid:u.uid,email:normEmail(u.email),...extra});
let currentUser=null,currentPerm={role:'Admin',perms:[]},creatingAdmin=false;let editingSale=null,editingStock=null,editingWarranty=null,editingExpense=null;
const data={customers:[],products:[],staff:[],prices:[],sales:[],stockVouchers:[],receipts:[],warranties:[],expenses:[],users:[],logs:[]};
const modules=['dashboard','sales','commissions','expenses','debts','inventory','stockbook','warranty','customers','products','prices','staff','reports','permissions'];
const permissionMap={
 Admin:modules.concat(['viewCost','editSales','deleteSales','editStock','deleteStock','audit']),
 Sale:['dashboard','sales','commissions','customers','products','warranty'],
 'Kỹ thuật':['dashboard','warranty','customers','products'],
 Kho:['dashboard','inventory','stockbook','products'],
 'Kế toán':['dashboard','expenses','commissions','debts','reports','sales','customers','products']
};
const permLabels={dashboard:'Dashboard',sales:'Bán hàng',commissions:'Hoa hồng',expenses:'Chi phí',debts:'Công nợ',inventory:'Kho',stockbook:'Sổ kho',warranty:'Bảo hành',customers:'Khách hàng',products:'Sản phẩm',prices:'Bảng giá',staff:'Nhân viên',reports:'Báo cáo',permissions:'Phân quyền',viewCost:'Xem giá vốn/lợi nhuận',editSales:'Sửa đơn bán',deleteSales:'Xóa đơn bán',editStock:'Sửa phiếu kho',deleteStock:'Xóa phiếu kho',audit:'Xem nhật ký'};

function has(p){return currentPerm.role==='Admin'||(currentPerm.perms||[]).includes(p)}
function col(n){return collection(db,n)}
async function loadCol(n){try{const s=await getDocs(col(n));data[n]=s.docs.map(d=>({id:d.id,...d.data()}));}catch(e){console.warn('Không tải được collection '+n,e.message);data[n]=[];}}
async function loadAll(){for(const n of ['customers','products','staff','prices','sales','stockVouchers','receipts','warranties','expenses','users','logs']) await loadCol(n); renderAll();}
async function logAction(action,detail){try{await addDoc(col('logs'),{action,detail,email:currentUser?.email||'',at:serverTimestamp()})}catch(e){}}
function fillSelect(el,arr,labelFn,valFn){if(!el)return;el.innerHTML='<option value="">-- Chọn --</option>'+arr.map(x=>`<option value="${valFn?valFn(x):x.id}">${labelFn(x)}</option>`).join('')}
function nextCode(prefix,arr){let max=0;arr.forEach(x=>{const m=String(x.code||'').match(/(\d+)$/);if(m)max=Math.max(max,+m[1])});return prefix+String(max+1).padStart(6,'0')}
function stockOf(code,excludeVoucherId=''){
  let qty=0;
  data.stockVouchers.forEach(v=>{if(v.id===excludeVoucherId)return;(v.items||[]).forEach(it=>{if(it.code===code){if(v.type==='IN')qty+=+it.qty||0;else if(v.type==='OUT')qty-=+it.qty||0;else qty+=+it.qty||0}})});
  data.sales.forEach(s=>(s.items||[]).forEach(it=>{if(it.code===code)qty-=+it.qty||0}));
  return qty
}
function prefixByStockType(t){return t==='IN'?'NK':t==='OUT'?'XK':t==='CHECK'?'KK':'DC'}
function stockTypeName(t){return t==='IN'?'Phiếu nhập kho':t==='OUT'?'Phiếu xuất kho':t==='CHECK'?'Phiếu kiểm kê':'Phiếu điều chỉnh kho'}
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
function validateDate(v){return !v || /^\d{4}-\d{2}-\d{2}$/.test(v)}
function calcSaleTotals(items,vatMode,paid){let subtotal=items.reduce((a,it)=>a+(+it.qty||0)*(+it.price||0)*(1-(+it.discount||0)/100),0);let rate=vatMode?.includes('10') ? 0.10 : (vatMode?.includes('8') ? 0.08 : 0);let vat=0,grand=subtotal;if(vatMode?.startsWith('add')){vat=subtotal*rate;grand=subtotal+vat}else if(vatMode?.startsWith('included')){vat=subtotal-subtotal/(1+rate);grand=subtotal}return{subtotal,vat,grand,debt:grand-(+paid||0)}}
function calcCommission(grand,percent){return Math.round((+grand||0)*(+percent||0)/100)}
function salePercentDefault(staffId){let s=data.staff.find(x=>x.id===staffId);return +(s?.commissionPercent??5)}
function techFeeDefault(staffId){let s=data.staff.find(x=>x.id===staffId);return +(s?.techFee??100000)}
function expenseTotal(from='',to=''){return data.expenses.filter(e=>(!from||String(e.date||'')>=from)&&(!to||String(e.date||'')<=to)).reduce((a,e)=>a+(+e.amount||0),0)}

function authMsg(e){
  const m=String(e?.code||e?.message||e||'');
  console.error('AUTH/FIRESTORE ERROR:', e);
  if(m.includes('invalid-api-key'))return 'Sai Firebase apiKey hoặc firebase-config.js chưa được cập nhật đúng.';
  if(m.includes('auth/unauthorized-domain')||m.includes('unauthorized-domain'))return 'Domain web chưa được thêm trong Firebase Authentication > Settings > Authorized domains. Hãy thêm domain GitHub Pages của bạn.';
  if(m.includes('operation-not-allowed'))return 'Firebase chưa bật Email/Password. Vào Authentication > Sign-in method > bật Email/Password.';
  if(m.includes('invalid-credential'))return 'Email hoặc mật khẩu không đúng, hoặc tài khoản chưa tồn tại.';
  if(m.includes('user-not-found'))return 'Email chưa tồn tại. Hãy bấm Tạo Admin lần đầu hoặc Tạo tài khoản nhân viên.';
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
      const admin=userProfileData(u,{name:'Admin Similock',role:'Admin',perms:permissionMap.Admin,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      await setDoc(pRef,admin,{merge:true});
      return admin;
    }
    const pending=userProfileData(u,{name:'',role:'Chưa phân quyền',perms:[],createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await setDoc(pRef,pending,{merge:true});
    return pending;
  }catch(e){
    alert('Đăng nhập Auth thành công nhưng Firestore đang lỗi. Chi tiết: '+authMsg(e));
    return {role:'Admin',perms:permissionMap.Admin,email:normEmail(u.email),uid:u.uid};
  }
}


function setLoginBusy(isBusy, msg=''){
  ['loginBtn','setupAdminBtn','signupStaffBtn'].forEach(id=>{ if($(id)) $(id).disabled=!!isBusy; });
  const box=$('loginStatus');
  if(box){ box.textContent=msg||''; box.style.display=msg?'block':'none'; }
}
async function loadUserProfile(u){
  const email=normEmail(u.email);
  const pRef=userDocRef(u);
  try{
    const p=await getDoc(pRef);
    if(p.exists()) return {uid:u.uid,...p.data()};

    // Chuẩn UID: document users/{uid}. Admin chính tự được cấp quyền.
    if(email===ADMIN_EMAIL){
      const admin=userProfileData(u,{name:'Admin Similock',role:'Admin',perms:permissionMap.Admin,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      await setDoc(pRef,admin,{merge:true});
      return admin;
    }

    // Dữ liệu mới hoàn toàn: tài khoản đầu tiên là Admin.
    const snap=await getDocs(col('users'));
    if(snap.empty){
      const admin=userProfileData(u,{name:'Admin Similock',role:'Admin',perms:permissionMap.Admin,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      await setDoc(pRef,admin,{merge:true});
      return admin;
    }

    // Nhân viên tự tạo hồ sơ chờ phân quyền bằng UID để Admin sửa sau.
    const pending=userProfileData(u,{name:'',role:'Chưa phân quyền',perms:[],createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await setDoc(pRef,pending,{merge:true});
    return pending;
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

$('setupAdminBtn').onclick=async()=>{
  try{
    const email=normEmail($('email').value),pw=$('password').value;
    if(!email||!pw)return alert('Nhập email và mật khẩu');
    if(pw.length<6)return alert('Mật khẩu phải tối thiểu 6 ký tự');
    setLoginBusy(true,'Đang tạo/cập nhật Admin...');
    creatingAdmin=true;
    try{
      await createUserWithEmailAndPassword(auth,email,pw);
    }catch(e){
      if((e.code||'').includes('email-already-in-use')) await signInWithEmailAndPassword(auth,email,pw);
      else throw e;
    }
    await setDoc(userDocRef(auth.currentUser),userProfileData(auth.currentUser,{name:'Admin Similock',role:'Admin',perms:permissionMap.Admin,createdAt:serverTimestamp(),updatedAt:serverTimestamp()}),{merge:true});
    alert('Đã tạo/cập nhật Admin thành công.');
  }catch(e){alert(authMsg(e)+'\n\nCần kiểm tra 3 mục: Authentication đã bật Email/Password, Authorized domains có domain GitHub Pages, Firestore Rules đã Publish.');setLoginBusy(false)}
  finally{creatingAdmin=false}
};

$('signupStaffBtn').onclick=async()=>{
  try{
    const email=normEmail($('email').value),pw=$('password').value;
    if(!email||!pw)return alert('Nhập email và mật khẩu');
    if(pw.length<6)return alert('Mật khẩu phải tối thiểu 6 ký tự');
    setLoginBusy(true,'Đang tạo tài khoản nhân viên...');
    try{
      await createUserWithEmailAndPassword(auth,email,pw);
    }catch(e){
      if((e.code||'').includes('email-already-in-use')) await signInWithEmailAndPassword(auth,email,pw);
      else throw e;
    }
    const pRef=userDocRef(auth.currentUser);
    const p=await getDoc(pRef);
    if(!p.exists()){
      await setDoc(pRef,userProfileData(auth.currentUser,{name:'',role:'Chưa phân quyền',perms:[],createdAt:serverTimestamp(),updatedAt:serverTimestamp()}),{merge:true});
    }
    await signOut(auth);
    alert('Tài khoản nhân viên đã tạo hồ sơ UID. Admin vào mục Phân quyền, tìm email '+email+' rồi cấp quyền.');
  }catch(e){alert(authMsg(e)+'\n\nLưu ý: Admin phải vào mục Phân quyền và lưu email nhân viên trước.');setLoginBusy(false)}
};
$('logoutBtn').onclick=()=>signOut(auth);

onAuthStateChanged(auth,async u=>{
  if(!u){currentUser=null;currentPerm={role:'Admin',perms:[]};$('loginPage').style.display='grid';$('appPage').style.display='none';setLoginBusy(false);return}
  try{
    setLoginBusy(true,'Đang tải phân quyền...');
    currentUser=u;
    currentPerm = await loadUserProfile(u);
    if(currentPerm.role==='Chưa phân quyền' && creatingAdmin){
      const email=normEmail(u.email);
      currentPerm={email,name:'Admin',role:'Admin',perms:permissionMap.Admin};
      await setDoc(userDocRef(u),userProfileData(u,{...currentPerm,createdAt:serverTimestamp(),updatedAt:serverTimestamp()}),{merge:true});
    }
    if(currentPerm.role==='Chưa phân quyền'){
      await signOut(auth);
      alert('Đăng nhập Auth thành công nhưng email này chưa được Admin phân quyền: '+normEmail(u.email));
      return;
    }
    $('currentUser').textContent=normEmail(u.email)+' • '+(currentPerm.role||'');
    $('loginPage').style.display='none';$('appPage').style.display='flex';
    applyPermissions();
    await loadAll();
    showPage(has('dashboard')?'dashboard':((currentPerm.perms||[])[0]||'dashboard'));
    setLoginBusy(false);
  }catch(e){
    $('loginPage').style.display='grid';$('appPage').style.display='none';setLoginBusy(false);
    alert('Đăng nhập chưa hoàn tất: '+authMsg(e));
  }
});

function applyPermissions(){document.querySelectorAll('#menu button[data-page]').forEach(b=>{b.style.display=has(b.dataset.page)?'block':'none'});document.querySelectorAll('#menu .menu-group').forEach(g=>{const visible=[...g.querySelectorAll('button[data-page]')].some(b=>b.style.display!=='none');g.style.display=visible?'block':'none';});document.querySelectorAll('.view-cost').forEach(x=>x.classList.toggle('hidden',!has('viewCost')));}
document.querySelectorAll('#menu .menu-toggle').forEach(btn=>btn.onclick=()=>btn.closest('.menu-group').classList.toggle('open'));document.querySelectorAll('#menu button[data-page]').forEach(btn=>btn.onclick=()=>showPage(btn.dataset.page));
function showPage(id){if(!has(id))return alert('Tài khoản chưa được phân quyền');document.querySelectorAll('#menu button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));document.querySelectorAll('#menu .menu-group').forEach(g=>g.classList.toggle('active-group',[...g.querySelectorAll('button[data-page]')].some(b=>b.dataset.page===id)));const activeBtn=document.querySelector(`#menu button[data-page="${id}"]`);if(activeBtn)activeBtn.closest('.menu-group')?.classList.add('open');document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));$('pageTitle').textContent=btnTitle(id);$('pageSub').textContent='SIMILOCK ERP - Quản lý bán hàng, kho, công nợ, bảo hành'}
function btnTitle(id){return ({dashboard:'Dashboard điều hành',sales:'Bán hàng',commissions:'Hoa hồng',expenses:'Chi phí vận hành',debts:'Công nợ',inventory:'Kho hàng',stockbook:'Sổ kho',warranty:'Bảo hành',customers:'Khách hàng',products:'Sản phẩm',prices:'Bảng giá',staff:'Nhân viên',reports:'Báo cáo',permissions:'Phân quyền'}[id]||id)}

function renderAll(){try{applyPermissions();renderSelectors();renderDashboard();renderCustomers();renderProducts();renderPrices();renderStaff();renderSales();renderCommissions();renderExpenses();renderDebts();renderReceipts();renderStock();renderStockBook();renderWarranties();renderReports();renderPermissions();staffDeptChanged();resetSaleForm();resetStockForm();}catch(e){console.error('RENDER ERROR:',e);alert('Đăng nhập được nhưng lỗi khi tải màn hình: '+(e.message||e));}}
function renderSelectors(){fillSelect($('saleStaff'),data.staff.filter(x=>x.dept==='Sale'||x.dept==='Quản lý'),x=>x.name);fillSelect($('saleTech'),data.staff.filter(x=>x.dept==='Kỹ thuật'),x=>x.name);fillSelect($('priceProduct'),data.products,x=>`${x.code} - ${x.name}`,x=>x.code);fillSelect($('receiptCustomer'),data.customers,x=>`${x.name} - ${x.phone||''}`);fillSelect($('wSale'),data.sales,x=>`${x.code} - ${x.customerName||''}`);$('customerList').innerHTML=data.customers.map(c=>`<option value="${c.name} | ${c.phone||''}"></option>`).join('')}
function renderDashboard(){let month=new Date().toISOString().slice(0,7);let sales=data.sales.filter(s=>String(s.date||'').startsWith(month));let monthlyExpenses=data.expenses.filter(e=>String(e.date||'').startsWith(month));let rev=sales.reduce((a,s)=>a+(+s.grand||0),0);let orderProfit=sales.reduce((a,s)=>a+(+s.profit||0),0);let expense=monthlyExpenses.reduce((a,e)=>a+(+e.amount||0),0);let profit=orderProfit-expense;let debt=calcDebts().reduce((a,d)=>a+d.debt,0);let low=data.products.filter(p=>stockOf(p.code)<=(+p.minStock||3));$('kpiRevenue').textContent=money(rev);$('kpiProfit').textContent=money(profit);$('kpiDebt').textContent=money(debt);$('kpiLowStock').textContent=low.length;const best={};data.sales.forEach(s=>(s.items||[]).forEach(it=>best[it.code]=(best[it.code]||0)+(+it.qty||0)));let rows=Object.entries(best).sort((a,b)=>b[1]-a[1]).slice(0,8);let max=Math.max(1,...rows.map(r=>r[1]));$('bestProducts').innerHTML=rows.length?rows.map(([code,qty])=>{let p=data.products.find(x=>x.code===code)||{};return `<div class="bar-row"><b>${code}</b><div><small>${p.name||''}</small><div class="bar"><i style="width:${qty/max*100}%"></i></div></div><b>${qty}</b></div>`}).join(''):'Chưa có dữ liệu';const st={};data.sales.forEach(s=>{let n=data.staff.find(x=>x.id===s.staffId)?.name||'Khác';st[n]=st[n]||{rev:0,count:0};st[n].rev+=+s.grand||0;st[n].count++});$('topStaff').innerHTML=Object.entries(st).sort((a,b)=>b[1].rev-a[1].rev).slice(0,5).map(([n,v])=>`<tr><td>${n}</td><td>${money(v.rev)}</td><td>${v.count}</td></tr>`).join('');$('latestSales').innerHTML=data.sales.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6).map(s=>`<tr><td>${s.code}</td><td>${s.customerName||''}</td><td>${money(s.grand)}</td></tr>`).join('');$('lowStockRows').innerHTML=low.map(p=>`<tr><td>${p.code}</td><td>${p.name}</td><td><span class="badge red">${stockOf(p.code)}</span></td></tr>`).join('')||'<tr><td colspan="3">Kho ổn định</td></tr>'}

window.saveCustomer=async()=>{let o={name:$('cName').value,type:$('cType').value,phone:$('cPhone').value,address:$('cAddress').value,discount:+$('cDiscount').value||0,openingDebt:+$('cOpeningDebt').value||0};if(!o.name)return alert('Nhập tên khách');let id=$('cId').value;if(id){await updateDoc(doc(db,'customers',id),o);await logAction('Sửa khách hàng',o.name)}else await addDoc(col('customers'),{...o,createdAt:serverTimestamp()});clearCustomer();await loadAll()}
function clearCustomer(){['cId','cName','cPhone','cAddress'].forEach(i=>$(i).value='');$('cDiscount').value=0;$('cOpeningDebt').value=0}
function renderCustomers(){$('customerTable').innerHTML=data.customers.map(c=>`<tr><td>${c.name}</td><td>${c.type||''}</td><td>${c.phone||''}</td><td>${c.address||''}</td><td>${c.discount||0}%</td><td><button class="btn ghost" onclick="editCustomer('${c.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('customers','${c.id}')">Xóa</button></td></tr>`).join('')}
window.editCustomer=id=>{let c=data.customers.find(x=>x.id===id);$('cId').value=id;$('cName').value=c.name||'';$('cType').value=c.type||'Khách lẻ';$('cPhone').value=c.phone||'';$('cAddress').value=c.address||'';$('cDiscount').value=c.discount||0;$('cOpeningDebt').value=c.openingDebt||0}
window.quickCreateCustomer=async()=>{let raw=$('saleCustomerSearch').value.trim();if(!raw)return alert('Nhập tên hoặc SĐT khách');let name=raw.split('|')[0].trim();let phone=(prompt('SĐT khách hàng:',raw.split('|')[1]?.trim()||'')||'');let address=prompt('Địa chỉ:', '')||'';await addDoc(col('customers'),{name,type:'Khách lẻ',phone,address,discount:0,openingDebt:0,createdAt:serverTimestamp()});await loadAll();$('saleCustomerSearch').value=`${name} | ${phone}`}

window.saveProduct=async()=>{let o={code:$('pCode').value.trim(),name:$('pName').value,category:$('pCategory').value,cost:+$('pCost').value||0,price:+$('pPrice').value||0,minStock:+$('pMinStock').value||3};if(!o.code||!o.name)return alert('Nhập model và tên');let id=$('pId').value;if(id){await updateDoc(doc(db,'products',id),o);await logAction('Sửa sản phẩm',o.code)}else await addDoc(col('products'),{...o,createdAt:serverTimestamp()});clearProduct();await loadAll()}
function clearProduct(){['pId','pCode','pName'].forEach(i=>$(i).value='');$('pCategory').value='Khóa thông minh';$('pCost').value='';$('pPrice').value='';$('pMinStock').value=3}
function renderProducts(){$('productTable').innerHTML=data.products.map(p=>`<tr><td>${p.code}</td><td>${p.name}</td><td>${p.category||''}</td><td class="view-cost">${money(p.cost)}</td><td>${money(p.price)}</td><td>${stockOf(p.code)}</td><td><button class="btn ghost" onclick="editProduct('${p.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('products','${p.id}')">Xóa</button></td></tr>`).join('');applyPermissions()}
window.editProduct=id=>{let p=data.products.find(x=>x.id===id);$('pId').value=id;$('pCode').value=p.code||'';$('pName').value=p.name||'';$('pCategory').value=p.category||'';$('pCost').value=p.cost||0;$('pPrice').value=p.price||0;$('pMinStock').value=p.minStock||3}

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
window.savePrice=async()=>{
  let o={code:$('priceProduct').value,type:$('priceType').value,price:+$('priceValue').value||0,validFrom:$('priceFrom').value||'',validTo:$('priceTo').value||'',active:$('priceActive').value==='true',note:$('priceNote').value||'',updatedAt:serverTimestamp()};
  if(!o.code)return alert('Chọn model sản phẩm');
  if(!o.price)return alert('Nhập giá bán');
  if(o.validFrom&&o.validTo&&o.validFrom>o.validTo)return alert('Ngày hiệu lực đến phải lớn hơn hoặc bằng ngày bắt đầu');
  let id=$('priceId').value;
  if(id)await updateDoc(doc(db,'prices',id),o);else await addDoc(col('prices'),{...o,createdAt:serverTimestamp()});
  ['priceId','priceValue','priceFrom','priceTo','priceNote'].forEach(i=>$(i).value='');$('priceActive').value='true';await loadAll()
}
function renderPrices(){
  $('priceTable').innerHTML=data.prices.sort((a,b)=>String(a.code||'').localeCompare(String(b.code||''))||String(b.validFrom||'').localeCompare(String(a.validFrom||''))).map(p=>{let st=priceStatus(p);return`<tr><td><b>${p.code}</b></td><td>${p.type}</td><td>${money(p.price)}</td><td>${p.validFrom||'Không giới hạn'} → ${p.validTo||'Không giới hạn'}</td><td><span class="badge ${st[1]}">${st[0]}</span></td><td>${p.note||''}</td><td><button class="btn ghost" onclick="editPrice('${p.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('prices','${p.id}')">Xóa</button></td></tr>`}).join('')
}
window.editPrice=id=>{let p=data.prices.find(x=>x.id===id);$('priceId').value=id;$('priceProduct').value=p.code;$('priceType').value=p.type;$('priceValue').value=p.price;$('priceFrom').value=p.validFrom||'';$('priceTo').value=p.validTo||'';$('priceActive').value=String(p.active)!=='false'?'true':'false';$('priceNote').value=p.note||'';showPage('prices')}

window.staffDeptChanged=()=>{let dept=$('eDept')?.value||'Sale';if($('saleCommissionBox'))$('saleCommissionBox').style.display=(dept==='Sale'||dept==='Quản lý')?'block':'none';if($('techFeeBox'))$('techFeeBox').style.display=dept==='Kỹ thuật'?'block':'none'}
window.saveStaff=async()=>{let dept=$('eDept').value;let o={name:$('eName').value,dept,phone:$('ePhone').value,commissionPercent:+($('eCommissionPercent')?.value||0),techFee:+($('eTechFee')?.value||0)};if(dept==='Sale'||dept==='Quản lý'){if(!o.commissionPercent)o.commissionPercent=5;o.techFee=0}else if(dept==='Kỹ thuật'){if(!o.techFee)o.techFee=100000;o.commissionPercent=0}else{o.commissionPercent=0;o.techFee=0}if(!o.name)return alert('Nhập tên nhân viên');let id=$('eId').value;if(id)await updateDoc(doc(db,'staff',id),o);else await addDoc(col('staff'),o);$('eId').value='';$('eName').value='';$('ePhone').value='';$('eCommissionPercent').value=5;$('eTechFee').value=100000;$('eDept').value='Sale';staffDeptChanged();await loadAll()}
function renderStaff(){$('staffTable').innerHTML=data.staff.map(e=>`<tr><td>${e.name}</td><td>${e.dept}</td><td>${e.phone||''}</td><td>${(e.dept==='Sale'||e.dept==='Quản lý')?((e.commissionPercent??5)+'%'):''}</td><td>${e.dept==='Kỹ thuật'?money(e.techFee??100000):''}</td><td><button class="btn ghost" onclick="editStaff('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('staff','${e.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="6">Chưa có nhân viên</td></tr>'}
window.editStaff=id=>{let e=data.staff.find(x=>x.id===id);$('eId').value=id;$('eName').value=e.name;$('eDept').value=e.dept;$('ePhone').value=e.phone||'';if($('eCommissionPercent'))$('eCommissionPercent').value=e.commissionPercent??5;if($('eTechFee'))$('eTechFee').value=e.techFee??100000;staffDeptChanged()}

window.resetSaleForm=()=>{editingSale=null;$('saleCode').value=nextCode('BH',data.sales);$('saleDate').value=today();$('saleCustomerSearch').value='';$('salePaid').value=0;if($('saleCommissionPercent'))$('saleCommissionPercent').value=salePercentDefault($('saleStaff')?.value);if($('saleTechCost'))$('saleTechCost').value=techFeeDefault($('saleTech')?.value);$('saleNote').value='';$('saleItems').innerHTML='';addSaleItem();updateSaleTotals()}
window.addSaleItem=(it={})=>{let tr=document.createElement('tr');tr.innerHTML=`<td><select onchange="saleProductChanged(this)"><option value="">Chọn model</option>${data.products.map(p=>`<option value="${p.code}" ${p.code===it.code?'selected':''}>${p.code}</option>`).join('')}</select></td><td><input value="${it.name||''}" readonly></td><td><input type="number" value="${it.qty||1}" oninput="updateSaleTotals()"></td><td><input type="number" value="${it.price||0}" oninput="updateSaleTotals()"></td><td><input type="number" value="${it.discount||0}" oninput="updateSaleTotals()"></td><td class="line-total">0</td><td><button class="btn danger" onclick="this.closest('tr').remove();updateSaleTotals()">X</button></td>`;$('saleItems').appendChild(tr);updateSaleTotals()}
window.saleProductChanged=sel=>{let p=data.products.find(x=>x.code===sel.value)||{};let tr=sel.closest('tr');tr.children[1].querySelector('input').value=p.name||'';let customer=findCustomerBySearch();let bp=activePriceFor(p.code,customer?.type,$('saleDate')?.value||today());let price=bp?.price||p.price||0;tr.children[3].querySelector('input').value=price;tr.children[4].querySelector('input').value=customer?.discount||0;updateSaleTotals()}
function saleItems(){return [...$('saleItems').querySelectorAll('tr')].map(tr=>({code:tr.children[0].querySelector('select').value,name:tr.children[1].querySelector('input').value,qty:+tr.children[2].querySelector('input').value||0,price:+tr.children[3].querySelector('input').value||0,discount:+tr.children[4].querySelector('input').value||0})).filter(x=>x.code&&x.qty>0)}
window.updateSaleTotals=()=>{let t=calcSaleTotals(saleItems(),$('saleVatMode').value,$('salePaid').value);[...$('saleItems').querySelectorAll('tr')].forEach(tr=>{let q=+tr.children[2].querySelector('input').value||0,pr=+tr.children[3].querySelector('input').value||0,ck=+tr.children[4].querySelector('input').value||0;tr.querySelector('.line-total').textContent=money(q*pr*(1-ck/100))});$('saleSubTotal').textContent=money(t.subtotal);$('saleVat').textContent=money(t.vat);$('saleGrand').textContent=money(t.grand);$('saleDebt').textContent=money(t.debt)};['saleVatMode','salePaid','saleCustomerSearch','saleCommissionPercent'].forEach(id=>setTimeout(()=>$(id)?.addEventListener('input',updateSaleTotals),0));setTimeout(()=>$('saleStaff')?.addEventListener('change',()=>{if($('saleCommissionPercent'))$('saleCommissionPercent').value=salePercentDefault($('saleStaff').value);updateSaleTotals()}),0);setTimeout(()=>$('saleTech')?.addEventListener('change',()=>{if($('saleTechCost'))$('saleTechCost').value=techFeeDefault($('saleTech').value);updateSaleTotals()}),0);
function findCustomerBySearch(){let s=$('saleCustomerSearch').value.toLowerCase();return data.customers.find(c=>s.includes((c.phone||'zzzz').toLowerCase())||s.includes((c.name||'zzzz').toLowerCase()))}
window.saveSale=async()=>{let customer=findCustomerBySearch();if(!customer){await quickCreateCustomer();customer=findCustomerBySearch()}let items=saleItems();if(!items.length)return alert('Chưa có sản phẩm');
  for(const it of items){const available=stockOf(it.code,editingSale); if(it.qty>available && !confirm(`Sản phẩm ${it.code} tồn hiện có ${available}, vẫn lưu đơn?`)) return;}
  let totals=calcSaleTotals(items,$('saleVatMode').value,$('salePaid').value);let cost=items.reduce((a,it)=>a+(data.products.find(p=>p.code===it.code)?.cost||0)*it.qty,0);let commissionPercent=+$('saleCommissionPercent')?.value||0;let saleCommission=calcCommission(totals.grand,commissionPercent);let techCost=+$('saleTechCost')?.value||techFeeDefault($('saleTech').value);let o={code:$('saleCode').value,date:$('saleDate').value,customerId:customer.id,customerName:customer.name,customerPhone:customer.phone||'',customerAddress:customer.address||'',staffId:$('saleStaff').value,staffName:data.staff.find(x=>x.id===$('saleStaff').value)?.name||'',techId:$('saleTech').value,techName:data.staff.find(x=>x.id===$('saleTech').value)?.name||'',commissionPercent,saleCommission,techCost,vatMode:$('saleVatMode').value,paid:+$('salePaid').value||0,note:$('saleNote').value,items,...totals,cost,profit:totals.grand-cost-saleCommission-techCost,status:totals.debt>0?'Còn nợ':'Đã thu đủ',updatedAt:serverTimestamp()};if(editingSale){if(!has('editSales'))return alert('Không có quyền sửa đơn');await updateDoc(doc(db,'sales',editingSale),o);await logAction('Sửa đơn bán',o.code)}else await addDoc(col('sales'),{...o,createdAt:serverTimestamp()});await loadAll();resetSaleForm()}
function renderSales(){let q=($('saleSearch')?.value||'').toLowerCase();$('saleTable').innerHTML=data.sales.filter(s=>(s.code+s.customerName).toLowerCase().includes(q)).sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(s=>`<tr><td>${s.code}</td><td>${s.date||''}</td><td>${s.customerName||''}</td><td>${money(s.grand)}</td><td>${money(s.paid)}</td><td>${money(s.debt)}</td><td class="view-cost">${money(s.saleCommission||0)}</td><td class="view-cost">${money(s.profit||0)}</td><td><span class="badge ${s.debt>0?'orange':'green'}">${s.status}</span></td><td><button class="btn ghost" onclick="printSale('${s.id}')">In A5</button> ${has('editSales')?`<button class="btn ghost" onclick="editSale('${s.id}')">Sửa</button>`:''} ${has('deleteSales')?`<button class="btn danger" onclick="removeDoc('sales','${s.id}')">Xóa</button>`:''}</td></tr>`).join('')}
window.editSale=id=>{let s=data.sales.find(x=>x.id===id);editingSale=id;$('saleCode').value=s.code;$('saleDate').value=s.date;$('saleCustomerSearch').value=`${s.customerName} | ${s.customerPhone||''}`;$('saleStaff').value=s.staffId||'';$('saleTech').value=s.techId||'';$('saleVatMode').value=s.vatMode||'none';$('salePaid').value=s.paid||0;if($('saleCommissionPercent'))$('saleCommissionPercent').value=s.commissionPercent??salePercentDefault(s.staffId);if($('saleTechCost'))$('saleTechCost').value=s.techCost??techFeeDefault(s.techId);$('saleNote').value=s.note||'';$('saleItems').innerHTML='';(s.items||[]).forEach(addSaleItem);updateSaleTotals();showPage('sales')}
window.printSale=id=>{let s=data.sales.find(x=>x.id===id);let html=`<div class="print-a5"><h2 style="text-align:center">PHIẾU BÁN HÀNG</h2><p><b>SIMILOCK ĐÀ NẴNG</b><br>223 Trường Chinh, P. An Khê, TP. Đà Nẵng<br>403 Nguyễn Thái Bình, P. Bảy Hiền, TP.HCM<br>Hotline: 0902950816</p><hr><p><b>Mã phiếu:</b> ${s.code} &nbsp; <b>Ngày:</b> ${s.date}<br><b>Khách hàng:</b> ${s.customerName} - ${s.customerPhone||''}<br><b>Địa chỉ:</b> ${s.customerAddress||''}</p><table><thead><tr><th>Model</th><th>Tên SP</th><th>SL</th><th>Đơn giá</th><th>CK</th><th>Thành tiền</th></tr></thead><tbody>${(s.items||[]).map(it=>`<tr><td>${it.code}</td><td>${it.name}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${it.discount||0}%</td><td>${money(it.qty*it.price*(1-(it.discount||0)/100))}</td></tr>`).join('')}</tbody></table><p style="text-align:right"><b>Tiền hàng:</b> ${money(s.subtotal)}<br><b>VAT:</b> ${money(s.vat)}<br><b>Tổng tiền:</b> ${money(s.grand)}<br><b>Đã thu:</b> ${money(s.paid)}<br><b>Còn nợ:</b> ${money(s.debt)}</p><div style="display:flex;justify-content:space-between;text-align:center;margin-top:30px"><div>Khách hàng<br><br><br></div><div>Người bán<br><br><br></div><div>Kỹ thuật<br><br><br></div></div></div>`;doPrint(html)}


function renderCommissions(){
  if(!$('commissionByStaff')||!$('commissionByOrder'))return;

  const bySale={};
  const byTech={};

  data.sales.forEach(s=>{
    let saleKey=s.staffId||'none';
    let saleName=s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||'Chưa chọn sale';
    bySale[saleKey]=bySale[saleKey]||{name:saleName,count:0,revenue:0,commission:0};
    bySale[saleKey].count++;
    bySale[saleKey].revenue+=+s.grand||0;
    bySale[saleKey].commission+=+s.saleCommission||0;

    let techKey=s.techId||'none';
    let techName=s.techName||data.staff.find(x=>x.id===s.techId)?.name||'Chưa chọn kỹ thuật';
    byTech[techKey]=byTech[techKey]||{name:techName,count:0,revenue:0,techCost:0};
    byTech[techKey].count++;
    byTech[techKey].revenue+=+s.grand||0;
    byTech[techKey].techCost+=+s.techCost||0;
  });

  $('commissionByStaff').innerHTML=Object.values(bySale)
    .sort((a,b)=>b.commission-a.commission)
    .map(v=>`<tr><td>${v.name}</td><td>${v.count}</td><td>${money(v.revenue)}</td><td><b>${money(v.commission)}</b></td></tr>`)
    .join('')||'<tr><td colspan="4">Chưa có dữ liệu hoa hồng Sale</td></tr>';

  if($('commissionByTech')){
    $('commissionByTech').innerHTML=Object.values(byTech)
      .sort((a,b)=>b.techCost-a.techCost)
      .map(v=>`<tr><td>${v.name}</td><td>${v.count}</td><td>${money(v.revenue)}</td><td><b>${money(v.techCost)}</b></td></tr>`)
      .join('')||'<tr><td colspan="4">Chưa có dữ liệu công kỹ thuật</td></tr>';
  }

  $('commissionByOrder').innerHTML=data.sales.slice()
    .sort((a,b)=>String(b.date).localeCompare(String(a.date)))
    .map(s=>`<tr><td>${s.date||''}</td><td>${s.code}</td><td>${s.customerName||''}</td><td>${s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||''}</td><td>${s.techName||data.staff.find(x=>x.id===s.techId)?.name||''}</td><td>${money(s.grand)}</td><td>${s.commissionPercent||0}%</td><td><b>${money(s.saleCommission||0)}</b></td><td><b>${money(s.techCost||0)}</b></td></tr>`)
    .join('')||'<tr><td colspan="9">Chưa có đơn bán</td></tr>';
}
window.resetExpenseForm=()=>{editingExpense=null;$('exDate').value=today();$('exCategory').value='Tiền điện';$('exAmount').value='';$('exNote').value=''}
window.saveExpense=async()=>{let o={date:$('exDate').value||today(),category:$('exCategory').value,amount:+$('exAmount').value||0,note:$('exNote').value||'',updatedAt:serverTimestamp()};if(!o.amount)return alert('Nhập số tiền chi phí');if(editingExpense)await updateDoc(doc(db,'expenses',editingExpense),o);else await addDoc(col('expenses'),{...o,createdAt:serverTimestamp()});await logAction(editingExpense?'Sửa chi phí':'Thêm chi phí',o.category+' '+o.amount);resetExpenseForm();await loadAll()}
function renderExpenses(){if(!$('expenseTable'))return;let total=data.expenses.reduce((a,e)=>a+(+e.amount||0),0);$('expenseTotal').textContent=money(total);$('expenseTable').innerHTML=data.expenses.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<tr><td>${e.date||''}</td><td>${e.category||''}</td><td>${money(e.amount)}</td><td>${e.note||''}</td><td><button class="btn ghost" onclick="editExpense('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('expenses','${e.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="5">Chưa có chi phí</td></tr>'}
window.editExpense=id=>{let e=data.expenses.find(x=>x.id===id);if(!e)return;editingExpense=id;$('exDate').value=e.date||today();$('exCategory').value=e.category||'Khác';$('exAmount').value=e.amount||0;$('exNote').value=e.note||'';showPage('expenses')}

function calcDebts(){return data.customers.map(c=>{let sales=data.sales.filter(s=>s.customerId===c.id);let total=sales.reduce((a,s)=>a+(+s.grand||0),0)+(+c.openingDebt||0);let paid=sales.reduce((a,s)=>a+(+s.paid||0),0)+data.receipts.filter(r=>r.customerId===c.id).reduce((a,r)=>a+(+r.amount||0),0);return{customer:c,total,paid,debt:total-paid}}).filter(x=>x.total||x.paid||x.debt)}
function renderDebts(){$('debtTable').innerHTML=calcDebts().map(d=>`<tr><td>${d.customer.name}</td><td>${money(d.total)}</td><td>${money(d.paid)}</td><td><b>${money(d.debt)}</b></td><td><button class="btn ghost" onclick="receiptFor('${d.customer.id}')">Thu tiền</button></td></tr>`).join('')}
window.receiptFor=id=>{$('receiptCustomer').value=id;$('receiptDate').value=today();showPage('debts')};window.openReceiptForm=()=>{$('receiptDate').value=today();showPage('debts')}
window.saveReceipt=async()=>{let cid=$('receiptCustomer').value,amount=+$('receiptAmount').value||0;if(!cid||!amount)return alert('Chọn khách và nhập số tiền');let c=data.customers.find(x=>x.id===cid);await addDoc(col('receipts'),{code:nextCode('PT',data.receipts),customerId:cid,customerName:c.name,amount,date:$('receiptDate').value||today(),note:$('receiptNote').value,createdAt:serverTimestamp()});$('receiptAmount').value='';$('receiptNote').value='';await loadAll()}
function renderReceipts(){$('receiptTable').innerHTML=data.receipts.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(r=>`<tr><td>${r.date}</td><td>${r.customerName}</td><td>${money(r.amount)}</td><td>${r.note||''}</td></tr>`).join('')}

window.resetStockForm=()=>{editingStock=null;$('stockCode').value=nextCode(prefixByStockType($('stockType').value||'IN'),data.stockVouchers);$('stockDate').value=today();$('stockType').value=$('stockType').value||'IN';$('stockWarehouse').value='Kho SIMILOCK';$('stockNote').value='';$('stockItems').innerHTML='';addStockItem();updateStockHeader()};
$('stockType').addEventListener('change',()=>{ $('stockCode').value=nextCode(prefixByStockType($('stockType').value),data.stockVouchers); updateStockHeader(); });
function updateStockHeader(){
  const isCheck=$('stockType').value==='CHECK';
  const ths=document.querySelectorAll('#inventory table.editable thead th');
  if(ths[2]) ths[2].textContent=isCheck?'Tồn thực tế':'Số lượng';
  if(ths[4]) ths[4].textContent=isCheck?'Ghi chú kiểm kê':'Ghi chú';
}
window.addStockItem=(it={})=>{let tr=document.createElement('tr');tr.innerHTML=`<td><select onchange="stockProductChanged(this)"><option value="">Chọn model</option>${data.products.map(p=>`<option value="${p.code}" ${p.code===it.code?'selected':''}>${p.code}</option>`).join('')}</select></td><td><input value="${it.name||''}" readonly></td><td><input type="number" value="${it.actualQty??it.inputQty??it.qty??1}" min="0"></td><td><input class="view-cost" type="number" value="${it.cost||0}"></td><td><input value="${it.note||''}"></td><td><button class="btn danger" onclick="this.closest('tr').remove()">X</button></td>`;$('stockItems').appendChild(tr);applyPermissions();updateStockHeader()}
window.stockProductChanged=sel=>{let p=data.products.find(x=>x.code===sel.value)||{};let tr=sel.closest('tr');tr.children[1].querySelector('input').value=p.name||'';tr.children[3].querySelector('input').value=p.cost||0;}
function stockItems(){return [...$('stockItems').querySelectorAll('tr')].map(tr=>({code:tr.children[0].querySelector('select').value,name:tr.children[1].querySelector('input').value,inputQty:+tr.children[2].querySelector('input').value||0,cost:+tr.children[3].querySelector('input').value||0,note:tr.children[4].querySelector('input').value})).filter(x=>x.code)}
window.saveStockVoucher=async()=>{
  let raw=stockItems();if(!raw.length)return alert('Chưa có mã hàng');
  let type=$('stockType').value, editingId=editingStock||'';
  let items=[];
  for(const it of raw){
    if(it.inputQty<0)return alert('Số lượng không hợp lệ: '+it.code);
    if(type==='OUT' && it.inputQty>stockOf(it.code,editingId)) return alert(`Không đủ tồn kho cho ${it.code}. Tồn hiện có: ${stockOf(it.code,editingId)}`);
    if(type==='CHECK'){
      const systemQty=stockOf(it.code,editingId); const delta=it.inputQty-systemQty;
      items.push({...it,actualQty:it.inputQty,systemQty,qty:delta,note:it.note||`Kiểm kê: hệ thống ${systemQty}, thực tế ${it.inputQty}, lệch ${delta}`});
    }else{
      items.push({...it,qty:it.inputQty});
    }
  }
  let o={code:$('stockCode').value,date:$('stockDate').value,type,warehouse:$('stockWarehouse').value,note:$('stockNote').value,items,value:items.reduce((a,it)=>a+Math.abs(+it.qty||0)*(+it.cost||0),0),updatedAt:serverTimestamp()};
  if(editingStock){if(!has('editStock'))return alert('Không có quyền sửa kho');await updateDoc(doc(db,'stockVouchers',editingStock),o);await logAction('Sửa phiếu kho',`${o.code} - ${stockTypeName(type)}`)}
  else {await addDoc(col('stockVouchers'),{...o,createdAt:serverTimestamp()});await logAction('Tạo phiếu kho',`${o.code} - ${stockTypeName(type)}`)}
  await loadAll();resetStockForm()
}
function renderStock(){$('stockVoucherTable').innerHTML=data.stockVouchers.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(v=>`<tr><td>${v.code}</td><td>${v.date}</td><td>${stockTypeName(v.type)}</td><td>${(v.items||[]).length}</td><td>${money(v.value)}</td><td><button class="btn ghost" onclick="printStock('${v.id}')">In A5</button> ${has('editStock')?`<button class="btn ghost" onclick="editStock('${v.id}')">Sửa</button>`:''} ${has('deleteStock')?`<button class="btn danger" onclick="removeDoc('stockVouchers','${v.id}')">Xóa</button>`:''}</td></tr>`).join('')}
window.editStock=id=>{let v=data.stockVouchers.find(x=>x.id===id);editingStock=id;$('stockCode').value=v.code;$('stockDate').value=v.date;$('stockType').value=v.type;$('stockWarehouse').value=v.warehouse||'';$('stockNote').value=v.note||'';$('stockItems').innerHTML='';(v.items||[]).forEach(addStockItem);updateStockHeader();showPage('inventory')}
window.printStock=id=>{let v=data.stockVouchers.find(x=>x.id===id);let title=stockTypeName(v.type).toUpperCase();let html=`<div class="print-a5"><h2 style="text-align:center">${title}</h2><p><b>Mã phiếu:</b> ${v.code} &nbsp; <b>Ngày:</b> ${v.date}<br><b>Kho:</b> ${v.warehouse||''}<br><b>Lý do:</b> ${v.note||''}</p><table><thead><tr><th>Model</th><th>Tên SP</th><th>${v.type==='CHECK'?'Tồn HT':'SL'}</th><th>${v.type==='CHECK'?'Tồn TT':'Giá vốn'}</th><th>${v.type==='CHECK'?'Lệch':'Ghi chú'}</th></tr></thead><tbody>${(v.items||[]).map(it=>v.type==='CHECK'?`<tr><td>${it.code}</td><td>${it.name}</td><td>${it.systemQty}</td><td>${it.actualQty}</td><td>${it.qty}</td></tr>`:`<tr><td>${it.code}</td><td>${it.name}</td><td>${it.qty}</td><td>${money(it.cost)}</td><td>${it.note||''}</td></tr>`).join('')}</tbody></table><p style="text-align:right"><b>Giá trị:</b> ${money(v.value)}</p><div style="display:flex;justify-content:space-between;text-align:center;margin-top:35px"><div>Người lập<br><br><br></div><div>Thủ kho<br><br><br></div><div>Người nhận<br><br><br></div></div></div>`;doPrint(html)}
function renderStockBook(){$('stockBookTable').innerHTML=data.products.map(p=>{let n=0,x=0,dc=0,kk=0;data.stockVouchers.forEach(v=>(v.items||[]).forEach(it=>{if(it.code===p.code){if(v.type==='IN')n+=+it.qty||0;else if(v.type==='OUT')x+=+it.qty||0;else if(v.type==='CHECK')kk+=+it.qty||0;else dc+=+it.qty||0}}));let sold=data.sales.reduce((a,s)=>a+(s.items||[]).filter(it=>it.code===p.code).reduce((b,it)=>b+(+it.qty||0),0),0);x+=sold;return`<tr><td>${p.code}</td><td>${p.name}</td><td>0</td><td>${n}</td><td>${x}</td><td>${dc+kk}</td><td><b>${n-x+dc+kk}</b></td></tr>`}).join('')}

window.saveWarranty=async()=>{let start=$('wStart').value||today();let end=new Date(start);end.setMonth(end.getMonth()+(+$('wMonths').value||24));let o={saleId:$('wSale').value,customer:$('wCustomer').value,phone:$('wPhone').value,serial:$('wSerial').value,start,end:end.toISOString().slice(0,10),months:+$('wMonths').value||24,status:$('wStatus').value,note:$('wNote').value};if(editingWarranty)await updateDoc(doc(db,'warranties',editingWarranty),o);else await addDoc(col('warranties'),o);editingWarranty=null;['wCustomer','wPhone','wSerial','wNote'].forEach(i=>$(i).value='');await loadAll()};$('wSale').addEventListener('change',()=>{let s=data.sales.find(x=>x.id===$('wSale').value);if(s){$('wCustomer').value=s.customerName;$('wPhone').value=s.customerPhone||'';$('wSerial').value=(s.items||[]).map(i=>i.code).join(', ');$('wStart').value=s.date||today()}});
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
  const expenses=data.expenses.filter(e=>inReportRange(e.date,from,to));
  const rev=sales.reduce((a,s)=>a+(+s.grand||0),0);
  const paid=sales.reduce((a,s)=>a+(+s.paid||0),0);
  const debt=sales.reduce((a,s)=>a+(+s.debt||0),0);
  const grossProfit=sales.reduce((a,s)=>a+(+s.profit||0),0);
  const op=expenses.reduce((a,e)=>a+(+e.amount||0),0);
  const profit=grossProfit-op;
  const comm=sales.reduce((a,s)=>a+(+s.saleCommission||0),0);
  const tech=sales.reduce((a,s)=>a+(+s.techCost||0),0);
  const qty=sales.reduce((a,s)=>a+(s.items||[]).reduce((b,it)=>b+(+it.qty||0),0),0);
  $('reportBox').innerHTML=`
    <div class="report-card">Doanh thu kỳ này<small>${from} → ${to}</small><b>${money(rev)}</b></div>
    <div class="report-card">Số đơn / Sản phẩm<b>${sales.length} đơn / ${qty} SP</b></div>
    <div class="report-card">Đã thu<b>${money(paid)}</b></div>
    <div class="report-card">Còn nợ<b>${money(debt)}</b></div>
    <div class="report-card view-cost">Lợi nhuận đơn hàng<b>${money(grossProfit)}</b></div>
    <div class="report-card view-cost">Chi phí trong kỳ<b>${money(op)}</b></div>
    <div class="report-card view-cost">Lợi nhuận ròng<b>${money(profit)}</b></div>
    <div class="report-card view-cost">Sale + Kỹ thuật<b>${money(comm+tech)}</b></div>`;

  const byProduct={};
  sales.forEach(s=>(s.items||[]).forEach(it=>{
    const code=it.code||''; const p=data.products.find(x=>x.code===code)||{};
    const name=it.name||p.name||'';
    const line=(+it.qty||0)*(+it.price||0)*(1-(+it.discount||0)/100);
    const cost=(+p.cost||0)*(+it.qty||0);
    byProduct[code]=byProduct[code]||{code,name,qty:0,revenue:0,cost:0};
    byProduct[code].qty+=+it.qty||0;byProduct[code].revenue+=line;byProduct[code].cost+=cost;
  }));
  let productRows=Object.values(byProduct).filter(x=>(x.code+' '+x.name).toLowerCase().includes(productQ)).sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue);
  if($('reportProductTable'))$('reportProductTable').innerHTML=productRows.map(x=>`<tr><td><b>${x.code}</b></td><td>${x.name}</td><td>${x.qty}</td><td>${money(x.revenue)}</td><td class="view-cost">${money(x.cost)}</td><td class="view-cost">${money(x.revenue-x.cost)}</td></tr>`).join('')||'<tr><td colspan="6">Chưa có sản phẩm bán ra trong kỳ</td></tr>';

  const byTime={};
  sales.forEach(s=>{
    const k=groupKeyByPeriod(s.date,period);
    byTime[k]=byTime[k]||{key:k,orders:0,qty:0,revenue:0,paid:0,debt:0,comm:0,tech:0,profit:0};
    byTime[k].orders++;byTime[k].qty+=(s.items||[]).reduce((a,it)=>a+(+it.qty||0),0);byTime[k].revenue+=+s.grand||0;byTime[k].paid+=+s.paid||0;byTime[k].debt+=+s.debt||0;byTime[k].comm+=+s.saleCommission||0;byTime[k].tech+=+s.techCost||0;byTime[k].profit+=+s.profit||0;
  });
  if($('reportRevenueTable'))$('reportRevenueTable').innerHTML=Object.values(byTime).sort((a,b)=>String(b.key).localeCompare(String(a.key))).map(x=>`<tr><td><b>${x.key}</b></td><td>${x.orders}</td><td>${x.qty}</td><td>${money(x.revenue)}</td><td>${money(x.paid)}</td><td>${money(x.debt)}</td><td class="view-cost">${money(x.comm)}</td><td class="view-cost">${money(x.tech)}</td><td class="view-cost">${money(x.profit)}</td></tr>`).join('')||'<tr><td colspan="9">Chưa có doanh thu trong kỳ</td></tr>';

  const byCat={};
  expenses.forEach(e=>{const k=e.category||'Khác';byCat[k]=byCat[k]||{category:k,count:0,amount:0};byCat[k].count++;byCat[k].amount+=+e.amount||0});
  if($('reportExpenseCategoryTable'))$('reportExpenseCategoryTable').innerHTML=Object.values(byCat).sort((a,b)=>b.amount-a.amount).map(x=>`<tr><td>${x.category}</td><td>${x.count}</td><td><b>${money(x.amount)}</b></td></tr>`).join('')||'<tr><td colspan="3">Chưa có chi phí trong kỳ</td></tr>';
  if($('reportExpenseDetailTable'))$('reportExpenseDetailTable').innerHTML=expenses.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<tr><td>${e.date||''}</td><td>${e.category||''}</td><td>${money(e.amount)}</td><td>${e.note||''}</td></tr>`).join('')||'<tr><td colspan="4">Chưa có chi phí trong kỳ</td></tr>';
  applyPermissions();
}
window.renderReports=renderReports;
function renderPermissions(){
  if(!$('uUid')) $('uEmail').insertAdjacentHTML('beforebegin','<input id="uUid" type="hidden">');
  let keys=Object.keys(permLabels);
  $('permBox').innerHTML=keys.map(k=>`<label><input type="checkbox" value="${k}"> ${permLabels[k]}</label>`).join('');
  $('permissionTable').innerHTML=data.users.map(u=>`<tr><td>${u.email||''}<br><small>UID: ${u.id}</small></td><td>${u.name||''}</td><td>${u.role||''}</td><td>${(u.perms||[]).map(p=>permLabels[p]||p).join(', ')}</td><td><button class="btn ghost" onclick="editPermission('${u.id}')">Sửa</button></td></tr>`).join('')
}
$('uRole')?.addEventListener('change',()=>{document.querySelectorAll('#permBox input').forEach(i=>i.checked=(permissionMap[$('uRole').value]||[]).includes(i.value))});
window.saveUserPermission=async()=>{
  let email=normEmail($('uEmail').value),role=$('uRole').value;
  if(!email)return alert('Nhập email');
  let existing=data.users.find(x=>x.id===$('uUid')?.value)||data.users.find(x=>normEmail(x.email)===email);
  if(!existing)return alert('Chưa có UID cho email này. Hãy bấm Tạo tài khoản nhân viên bằng email đó trước, sau đó quay lại Phân quyền để cấp quyền.');
  let perms=[...document.querySelectorAll('#permBox input:checked')].map(i=>i.value);
  await setDoc(doc(db,'users',existing.id),{uid:existing.id,email,name:$('uName').value,role,perms,updatedAt:serverTimestamp()},{merge:true});
  $('uUid').value=existing.id;
  await loadAll()
}
window.editPermission=id=>{
  let u=data.users.find(x=>x.id===id);
  if(!u)return alert('Không tìm thấy user UID: '+id);
  $('uUid').value=u.id;$('uEmail').value=u.email||'';$('uName').value=u.name||'';$('uRole').value=u.role||'Sale';
  document.querySelectorAll('#permBox input').forEach(i=>i.checked=(u.perms||[]).includes(i.value))
}


window.removeDoc=async(name,id)=>{
  const label={sales:'đơn bán',stockVouchers:'phiếu kho',customers:'khách hàng',products:'sản phẩm',prices:'bảng giá',staff:'nhân viên',warranties:'bảo hành',expenses:'chi phí'}[name]||name;
  const code=prompt(`Bạn đang xóa ${label}. Nhập XOA để xác nhận:`);
  if(code!=='XOA')return;
  await deleteDoc(doc(db,name,id));await logAction('Xóa '+label,id);await loadAll()
}
function doPrint(html){let w=window.open('','PRINT','width=800,height=900');w.document.write(`<!doctype html><html><head><title>In phiếu</title><style>body{font-family:Arial;margin:0}.print-a5{width:148mm;min-height:210mm;padding:8mm;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #222;padding:5px;text-align:left}@page{size:A5;margin:0}</style></head><body>${html}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script></body></html>`);w.document.close()}
window.exportCSV=(type)=>{let rows=[];if(type==='customers')rows=data.customers.map(({name,type,phone,address,discount,openingDebt})=>({name,type,phone,address,discount,openingDebt}));if(type==='products')rows=data.products.map(p=>({code:p.code,name:p.name,category:p.category,cost:p.cost,price:p.price,minStock:p.minStock,stock:stockOf(p.code)}));if(type==='prices')rows=data.prices.map(p=>({code:p.code,type:p.type,price:p.price,validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||''}));if(type==='sales')rows=data.sales.map(s=>({code:s.code,date:s.date,customer:s.customerName,staff:s.staffName,grand:s.grand,cost:s.cost,commissionPercent:s.commissionPercent,saleCommission:s.saleCommission,techCost:s.techCost,profit:s.profit,paid:s.paid,debt:s.debt}));if(type==='expenses')rows=data.expenses.map(e=>({date:e.date,category:e.category,amount:e.amount,note:e.note}));if(type==='commissions')rows=data.sales.map(s=>({date:s.date,code:s.code,customer:s.customerName,saleStaff:s.staffName,techStaff:s.techName,grand:s.grand,commissionPercent:s.commissionPercent,saleCommission:s.saleCommission,techCost:s.techCost,totalCommission:(+s.saleCommission||0)+(+s.techCost||0)}));if(type==='stockbook')rows=data.products.map(p=>({code:p.code,name:p.name,stock:stockOf(p.code)}));let csv='\ufeff'+(rows[0]?Object.keys(rows[0]).join(',')+'\n':'')+rows.map(r=>Object.values(r).map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=type+'.csv';a.click()}
window.importCSV=async(e,type)=>{
  let file=e.target.files[0];if(!file)return;
  let rows=parseCSV(await file.text());if(rows.length<2)return alert('File import không có dữ liệu');
  let heads=rows.shift().map(x=>x.trim());let ok=0,skip=0,errors=[];
  const existingByPhone=new Map(data.customers.map(x=>[normalizePhone(x.phone),x]));
  const existingByCode=new Map(data.products.map(x=>[String(x.code||'').toUpperCase(),x]));
  const existingPriceKey=new Map(data.prices.map(x=>[`${String(x.code||'').toUpperCase()}|${x.type}|${x.validFrom||''}|${x.validTo||''}`,x]));
  for(let r=0;r<rows.length;r++){
    let obj={};heads.forEach((h,i)=>obj[h]=rows[r][i]??'');
    try{
      if(type==='customers'){
        obj.name=(obj.name||obj['Tên khách']||'').trim(); obj.phone=(obj.phone||obj['SĐT']||obj['phone']||'').trim();
        if(!obj.name){skip++;errors.push(`Dòng ${r+2}: thiếu tên khách`);continue}
        obj.type=obj.type||'Khách lẻ';obj.discount=safeNum(obj.discount);obj.openingDebt=safeNum(obj.openingDebt);obj.address=obj.address||'';
        const key=normalizePhone(obj.phone);
        if(key&&existingByPhone.has(key)){await updateDoc(doc(db,'customers',existingByPhone.get(key).id),obj);}
        else await addDoc(col('customers'),{...obj,createdAt:serverTimestamp()});
      }else if(type==='products'){
        obj.code=String(obj.code||obj.model||'').trim().toUpperCase();obj.name=(obj.name||'').trim();
        if(!obj.code||!obj.name){skip++;errors.push(`Dòng ${r+2}: thiếu model/tên sản phẩm`);continue}
        obj.category=obj.category||'Khóa thông minh';obj.cost=safeNum(obj.cost);obj.price=safeNum(obj.price);obj.minStock=safeNum(obj.minStock)||3;
        if(existingByCode.has(obj.code)) await updateDoc(doc(db,'products',existingByCode.get(obj.code).id),obj);
        else await addDoc(col('products'),{...obj,createdAt:serverTimestamp()});
      }else if(type==='prices'){
        obj.code=String(obj.code||'').trim().toUpperCase();obj.type=obj.type||'Khách lẻ';obj.price=safeNum(obj.price);obj.validFrom=obj.validFrom||'';obj.validTo=obj.validTo||'';obj.active=String(obj.active).toLowerCase()!=='false';obj.note=obj.note||'';
        if(!obj.code||!obj.price){skip++;errors.push(`Dòng ${r+2}: thiếu model/giá`);continue}
        if(!validateDate(obj.validFrom)||!validateDate(obj.validTo)){skip++;errors.push(`Dòng ${r+2}: sai định dạng ngày YYYY-MM-DD`);continue}
        if(obj.validFrom&&obj.validTo&&obj.validFrom>obj.validTo){skip++;errors.push(`Dòng ${r+2}: ngày bắt đầu lớn hơn ngày kết thúc`);continue}
        const key=`${obj.code}|${obj.type}|${obj.validFrom}|${obj.validTo}`;
        if(existingPriceKey.has(key)) await updateDoc(doc(db,'prices',existingPriceKey.get(key).id),obj);
        else await addDoc(col('prices'),{...obj,createdAt:serverTimestamp()});
      }
      ok++;
    }catch(err){skip++;errors.push(`Dòng ${r+2}: ${err.message}`)}
  }
  await logAction('Import '+type,`Thành công ${ok}, bỏ qua ${skip}`);
  await loadAll();e.target.value='';alert(`Import xong: ${ok} dòng. Bỏ qua: ${skip}`+(errors.length?'\n'+errors.slice(0,8).join('\n'):''))
}

window.exportBackup=()=>{
  const pack={exportedAt:new Date().toISOString(),customers:data.customers,products:data.products,prices:data.prices,staff:data.staff,sales:data.sales,stockVouchers:data.stockVouchers,receipts:data.receipts,warranties:data.warranties,expenses:data.expenses,users:data.users};
  let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(pack,null,2)],{type:'application/json'}));a.download='similock-erp-backup-'+today()+'.json';a.click()
}
