V53 - Sửa lỗi ngày phiếu bán

Đã cập nhật:
- Nhân viên được phép chọn ngày bán trước ngày hiện tại.
- Khi lưu phiếu bán, hệ thống lấy đúng ngày đang chọn trên ô Ngày bán.
- Không tự ép ngày phiếu bán về ngày hiện tại, trừ khi ô ngày bị trống hoặc sai định dạng.
- Giá bán/giá vốn khi tính đơn lấy theo đúng ngày phiếu bán.
- Phiếu xuất kho kiêm theo đơn dùng đúng ngày phiếu bán.

Đã kiểm tra cơ bản:
- JS không lỗi cú pháp.
- Các hàm tạo/sửa phiếu bán vẫn giữ customer snapshot, công nợ, kho, giá vốn.
