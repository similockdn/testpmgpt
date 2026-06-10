import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);
const $ = id => document.getElementById(id), money = n => (Number(n)||0).toLocaleString('vi-VN') + 'đ';
const pages = ['dashboard','customers','products','pricelist','sales','inventory','stockvouchers','staff','expenses','users'];
const perms = { dashboard:'Dashboard', customers:'Khách hàng', products:'Sản phẩm', pricelist:'Bảng giá', sales:'Bán hàng', inventory:'Kho hàng', stockvouchers:'Phiếu kho', staff:'Nhân viên', expenses:'Chi phí', users:'Phân quyền', viewCost:'Xem giá vốn/lợi nhuận' };
let me = null, myPerm = {}, data = {customers:[],products:[],prices:[],orders:[],staff:[],expenses:[],users:[],vouchers:[]};

function code(prefix){ return prefix + '-' + new Date().toISOString().slice(0,10).replaceAll('-','') + '-' + Math.floor(Math.random()*9000+1000); }
function show(page){ pages.forEach(p=>$(p).classList.toggle('active',p===page)); document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page)); }
function can(p){ return me?.isAdmin || myPerm[p]; }
function applyPerm(){
  pages.forEach(p=>{ const b=document.querySelector(`button[data-page="${p}"]`); if(b) b.style.display=can(p)?'block':'none'; });
  document.querySelectorAll('.view-cost').forEach(el=>el.classList.toggle('hidden',!can('viewCost')));
  show(pages.find(can) || 'dashboard');
}
async function loadAll(){
  for(const name of ['customers','products','prices','orders','staff','expenses','users','vouchers']){
    const snap = await getDocs(query(collection(db,name), orderBy('createdAt','desc'))).catch(()=>getDocs(collection(db,name)));
    data[name]=snap.docs.map(d=>({id:d.id,...d.data()}));
  }
  renderAll(); applyPerm();
}
function opts(id, arr, label){ $(id).innerHTML = arr.map(x=>`<option value="${x.id}">${label(x)}</option>`).join(''); }
function productById(id){return data.products.find(x=>x.id===id)} function customerById(id){return data.customers.find(x=>x.id===id)} function staffById(id){return data.staff.find(x=>x.id===id)}
function renderAll(){ renderCustomers(); renderProducts(); renderPrices(); renderStaff(); renderExpenses(); renderOrders(); renderInventory(); renderVouchers(); renderUsers(); renderDashboard(); fillSelects(); }
function fillSelects(){ opts('sCustomer',data.customers,x=>`${x.name} - ${x.type}`); opts('sProduct',data.products,x=>`${x.code} - ${x.name}`); opts('iProduct',data.products,x=>`${x.code} - ${x.name}`); opts('plProductCode',data.products,x=>`${x.code} - ${x.name}`); opts('sStaff',data.staff,x=>`${x.name} - ${x.dept}`); }

$('loginBtn').onclick=()=>signInWithEmailAndPassword(auth,$('email').value,$('password').value).catch(e=>alert(e.message));
$('logoutBtn').onclick=()=>signOut(auth);
$('setupAdminBtn').onclick=async()=>{ const email=$('email').value.trim(); const pass=$('password').value; const cred=await createUserWithEmailAndPassword(auth,email,pass); await setDoc(doc(db,'users',cred.user.uid),{email,name:'Admin',role:'Admin',isAdmin:true,permissions:Object.fromEntries(Object.keys(perms).map(k=>[k,true])),createdAt:serverTimestamp()}); alert('Đã tạo Admin'); };
$('signupStaffBtn').onclick=async()=>{ const email=$('email').value.trim(); const pass=$('password').value; const allowed = data.users.find(u=>u.email===email); if(!allowed) return alert('Tài khoản chưa được Admin phân quyền.'); const cred=await createUserWithEmailAndPassword(auth,email,pass); await setDoc(doc(db,'users',cred.user.uid),{...allowed,createdAt:serverTimestamp()}); alert('Đã tạo tài khoản nhân viên'); };
onAuthStateChanged(auth, async user=>{ if(!user){$('loginPage').style.display='flex';$('appPage').style.display='none';return;} const us=await getDoc(doc(db,'users',user.uid)); if(!us.exists()){alert('Tài khoản chưa được phân quyền.'); await signOut(auth); return;} me={uid:user.uid,...us.data()}; myPerm=me.permissions||{}; $('currentUser').innerText=`${me.name||user.email} (${me.role||''})`; $('loginPage').style.display='none'; $('appPage').style.display='block'; await loadAll(); });
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.page));

$('addCustomerBtn').onclick=async()=>{ await addDoc(collection(db,'customers'),{name:$('cName').value,type:$('cType').value,phone:$('cPhone').value,address:$('cAddress').value,discount:+$('cDiscount').value||0,createdAt:serverTimestamp()}); await loadAll(); };
function renderCustomers(){ $('customerTable').innerHTML=data.customers.map(x=>`<tr><td>${x.name||''}</td><td>${x.type||''}</td><td>${x.phone||''}</td><td>${x.address||''}</td><td>${x.discount||0}%</td><td><button class="danger" onclick="del('customers','${x.id}')">Xóa</button></td></tr>`).join(''); }

$('addProductBtn').onclick=async()=>{ await addDoc(collection(db,'products'),{code:$('pCode').value.trim(),name:$('pName').value,category:$('pCategory').value,unit:$('pUnit').value,cost:+$('pCost').value||0,price:+$('pPrice').value||0,stock:+$('pStock').value||0,createdAt:serverTimestamp()}); await loadAll(); };
function renderProducts(){ $('productTable').innerHTML=data.products.map(x=>`<tr><td>${x.code}</td><td>${x.name}</td><td>${x.category||''}</td><td>${x.unit||'Bộ'}</td><td class="view-cost">${money(x.cost)}</td><td>${money(x.price)}</td><td>${x.stock||0}</td><td><button class="danger" onclick="del('products','${x.id}')">Xóa</button></td></tr>`).join(''); }

$('addPriceBtn').onclick=async()=>{ const p=productById($('plProductCode').value); await addDoc(collection(db,'prices'),{productId:p.id,code:p.code,customerType:$('plCustomerType').value,price:+$('plPrice').value||0,createdAt:serverTimestamp()}); await loadAll(); };
function renderPrices(){ $('priceTable').innerHTML=data.prices.map(x=>`<tr><td>${x.code}</td><td>${x.customerType}</td><td>${money(x.price)}</td><td><button class="danger" onclick="del('prices','${x.id}')">Xóa</button></td></tr>`).join(''); }

$('sCustomer').onchange=$('sProduct').onchange=()=>{ const c=customerById($('sCustomer').value), p=productById($('sProduct').value); if(!p) return; const pl=data.prices.find(x=>x.productId===p.id && x.customerType===c?.type); $('sPrice').value=pl?.price||p.price||0; $('sDiscount').placeholder=`Theo khách: ${c?.discount||0}%`; };
$('createOrderBtn').onclick=async()=>{
  const c=customerById($('sCustomer').value), p=productById($('sProduct').value), st=staffById($('sStaff').value); if(!c||!p) return alert('Chọn khách và sản phẩm');
  const qty=+$('sQty').value||1, price=+$('sPrice').value||0, disc= $('sDiscount').value==='' ? (+c.discount||0) : (+$('sDiscount').value||0);
  const sub=qty*price, discount=sub*disc/100, after=sub-discount, rate=+$('sVatRate').value||0; let vat=0,total=after;
  if($('sVatMode').value==='add'){ vat=after*rate/100; total=after+vat; } if($('sVatMode').value==='included'){ vat=after*rate/(100+rate); total=after; }
  const profit = total - vat - (p.cost||0)*qty - (+$('sCommission').value||0) - (+$('sTech').value||0) - (+$('sOther').value||0);
  const order={no:code('BH'),customerId:c.id,customerName:c.name,customerPhone:c.phone,customerAddress:c.address,productId:p.id,code:p.code,productName:p.name,unit:p.unit||'Bộ',qty,price,discountPercent:disc,discountAmount:discount,vatMode:$('sVatMode').value,vatRate:rate,vat,total,staffId:st?.id||'',staffName:st?.name||'',commission:+$('sCommission').value||0,tech:+$('sTech').value||0,other:+$('sOther').value||0,cost:p.cost||0,profit,note:$('sNote').value,createdAt:serverTimestamp()};
  const ref=await addDoc(collection(db,'orders'),order); await updateDoc(doc(db,'products',p.id),{stock:(+p.stock||0)-qty}); await loadAll(); printSale({...order,id:ref.id});
};
function renderOrders(){ $('orderHead').innerHTML=`<tr><th>Ngày</th><th>Số phiếu</th><th>Khách</th><th>Model</th><th>SL</th><th>Tổng</th><th>VAT</th><th>Sale</th><th class="view-cost">Lợi nhuận</th><th>In</th></tr>`; $('orderTable').innerHTML=data.orders.map(x=>`<tr><td>${fmtDate(x.createdAt)}</td><td>${x.no}</td><td>${x.customerName}</td><td>${x.code}</td><td>${x.qty}</td><td>${money(x.total)}</td><td>${money(x.vat)}</td><td>${x.staffName||''}</td><td class="view-cost">${money(x.profit)}</td><td><button onclick='printSaleById("${x.id}")'>In A5</button></td></tr>`).join(''); }

$('stockMoveBtn').onclick=async()=>{ const p=productById($('iProduct').value); if(!p) return; const type=$('iType').value, qty=+$('iQty').value||0; let stock=+p.stock||0; if(type==='Nhập kho') stock+=qty; else if(type==='Xuất kho') stock-=qty; else stock=qty; const voucher={no:code(type==='Nhập kho'?'NK':type==='Xuất kho'?'XK':'DC'),type,productId:p.id,code:p.code,productName:p.name,unit:p.unit||'Bộ',qty,note:$('iNote').value,stockAfter:stock,createdAt:serverTimestamp()}; const ref=await addDoc(collection(db,'vouchers'),voucher); await updateDoc(doc(db,'products',p.id),{stock}); await loadAll(); printStock({...voucher,id:ref.id}); };
function renderInventory(){ $('stockTable').innerHTML=data.products.map(x=>`<tr><td>${x.code}</td><td>${x.name}</td><td><b>${x.stock||0}</b> ${x.unit||'Bộ'}</td></tr>`).join(''); }
function renderVouchers(){ $('voucherTable').innerHTML=data.vouchers.map(x=>`<tr><td>${fmtDate(x.createdAt)}</td><td>${x.no}</td><td>${x.type}</td><td>${x.code}</td><td>${x.qty}</td><td>${x.note||''}</td><td><button onclick='printStockById("${x.id}")'>In A5</button></td></tr>`).join(''); }

$('addStaffBtn').onclick=async()=>{ await addDoc(collection(db,'staff'),{name:$('eName').value,dept:$('eDept').value,phone:$('ePhone').value,email:$('eEmail').value,createdAt:serverTimestamp()}); await loadAll(); };
function renderStaff(){ $('staffTable').innerHTML=data.staff.map(x=>`<tr><td>${x.name}</td><td>${x.dept}</td><td>${x.phone||''}</td><td>${x.email||''}</td><td><button class="danger" onclick="del('staff','${x.id}')">Xóa</button></td></tr>`).join(''); }
$('addExpenseBtn').onclick=async()=>{ await addDoc(collection(db,'expenses'),{name:$('xName').value,type:$('xType').value,amount:+$('xAmount').value||0,note:$('xNote').value,createdAt:serverTimestamp()}); await loadAll(); };
function renderExpenses(){ $('expenseTable').innerHTML=data.expenses.map(x=>`<tr><td>${fmtDate(x.createdAt)}</td><td>${x.name}</td><td>${x.type}</td><td>${money(x.amount)}</td><td>${x.note||''}</td><td><button class="danger" onclick="del('expenses','${x.id}')">Xóa</button></td></tr>`).join(''); }

function renderUsers(){ $('permBox').innerHTML=Object.entries(perms).map(([k,v])=>`<label><input type="checkbox" data-perm="${k}">${v}</label>`).join(''); $('userTable').innerHTML=data.users.map(x=>`<tr><td>${x.email}</td><td>${x.name||''}</td><td>${x.role||''}</td><td>${x.isAdmin?'ADMIN':Object.keys(x.permissions||{}).filter(k=>x.permissions[k]).join(', ')}</td><td><button class="danger" onclick="del('users','${x.id}')">Xóa</button></td></tr>`).join(''); }
$('saveUserBtn').onclick=async()=>{ const permissions={}; document.querySelectorAll('[data-perm]').forEach(i=>permissions[i.dataset.perm]=i.checked); await addDoc(collection(db,'users'),{email:$('uEmail').value.trim(),name:$('uName').value,role:$('uRole').value,isAdmin:false,permissions,createdAt:serverTimestamp()}); await loadAll(); };

function renderDashboard(){ const revenue=data.orders.reduce((s,x)=>s+(+x.total||0),0), vat=data.orders.reduce((s,x)=>s+(+x.vat||0),0), profit=data.orders.reduce((s,x)=>s+(+x.profit||0),0), stock=data.products.reduce((s,x)=>s+(+x.stock||0),0); $('dashRevenue').innerText=money(revenue); $('dashVat').innerText=money(vat); $('dashProfit').innerText=money(profit); $('dashOrders').innerText=data.orders.length; $('dashStock').innerText=stock; const map={}; data.orders.forEach(o=>{ const k=o.staffName||'Chưa chọn'; map[k]??={orders:0,revenue:0,commission:0,profit:0}; map[k].orders++; map[k].revenue+=+o.total||0; map[k].commission+=+o.commission||0; map[k].profit+=+o.profit||0; }); $('topStaff').innerHTML=Object.entries(map).map(([k,v])=>`<tr><td>${k}</td><td>${v.orders}</td><td>${money(v.revenue)}</td><td>${money(v.commission)}</td><td class="view-cost">${money(v.profit)}</td></tr>`).join(''); }
function fmtDate(ts){ try{return ts?.toDate?.().toLocaleDateString('vi-VN')||''}catch{return ''} }
function printHtml(html){ let box=document.querySelector('.print-only'); if(!box){box=document.createElement('div');box.className='print-only';document.body.appendChild(box)} box.innerHTML=html; window.print(); }
function printSale(o){ printHtml(`<div class="a5"><h2>PHIẾU BÁN HÀNG</h2><div class="center"><b>SIMILOCK ĐÀ NẴNG</b><br>Call/Zalo: 0902950816</div><p><b>Số phiếu:</b> ${o.no}<br><b>Khách hàng:</b> ${o.customerName} - ${o.customerPhone||''}<br><b>Địa chỉ:</b> ${o.customerAddress||''}</p><table><tr><th>Model</th><th>Tên hàng</th><th>SL</th><th>Đơn giá</th><th>TT</th></tr><tr><td>${o.code}</td><td>${o.productName}</td><td>${o.qty}</td><td>${money(o.price)}</td><td>${money(o.qty*o.price)}</td></tr></table><p>Chiết khấu: ${o.discountPercent}% = ${money(o.discountAmount)}<br>VAT: ${o.vatMode==='none'?'Không VAT':o.vatRate+'%'} = ${money(o.vat)}<br><b>Tổng thanh toán: ${money(o.total)}</b></p><p>Ghi chú: ${o.note||''}</p><div class="sign"><div>Khách hàng<br><br><br>................</div><div>Người bán<br><br><br>................</div></div></div>`); }
function printStock(v){ printHtml(`<div class="a5"><h2>PHIẾU ${v.type.toUpperCase()}</h2><div class="center"><b>SIMILOCK ĐÀ NẴNG</b><br>Call/Zalo: 0902950816</div><p><b>Số phiếu:</b> ${v.no}<br><b>Loại phiếu:</b> ${v.type}</p><table><tr><th>Model</th><th>Tên hàng</th><th>SL</th><th>Tồn sau</th></tr><tr><td>${v.code}</td><td>${v.productName}</td><td>${v.qty} ${v.unit}</td><td>${v.stockAfter}</td></tr></table><p>Ghi chú: ${v.note||''}</p><div class="sign"><div>Người lập<br><br><br>................</div><div>Thủ kho<br><br><br>................</div></div></div>`); }
window.printSaleById=id=>printSale(data.orders.find(x=>x.id===id)); window.printStockById=id=>printStock(data.vouchers.find(x=>x.id===id)); window.del=async(col,id)=>{ if(confirm('Xóa dữ liệu này?')){ await deleteDoc(doc(db,col,id)); await loadAll(); } };
