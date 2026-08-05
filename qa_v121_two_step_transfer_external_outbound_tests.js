const fs=require('fs');
const assert=require('assert');
const vm=require('vm');

const html=fs.readFileSync('index.html','utf8');
const src=fs.readFileSync('app.js','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');
const version=fs.readFileSync('VERSION.txt','utf8').trim();

assert.equal(version,'V121_TWO_STEP_TRANSFER_EXTERNAL_OUTBOUND','Sai VERSION V121');

// OUT là hàng ra ngoài hệ thống.
assert(html.includes('id="stockRecipientWrap"'),'Thiếu nhóm nơi nhận bên ngoài');
['stockRecipientType','stockRecipientName','stockRecipientPhone','stockRecipientAddress'].forEach(id=>assert(html.includes(`id="${id}"`),`Thiếu ${id}`));
assert(src.includes("if(toWrap) toWrap.style.display=isTransfer?'block':'none'"),'Dropdown kho nhận còn hiện cho OUT');
assert(src.includes("if(recipientWrap)recipientWrap.style.display=isOut?'block':'none'"),'Nơi nhận bên ngoài chưa hiện cho OUT');
assert(src.includes("if(type==='OUT'&&(!recipientType||!recipientName))"),'OUT chưa bắt buộc nơi nhận');
assert(src.includes("toWarehouse:type==='TRANSFER'?toWarehouse:''"),'OUT còn lưu kho nội bộ vào toWarehouse');

// Chuyển kho hai bước và tương thích phiếu cũ.
assert(src.includes("return v.transferStatus||'RECEIVED'"),'Phiếu chuyển cũ chưa được hiểu là đã nhận');
assert(src.includes("transferStatus:'IN_TRANSIT'"),'Phiếu chuyển mới chưa vào trạng thái vận chuyển');
assert(src.includes("if(warehouse===to&&transferIsReceived(v))qty+=transferReceivedQty"),'Kho nhận còn được cộng trước xác nhận');
assert(src.includes('if(!received)return 0'),'Dòng xác nhận thiếu chưa fail-closed');
assert(src.includes("window.openTransferReceipt=id=>"),'Thiếu màn hình xác nhận nhận hàng');
assert(src.includes("window.confirmTransferReceipt=async id=>"),'Thiếu lưu xác nhận nhận hàng');
assert(src.includes("RECEIVED_WITH_DIFFERENCE"),'Thiếu trạng thái nhận có chênh lệch');
assert(src.includes("pendingDifference"),'Sổ kho thiếu chênh lệch nhận');
assert(src.includes("inTransit"),'Sổ kho thiếu hàng đang vận chuyển');
assert(src.includes("window.cancelTransferVoucher=async id=>"),'Thiếu hủy chuyển kho an toàn');
assert(src.includes("if(transfer?.type==='TRANSFER')return cancelTransferVoucher(id)"),'Phiếu chuyển vẫn có thể xóa cứng từ giao diện');

// Phân quyền máy chủ.
assert(rules.includes('function canConfirmTransfer(oldStock, newStock)'),'Rules thiếu hàm xác nhận chuyển kho');
assert(rules.includes('function validStockVoucherCreate(stock)'),'Rules thiếu kiểm tra trạng thái khởi tạo phiếu kho');
assert(rules.includes("affectedKeys().hasOnly(["),'Rules chưa giới hạn trường xác nhận');
['transferStatus','receivedItems','receivedAt','receivedBy','receiveNote','updatedAt'].forEach(field=>assert(rules.includes(`'${field}'`),`Rules thiếu trường xác nhận ${field}`));
assert(rules.includes('hasWarehouseAccess(stockToWarehouse(oldStock))'),'Rules chưa buộc người xác nhận thuộc kho nhận');
assert(rules.includes("newStock.receivedBy == myEmail()"),'Rules chưa khóa danh tính người nhận');
assert(rules.includes("resource.data.type != 'TRANSFER'"),'Rules chưa chặn kho nguồn sửa phiếu chuyển sau khi gửi');
assert(rules.includes("allow write: if isAdmin();"),'Ghi danh mục kho chưa khóa Admin');
assert(rules.includes("allow delete: if resource.data.type != 'TRANSFER'"),'Rules còn cho xóa cứng phiếu chuyển');

assert(src.includes("version:'v121'"),'Backup chưa cập nhật V121');

// Chạy trực tiếp các hàm tính tồn lấy từ app.js để kiểm tra bốn trạng thái dữ liệu.
function sourceFunction(name){
  const start=src.indexOf(`function ${name}(`);
  assert(start>=0,`Không tìm thấy hàm ${name}`);
  const brace=src.indexOf('{',start);
  let depth=0;
  for(let i=brace;i<src.length;i++){
    if(src[i]==='{')depth++;
    else if(src[i]==='}'&&--depth===0)return src.slice(start,i+1);
  }
  throw new Error(`Hàm ${name} thiếu dấu đóng`);
}
const sandbox={result:{}};
vm.createContext(sandbox);
vm.runInContext(`
  let data={stockVouchers:[]};
  const WAREHOUSES=['Kho Chính','Kho Văn Phòng','Kho HCM'];
  function isVoucherCanceled(v){return v.canceled===true||v.transferStatus==='CANCELED'}
  function voucherWarehouse(v){return v.warehouse||v.fromWarehouse||'Kho Chính'}
  ${sourceFunction('transferStatusOf')}
  ${sourceFunction('transferIsReceived')}
  ${sourceFunction('transferReceivedQty')}
  ${sourceFunction('stockOf')}
  const item={code:'F07',name:'F07',qty:10};
  function amounts(v){data.stockVouchers=[v];return [stockOf('F07','','Kho Chính'),stockOf('F07','','Kho Văn Phòng')]}
  result.legacy=amounts({type:'TRANSFER',warehouse:'Kho Chính',fromWarehouse:'Kho Chính',toWarehouse:'Kho Văn Phòng',items:[item]});
  result.pending=amounts({type:'TRANSFER',warehouse:'Kho Chính',fromWarehouse:'Kho Chính',toWarehouse:'Kho Văn Phòng',transferStatus:'IN_TRANSIT',receivedItems:[],items:[item]});
  result.received=amounts({type:'TRANSFER',warehouse:'Kho Chính',fromWarehouse:'Kho Chính',toWarehouse:'Kho Văn Phòng',transferStatus:'RECEIVED_WITH_DIFFERENCE',receivedItems:[{lineIndex:0,receivedQty:7}],items:[item]});
  result.invalid=amounts({type:'TRANSFER',warehouse:'Kho Chính',fromWarehouse:'Kho Chính',toWarehouse:'Kho Văn Phòng',transferStatus:'RECEIVED',receivedItems:[],items:[item]});
  result.canceled=amounts({type:'TRANSFER',warehouse:'Kho Chính',fromWarehouse:'Kho Chính',toWarehouse:'Kho Văn Phòng',transferStatus:'CANCELED',canceled:true,items:[item]});
`,sandbox);
assert.deepEqual(Array.from(sandbox.result.legacy),[-10,10],'Phiếu cũ không giữ nguyên tồn lịch sử');
assert.deepEqual(Array.from(sandbox.result.pending),[-10,0],'Phiếu đang vận chuyển cộng nhầm kho nhận');
assert.deepEqual(Array.from(sandbox.result.received),[-10,7],'Phiếu nhận thiếu không cộng đúng thực nhận');
assert.deepEqual(Array.from(sandbox.result.invalid),[-10,0],'Phiếu mới thiếu receivedItems không fail-closed');
assert.deepEqual(Array.from(sandbox.result.canceled),[0,0],'Phiếu hủy vẫn tác động tồn');

console.log('V121 two-step transfer and external outbound tests OK');
