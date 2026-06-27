BẢN CẬP NHẬT BẢO HÀNH

- Đã tách Bảo hành ra menu riêng, không còn nằm trong Kho & Sản phẩm.
- Lý do bảo hành chuyển từ checkbox dài sang dropdown gọn.
- Chọn "Khác" sẽ hiện ô nhập lý do khác.
- Bổ sung tab "Danh mục lỗi" để Admin thêm/xóa lý do bảo hành tùy chỉnh.
- Tìm phiếu bán bảo hành vẫn theo mã phiếu / tên khách / SĐT / model.
- Bảo hành vẫn liên kết theo saleId/saleCode, không liên kết theo tên khách.

Checklist đã kiểm tra:
- app.js không lỗi cú pháp bằng node --check.
- index.html có menu Bảo hành riêng.
- Form bảo hành giữ nguyên các ID chính, không ảnh hưởng dữ liệu cũ.
