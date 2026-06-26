BẢN CẬP NHẬT HOA HỒNG V58

Nội dung đã cập nhật:
1. Hoa hồng Sale tính trên doanh số gồm:
   Tiền hàng sau chiết khấu + Phụ thu - VAT nếu có.
   Phụ thu đã được đưa vào doanh số tính hoa hồng 5%.

2. Báo cáo hoa hồng bổ sung cột:
   - Phụ thu
   - Doanh số tính hoa hồng
   - STT ở chi tiết đơn hàng

3. Bổ sung nút "Xuất Excel theo nhân viên" trong mục Hoa hồng.
   File Excel xuất theo bộ lọc hiện tại, nên có thể chọn nhân viên + khoảng ngày rồi xuất.

4. Các số hoa hồng trong báo cáo và xuất Excel được tính lại động theo công thức mới,
   tránh trường hợp đơn cũ có phụ thu nhưng hoa hồng cũ chưa tính phụ thu.

Đã kiểm tra:
- app.js không lỗi cú pháp bằng node --check.
- index.html có nút xuất Excel hoa hồng.
- Không thay đổi dữ liệu Firebase hiện hữu.
