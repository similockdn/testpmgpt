BẢN CẬP NHẬT HOA HỒNG - V58

Nội dung đã cập nhật:
1. Hoa hồng Sale tính trên: Doanh số tính hoa hồng = Doanh thu trước VAT = Tiền hàng sau chiết khấu + Phụ thu.
2. Không trừ phụ thu khỏi công thức hoa hồng nữa.
3. Báo cáo hoa hồng bổ sung các cột: Phụ thu, Chiết khấu, Doanh số tính HH.
4. Bổ sung nút Xuất Excel theo nhân viên trong mục Hoa hồng.
5. Nếu chọn 1 nhân viên trong bộ lọc, file Excel xuất riêng nhân viên đó.
6. Nếu không chọn nhân viên, file Excel xuất nhiều sheet theo từng nhân viên Sale.
7. Dữ liệu cũ khi xem báo cáo sẽ được tính lại hoa hồng theo công thức mới để tránh lệch.

Đã kiểm tra:
- app.js không lỗi cú pháp bằng node --check.
- index.html đang gọi đúng app.js và style.css.
- Gói ZIP đã dọn gọn, chỉ giữ các file cần chạy và file mẫu import.

Lưu ý triển khai:
- Nên upload toàn bộ các file trong gói này lên GitHub để đồng bộ.
- Trước khi đưa vào bản chính, test trên link test với 1 đơn có phụ thu để kiểm tra hoa hồng và xuất Excel.
