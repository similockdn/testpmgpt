BẢN CẬP NHẬT - SỬA TÌM/CHỌN KHÁCH TRÊN PHIẾU BÁN

Đã chỉnh:
- Ô Tên khách hàng trong Phiếu bán chuyển sang ô search riêng, không phụ thuộc dropdown dài của trình duyệt.
- Click chọn khách theo ID nội bộ, không chọn theo tên nên không nhầm khách trùng tên.
- Khi chọn khách, hệ thống đổ đúng: Tên, SĐT, Địa chỉ, Loại khách.
- Chọn khách không tự đổi sản phẩm, số lượng, đơn giá, chiết khấu trên phiếu đang nhập.
- Tránh lỗi chọn khách mới nhưng SĐT/Địa chỉ vẫn giữ dữ liệu khách cũ.

Kiểm tra kỹ thuật:
- node --check app.js: PASS
- CSS cân bằng dấu { }: PASS

Checklist cần test trên GitHub/Firebase:
1. Tạo phiếu mới -> gõ tên khách -> danh sách hiện khách phù hợp.
2. Click đúng khách -> Tên/SĐT/Địa chỉ/Loại khách đổ đúng.
3. Chọn khách A rồi chọn khách B -> SĐT/Địa chỉ đổi theo khách B.
4. Thêm sản phẩm trước rồi đổi khách -> sản phẩm/đơn giá không bị về 0.
5. Lưu phiếu -> công nợ/doanh thu vẫn đúng.
