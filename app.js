import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  runTransaction
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const PERMS = [
  ['dashboard','Xem dashboard'],
  ['customers','Quản lý khách hàng'],
  ['products','Quản lý sản phẩm'],
  ['sales','Bán hàng'],
  ['inventory','Kho hàng'],
  ['staff','Nhân viên'],
  ['expenses','Chi phí'],
  ['users','Phân quyền'],
  ['viewCost','Xem giá vốn'],
  ['viewProfit','Xem lợi nhuận'],
  ['delete','Xóa dữ liệu']
];

let currentProfile = null;
let data = {
  customers: [],
  products: [],
  staff: [],
  orders: [],
  expenses: [],
  users: []
};

const $ = id => document.getElementById(id);
const money = n => Number(n || 0).toLocaleString('vi-VN') + ' VNĐ';
const val = id => $(id).value;
const num = id => Number($(id).value) || 0;
const has = perm => currentProfile?.perms?.includes(perm);
const today = () => new Date().toLocaleDateString('vi-VN');

function requirePerm(perm) {
  if (!has(perm)) {
    alert('Tài khoản chưa có quyền này');
    return false;
  }
  return true;
}

function showLogin() {
  $('loginPage').style.display = 'flex';
  $('appPage').style.display = 'none';
}

function showApp() {
  $('loginPage').style.display = 'none';
  $('appPage').style.display = 'block';
}

async function setupAdmin() {
  const email = val('email').trim();
  const password = val('password');
  if (!email || !password) return alert('Nhập email và mật khẩu admin');

  const usersSnap = await getDocs(collection(db, 'users'));
  if (!usersSnap.empty) return alert('Hệ thống đã có user. Vui lòng đăng nhập admin hiện có.');

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const profile = {
    uid: cred.user.uid,
    email,
    name: 'Admin Similock',
    role: 'Admin',
    perms: PERMS.map(p => p[0]),
    createdAt: serverTimestamp()
  };
  await setDoc(doc(db, 'users', cred.user.uid), profile);
  await seedDefaultData();
  alert('Đã tạo Admin. Hệ thống sẽ đăng nhập.');
}

async function signupStaff() {
  const email = val('email').trim();
  const password = val('password');
  if (!email || !password) return alert('Nhập email và mật khẩu');

  const pendingId = email.toLowerCase();
  const pendingRef = doc(db, 'pendingUsers', pendingId);
  const pendingSnap = await getDoc(pendingRef);
  if (!pendingSnap.exists()) {
    return alert('Email này chưa được admin phân quyền. Admin cần vào mục Phân quyền để thêm email trước.');
  }

  const pending = pendingSnap.data();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    name: pending.name || email,
    role: pending.role || 'Nhân viên',
    perms: pending.perms || [],
    createdAt: serverTimestamp()
  });
  await deleteDoc(pendingRef);
  alert('Đã tạo tài khoản nhân viên.');
}

async function login() {
  const email = val('email').trim();
  const password = val('password');
  if (!email || !password) return alert('Nhập email và mật khẩu');
  await signInWithEmailAndPassword(auth, email, password);
}

async function logout() {
  await signOut(auth);
}

async function loadProfile(user) {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) {
    await signOut(auth);
    alert('Tài khoản chưa được phân quyền.');
    return null;
  }
  return snap.data();
}

async function seedDefaultData() {
  const products = [
    {code:'S01', name:'SIMILOCK S01', category:'Khóa cửa nhôm', cost:1500000, price:2350000, stock:10},
    {code:'F07', name:'SIMILOCK F07', category:'Khóa cửa gỗ/composite', cost:1200000, price:1850000, stock:10},
    {code:'569', name:'SIMILOCK 569 WiFi', category:'Khóa cổng/cửa sắt', cost:2200000, price:3350000, stock:5}
  ];
  const customers = [
    {name:'Khách lẻ mặc định', type:'Khách lẻ', phone:'', address:'', discount:0},
    {name:'Đại lý mặc định', type:'Khách đại lý', phone:'', address:'', discount:10},
    {name:'CTV mặc định', type:'CTV', phone:'', address:'', discount:5}
  ];
  const staff = [
    {name:'Sale mặc định', dept:'Sale', phone:''},
    {name:'Kỹ thuật mặc định', dept:'Kỹ thuật', phone:''}
  ];

  for (const item of products) await addDoc(collection(db, 'products'), item);
  for (const item of customers) await addDoc(collection(db, 'customers'), item);
  for (const item of staff) await addDoc(collection(db, 'staff'), item);
}

async function loadCollection(name, orderField = null) {
  try {
    const ref = orderField ? query(collection(db, name), orderBy(orderField, 'desc')) : collection(db, name);
    const snap = await getDocs(ref);
    data[name] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, name));
    data[name] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

async function loadAll() {
  await Promise.all([
    loadCollection('customers'),
    loadCollection('products'),
    loadCollection('staff'),
    loadCollection('orders', 'createdAt'),
    loadCollection('expenses', 'createdAt'),
    loadCollection('users')
  ]);
  renderAll();
}

function applyMenu() {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.classList.toggle('hide', !has(btn.dataset.page));
  });
  document.querySelectorAll('.view-cost').forEach(el => {
    el.style.display = has('viewCost') ? '' : 'none';
  });
}

function showPage(page, btn = null) {
  if (!requirePerm(page)) return;
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  $(page).classList.add('active');
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyMenu();
  renderAll();
}

function firstAllowedPage() {
  const btn = [...document.querySelectorAll('nav button')].find(b => !b.classList.contains('hide'));
  if (btn) showPage(btn.dataset.page, btn);
}

async function addCustomer() {
  if (!requirePerm('customers')) return;
  await addDoc(collection(db, 'customers'), {
    name: val('cName') || 'Chưa đặt tên',
    type: val('cType'),
    phone: val('cPhone'),
    address: val('cAddress'),
    discount: num('cDiscount'),
    createdAt: serverTimestamp()
  });
  await loadAll();
}

async function addProduct() {
  if (!requirePerm('products')) return;
  await addDoc(collection(db, 'products'), {
    code: val('pCode'),
    name: val('pName') || 'Chưa đặt tên',
    category: val('pCategory'),
    cost: num('pCost'),
    price: num('pPrice'),
    stock: num('pStock'),
    createdAt: serverTimestamp()
  });
  await loadAll();
}

async function addStaff() {
  if (!requirePerm('staff')) return;
  await addDoc(collection(db, 'staff'), {
    name: val('eName') || 'Chưa đặt tên',
    dept: val('eDept'),
    phone: val('ePhone'),
    createdAt: serverTimestamp()
  });
  await loadAll();
}

async function addExpense() {
  if (!requirePerm('expenses')) return;
  await addDoc(collection(db, 'expenses'), {
    date: today(),
    name: val('xName'),
    type: val('xType'),
    amount: num('xAmount'),
    note: val('xNote'),
    createdAt: serverTimestamp()
  });
  await loadAll();
}

async function removeDoc(name, id) {
  if (!requirePerm('delete')) return;
  if (!confirm('Xóa dữ liệu này?')) return;
  await deleteDoc(doc(db, name, id));
  await loadAll();
}

function fillPrice() {
  const product = data.products[$('sProduct').selectedIndex];
  if (product) $('sPrice').value = product.price || 0;
}

async function createOrder() {
  if (!requirePerm('sales')) return;
  const customer = data.customers[$('sCustomer').selectedIndex];
  const product = data.products[$('sProduct').selectedIndex];
  const staff = data.staff[$('sStaff').selectedIndex];
  if (!customer || !product) return alert('Thiếu khách hàng hoặc sản phẩm');

  const qty = num('sQty') || 1;
  if ((product.stock || 0) < qty) return alert('Kho không đủ');

  const price = num('sPrice') || product.price || 0;
  const discount = val('sDiscount') === '' ? Number(customer.discount || 0) : num('sDiscount');
  const gross = price * qty;
  const revenue = gross - gross * discount / 100;
  const productCost = Number(product.cost || 0) * qty;
  const commission = num('sCommission');
  const tech = num('sTech');
  const other = num('sOther');
  const totalCost = productCost + commission + tech + other;
  const profit = revenue - totalCost;

  await runTransaction(db, async transaction => {
    const productRef = doc(db, 'products', product.id);
    const productSnap = await transaction.get(productRef);
    const currentStock = productSnap.data().stock || 0;
    if (currentStock < qty) throw new Error('Kho không đủ');

    transaction.update(productRef, { stock: currentStock - qty });
    const orderRef = doc(collection(db, 'orders'));
    transaction.set(orderRef, {
      date: today(),
      customerId: customer.id,
      customerName: customer.name,
      customerType: customer.type,
      productId: product.id,
      productName: product.name,
      qty,
      price,
      discount,
      revenue,
      productCost,
      commission,
      tech,
      other,
      totalCost,
      profit,
      staffId: staff?.id || '',
      staffName: staff?.name || currentProfile.name,
      createdBy: currentProfile.uid,
      createdAt: serverTimestamp()
    });
  });

  await loadAll();
}

async function stockMove() {
  if (!requirePerm('inventory')) return;
  const product = data.products[$('iProduct').selectedIndex];
  if (!product) return;
  const qty = num('iQty');
  const type = val('iType');

  let newStock = product.stock || 0;
  if (type === 'Nhập kho') newStock += qty;
  if (type === 'Xuất kho') newStock -= qty;
  if (type === 'Điều chỉnh tồn') newStock = qty;
  if (newStock < 0) return alert('Tồn kho không được âm');

  await updateDoc(doc(db, 'products', product.id), { stock: newStock });
  await loadAll();
}

async function saveUserPerms() {
  if (!requirePerm('users')) return;
  const email = val('uEmail').trim().toLowerCase();
  if (!email) return alert('Nhập email nhân viên');
  const perms = [...document.querySelectorAll('.perm-check:checked')].map(x => x.value);

  await setDoc(doc(db, 'pendingUsers', email), {
    email,
    name: val('uName') || email,
    role: val('uRole') || 'Nhân viên',
    perms,
    updatedAt: serverTimestamp()
  });
  alert('Đã lưu phân quyền. Nhân viên có thể tạo tài khoản bằng email này.');
  await loadAll();
}

function renderPermBox() {
  $('permBox').innerHTML = PERMS.map(([key, label]) =>
    `<label><input type="checkbox" class="perm-check" value="${key}"> ${label}</label>`
  ).join('');
}

function renderSelects() {
  $('sCustomer').innerHTML = data.customers.map(c => `<option>${c.name} - ${c.type} - CK ${c.discount || 0}%</option>`).join('');
  $('sProduct').innerHTML = data.products.map(p => `<option>${p.name} | tồn ${p.stock || 0}</option>`).join('');
  $('iProduct').innerHTML = data.products.map(p => `<option>${p.name}</option>`).join('');
  $('sStaff').innerHTML = data.staff.map(s => `<option>${s.name} - ${s.dept}</option>`).join('');
}

function renderDashboard() {
  const revenue = data.orders.reduce((s,o) => s + Number(o.revenue || 0), 0);
  const orderProfit = data.orders.reduce((s,o) => s + Number(o.profit || 0), 0);
  const expenses = data.expenses.reduce((s,x) => s + Number(x.amount || 0), 0);
  $('dashRevenue').innerHTML = money(revenue);
  $('dashProfit').innerHTML = has('viewProfit') ? money(orderProfit - expenses) : 'Đã ẩn';
  $('dashOrders').innerHTML = data.orders.length;
  $('dashCustomers').innerHTML = data.customers.length;

  const map = {};
  data.orders.forEach(o => {
    const name = o.staffName || '-';
    map[name] ||= { count: 0, revenue: 0, commission: 0, profit: 0 };
    map[name].count++;
    map[name].revenue += Number(o.revenue || 0);
    map[name].commission += Number(o.commission || 0);
    map[name].profit += Number(o.profit || 0);
  });
  $('topStaff').innerHTML = Object.entries(map).map(([name, x]) =>
    `<tr><td>${name}</td><td>${x.count}</td><td>${money(x.revenue)}</td><td>${money(x.commission)}</td><td>${has('viewProfit') ? money(x.profit) : 'Đã ẩn'}</td></tr>`
  ).join('');
}

function renderTables() {
  $('customerTable').innerHTML = data.customers.map(c =>
    `<tr><td>${c.name}</td><td>${c.type}</td><td>${c.phone || ''}</td><td>${c.address || ''}</td><td>${c.discount || 0}%</td><td>${has('delete') ? `<button class="danger" data-del="customers:${c.id}">X</button>` : ''}</td></tr>`
  ).join('');

  $('productTable').innerHTML = data.products.map(p =>
    `<tr><td>${p.code || ''}</td><td>${p.name}</td><td>${p.category || ''}</td><td class="view-cost">${has('viewCost') ? money(p.cost) : '<span class="hidden-money">Đã ẩn</span>'}</td><td>${money(p.price)}</td><td>${p.stock || 0}</td><td>${has('delete') ? `<button class="danger" data-del="products:${p.id}">X</button>` : ''}</td></tr>`
  ).join('');

  $('orderHead').innerHTML = has('viewProfit')
    ? `<tr><th>Ngày</th><th>Khách</th><th>Loại</th><th>Sản phẩm</th><th>SL</th><th>Doanh thu</th><th>Giá vốn</th><th>Hoa hồng</th><th>Lợi nhuận</th><th>NV</th><th>Xóa</th></tr>`
    : `<tr><th>Ngày</th><th>Khách</th><th>Loại</th><th>Sản phẩm</th><th>SL</th><th>Doanh thu</th><th>Hoa hồng</th><th>NV</th></tr>`;

  $('orderTable').innerHTML = data.orders.map(o => {
    if (has('viewProfit')) {
      return `<tr><td>${o.date}</td><td>${o.customerName}</td><td>${o.customerType}</td><td>${o.productName}</td><td>${o.qty}</td><td>${money(o.revenue)}</td><td>${has('viewCost') ? money(o.productCost) : 'Đã ẩn'}</td><td>${money(o.commission)}</td><td class="${o.profit >= 0 ? 'profit' : 'loss'}">${money(o.profit)}</td><td>${o.staffName || '-'}</td><td>${has('delete') ? `<button class="danger" data-del="orders:${o.id}">X</button>` : ''}</td></tr>`;
    }
    return `<tr><td>${o.date}</td><td>${o.customerName}</td><td>${o.customerType}</td><td>${o.productName}</td><td>${o.qty}</td><td>${money(o.revenue)}</td><td>${money(o.commission)}</td><td>${o.staffName || '-'}</td></tr>`;
  }).join('');

  $('stockTable').innerHTML = data.products.map(p =>
    `<tr><td>${p.code || ''}</td><td>${p.name}</td><td>${p.stock || 0}</td></tr>`
  ).join('');

  $('staffTable').innerHTML = data.staff.map(s =>
    `<tr><td>${s.name}</td><td>${s.dept}</td><td>${s.phone || ''}</td><td>${has('delete') ? `<button class="danger" data-del="staff:${s.id}">X</button>` : ''}</td></tr>`
  ).join('');

  $('expenseTable').innerHTML = data.expenses.map(x =>
    `<tr><td>${x.date}</td><td>${x.name}</td><td>${x.type}</td><td>${has('viewProfit') ? money(x.amount) : 'Đã ẩn'}</td><td>${x.note || ''}</td><td>${has('delete') ? `<button class="danger" data-del="expenses:${x.id}">X</button>` : ''}</td></tr>`
  ).join('');

  $('userTable').innerHTML = data.users.map(u =>
    `<tr><td>${u.email}</td><td>${u.name}</td><td>${u.role}</td><td>${(u.perms || []).join(', ')}</td><td></td></tr>`
  ).join('');

  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.onclick = async () => {
      const [collectionName, id] = btn.dataset.del.split(':');
      await removeDoc(collectionName, id);
    };
  });
}

function renderAll() {
  if (!currentProfile) return;
  $('currentUser').innerHTML = `<b>${currentProfile.name}</b><br>${currentProfile.email}`;
  applyMenu();
  renderPermBox();
  renderSelects();
  renderDashboard();
  renderTables();
  applyMenu();
}

document.querySelectorAll('nav button').forEach(btn => {
  btn.onclick = () => showPage(btn.dataset.page, btn);
});

$('loginBtn').onclick = () => login().catch(e => alert(e.message));
$('setupAdminBtn').onclick = () => setupAdmin().catch(e => alert(e.message));
$('signupStaffBtn').onclick = () => signupStaff().catch(e => alert(e.message));
$('logoutBtn').onclick = logout;
$('addCustomerBtn').onclick = () => addCustomer().catch(e => alert(e.message));
$('addProductBtn').onclick = () => addProduct().catch(e => alert(e.message));
$('addStaffBtn').onclick = () => addStaff().catch(e => alert(e.message));
$('addExpenseBtn').onclick = () => addExpense().catch(e => alert(e.message));
$('createOrderBtn').onclick = () => createOrder().catch(e => alert(e.message));
$('stockMoveBtn').onclick = () => stockMove().catch(e => alert(e.message));
$('saveUserBtn').onclick = () => saveUserPerms().catch(e => alert(e.message));
$('sProduct').onchange = fillPrice;

onAuthStateChanged(auth, async user => {
  if (!user) {
    currentProfile = null;
    showLogin();
    return;
  }

  currentProfile = await loadProfile(user);
  if (!currentProfile) return;

  showApp();
  await loadAll();
  firstAllowedPage();
});
