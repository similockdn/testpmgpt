BẢN V54 - PHIẾU BÁN: SĐT KHÁCH + ĐỒNG BỘ PHIẾU THU

Nội dung cập nhật:
1. Phiếu bán hàng bổ sung trường Số điện thoại riêng.
2. Trường Khách hàng sau khi chọn/search chỉ hiển thị tên khách để giao diện gọn, không còn hiện quá nhiều mã/SĐT/địa chỉ.
3. Khi chọn khách từ danh mục:
   - Tự lấy Tên khách
   - Tự lấy SĐT
   - Tự lấy Địa chỉ giao/lắp đặt
   - Tự lấy Loại khách
4. Khi sửa thông tin khách trên phiếu bán đã thu tiền:
   - Chỉ cập nhật đúng phiếu đang sửa
   - Không đổi hàng loạt đơn cũ
   - Không thay đổi tiền hàng / đã thu / còn nợ / kho / sản phẩm
5. Đồng bộ phiếu thu liên quan khi khách trên phiếu bán được sửa:
   - customerId
   - customerCode
   - customerName
   - customerPhone
6. Khi sửa phiếu bán thông thường và đổi sang khách khác, phiếu thu liên quan cũng được đồng bộ để tránh lệch Công nợ/Phiếu thu.

Đã kiểm tra:
- node --check app.js: không lỗi cú pháp
- node --check firebase-config.js: không lỗi cú pháp
- HTML có đủ các field mới: saleCustomerId, saleCustomerSearch, saleCustomerPhone, saleCustomerAddress
- Quy trình chọn khách -> lưu phiếu -> sửa khách -> đồng bộ phiếu thu đã được rà lại ở mức code.

Lưu ý dữ liệu cũ:
- Các phiếu thu đã lưu trước đây nếu thiếu customerPhone sẽ được cập nhật khi sửa lại thông tin khách trên phiếu bán liên quan.
- Các đơn cũ bị nhập sai tên cần mở đúng phiếu bán và sửa lại một lần.
