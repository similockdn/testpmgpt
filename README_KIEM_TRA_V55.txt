V55 - KIỂM TRA VÀ SỬA QUY TRÌNH KHÁCH HÀNG / PHIẾU BÁN

Nội dung đã sửa:
1. Popup Sửa thông tin khách trên phiếu bán đã lưu luôn lấy thông tin từ chính phiếu bán, không lấy chéo từ danh mục khách hàng.
2. Khi chọn khách có sẵn trong danh mục và bấm Áp dụng, hệ thống ghi đè đồng bộ toàn bộ: Mã KH, Tên, SĐT, Địa chỉ, Loại khách.
3. Phiếu bán đã thu tiền vẫn cho phép sửa thông tin khách, nhưng chỉ sửa thông tin khách của phiếu đó.
4. Không thay đổi tiền hàng, đã thu, còn nợ, sản phẩm, kho, giá vốn, lợi nhuận khi sửa khách.
5. Phiếu thu liên quan được đồng bộ lại Tên/SĐT/Mã KH/Địa chỉ/Loại khách theo phiếu bán đã sửa.
6. Sửa khách trên phiếu bán đang nhập chỉ cập nhật form hiện tại, không ghi Firestore trước khi lưu phiếu.

Kiểm tra kỹ thuật đã chạy:
- node --check app.js: OK
- Kiểm tra CSS đóng/mở ngoặc: OK
- Kiểm tra hàm gọi từ HTML: không phát hiện thiếu hàm nghiệp vụ chính
- Kiểm tra lại các hàm liên quan: editSaleCustomer, editSaleCustomerFromSale, applyExistingCustomerToSaleEdit, saveSaleCustomerEdit, syncReceiptsForSaleCustomer, saleCustomerInfo

Quy trình cần test sau khi deploy:
1. Tạo khách A, lưu phiếu chưa thu tiền.
2. Vào danh sách phiếu bán > Chi tiết > Sửa thông tin KH > đổi tên/SĐT/địa chỉ > Lưu.
3. Kiểm tra chỉ phiếu đó đổi thông tin khách.
4. Tạo phiếu đã thu tiền > Chi tiết > Sửa thông tin KH > chọn khách có sẵn > Áp dụng > Lưu.
5. Kiểm tra phiếu thu liên quan đổi theo thông tin khách mới.
6. Kiểm tra Công nợ, Báo cáo, Danh sách phiếu bán không bị lệch tiền.
