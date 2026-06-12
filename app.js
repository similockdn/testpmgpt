import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';
import { collection, addDoc, setDoc, doc, deleteDoc, getDocs, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

const $=id=>document.getElementById(id);const money=n=>(Number(n)||0).toLocaleString('vi-VN')+'đ';const today=()=>new Date().toISOString().slice(0,10);const uid=()=>Math.random().toString(36).slice(2,9);const normEmail=v=>String(v||'').trim().toLowerCase();
function numberToVietnamese(n){n=Math.round(Number(n)||0);if(n===0)return 'Không đồng';const dv=['','nghìn','triệu','tỷ','nghìn tỷ','triệu tỷ'];const cs=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];function read3(num,full){let tr=Math.floor(num/100),ch=Math.floor((num%100)/10),dvn=num%10,out=[];if(full||tr>0){out.push(cs[tr]+' trăm');if(ch===0&&dvn>0)out.push('lẻ')}if(ch>1){out.push(cs[ch]+' mươi');if(dvn===1)out.push('mốt');else if(dvn===5)out.push('lăm');else if(dvn>0)out.push(cs[dvn])}else if(ch===1){out.push('mười');if(dvn===5)out.push('lăm');else if(dvn>0)out.push(cs[dvn])}else if(ch===0&&dvn>0){out.push(cs[dvn])}return out.join(' ')}let parts=[],i=0;while(n>0){let block=n%1000;if(block>0){parts.unshift(read3(block,parts.length>0)+' '+dv[i])}n=Math.floor(n/1000);i++}let text=parts.join(' ').replace(/\s+/g,' ').trim();return text.charAt(0).toUpperCase()+text.slice(1)+' đồng'}
const ADMIN_EMAIL='similockdn@gmail.com';
const userDocRef = (u)=>doc(db,'users',u.uid);
const userProfileData = (u, extra={})=>({uid:u.uid,email:normEmail(u.email),...extra});
const WAREHOUSES=['Kho Chính','Kho Văn Phòng'];
let currentUser=null,currentPerm={role:'Admin',perms:[],warehouseAccess:WAREHOUSES},creatingAdmin=false;let editingSale=null,editingStock=null,editingWarranty=null,editingExpense=null,editingReceipt=null;
let commissionAppliedFilter={q:'',dept:'',staffId:'',period:'all',from:'',to:''};
const data={customers:[],products:[],staff:[],prices:[],costPrices:[],sales:[],stockVouchers:[],receipts:[],warranties:[],expenses:[],users:[],logs:[]};
function userWarehouses(){return currentPerm.role==='Admin'?WAREHOUSES:((currentPerm.warehouseAccess&&currentPerm.warehouseAccess.length)?currentPerm.warehouseAccess:WAREHOUSES)}
function canAccessWarehouse(w){return currentPerm.role==='Admin'||userWarehouses().includes(w)}
function canAccessVoucher(v){if(currentPerm.role==='Admin')return true; if(!has('inventory')&&!has('stockbook'))return false; if(v.type==='TRANSFER')return canAccessWarehouse(v.fromWarehouse||v.warehouse||'Kho Chính')||canAccessWarehouse(v.toWarehouse||'Kho Văn Phòng'); return canAccessWarehouse(voucherWarehouse(v));}
function warehouseOptions(selected='',allowed=userWarehouses()){return allowed.map(w=>`<option value="${w}" ${w===selected?'selected':''}>${w}</option>`).join('')}
function defaultWarehouse(){return userWarehouses()[0]||WAREHOUSES[0]}
function voucherWarehouse(v){return v.warehouse||v.fromWarehouse||defaultWarehouse()}
function voucherToWarehouse(v){return v.toWarehouse||''}
function isTransferVoucher(v){return v.type==='TRANSFER'}
const modules=['dashboard','sales','commissions','expenses','debts','inventory','stockbook','warranty','customers','products','prices','staff','reports','permissions','system'];
const permissionMap={
 Admin:modules.concat(['viewCost','editSales','deleteSales','editStock','deleteStock','audit']),
 Sale:['dashboard','sales','commissions','customers','products','warranty'],
 'Kỹ thuật':['dashboard','warranty','customers','products'],
 Kho:['dashboard','inventory','stockbook','products'],
 'Kho Chính':['dashboard','inventory','stockbook','products'],
 'Kho Văn Phòng':['dashboard','inventory','stockbook','products'],
 'Kế toán':['dashboard','expenses','commissions','debts','reports','sales','customers','products']
};
const permLabels={dashboard:'Dashboard',sales:'Bán hàng',commissions:'Hoa hồng',expenses:'Chi phí',debts:'Công nợ',inventory:'Kho',stockbook:'Sổ kho',warranty:'Bảo hành',customers:'Khách hàng',products:'Sản phẩm',prices:'Bảng giá',staff:'Nhân viên',reports:'Báo cáo',permissions:'Phân quyền',system:'Hệ thống',viewCost:'Xem giá vốn/lợi nhuận',editSales:'Sửa đơn bán',deleteSales:'Xóa đơn bán',editStock:'Sửa phiếu kho',deleteStock:'Xóa phiếu kho',audit:'Xem nhật ký'};

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
async function loadAll(){for(const n of ['customers','products','staff','prices','costPrices','sales','stockVouchers','receipts','warranties','expenses','users','logs']) await loadCol(n); renderAll();}
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
        if(v.type==='IN')qty+=q;
        else if(v.type==='OUT')qty-=q;
        else qty+=q;
      }
    });
  });
  return qty;
}
function prefixByStockType(t){return t==='IN'?'NK':t==='OUT'?'XK':t==='TRANSFER'?'CK':t==='CHECK'?'KK':'DC'}
function stockTypeName(t){return t==='IN'?'Phiếu nhập kho':t==='OUT'?'Phiếu xuất kho':t==='TRANSFER'?'Phiếu chuyển kho':t==='CHECK'?'Phiếu kiểm kê':'Phiếu điều chỉnh kho'}
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
function printHeader(title){return `<h2 style="text-align:center;margin:0 0 6px">${title}</h2><p style="text-align:center;line-height:1.45;margin:0 0 8px"><b>SIMILOCK ĐÀ NẴNG</b><br>223 Trường Chinh, P. An Khê, TP. Đà Nẵng<br>403 Nguyễn Thái Bình, P. Bảy Hiền, TP.HCM<br>Hotline: 0902950816</p><hr>`}

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
function validateDate(v){return !v || /^\d{4}-\d{2}-\d{2}$/.test(v)}
function calcSaleTotals(items,vatMode,paid){let subtotal=items.reduce((a,it)=>a+(+it.qty||0)*(+it.price||0)*(1-(+it.discount||0)/100),0);let rate=vatMode?.includes('10') ? 0.10 : (vatMode?.includes('8') ? 0.08 : 0);let vat=0,grand=subtotal;if(vatMode?.startsWith('add')){vat=subtotal*rate;grand=subtotal+vat}else if(vatMode?.startsWith('included')){vat=subtotal-subtotal/(1+rate);grand=subtotal}return{subtotal,vat,grand,debt:grand-(+paid||0)}}
function calcCommissionBase(totals){return Math.max(0,(+totals?.grand||0)-(+totals?.vat||0))}
function calcCommission(totals,percent){return Math.round(calcCommissionBase(totals)*(+percent||0)/100)}
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

function applyPermissions(){document.querySelectorAll('#menu button[data-page]').forEach(b=>{b.style.display=has(b.dataset.page)?'block':'none'});document.querySelectorAll('#menu .menu-group').forEach(g=>{const visible=[...g.querySelectorAll('button[data-page]')].some(b=>b.style.display!=='none');g.style.display=visible?'block':'none';});document.querySelectorAll('.view-cost').forEach(x=>x.classList.toggle('hidden',!has('viewCost')));}
document.querySelectorAll('#menu .menu-toggle').forEach(btn=>btn.onclick=()=>btn.closest('.menu-group').classList.toggle('open'));document.querySelectorAll('#menu button[data-page]').forEach(btn=>btn.onclick=()=>showPage(btn.dataset.page));
function showPage(id){if(!has(id))return alert('Tài khoản chưa được phân quyền');document.querySelectorAll('#menu button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));document.querySelectorAll('#menu .menu-group').forEach(g=>g.classList.toggle('active-group',[...g.querySelectorAll('button[data-page]')].some(b=>b.dataset.page===id)));const activeBtn=document.querySelector(`#menu button[data-page="${id}"]`);if(activeBtn)activeBtn.closest('.menu-group')?.classList.add('open');document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));$('pageTitle').textContent=btnTitle(id);$('pageSub').textContent='Similock Đà Nẵng - Quản lý bán hàng, kho, công nợ, bảo hành'}
function btnTitle(id){return ({dashboard:'Dashboard điều hành',sales:'Bán hàng',commissions:'Hoa hồng',expenses:'Chi phí vận hành',debts:'Công nợ',inventory:'Kho hàng',stockbook:'Sổ kho',warranty:'Bảo hành',customers:'Khách hàng',products:'Sản phẩm',prices:'Bảng giá',staff:'Nhân viên',reports:'Báo cáo',permissions:'Phân quyền',system:'Hệ thống'}[id]||id)}

function renderAll(){try{applyPermissions();renderSelectors();renderDashboard();renderCustomers();renderProducts();renderPrices();renderCostPrices();renderStaff();renderSales();renderCommissions();renderExpenses();renderDebts();renderReceipts();renderStock();renderStockBook();renderWarranties();renderReports();renderPermissions();staffDeptChanged();resetSaleForm();resetStockForm();}catch(e){console.error('RENDER ERROR:',e);alert('Đăng nhập được nhưng lỗi khi tải màn hình: '+(e.message||e));}}
function renderSelectors(){fillSelect($('saleStaff'),data.staff.filter(x=>x.dept==='Sale'||x.dept==='Quản lý'),x=>x.name);fillSelect($('saleTech'),data.staff.filter(x=>x.dept==='Kỹ thuật'),x=>x.name);refreshCommissionStaffOptions();fillSelect($('priceProduct'),data.products,x=>`${x.code} - ${x.name}`,x=>x.code);fillSelect($('costProduct'),data.products,x=>`${x.code} - ${x.name}`,x=>x.code);fillReceiptCustomerOptions();fillSelect($('wSale'),data.sales,x=>`${x.code} - ${x.customerName||''}`);if($('saleWarehouse'))$('saleWarehouse').innerHTML=warehouseOptions($('saleWarehouse').value||defaultWarehouse());if($('stockWarehouse'))$('stockWarehouse').innerHTML=warehouseOptions($('stockWarehouse').value||defaultWarehouse());if($('stockToWarehouse'))$('stockToWarehouse').innerHTML=warehouseOptions($('stockToWarehouse').value||defaultWarehouse(),WAREHOUSES);$('customerList').innerHTML=data.customers.map(c=>`<option value="${ensureCustomerCode(c)} | ${c.name} | ${c.phone||''}"></option>`).join('')}
function renderDashboard(){let month=new Date().toISOString().slice(0,7);let sales=data.sales.filter(s=>String(s.date||'').startsWith(month));let monthlyExpenses=data.expenses.filter(e=>String(e.date||'').startsWith(month));let rev=sales.reduce((a,s)=>a+(+s.grand||0),0);let orderProfit=sales.reduce((a,s)=>a+(+s.profit||0),0);let expense=monthlyExpenses.reduce((a,e)=>a+(+e.amount||0),0);let profit=orderProfit-expense;let debt=calcDebts().reduce((a,d)=>a+d.debt,0);let low=data.products.filter(p=>stockOf(p.code)<=(+p.minStock||3));$('kpiRevenue').textContent=money(rev);$('kpiProfit').textContent=money(profit);$('kpiDebt').textContent=money(debt);$('kpiLowStock').textContent=low.length;const best={};data.sales.forEach(s=>(s.items||[]).forEach(it=>best[it.code]=(best[it.code]||0)+(+it.qty||0)));let rows=Object.entries(best).sort((a,b)=>b[1]-a[1]).slice(0,8);let max=Math.max(1,...rows.map(r=>r[1]));$('bestProducts').innerHTML=rows.length?rows.map(([code,qty])=>{let p=data.products.find(x=>x.code===code)||{};return `<div class="bar-row"><b>${code}</b><div><small>${p.name||''}</small><div class="bar"><i style="width:${qty/max*100}%"></i></div></div><b>${qty}</b></div>`}).join(''):'Chưa có dữ liệu';const st={};data.sales.forEach(s=>{let n=data.staff.find(x=>x.id===s.staffId)?.name||'Khác';st[n]=st[n]||{rev:0,count:0};st[n].rev+=+s.grand||0;st[n].count++});$('topStaff').innerHTML=Object.entries(st).sort((a,b)=>b[1].rev-a[1].rev).slice(0,5).map(([n,v])=>`<tr><td>${n}</td><td>${money(v.rev)}</td><td>${v.count}</td></tr>`).join('');$('latestSales').innerHTML=data.sales.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6).map(s=>`<tr><td>${s.code}</td><td>${s.customerCode||''}</td><td>${s.customerName||''}</td><td>${money(s.grand)}</td></tr>`).join('');$('lowStockRows').innerHTML=low.map(p=>`<tr><td>${p.code}</td><td>${p.name}</td><td><span class="badge red">${stockOf(p.code)}</span></td></tr>`).join('')||'<tr><td colspan="3">Kho ổn định</td></tr>'}

window.saveCustomer=async()=>{let phone=$('cPhone').value;let o={customerCode:($('cCode').value||customerCodeFromPhone(phone)).trim(),name:$('cName').value,type:$('cType').value,phone,address:$('cAddress').value,discount:+$('cDiscount').value||0,openingDebt:+$('cOpeningDebt').value||0};if(!o.name)return alert('Nhập tên khách');let id=$('cId').value;if(id){await updateDoc(doc(db,'customers',id),o);await logAction('Sửa khách hàng',o.name)}else await addDoc(col('customers'),{...o,createdAt:serverTimestamp()});clearCustomer();await loadAll()}
function clearCustomer(){['cId','cCode','cName','cPhone','cAddress'].forEach(i=>$(i).value='');$('cDiscount').value=0;$('cOpeningDebt').value=0}
function renderCustomers(){$('customerTable').innerHTML=data.customers.map(c=>`<tr><td><b>${ensureCustomerCode(c)}</b></td><td>${c.name}</td><td>${c.type||''}</td><td>${c.phone||''}</td><td>${c.address||''}</td><td>${c.discount||0}%</td><td><button class="btn ghost" onclick="editCustomer('${c.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('customers','${c.id}')">Xóa</button></td></tr>`).join('')}
window.editCustomer=id=>{let c=data.customers.find(x=>x.id===id);$('cId').value=id;$('cCode').value=ensureCustomerCode(c);$('cName').value=c.name||'';$('cType').value=c.type||'Khách lẻ';$('cPhone').value=c.phone||'';$('cAddress').value=c.address||'';$('cDiscount').value=c.discount||0;$('cOpeningDebt').value=c.openingDebt||0}
window.quickCreateCustomer=async()=>{let raw=$('saleCustomerSearch').value.trim();if(!raw)return alert('Nhập tên hoặc SĐT khách');let name=raw.split('|')[0].trim();let phone=(prompt('SĐT khách hàng:',raw.split('|')[1]?.trim()||'')||'');let address=prompt('Địa chỉ:', '')||'';await addDoc(col('customers'),{customerCode:customerCodeFromPhone(phone),name,type:'Khách lẻ',phone,address,discount:0,openingDebt:0,createdAt:serverTimestamp()});await loadAll();$('saleCustomerSearch').value=`${customerCodeFromPhone(phone)} | ${name} | ${phone}`}

window.saveProduct=async()=>{let old=$('pId').value?data.products.find(x=>x.id===$('pId').value):{};let o={code:$('pCode').value.trim(),name:$('pName').value,category:$('pCategory').value,cost:has('viewCost')?(+$('pCost').value||0):(+old?.cost||0),price:+$('pPrice').value||0,minStock:+$('pMinStock').value||3};if(!o.code||!o.name)return alert('Nhập model và tên');let id=$('pId').value;if(id){await updateDoc(doc(db,'products',id),o);await logAction('Sửa sản phẩm',o.code)}else await addDoc(col('products'),{...o,createdAt:serverTimestamp()});clearProduct();await loadAll()}
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
window.saveCostPrice=async()=>{
  if(!has('viewCost'))return alert('Chỉ Admin được xem/sửa bảng giá vốn');
  const o={code:$('costProduct').value,cost:+$('costValue').value||0,validFrom:$('costFrom').value||'',validTo:$('costTo').value||'',active:$('costActive').value==='true',note:$('costNote').value||'',updatedAt:serverTimestamp()};
  if(!o.code)return alert('Chọn model sản phẩm');
  if(!o.cost)return alert('Nhập giá vốn');
  if(o.validFrom&&o.validTo&&o.validFrom>o.validTo)return alert('Ngày hiệu lực đến phải lớn hơn hoặc bằng ngày bắt đầu');
  const id=$('costId').value;
  if(id)await updateDoc(doc(db,'costPrices',id),o);else await addDoc(col('costPrices'),{...o,createdAt:serverTimestamp()});
  await logAction(id?'Sửa bảng giá vốn':'Thêm bảng giá vốn',`${o.code} - ${o.cost}`);
  ['costId','costValue','costFrom','costTo','costNote'].forEach(i=>$(i).value='');$('costActive').value='true';await loadAll();
}
function renderCostPrices(){
  const tb=$('costPriceTable'); if(!tb)return;
  if(!has('viewCost')){tb.innerHTML='<tr><td colspan="6">Chỉ Admin được xem bảng giá vốn</td></tr>';return;}
  tb.innerHTML=(data.costPrices||[]).sort((a,b)=>String(a.code||'').localeCompare(String(b.code||''))||String(b.validFrom||'').localeCompare(String(a.validFrom||''))).map(p=>{let st=priceStatus(p);return`<tr><td><b>${p.code}</b></td><td>${money(p.cost)}</td><td>${p.validFrom||'Không giới hạn'} → ${p.validTo||'Không giới hạn'}</td><td><span class="badge ${st[1]}">${st[0]}</span></td><td>${p.note||''}</td><td><button class="btn ghost" onclick="editCostPrice('${p.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('costPrices','${p.id}')">Xóa</button></td></tr>`}).join('')||'<tr><td colspan="6">Chưa có bảng giá vốn</td></tr>';
}
window.editCostPrice=id=>{if(!has('viewCost'))return alert('Chỉ Admin được sửa bảng giá vốn');let p=data.costPrices.find(x=>x.id===id);$('costId').value=id;$('costProduct').value=p.code;$('costValue').value=p.cost;$('costFrom').value=p.validFrom||'';$('costTo').value=p.validTo||'';$('costActive').value=String(p.active)!=='false'?'true':'false';$('costNote').value=p.note||'';showPage('prices')}


window.staffDeptChanged=()=>{let dept=$('eDept')?.value||'Sale';if($('saleCommissionBox'))$('saleCommissionBox').style.display=(dept==='Sale'||dept==='Quản lý')?'block':'none';if($('techFeeBox'))$('techFeeBox').style.display=dept==='Kỹ thuật'?'block':'none'}
window.saveStaff=async()=>{let dept=$('eDept').value;let o={name:$('eName').value,dept,phone:$('ePhone').value,commissionPercent:+($('eCommissionPercent')?.value||0),techFee:+($('eTechFee')?.value||0)};if(dept==='Sale'||dept==='Quản lý'){if(!o.commissionPercent)o.commissionPercent=5;o.techFee=0}else if(dept==='Kỹ thuật'){if(!o.techFee)o.techFee=100000;o.commissionPercent=0}else{o.commissionPercent=0;o.techFee=0}if(!o.name)return alert('Nhập tên nhân viên');let id=$('eId').value;if(id)await updateDoc(doc(db,'staff',id),o);else await addDoc(col('staff'),o);$('eId').value='';$('eName').value='';$('ePhone').value='';$('eCommissionPercent').value=5;$('eTechFee').value=100000;$('eDept').value='Sale';staffDeptChanged();await loadAll()}
function renderStaff(){$('staffTable').innerHTML=data.staff.map(e=>`<tr><td>${e.name}</td><td>${e.dept}</td><td>${e.phone||''}</td><td>${(e.dept==='Sale'||e.dept==='Quản lý')?((e.commissionPercent??5)+'%'):''}</td><td>${e.dept==='Kỹ thuật'?money(e.techFee??100000):''}</td><td><button class="btn ghost" onclick="editStaff('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('staff','${e.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="6">Chưa có nhân viên</td></tr>'}
window.editStaff=id=>{let e=data.staff.find(x=>x.id===id);$('eId').value=id;$('eName').value=e.name;$('eDept').value=e.dept;$('ePhone').value=e.phone||'';if($('eCommissionPercent'))$('eCommissionPercent').value=e.commissionPercent??5;if($('eTechFee'))$('eTechFee').value=e.techFee??100000;staffDeptChanged()}


function allocationForCustomer(customerId){
  const sales=data.sales.filter(x=>x.customerId===customerId).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.code||'').localeCompare(String(b.code||'')));
  let totalPaid=sales.reduce((a,x)=>a+(+x.paid||0),0)+data.receipts.filter(r=>r.customerId===customerId).reduce((a,r)=>a+(+r.amount||0),0);
  const map={};
  sales.forEach(x=>{const grand=+x.grand||0;const paid=Math.min(grand,Math.max(0,totalPaid));const debt=Math.max(0,grand-paid);map[x.id]={paidTotal:paid,debtLeft:debt,paymentStatus:debt<=0?'Đã thu tiền':(paid>0?'Thanh toán một phần':'Chưa thu tiền')};totalPaid-=paid;});
  return map;
}
function salePaymentInfo(s){return allocationForCustomer(s.customerId||'')[s.id]||{paidTotal:+s.paid||0,debtLeft:+s.debt||0,paymentStatus:s.status||'Chưa thu tiền'};}
async function updatePaymentStatusesForCustomer(customerId){
  const map=allocationForCustomer(customerId);
  for(const [id,st] of Object.entries(map)){
    try{await updateDoc(doc(db,'sales',id),{paidTotal:st.paidTotal,debtLeft:st.debtLeft,paymentStatus:st.paymentStatus,status:st.paymentStatus,updatedAt:serverTimestamp()});}catch(e){console.warn('Không cập nhật trạng thái công nợ đơn '+id,e.message)}
  }
}
function stockVoucherForSale(s){return data.stockVouchers.find(v=>v.id===s.stockVoucherId)||data.stockVouchers.find(v=>v.saleId===s.id)||null;}

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
    code:nextCode('XK',data.stockVouchers),date:today(),type:'OUT',warehouse,saleId:s.id,saleCode:s.code,customerName:s.customerName||'',
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

window.resetSaleForm=()=>{editingSale=null;$('saleCode').value=nextCode('BH',data.sales);$('saleDate').value=today();$('saleCustomerSearch').value='';if($('saleVatMode'))$('saleVatMode').value='included8';$('salePaid').value=0;if($('saleCommissionPercent'))$('saleCommissionPercent').value=salePercentDefault($('saleStaff')?.value);if($('saleTechCost'))$('saleTechCost').value=techFeeDefault($('saleTech')?.value);$('saleNote').value='';if($('saleWarehouse'))$('saleWarehouse').value='Kho Văn Phòng';if($('saleExportStock'))$('saleExportStock').checked=false;if($('saleExportStockSticky'))$('saleExportStockSticky').checked=false;$('saleItems').innerHTML='';addSaleItem();updateSaleTotals()}
window.addSaleItem=(it={})=>{let tr=document.createElement('tr');tr.innerHTML=`<td><select onchange="saleProductChanged(this)"><option value="">Chọn model</option>${data.products.map(p=>`<option value="${p.code}" ${p.code===it.code?'selected':''}>${p.code}</option>`).join('')}</select></td><td><input value="${it.name||''}" readonly></td><td><input type="number" value="${it.qty||1}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td><input type="number" value="${it.price||0}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td><input type="number" value="${it.discount||0}" oninput="updateSaleTotals()" onkeydown="saleItemKeyNav(event,this)"></td><td class="line-total">0</td><td><button class="btn danger" onclick="this.closest('tr').remove();updateSaleTotals()">X</button></td>`;$('saleItems').appendChild(tr);updateSaleTotals();setTimeout(()=>tr.querySelector('select')?.focus(),30);return tr}
window.saleItemKeyNav=(e,el)=>{if(e.key!=='Enter')return;e.preventDefault();const tr=el.closest('tr');const inputs=[...tr.querySelectorAll('select,input:not([readonly])')];let i=inputs.indexOf(el);if(i<inputs.length-1){inputs[i+1].focus();inputs[i+1].select?.();}else{addSaleItem();}}
window.addQuickSaleModel=(code)=>{let p=data.products.find(x=>String(x.code).toLowerCase()===String(code).toLowerCase() || String(x.code).toLowerCase().includes(String(code).toLowerCase()));if(!p)return alert('Chưa có model '+code+' trong danh mục sản phẩm');let customer=findCustomerBySearch();let bp=activePriceFor(p.code,customer?.type,$('saleDate')?.value||today());let tr=addSaleItem({code:p.code,name:p.name,qty:1,price:bp?.price||p.price||0,discount:customer?.discount||0});saleProductChanged(tr.querySelector('select'));setTimeout(()=>tr.children[2].querySelector('input')?.focus(),30)}
window.syncSaleExportStockFromSticky=()=>{if($('saleExportStock')&&$('saleExportStockSticky'))$('saleExportStock').checked=$('saleExportStockSticky').checked}
window.syncSaleExportStockToSticky=()=>{if($('saleExportStock')&&$('saleExportStockSticky'))$('saleExportStockSticky').checked=$('saleExportStock').checked}
window.saleProductChanged=sel=>{let p=data.products.find(x=>x.code===sel.value)||{};let tr=sel.closest('tr');tr.children[1].querySelector('input').value=p.name||'';let customer=findCustomerBySearch();let bp=activePriceFor(p.code,customer?.type,$('saleDate')?.value||today());let price=bp?.price||p.price||0;tr.children[3].querySelector('input').value=price;tr.children[4].querySelector('input').value=customer?.discount||0;updateSaleTotals()}
function saleItems(){return [...$('saleItems').querySelectorAll('tr')].map(tr=>({code:tr.children[0].querySelector('select').value,name:tr.children[1].querySelector('input').value,qty:+tr.children[2].querySelector('input').value||0,price:+tr.children[3].querySelector('input').value||0,discount:+tr.children[4].querySelector('input').value||0})).filter(x=>x.code&&x.qty>0)}
window.updateSaleTotals=()=>{let t=calcSaleTotals(saleItems(),$('saleVatMode').value,$('salePaid').value);[...$('saleItems').querySelectorAll('tr')].forEach(tr=>{let q=+tr.children[2].querySelector('input').value||0,pr=+tr.children[3].querySelector('input').value||0,ck=+tr.children[4].querySelector('input').value||0;tr.querySelector('.line-total').textContent=money(q*pr*(1-ck/100))});$('saleSubTotal').textContent=money(t.subtotal);$('saleVat').textContent=money(t.vat);$('saleGrand').textContent=money(t.grand);$('saleDebt').textContent=money(t.debt);if($('saleGrandSticky'))$('saleGrandSticky').textContent=money(t.grand);if($('saleDebtSticky'))$('saleDebtSticky').textContent=money(t.debt);syncSaleExportStockToSticky()};['saleVatMode','salePaid','saleCustomerSearch','saleCommissionPercent'].forEach(id=>setTimeout(()=>$(id)?.addEventListener('input',updateSaleTotals),0));setTimeout(()=>$('saleStaff')?.addEventListener('change',()=>{if($('saleCommissionPercent'))$('saleCommissionPercent').value=salePercentDefault($('saleStaff').value);updateSaleTotals()}),0);setTimeout(()=>$('saleTech')?.addEventListener('change',()=>{if($('saleTechCost'))$('saleTechCost').value=techFeeDefault($('saleTech').value);updateSaleTotals()}),0);
function findCustomerBySearch(){let s=$('saleCustomerSearch').value.toLowerCase();return data.customers.find(c=>s.includes((ensureCustomerCode(c)||'zzzz').toLowerCase())||s.includes((c.phone||'zzzz').toLowerCase())||s.includes((c.name||'zzzz').toLowerCase()))}
window.saveSale=async()=>{let customer=findCustomerBySearch();if(!customer){await quickCreateCustomer();customer=findCustomerBySearch()}let items=saleItems();if(!items.length)return alert('Chưa có sản phẩm');
  const exportStock=!!$('saleExportStock')?.checked;
  const saleWarehouse=$('saleWarehouse')?.value||'Kho Văn Phòng';
  let oldSale=editingSale?data.sales.find(x=>x.id===editingSale):null;
  let excludeVoucherId=oldSale?.stockVoucherId||'';
  if(exportStock){for(const it of items){const available=stockOf(it.code,excludeVoucherId,saleWarehouse); if(it.qty>available && !confirm(`Sản phẩm ${it.code} tồn tại kho ${saleWarehouse} hiện có ${available}, vẫn lưu đơn kiêm xuất kho?`)) return;}}
  let totals=calcSaleTotals(items,$('saleVatMode').value,$('salePaid').value);let cost=items.reduce((a,it)=>a+costFor(it.code,$('saleDate').value)*it.qty,0);let commissionPercent=+$('saleCommissionPercent')?.value||0;let saleCommission=calcCommission(totals,commissionPercent);let techCost=+$('saleTechCost')?.value||techFeeDefault($('saleTech').value);let commissionBase=calcCommissionBase(totals);let o={code:$('saleCode').value,date:$('saleDate').value,customerId:customer.id,customerCode:ensureCustomerCode(customer),customerName:customer.name,customerPhone:customer.phone||'',customerAddress:customer.address||'',staffId:$('saleStaff').value,staffName:data.staff.find(x=>x.id===$('saleStaff').value)?.name||'',techId:$('saleTech').value,techName:data.staff.find(x=>x.id===$('saleTech').value)?.name||'',commissionPercent,commissionBase,saleCommission,techCost,vatMode:$('saleVatMode').value,paid:+$('salePaid').value||0,note:$('saleNote').value,items,...totals,cost,profit:commissionBase-cost-saleCommission-techCost,status:totals.debt>0?'Còn nợ':'Đã thu tiền',paymentStatus:totals.debt>0?(((+$('salePaid').value||0)>0)?'Thanh toán một phần':'Chưa thu tiền'):'Đã thu tiền',paidTotal:+$('salePaid').value||0,debtLeft:totals.debt,warehouse:saleWarehouse,stockExported:exportStock,stockVoucherId:oldSale?.stockVoucherId||'',updatedAt:serverTimestamp()};
  if(editingSale){if(!has('editSales'))return alert('Không có quyền sửa đơn');await updateDoc(doc(db,'sales',editingSale),o);await logAction('Sửa đơn bán',o.code)}else{const saleRef=await addDoc(col('sales'),{...o,createdAt:serverTimestamp()});editingSale=saleRef.id;}
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
  const rows=data.sales.filter(s=>(s.code+(s.customerCode||'')+s.customerName+(s.customerPhone||'')).toLowerCase().includes(q)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  $('saleTable').innerHTML=rows.map(s=>{const pay=salePaymentInfo(s);const sv=stockVoucherForSale(s);const stockStatus=!!sv;return `<tr><td><b>${s.code}</b></td><td>${s.date||''}</td><td>${s.customerCode||''}</td><td>${s.customerName||''}<br><small>${s.customerPhone||''}</small></td><td><b>${money(s.grand)}</b></td><td>${money(pay.paidTotal)}</td><td><b>${money(pay.debtLeft)}</b></td><td class="view-cost">${money(s.saleCommission||0)}</td><td class="view-cost">${money(s.profit||0)}</td><td><span class="badge ${pay.debtLeft>0?(pay.paidTotal>0?'orange':'red'):'green'}">${pay.paymentStatus}</span></td><td>${stockStatus?'<span class="badge green">Đã xuất kho</span>':(saleNeedSupplementStock(s)?'<span class="badge red">Cần xuất kho bổ sung</span>':'<span class="badge orange">Chưa xuất kho</span>')}</td><td><button class="btn ghost" onclick="viewSaleDetail('${s.id}')">Chi tiết</button> <button class="btn ghost" onclick="printSale('${s.id}')">In A5</button> ${has('editSales')?`<button class="btn ghost" onclick="editSale('${s.id}')">Sửa</button>`:''} ${has('deleteSales')?`<button class="btn danger" onclick="removeDoc('sales','${s.id}')">Xóa</button>`:''}</td></tr>`}).join('')||'<tr><td colspan="12">Chưa có phiếu bán</td></tr>';
}
window.viewSaleDetail=id=>{
  const s=data.sales.find(x=>x.id===id); if(!s)return;
  const pay=salePaymentInfo(s); const sv=stockVoucherForSale(s); const recs=receiptsForSale(s);
  const receiptHtml=recs.length?`<div class="receipt-list"><h4>Phiếu thu liên quan</h4><table><thead><tr><th>Mã PT</th><th>Ngày</th><th>Số tiền phân bổ</th><th>Ghi chú</th><th></th></tr></thead><tbody>${recs.map(r=>`<tr><td>${r.code||''}</td><td>${r.date||''}</td><td><b>${money(r.allocatedAmount||r.amount)}</b></td><td>${r.note||''}</td><td><button class="btn ghost" onclick="printReceipt('${r.id}')">In PT</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="receipt-list"><h4>Phiếu thu liên quan</h4><p>Chưa có phiếu thu được phân bổ cho đơn này.</p></div>`;
  let html=`<div class="modal-backdrop" id="saleDetailModal"><div class="modal-card"><div class="panel-head"><h3>Chi tiết đơn ${s.code}</h3><button class="btn ghost" onclick="document.getElementById('saleDetailModal').remove()">Đóng</button></div><div class="sale-detail-grid"><div><b>Khách hàng</b><p>${s.customerCode||''} - ${s.customerName||''}<br>${s.customerPhone||''}<br>${s.customerAddress||''}</p></div><div><b>Trạng thái công nợ</b><p><span class="badge ${pay.debtLeft>0?(pay.paidTotal>0?'orange':'red'):'green'}">${pay.paymentStatus}</span><br>Tổng tiền: <b>${money(s.grand)}</b><br>Đã thu: <b>${money(pay.paidTotal)}</b><br>Còn nợ: <b>${money(pay.debtLeft)}</b></p></div><div><b>Kho</b><p>${sv?`<span class="badge green">Đã xuất kho</span><br>Kho xuất: <b>${voucherWarehouse(sv)}</b><br>Mã phiếu: <b>${sv.code||''}</b><br><button class="btn ghost" onclick="printStock('${sv.id}')">Xem/In phiếu xuất kho</button>`:`<span class="badge ${saleNeedSupplementStock(s)?'red':'orange'}">${saleNeedSupplementStock(s)?'Cần xuất kho bổ sung':'Chưa xuất kho'}</span><br>Đơn này chưa tạo phiếu xuất kho.<br><button class="btn primary" onclick="createSupplementStockVoucher('${s.id}')">Tạo phiếu xuất kho bổ sung</button>`}</p></div></div><table><thead><tr><th>Model</th><th>Tên sản phẩm</th><th>SL</th><th>Đơn giá</th><th>CK</th><th>Thành tiền</th></tr></thead><tbody>${(s.items||[]).map(it=>`<tr><td>${it.code}</td><td>${it.name||''}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${it.discount||0}%</td><td>${money((+it.qty||0)*(+it.price||0)*(1-(+it.discount||0)/100))}</td></tr>`).join('')}</tbody></table><div class="total-box"><div>Tổng tiền: <b>${money(s.grand)}</b></div><div>Đã thu: <b>${money(pay.paidTotal)}</b></div><div>Còn nợ: <b>${money(pay.debtLeft)}</b></div></div>${receiptHtml}</div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
}
window.editSale=id=>{let s=data.sales.find(x=>x.id===id);if(saleLocked(s)&&currentPerm.role!=='Admin')return alert('Đơn đã thu tiền hoặc đã xuất kho. Chỉ Admin được mở khóa/sửa để tránh lệch công nợ và tồn kho.');editingSale=id;$('saleCode').value=s.code;$('saleDate').value=s.date;$('saleCustomerSearch').value=`${s.customerCode||''} | ${s.customerName} | ${s.customerPhone||''}`;$('saleStaff').value=s.staffId||'';$('saleTech').value=s.techId||'';if($('saleWarehouse'))$('saleWarehouse').value=s.warehouse||stockVoucherForSale(s)?.warehouse||defaultWarehouse();$('saleVatMode').value=s.vatMode||'none';$('salePaid').value=s.paid||0;if($('saleCommissionPercent'))$('saleCommissionPercent').value=s.commissionPercent??salePercentDefault(s.staffId);if($('saleTechCost'))$('saleTechCost').value=s.techCost??techFeeDefault(s.techId);if($('saleExportStock'))$('saleExportStock').checked=!!s.stockExported;if($('saleExportStockSticky'))$('saleExportStockSticky').checked=!!s.stockExported;$('saleNote').value=s.note||'';$('saleItems').innerHTML='';(s.items||[]).forEach(addSaleItem);updateSaleTotals();showPage('sales')}
window.printSale=id=>{
  let s=data.sales.find(x=>x.id===id);
  if(!s) return alert('Không tìm thấy phiếu bán');
  let pay=salePaymentInfo(s);
  let staff=data.staff.find(x=>x.id===s.staffId)||{};
  let tech=data.staff.find(x=>x.id===s.techId)||{};
  let customerType=s.customerType||s.customerGroup||'';
  let html=`<div class="print-a5">${printHeader('PHIẾU BÁN HÀNG')}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;border-bottom:1px solid #999;padding-bottom:8px;margin-bottom:8px;line-height:1.55">
    <div>
      <div><b>Mã phiếu:</b> ${s.code||''}</div>
      <div><b>Ngày:</b> ${s.date||''}</div>
      <div><b>Khách hàng:</b> ${s.customerName||''}</div>
      <div><b>SĐT:</b> ${s.customerPhone||''}</div>
      <div><b>Mã KH:</b> ${s.customerCode||''}</div>
    </div>
    <div>
      <div><b>Địa chỉ:</b> ${s.customerAddress||''}</div>
      <div><b>Loại khách:</b> ${customerType||''}</div>
      <div><b>Sale:</b> ${staff.name||''}</div>
      <div><b>Kỹ thuật:</b> ${tech.name||''}</div>
    </div>
  </div>
  <table><thead><tr><th>STT</th><th>Model</th><th>Tên SP</th><th>SL</th><th>Đơn giá</th><th>CK</th><th>Thành tiền</th></tr></thead><tbody>${(s.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.code||''}</td><td>${it.name||''}</td><td>${it.qty||0}</td><td>${money(it.price||0)}</td><td>${it.discount||0}%</td><td>${money((+it.qty||0)*(+it.price||0)*(1-(+it.discount||0)/100))}</td></tr>`).join('')}</tbody></table>
  <div style="display:flex;justify-content:flex-end;margin-top:10px">
    <div style="min-width:230px;line-height:1.65">
      <div style="display:flex;justify-content:space-between"><b>Tiền hàng:</b><span>${money(s.subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between"><b>Giảm giá/VAT:</b><span>${money(s.vat)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:bold;border-top:1px dashed #999;padding-top:4px"><span>Tổng thanh toán:</span><span>${money(s.grand)}</span></div>
      <div style="display:flex;justify-content:space-between"><b>Đã thu:</b><span>${money(pay.paidTotal)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:bold"><span>Còn nợ:</span><span>${money(pay.debtLeft)}</span></div>
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
  let totalRevenue=0,totalSaleCommission=0,totalTechCost=0;

  rows.forEach(s=>{
    totalRevenue+=+s.grand||0;
    totalSaleCommission+=+s.saleCommission||0;
    totalTechCost+=+s.techCost||0;
    let saleKey=s.staffId||'none';
    let saleName=s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||'Chưa chọn sale';
    bySale[saleKey]=bySale[saleKey]||{id:saleKey,name:saleName,count:0,revenue:0,commission:0};
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

  if($('commissionSummary')) $('commissionSummary').innerHTML=`<div>Tổng doanh thu: <b>${money(totalRevenue)}</b></div><div>Hoa hồng Sale: <b>${money(totalSaleCommission)}</b></div><div>Công kỹ thuật: <b>${money(totalTechCost)}</b></div><div>Tổng chi: <b>${money(totalSaleCommission+totalTechCost)}</b></div>`;

  $('commissionByStaff').innerHTML=Object.values(bySale)
    .sort((a,b)=>b.commission-a.commission)
    .map(v=>`<tr><td>${v.name}</td><td>${v.count}</td><td>${money(v.revenue)}</td><td><b>${money(v.commission)}</b></td><td>${v.id==='none'?'':`<button class="btn ghost" onclick="viewCommissionStaff('${v.id}','Sale')">Xem chi tiết</button>`}</td></tr>`)
    .join('')||'<tr><td colspan="5">Không có dữ liệu hoa hồng Sale theo bộ lọc</td></tr>';

  if($('commissionByTech')){
    $('commissionByTech').innerHTML=Object.values(byTech)
      .sort((a,b)=>b.techCost-a.techCost)
      .map(v=>`<tr><td>${v.name}</td><td>${v.count}</td><td>${money(v.revenue)}</td><td><b>${money(v.techCost)}</b></td></tr>`)
      .join('')||'<tr><td colspan="4">Không có dữ liệu công kỹ thuật theo bộ lọc</td></tr>';
  }

  if($('commissionOrderTitle')){
    const f=commissionAppliedFilter||{};
    const staff=data.staff.find(x=>x.id===f.staffId);
    $('commissionOrderTitle').textContent=`🧾 Chi tiết đơn hàng (${rows.length} đơn${staff?' - '+staff.name:''})`;
  }
  $('commissionByOrder').innerHTML=rows.slice()
    .sort((a,b)=>String(b.date).localeCompare(String(a.date)))
    .map(s=>`<tr><td>${s.date||''}</td><td>${s.code}</td><td>${s.customerName||''}</td><td>${s.staffName||data.staff.find(x=>x.id===s.staffId)?.name||''}</td><td>${s.techName||data.staff.find(x=>x.id===s.techId)?.name||''}</td><td>${money(s.grand)}</td><td>${s.commissionPercent||0}%</td><td><b>${money(s.saleCommission||0)}</b></td><td><b>${money(s.techCost||0)}</b></td><td><b>${money((+s.saleCommission||0)+(+s.techCost||0))}</b></td></tr>`)
    .join('')||'<tr><td colspan="10">Không có đơn bán theo bộ lọc</td></tr>';
}
window.resetExpenseForm=()=>{editingExpense=null;$('exDate').value=today();$('exCategory').value='Tiền điện';$('exAmount').value='';$('exNote').value=''}
window.saveExpense=async()=>{let o={date:$('exDate').value||today(),category:$('exCategory').value,amount:+$('exAmount').value||0,note:$('exNote').value||'',updatedAt:serverTimestamp()};if(!o.amount)return alert('Nhập số tiền chi phí');if(editingExpense)await updateDoc(doc(db,'expenses',editingExpense),o);else await addDoc(col('expenses'),{...o,createdAt:serverTimestamp()});await logAction(editingExpense?'Sửa chi phí':'Thêm chi phí',o.category+' '+o.amount);resetExpenseForm();await loadAll()}
function renderExpenses(){if(!$('expenseTable'))return;let total=data.expenses.reduce((a,e)=>a+(+e.amount||0),0);$('expenseTotal').textContent=money(total);$('expenseTable').innerHTML=data.expenses.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<tr><td>${e.date||''}</td><td>${e.category||''}</td><td>${money(e.amount)}</td><td>${e.note||''}</td><td><button class="btn ghost" onclick="editExpense('${e.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('expenses','${e.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="5">Chưa có chi phí</td></tr>'}
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
  el.innerHTML='<option value="">-- Chọn khách còn công nợ --</option>'+customers.map(c=>`<option value="${c.id}">${ensureCustomerCode(c)} - ${c.name} - ${c.phone||''}</option>`).join('');
}
function renderDebts(){
  const active=calcDebts().sort((a,b)=>b.debt-a.debt);
  const settled=calcSettledDebts();
  if($('debtActiveCount'))$('debtActiveCount').textContent=active.length;
  if($('debtActiveTotal'))$('debtActiveTotal').textContent=money(active.reduce((a,d)=>a+d.debt,0));
  if($('debtSettledCount'))$('debtSettledCount').textContent=settled.length;
  $('debtTable').innerHTML=active.map(d=>`<tr><td><b>${ensureCustomerCode(d.customer)}</b></td><td>${d.customer.name}<br><small>${d.customer.phone||''}</small></td><td>${money(d.total)}</td><td>${money(d.paid)}</td><td><b class="text-danger debt-money">${money(d.debt)}</b></td><td><button class="btn primary debt-action" onclick="receiptFor('${d.customer.id}')">Thu tiền</button></td></tr>`).join('')||'<tr><td colspan="6">Không còn công nợ phải thu</td></tr>';
  if($('settledDebtTable'))$('settledDebtTable').innerHTML=settled.map(d=>`<tr class="settled-row"><td>${ensureCustomerCode(d.customer)}</td><td>${d.customer.name}<br><small>${d.customer.phone||''}</small></td><td>${money(d.total)}</td><td>${money(d.paid)}</td><td><span class="badge green">Đã thu đủ</span>${d.overPaid?` <span class="badge orange">Thu dư ${money(d.overPaid)}</span>`:''}</td></tr>`).join('')||'<tr><td colspan="5">Chưa có công nợ đã tất toán</td></tr>';
}
window.resetReceiptForm=()=>{editingReceipt=null;fillReceiptCustomerOptions();$('receiptCustomer').value='';$('receiptAmount').value='';$('receiptDate').value=today();$('receiptNote').value=''}
window.receiptFor=id=>{let d=calcDebtRows().find(x=>x.customer.id===id);if(d&&d.debt<=0)return alert('Khách hàng này đã thu đủ tiền. Phiếu thu được lưu trong lịch sử đã tất toán.');resetReceiptForm();$('receiptCustomer').value=id;$('receiptDate').value=today();if(d&&d.debt>0)$('receiptAmount').value=d.debt;showPage('debts');setTimeout(()=>$('receiptAmount')?.focus(),0)};window.openReceiptForm=()=>{resetReceiptForm();showPage('debts');setTimeout(()=>$('receiptCustomer')?.focus(),0)}
window.saveReceipt=async()=>{let cid=$('receiptCustomer').value,amount=+$('receiptAmount').value||0;if(!cid||!amount)return alert('Chọn khách và nhập số tiền');let d=calcDebtRows().find(x=>x.customer.id===cid);if(d&&d.debt<=0&&!editingReceipt)return alert('Khách hàng này đã thu đủ tiền, không còn công nợ phải thu.');if(d&&amount>d.debt&&!confirm(`Số tiền thu ${money(amount)} lớn hơn công nợ còn lại ${money(d.debt)}. Vẫn lưu phiếu thu?`))return;let c=data.customers.find(x=>x.id===cid)||{};let o={customerId:cid,customerCode:ensureCustomerCode(c),customerName:c.name||'',amount,date:$('receiptDate').value||today(),note:$('receiptNote').value||'',updatedAt:serverTimestamp()};if(editingReceipt){await updateDoc(doc(db,'receipts',editingReceipt),o);await logAction('Sửa phiếu thu',o.customerName+' '+o.amount)}else{await addDoc(col('receipts'),{code:nextCode('PT',data.receipts),...o,createdAt:serverTimestamp()});await logAction('Thêm phiếu thu',o.customerName+' '+o.amount)}resetReceiptForm();await loadAll();await updatePaymentStatusesForCustomer(cid);await loadAll()}
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
window.printReceipt=id=>{let r=data.receipts.find(x=>x.id===id);if(!r)return alert('Không tìm thấy phiếu thu');let c=data.customers.find(x=>x.id===r.customerId)||{};let html=`<div class="print-a5"><h2 style="text-align:center">PHIẾU THU</h2><p style="text-align:center;line-height:1.45"><b>SIMILOCK ĐÀ NẴNG</b><br>223 Trường Chinh, P. An Khê, TP. Đà Nẵng<br>403 Nguyễn Thái Bình, P. Bảy Hiền, TP.HCM<br>Hotline: 0902950816</p><hr><p><b>Mã phiếu thu:</b> ${r.code||''} &nbsp; <b>Ngày:</b> ${r.date||''}<br><b>Mã KH:</b> ${r.customerCode||ensureCustomerCode(c)||''}<br><b>Khách hàng:</b> ${r.customerName||c.name||''}<br><b>Số tiền thu:</b> ${money(r.amount)}<br><b>Bằng chữ:</b> ${numberToVietnamese(r.amount)}<br><b>Ghi chú:</b> ${r.note||''}</p><div style="display:flex;justify-content:space-between;text-align:center;margin-top:50px"><div>Người nộp tiền<br><br><br></div><div>Người thu tiền<br><br><br></div></div></div>`;doPrint(html)}
function renderReceipts(){$('receiptTable').innerHTML=data.receipts.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(r=>`<tr><td>${r.code||''}</td><td>${r.date||''}</td><td>${r.customerCode||''}</td><td>${r.customerName||''}</td><td>${money(r.amount)}</td><td>${r.note||''}</td><td><button class="btn ghost" onclick="printReceipt('${r.id}')">In</button> <button class="btn ghost" onclick="editReceipt('${r.id}')">Sửa</button> <button class="btn danger" onclick="removeDoc('receipts','${r.id}')">Xóa</button></td></tr>`).join('')||'<tr><td colspan="7">Chưa có phiếu thu</td></tr>'}

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
  if(ths[2]) ths[2].textContent=isCheck?'Tồn thực tế':(isTransfer?'Số lượng chuyển':(type==='OUT'?'Số lượng xuất':(type==='ADJUST'?'SL điều chỉnh (+/-)':'Số lượng nhập')));
  if(ths[4]) ths[4].textContent=isCheck?'Ghi chú kiểm kê':(isTransfer?'Ghi chú chuyển kho':(type==='OUT'?'Lý do xuất':(type==='ADJUST'?'Lý do điều chỉnh':'Ghi chú')));
  document.querySelectorAll('#stockItems tr td:nth-child(3) input').forEach(inp=>{ if(type==='ADJUST') inp.removeAttribute('min'); else inp.setAttribute('min','0'); });
}
window.addStockItem=(it={})=>{let tr=document.createElement('tr');tr.innerHTML=`<td><select onchange="stockProductChanged(this)"><option value="">Chọn model</option>${data.products.map(p=>`<option value="${p.code}" ${p.code===it.code?'selected':''}>${p.code}</option>`).join('')}</select></td><td><input value="${it.name||''}" readonly></td><td><input type="number" value="${it.actualQty??it.inputQty??it.qty??1}"></td><td><input class="view-cost" type="number" value="${it.cost||0}"></td><td><input value="${it.note||''}"></td><td><button class="btn danger" onclick="this.closest('tr').remove()">X</button></td>`;$('stockItems').appendChild(tr);applyPermissions();updateStockHeader()}
window.stockProductChanged=sel=>{let p=data.products.find(x=>x.code===sel.value)||{};let tr=sel.closest('tr');tr.children[1].querySelector('input').value=p.name||'';tr.children[3].querySelector('input').value=p.cost||0;}
function stockItems(){return [...$('stockItems').querySelectorAll('tr')].map(tr=>({code:tr.children[0].querySelector('select').value,name:tr.children[1].querySelector('input').value,inputQty:+tr.children[2].querySelector('input').value||0,cost:+tr.children[3].querySelector('input').value||0,note:tr.children[4].querySelector('input').value})).filter(x=>x.code)}
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
function renderStock(){$('stockVoucherTable').innerHTML=data.stockVouchers.filter(canAccessVoucher).sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(v=>`<tr><td>${v.code}</td><td>${v.date}</td><td>${stockTypeName(v.type)}</td><td>${v.type==='TRANSFER'?`${v.fromWarehouse||v.warehouse||''} → ${v.toWarehouse||''}`:voucherWarehouse(v)}</td><td>${(v.items||[]).length}</td><td>${has('viewCost')?money(v.value):'Ẩn'}</td><td><button class="btn ghost" onclick="printStock('${v.id}')">In A5</button> ${has('editStock')?`<button class="btn ghost" onclick="editStock('${v.id}')">Sửa</button>`:''} ${has('deleteStock')?`<button class="btn danger" onclick="removeDoc('stockVouchers','${v.id}')">Xóa</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7">Không có chứng từ thuộc kho được phân quyền</td></tr>'}
window.editStock=id=>{let v=data.stockVouchers.find(x=>x.id===id);if(!canAccessVoucher(v))return alert('Bạn không có quyền xem/sửa phiếu kho này');if(stockVoucherLocked(v)&&currentPerm.role!=='Admin')return alert('Phiếu kho đã liên kết đơn bán/đã khóa. Chỉ Admin được sửa.');editingStock=id;$('stockCode').value=v.code;$('stockDate').value=v.date;$('stockType').value=v.type;$('stockWarehouse').value=v.fromWarehouse||v.warehouse||'';if($('stockToWarehouse'))$('stockToWarehouse').value=v.toWarehouse||'Kho Văn Phòng';$('stockNote').value=v.note||'';$('stockItems').innerHTML='';(v.items||[]).forEach(addStockItem);updateStockHeader();showPage('inventory')}
window.printStock=id=>{let v=data.stockVouchers.find(x=>x.id===id);if(!canAccessVoucher(v))return alert('Bạn không có quyền in phiếu kho này');let title=stockTypeName(v.type).toUpperCase();let isCheck=v.type==='CHECK';let isTransfer=v.type==='TRANSFER';let isAdjust=v.type==='ADJUST';let html=`<div class="print-a5">${printHeader(title)}<p><b>Mã phiếu:</b> ${v.code} &nbsp; <b>Ngày:</b> ${v.date}<br>${isTransfer?`<b>Kho nguồn:</b> ${v.fromWarehouse||v.warehouse||''} &nbsp; <b>Kho đích:</b> ${v.toWarehouse||''}`:`<b>Kho:</b> ${v.warehouse||''}`}<br><b>Liên kết đơn bán:</b> ${v.saleCode||''}<br><b>Lý do/Ghi chú:</b> ${v.note||''}</p><table><thead><tr><th>STT</th><th>Model</th><th>Tên SP</th>${isCheck||isAdjust?'<th>Tồn trước</th><th>Điều chỉnh/Thực tế</th><th>Tồn sau</th>':'<th>SL</th><th>Ghi chú</th>'}</tr></thead><tbody>${(v.items||[]).map((it,i)=>{if(isCheck){return `<tr><td>${i+1}</td><td>${it.code}</td><td>${it.name}</td><td>${it.systemQty??''}</td><td>${it.actualQty??''}</td><td>${(it.systemQty??0)+(+it.qty||0)}</td></tr>`}if(isAdjust){let before=stockOf(it.code,v.id,voucherWarehouse(v));let after=before+(+it.qty||0);return `<tr><td>${i+1}</td><td>${it.code}</td><td>${it.name}</td><td>${before}</td><td>${it.qty}</td><td>${after}<br><small>${it.note||''}</small></td></tr>`}return `<tr><td>${i+1}</td><td>${it.code}</td><td>${it.name}</td><td>${it.qty}</td><td>${it.note||''}</td></tr>`}).join('')}</tbody></table>${has('viewCost')?`<p style="text-align:right"><b>Giá trị:</b> ${money(v.value)}</p>`:''}<div style="display:flex;justify-content:space-between;text-align:center;margin-top:35px"><div>Người lập<br><br><br></div><div>Người giao/Thủ kho<br><br><br></div><div>Người nhận<br><br><br></div></div></div>`;doPrint(html)}
function renderStockBook(){
  const ledgerBody=$('stockLedgerTable');
  if(ledgerBody){ledgerBody.innerHTML=stockLedgerRows().slice(0,300).map(r=>`<tr><td>${r.date||''}</td><td>${r.code||''}</td><td>${r.type||''}</td><td>${r.warehouse||''}</td><td>${r.product||''}</td><td>${r.name||''}</td><td><b>${r.qty>0?'+':''}${r.qty}</b></td><td>${r.note||''}</td></tr>`).join('')||'<tr><td colspan="8">Chưa có phát sinh kho</td></tr>'}
  const allowed=userWarehouses();
  const showMain=allowed.includes('Kho Chính');
  const showOffice=allowed.includes('Kho Văn Phòng');
  const head=document.querySelector('#stockbook thead tr');
  if(head)head.innerHTML=`<th>Model</th><th>Sản phẩm</th><th>Nhập</th><th>Xuất</th><th>Chuyển kho</th><th>Điều chỉnh</th>${showMain?'<th>Kho Chính</th>':''}${showOffice?'<th>Kho Văn Phòng</th>':''}<th>Tổng tồn được xem</th>`;
  $('stockBookTable').innerHTML=data.products.map(p=>{
    let totalIn=0,totalOut=0,totalAdj=0,totalTransfer=0,byWh={};WAREHOUSES.forEach(w=>byWh[w]=0);
    data.stockVouchers.forEach(v=>(v.items||[]).forEach(it=>{
      if(it.code!==p.code)return; const q=+it.qty||0;
      if(v.type==='TRANSFER'){
        const from=v.fromWarehouse||v.warehouse||'Kho Chính', to=v.toWarehouse||'Kho Văn Phòng';
        if(canAccessWarehouse(from)||canAccessWarehouse(to))totalTransfer+=q;
        byWh[from]=(byWh[from]||0)-q; byWh[to]=(byWh[to]||0)+q;
      }else{
        const w=voucherWarehouse(v);
        if(!canAccessWarehouse(w))return;
        if(v.type==='IN'){totalIn+=q;byWh[w]=(byWh[w]||0)+q}
        else if(v.type==='OUT'){totalOut+=q;byWh[w]=(byWh[w]||0)-q}
        else{totalAdj+=q;byWh[w]=(byWh[w]||0)+q}
      }
    }));
    const total=allowed.reduce((a,w)=>a+(byWh[w]||0),0);
    return`<tr><td>${p.code}</td><td>${p.name}</td><td>${totalIn}</td><td>${totalOut}</td><td>${totalTransfer}</td><td>${totalAdj}</td>${showMain?`<td><b>${byWh['Kho Chính']||0}</b></td>`:''}${showOffice?`<td><b>${byWh['Kho Văn Phòng']||0}</b></td>`:''}<td><b>${total}</b></td></tr>`
  }).join('')
}


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
    const cost=costFor(code,s.date||today())*(+it.qty||0);
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
  if($('warehouseAccessBox'))$('warehouseAccessBox').innerHTML=WAREHOUSES.map(w=>`<label><input type="checkbox" value="${w}"> ${w}</label>`).join('');
  $('permissionTable').innerHTML=data.users.map(u=>`<tr><td>${u.email||''}<br><small>UID: ${u.id}</small></td><td>${u.name||''}</td><td>${u.role||''}</td><td>${(u.perms||[]).map(p=>permLabels[p]||p).join(', ')}</td><td>${(u.warehouseAccess||[]).join(', ')||'Không giới hạn/Chưa chọn'}</td><td><button class="btn ghost" onclick="editPermission('${u.id}')">Sửa</button></td></tr>`).join('')
}
$('uRole')?.addEventListener('change',()=>{const role=$('uRole').value;document.querySelectorAll('#permBox input').forEach(i=>i.checked=(permissionMap[role]||[]).includes(i.value));document.querySelectorAll('#warehouseAccessBox input').forEach(i=>{i.checked=role==='Admin'||(role==='Kho Chính'&&i.value==='Kho Chính')||(role==='Kho Văn Phòng'&&i.value==='Kho Văn Phòng')})});
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
  document.querySelectorAll('#permBox input').forEach(i=>i.checked=(u.perms||[]).includes(i.value));
  document.querySelectorAll('#warehouseAccessBox input').forEach(i=>i.checked=((u.warehouseAccess||[]).includes(i.value) || u.role==='Admin'))
}


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
function doPrint(html){let w=window.open('','PRINT','width=800,height=900');w.document.write(`<!doctype html><html><head><title>In phiếu</title><style>body{font-family:Arial;margin:0;color:#111}.print-a5{width:148mm;min-height:210mm;padding:8mm;font-size:12px;box-sizing:border-box}table{width:100%;border-collapse:collapse;margin-top:6px}th,td{border:1px solid #222;padding:5px;text-align:left;vertical-align:top}th{background:#f1f5f9}p{line-height:1.45}.print-a5 h2{font-size:18px}@page{size:A5;margin:0}</style></head><body>${html}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script></body></html>`);w.document.close()}

function excelReady(){return !!window.XLSX}
function assertExcel(){if(!excelReady())throw new Error('Thư viện Excel chưa tải xong. Kiểm tra Internet hoặc tải lại trang.');}
const excelSchemas={
  customers:{sheet:'Khach_hang',headers:['customerCode','name','type','phone','address','discount','openingDebt'],sample:[{customerCode:'KL0902950816',name:'Nguyễn Văn A',type:'Khách lẻ',phone:'0902950816',address:'Đà Nẵng',discount:0,openingDebt:0}]},
  products:{sheet:'San_pham',headers:['code','name','category','cost','price','minStock'],sample:[{code:'F07',name:'Khóa thông minh F07',category:'Khóa thông minh',cost:950000,price:1850000,minStock:3}]},
  prices:{sheet:'Bang_gia',headers:['code','type','price','validFrom','validTo','active','note'],sample:[{code:'F07',type:'Khách lẻ',price:1850000,validFrom:today(),validTo:'',active:true,note:'Giá bán lẻ'}]},
  costPrices:{sheet:'Bang_gia_von',headers:['code','cost','validFrom','validTo','active','note'],sample:[{code:'F07',cost:950000,validFrom:today(),validTo:'',active:true,note:'Giá vốn tháng hiện hành'}]},
  staff:{sheet:'Nhan_vien',headers:['name','dept','phone','commissionPercent','techFee'],sample:[{name:'Nguyễn Sale',dept:'Sale',phone:'0900000001',commissionPercent:5,techFee:0},{name:'Lê Kỹ Thuật',dept:'Kỹ thuật',phone:'0900000002',commissionPercent:0,techFee:100000}]},
  expenses:{sheet:'Chi_phi',headers:['date','category','amount','note'],sample:[{date:today(),category:'Chi lương cố định',amount:8000000,note:'Lương tháng'}]},
  warranties:{sheet:'Bao_hanh',headers:['saleId','customer','phone','serial','start','months','end','status','note'],sample:[{saleId:'',customer:'Nguyễn Văn A',phone:'0902950816',serial:'F07-001',start:today(),months:24,end:'',status:'Còn bảo hành',note:''}]},
  stockVouchers:{sheet:'Chung_tu_kho',headers:['code','date','type','warehouse','productCode','productName','qty','cost','note'],sample:[{code:'NK000001',date:today(),type:'IN',warehouse:defaultWarehouse(),productCode:'F07',productName:'Khóa thông minh F07',qty:10,cost:950000,note:'Nhập kho'}]},
  sales:{sheet:'Ban_hang',headers:['code','date','customerCode','customerName','customerPhone','staffName','techName','grand','paid','debt','commissionPercent','saleCommission','techCost','profit','itemsJson','note'],sample:[{code:'BH000001',date:today(),customerCode:'KL0902950816',customerName:'Nguyễn Văn A',customerPhone:'0902950816',staffName:'Nguyễn Sale',techName:'Lê Kỹ Thuật',grand:1850000,paid:1850000,debt:0,commissionPercent:5,saleCommission:85648,techCost:100000,profit:577315,itemsJson:'[{"code":"F07","name":"Khóa thông minh F07","qty":1,"price":1850000,"discount":0}]',note:''}]},
  commissions:{sheet:'Hoa_hong',headers:['date','code','customer','saleStaff','techStaff','grand','commissionPercent','saleCommission','techCost','totalCommission'],sample:[]},
  stockbook:{sheet:'So_kho',headers:['code','name','inQty','outQty','transferQty','adjustQty','khoChinh','khoVanPhong','stock'],sample:[]}
};
function exportRows(type){let rows=[];
  if(type==='customers')rows=data.customers.map(c=>({customerCode:ensureCustomerCode(c),name:c.name,type:c.type,phone:c.phone,address:c.address,discount:c.discount,openingDebt:c.openingDebt}));
  if(type==='products')rows=data.products.map(p=>({code:p.code,name:p.name,category:p.category,cost:p.cost,price:p.price,minStock:p.minStock,stock:stockOf(p.code)}));
  if(type==='prices')rows=data.prices.map(p=>({code:p.code,type:p.type,price:p.price,validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||''}));
  if(type==='costPrices')rows=(data.costPrices||[]).map(p=>({code:p.code,cost:p.cost,validFrom:p.validFrom||'',validTo:p.validTo||'',active:String(p.active)!=='false',note:p.note||''}));
  if(type==='staff')rows=data.staff.map(e=>({name:e.name,dept:e.dept,phone:e.phone,commissionPercent:e.commissionPercent||0,techFee:e.techFee||0}));
  if(type==='expenses')rows=data.expenses.map(e=>({date:e.date,category:e.category,amount:e.amount,note:e.note}));
  if(type==='warranties')rows=data.warranties.map(w=>({saleId:w.saleId||'',customer:w.customer,phone:w.phone,serial:w.serial,start:w.start,months:w.months,end:w.end,status:w.status,note:w.note}));
  if(type==='stockVouchers')rows=data.stockVouchers.flatMap(v=>(v.items||[]).map(it=>({code:v.code,date:v.date,type:v.type,warehouse:voucherWarehouse(v),productCode:it.code,productName:it.name,qty:it.actualQty??it.inputQty??it.qty,cost:it.cost,note:it.note||v.note||''})));
  if(type==='sales')rows=data.sales.map(s=>({code:s.code,date:s.date,customerCode:s.customerCode||'',customerName:s.customerName,customerPhone:s.customerPhone||'',staffName:s.staffName,techName:s.techName,grand:s.grand,paid:s.paid,debt:s.debt,commissionPercent:s.commissionPercent,saleCommission:s.saleCommission,techCost:s.techCost,profit:s.profit,itemsJson:JSON.stringify(s.items||[]),note:s.note||''}));
  if(type==='commissions')rows=data.sales.map(s=>({date:s.date,code:s.code,customer:s.customerName,saleStaff:s.staffName,techStaff:s.techName,grand:s.grand,commissionPercent:s.commissionPercent,saleCommission:s.saleCommission,techCost:s.techCost,totalCommission:(+s.saleCommission||0)+(+s.techCost||0)}));
  if(type==='stockbook')rows=data.products.map(p=>({code:p.code,name:p.name,inQty:stockQtyByType(p.code,'IN'),outQty:Math.abs(stockQtyByType(p.code,'OUT')),transferQty:stockQtyByType(p.code,'TRANSFER'),adjustQty:stockQtyByType(p.code,'ADJUST')+stockQtyByType(p.code,'CHECK'),khoChinh:canAccessWarehouse('Kho Chính')?stockOf(p.code,'','Kho Chính'):'Ẩn',khoVanPhong:canAccessWarehouse('Kho Văn Phòng')?stockOf(p.code,'','Kho Văn Phòng'):'Ẩn',stock:userWarehouses().reduce((a,w)=>a+stockOf(p.code,'',w),0)}));
  return rows;
}
function stockQtyByType(code,type){let q=0;data.stockVouchers.forEach(v=>{if(v.type!==type)return;(v.items||[]).forEach(it=>{if(it.code===code)q+=+it.qty||0})});return q}
function makeWorkbook(sheets){assertExcel();const wb=XLSX.utils.book_new();Object.entries(sheets).forEach(([name,rows])=>{const ws=XLSX.utils.json_to_sheet(rows.length?rows:[{}]);XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));});return wb;}
window.exportExcel=(type)=>{try{const schema=excelSchemas[type]||{sheet:type};const rows=exportRows(type);const wb=makeWorkbook({[schema.sheet||type]:rows.length?rows:(schema.sample||[])});XLSX.writeFile(wb,`${type}_${today()}.xlsx`);}catch(err){alert(err.message)}};
window.downloadTemplateExcel=(type)=>{try{const schema=excelSchemas[type];if(!schema)return alert('Chưa có mẫu Excel cho mục này');const sample=schema.sample?.length?schema.sample:[Object.fromEntries(schema.headers.map(h=>[h,'']))];const wb=makeWorkbook({[schema.sheet]:sample});XLSX.writeFile(wb,`mau_import_${type}.xlsx`);}catch(err){alert(err.message)}};
window.exportAllExcel=()=>{try{const sheets={};['customers','products','prices','staff','sales','stockVouchers','expenses','warranties','commissions','stockbook'].forEach(t=>{sheets[excelSchemas[t]?.sheet||t]=exportRows(t)});const wb=makeWorkbook(sheets);XLSX.writeFile(wb,`Similock_Da_Nang_Toan_bo_${today()}.xlsx`);}catch(err){alert(err.message)}};
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
        obj.category=obj.category||'Khóa thông minh';obj.cost=safeNum(obj.cost);obj.price=safeNum(obj.price);obj.minStock=safeNum(obj.minStock)||3;
        if(existingByCode.has(obj.code)) await updateDoc(doc(db,'products',existingByCode.get(obj.code).id),obj);
        else await addDoc(col('products'),{...obj,createdAt:serverTimestamp()});
      }else if(type==='prices'){
        obj.code=String(obj.code||'').trim().toUpperCase();obj.type=obj.type||'Khách lẻ';obj.price=safeNum(obj.price);obj.validFrom=String(obj.validFrom||'');obj.validTo=String(obj.validTo||'');obj.active=String(obj.active).toLowerCase()!=='false';obj.note=obj.note||'';
        if(!obj.code||!obj.price){skip++;errors.push(`Dòng ${r+2}: thiếu model/giá`);continue}
        if(!validateDate(obj.validFrom)||!validateDate(obj.validTo)){skip++;errors.push(`Dòng ${r+2}: sai định dạng ngày YYYY-MM-DD`);continue}
        if(obj.validFrom&&obj.validTo&&obj.validFrom>obj.validTo){skip++;errors.push(`Dòng ${r+2}: ngày bắt đầu lớn hơn ngày kết thúc`);continue}
        const key=`${obj.code}|${obj.type}|${obj.validFrom}|${obj.validTo}`;
        if(existingPriceKey.has(key)) await updateDoc(doc(db,'prices',existingPriceKey.get(key).id),obj);
        else await addDoc(col('prices'),{...obj,createdAt:serverTimestamp()});
      }else if(type==='staff'){
        obj.name=String(obj.name||'').trim();obj.dept=obj.dept||obj.department||'Sale';obj.phone=String(obj.phone||'').trim();obj.commissionPercent=safeNum(obj.commissionPercent);obj.techFee=safeNum(obj.techFee);
        if(!obj.name){skip++;errors.push(`Dòng ${r+2}: thiếu tên nhân viên`);continue}
        if(obj.dept==='Kỹ thuật'){obj.commissionPercent=0;if(!obj.techFee)obj.techFee=100000}else if(obj.dept==='Sale'||obj.dept==='Quản lý'){if(!obj.commissionPercent)obj.commissionPercent=5;obj.techFee=0}else{obj.commissionPercent=0;obj.techFee=0}
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
        const o={code:String(obj.code||obj.productCode||'').trim().toUpperCase(),cost:safeNum(obj.cost),validFrom:String(obj.validFrom||''),validTo:String(obj.validTo||''),active:String(obj.active).toLowerCase()!=='false',note:obj.note||'',createdAt:serverTimestamp()};
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
        const grand=safeNum(obj.grand)||items.reduce((a,it)=>a+(+it.qty||0)*(+it.price||0)*(1-(+it.discount||0)/100),0);
        const o={code:obj.code||nextCode('BH',data.sales),date:String(obj.date||today()),customerCode:obj.customerCode||customerCodeFromPhone(obj.customerPhone),customerName:obj.customerName||'',customerPhone:obj.customerPhone||'',staffName:obj.staffName||'',techName:obj.techName||'',items,grand,paid:safeNum(obj.paid),debt:safeNum(obj.debt)||grand-safeNum(obj.paid),commissionPercent:safeNum(obj.commissionPercent),saleCommission:safeNum(obj.saleCommission),techCost:safeNum(obj.techCost),profit:safeNum(obj.profit),note:obj.note||'',createdAt:serverTimestamp()};
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
  const pack={exportedAt:new Date().toISOString(),customers:data.customers,products:data.products,prices:data.prices,staff:data.staff,sales:data.sales,stockVouchers:data.stockVouchers,receipts:data.receipts,warranties:data.warranties,expenses:data.expenses,users:data.users};
  let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(pack,null,2)],{type:'application/json'}));a.download='similock-da-nang-backup-'+today()+'.json';a.click()
}


async function deleteCollectionDocs(collectionName){
  const snap=await getDocs(col(collectionName));
  for(const d of snap.docs){ await deleteDoc(doc(db,collectionName,d.id)); }
  return snap.size;
}
window.clearAllData=async()=>{
  if(!has('system')&&!has('audit')) return alert('Chỉ Admin mới được Clear Data');
  const first=confirm('⚠️ CẢNH BÁO LẦN 1\n\nBạn sắp xóa toàn bộ dữ liệu vận hành của hệ thống. Hành động này không thể hoàn tác.\n\nTiếp tục?');
  if(!first) return;
  const confirmText=prompt('⚠️ XÁC NHẬN LẦN 2\n\nNhập đúng: XOA_TOAN_BO_DU_LIEU');
  if(confirmText!=='XOA_TOAN_BO_DU_LIEU') return alert('Đã hủy. Mã xác nhận không đúng.');
  const password=prompt('🔐 Nhập mật khẩu Admin để xác thực lần cuối:');
  if(!password) return alert('Đã hủy. Chưa nhập mật khẩu Admin.');
  try{
    const credential=EmailAuthProvider.credential(auth.currentUser.email,password);
    await reauthenticateWithCredential(auth.currentUser,credential);
    const collectionsToClear=['customers','products','prices','costPrices','staff','sales','stockVouchers','receipts','warranties','expenses','logs'];
    let result=[];
    for(const name of collectionsToClear){
      const count=await deleteCollectionDocs(name);
      result.push(`${name}: ${count}`);
    }
    await logAction('Clear Data','Đã xóa dữ liệu vận hành: '+result.join(', '));
    await loadAll();
    alert('Đã Clear Data thành công. Không xóa users/settings/roles/permissions.');
  }catch(e){
    alert('Clear Data thất bại: '+authMsg(e));
  }
}
