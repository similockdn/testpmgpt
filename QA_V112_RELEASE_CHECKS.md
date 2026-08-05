# QA V112 — Doanh thu theo phiếu thu đủ 100%

## Kết quả

- Toàn bộ bộ kiểm thử JavaScript/Python hiện có: đạt.
- Kiểm tra cú pháp `app.js`: đạt.
- Kiểm tra ID HTML trùng và hàm `onclick` bị thiếu: đạt.

## Trường hợp đã đối chiếu

- Một đơn được thu bằng nhiều phiếu thu trong nhiều tháng.
- Đơn mới thu một phần không được tính doanh thu.
- Khoản hoàn tiền làm đơn không còn đủ 100% thì loại khỏi doanh thu.
- Đơn thu đủ trực tiếp dùng đúng ngày thu.
- Đơn hủy không được tính doanh thu.
- Đơn chưa lắp nhưng đã thu đủ 100% vẫn ghi nhận đúng tháng thu đủ.
- Bốn chỉ tiêu tuân thủ tuyệt đối công thức tổng doanh thu, chi phí và hoa hồng.
- Hoa hồng không bị trừ lặp trong tổng chi phí.
- Xuất Excel doanh thu có sheet tổng hợp và sheet chi tiết.
