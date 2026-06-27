# Cập nhật ERP V58 - Hoa hồng, công kỹ thuật, công nợ tất toán

## Đã cập nhật

### 1. Hoa hồng
- Thêm tab Hoa hồng Sale.
- Thêm tab Công Kỹ thuật.
- Thêm tab Báo cáo tổng / Thu nhập nhân viên.
- Chi tiết công kỹ thuật theo từng kỹ thuật: số đơn, số bộ, công kỹ thuật, tiền xăng, tổng nhận.
- Xuất Excel theo đúng nhân viên đang chọn.
- Hoa hồng Sale và công kỹ thuật chỉ tính khi phiếu bán đã thu đủ 100%.
- Nhân viên thường chỉ xem hoa hồng/công kỹ thuật của chính mình. Admin/Quản lý/Kế toán xem toàn bộ.

### 2. Báo cáo công nợ
- Thêm báo cáo công nợ theo trạng thái: Đang nợ / Đã tất toán / Tất cả.
- Lọc theo mã phiếu, khách hàng, SĐT, địa chỉ, model, khoảng thời gian.
- Xuất Excel báo cáo công nợ.
- Công nợ tính theo từng phiếu bán, không gom theo tên khách.

### 3. Dashboard
- Bổ sung chỉ số: Đơn đang nợ, Đơn đã tất toán, Công nợ quá hạn.

## Nguyên tắc nghiệp vụ giữ nguyên
- Mỗi phiếu bán là một dòng công nợ riêng.
- Phiếu thu liên kết theo saleId / saleCode / debtKey.
- Không lấy tên khách để trừ công nợ hoặc cộng dồn công nợ.
- Bảo hành vẫn tính từ ngày hoàn thành lắp đặt nếu phiếu bán có trường này.

## Ghi chú kiểm tra
- Đã kiểm tra cú pháp app.js bằng node --check.
- Đã kiểm tra trùng ID HTML cơ bản.
