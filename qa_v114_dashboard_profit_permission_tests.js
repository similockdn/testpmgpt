const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const src=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');

function extractFunction(name){
  const start=src.indexOf(`function ${name}(`);
  if(start<0)throw new Error(`Không tìm thấy hàm ${name}`);
  const p0=src.indexOf('(',start);
  let paren=0,quote='',escape=false,body=-1;
  for(let i=p0;i<src.length;i++){
    const c=src[i];
    if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='(')paren++;
    else if(c===')'&&--paren===0){body=src.indexOf('{',i);break;}
  }
  let depth=0;quote='';escape=false;
  for(let i=body;i<src.length;i++){
    const c=src[i];
    if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{')depth++;
    else if(c==='}'&&--depth===0)return src.slice(start,i+1);
  }
  throw new Error(`Hàm ${name} không đóng ngoặc`);
}

function permissionRun(perms){
  const profitNodes=Array.from({length:4},()=>({hidden:false,classList:{toggle(name,on){if(name==='hidden')this.owner.hidden=on;},owner:null}}));
  profitNodes.forEach(n=>n.classList.owner=n);
  const costNode={hidden:false,classList:{toggle(name,on){if(name==='hidden')costNode.hidden=on;}}};
  const ctx={
    currentPerm:{role:'Sale',perms},
    document:{querySelectorAll(selector){
      if(selector==='.view-dashboard-profit')return profitNodes;
      if(selector==='.view-cost')return [costNode];
      return [];
    }},
    $:()=>null
  };
  vm.createContext(ctx);
  vm.runInContext(extractFunction('has')+'\n'+extractFunction('applyPermissions'),ctx);
  ctx.applyPermissions();
  return {profitNodes,costNode};
}

let state=permissionRun(['dashboard','viewCost']);
assert(state.profitNodes.every(n=>n.hidden),'Có quyền giá vốn nhưng thiếu quyền lợi nhuận Dashboard vẫn phải ẩn lợi nhuận');
assert.equal(state.costNode.hidden,false,'Quyền giá vốn phải tiếp tục hoạt động độc lập');

state=permissionRun(['dashboard','viewDashboardProfit']);
assert(state.profitNodes.every(n=>!n.hidden),'Có quyền lợi nhuận Dashboard phải được xem các KPI lợi nhuận');
assert.equal(state.costNode.hidden,true,'Quyền lợi nhuận Dashboard không được tự cấp quyền xem giá vốn ở nơi khác');

assert(src.includes("viewDashboardProfit:'Xem lợi nhuận trên Dashboard'"),'Thiếu nhãn quyền lợi nhuận Dashboard');
assert(src.includes("Admin:modules.concat(['viewDashboardProfit'"),'Admin phải được cấp quyền lợi nhuận Dashboard');
assert(!/Sale:\[[^\]]*viewDashboardProfit/.test(src),'Vai trò Sale mặc định không được xem lợi nhuận Dashboard');
assert(!/'Kỹ thuật':\[[^\]]*viewDashboardProfit/.test(src),'Vai trò Kỹ thuật mặc định không được xem lợi nhuận Dashboard');
assert(!/Kho:\[[^\]]*viewDashboardProfit/.test(src),'Vai trò Kho mặc định không được xem lợi nhuận Dashboard');
['kpiRevenueAfterExpense','kpiRevenueAfterCommission','kpiRevenueAfterExpenseCommission','kpiProfit'].forEach(id=>{
  const tag=(html.match(new RegExp(`<div[^>]*view-dashboard-profit[^>]*>[\\s\\S]{0,350}?id="${id}"`))||[])[0];
  assert(tag,`KPI ${id} chưa được bảo vệ bằng quyền riêng`);
});
assert(src.includes('const dashboardProfitChart=canViewDashboardProfit'),'Biểu đồ lợi nhuận phải được tạo có điều kiện theo quyền');
assert(src.includes("document.querySelectorAll('.view-dashboard-profit')"),'applyPermissions phải ẩn nhóm lợi nhuận Dashboard');

console.log('V114 dashboard profit permission tests OK');
