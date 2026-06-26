BẢN V52 - BỔ SUNG ĐỊA CHỈ TRÊN PHIẾU BÁN

Đã cập nhật:
1. Thêm trường Địa chỉ giao/lắp đặt trong màn hình Bán hàng / Phiếu bán.
2. Khi chọn khách hàng có sẵn, địa chỉ tự lấy từ danh mục khách hàng.
3. Cho phép sửa địa chỉ riêng trên từng phiếu bán nếu địa chỉ lắp đặt khác hồ sơ khách.
4. Khi lưu phiếu bán, địa chỉ được lưu vào customerSnapshot/customerAddress của chính phiếu đó.
5. Khi sửa phiếu bán cũ, địa chỉ được load lại đúng theo phiếu.
6. Không làm thay đổi số tiền, công nợ, kho hoặc sản phẩm.

Đã kiểm tra:
- JS không lỗi cú pháp bằng node --check.
- Trường mới có kiểm tra null an toàn.
- Không ảnh hưởng quy trình thêm nhanh khách hàng và sửa khách trên phiếu bán.
