V58 - Sửa tìm/chọn khách trong popup Sửa khách trên phiếu bán

Đã chỉnh:
1. Thay dropdown khách hàng bằng ô tìm kiếm có gợi ý.
2. Tìm được theo tên / SĐT / mã KH / địa chỉ.
3. Khi bấm Áp dụng khách có sẵn, hệ thống lấy theo ID khách hàng duy nhất ở đầu dòng, không lấy theo tên.
4. Ghi đè đồng bộ các ô Mã KH / Tên / SĐT / Địa chỉ / Loại khách từ đúng khách đã chọn.
5. Giữ nguyên nguyên tắc: sửa khách trên phiếu bán chỉ cập nhật phiếu đang sửa và chứng từ liên quan đến phiếu đó.

Đã kiểm tra kỹ thuật:
- node --check app.js: không lỗi cú pháp.
- Kiểm tra còn tồn tại các hàm chính: saleCustomerEditModalHtml, applyExistingCustomerToSaleEdit, saveSaleCustomerEdit, syncRelatedDocsForSaleCustomer.
- Không dùng dò theo tên làm nguồn chính khi áp dụng khách có sẵn.
