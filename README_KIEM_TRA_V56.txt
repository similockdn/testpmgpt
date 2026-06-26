V56 - Sửa chọn khách có sẵn trong phiếu bán

Đã chỉnh:
1. Popup Sửa thông tin khách hàng không còn áp dụng khách bằng cách dò theo tên.
2. Chọn khách có sẵn bằng danh sách select theo ID khách hàng duy nhất.
3. Khi bấm Áp dụng khách có sẵn, hệ thống ghi đè đồng bộ toàn bộ trường:
   - Mã KH
   - Tên khách
   - SĐT
   - Địa chỉ
   - Loại khách
4. Tránh lỗi khách trùng tên bị lấy nhầm thông tin của khách khác.
5. Phiếu bán đã thu tiền vẫn được sửa riêng thông tin khách; không sửa tiền, kho, sản phẩm.
6. Phiếu thu liên quan vẫn được đồng bộ theo thông tin khách mới của đúng phiếu bán.

Đã kiểm tra:
- node --check app.js: không lỗi cú pháp.
- Kiểm tra hàm applyExistingCustomerToSaleEdit: ưu tiên ID khách hàng, không ưu tiên tên.
- Kiểm tra saveSaleCustomerEdit: chỉ cập nhật đúng phiếu đang sửa.
