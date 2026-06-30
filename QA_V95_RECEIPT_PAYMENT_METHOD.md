# QA V95 - Chuẩn hóa phương thức thanh toán phiếu thu

## Kết quả kiểm tra

- `node --check app.js`: OK.
- `qa_static_checks.py`: không trùng ID, không thiếu hàm onclick.
- `qa_finance_v94_tests.js`: OK với các test tài chính hiện có.
- Kiểm tra logic V95: OK.

## Quy tắc đã áp dụng

- Phiếu thu có `paymentMethod` rỗng, `Chưa chọn`, `Chưa xác định`, `Chưa khai báo`, `undefined`, `null` sẽ được xem là **Chuyển khoản**.
- Khi hệ thống tải dữ liệu, các phiếu thu cũ bị thiếu phương thức sẽ được tự cập nhật vào Firestore thành **Chuyển khoản**.
- Phiếu thu mới mặc định chọn **Chuyển khoản**.
- Danh sách Phiếu thu, In Phiếu thu A5, Chi tiết đơn, Sổ quỹ và Báo cáo thanh toán dùng cùng một hàm chuẩn hóa phương thức thanh toán.
