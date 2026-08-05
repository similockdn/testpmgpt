# QA V121 — Chuyển kho hai bước

## Kiểm tra tự động

- Cú pháp JavaScript: `node --check app.js`.
- Chạy toàn bộ `qa*.js` và các kiểm tra Python hiện có.
- Kiểm tra riêng `qa_v121_two_step_transfer_external_outbound_tests.js`.

## Kịch bản nghiệm thu bắt buộc

1. Tạo OUT tại Kho Chính: chỉ thấy đối tượng/nơi nhận bên ngoài, không thấy dropdown kho nhận; tồn Kho Chính giảm.
2. Tạo TRANSFER Kho Chính → Kho Văn Phòng: tồn Kho Chính giảm, Kho Văn Phòng chưa tăng, số lượng xuất hiện ở `Đang vận chuyển`.
3. Đăng nhập Kho Văn Phòng: xem được phiếu chuyển đến và nhấn `Xác nhận nhận`; không xem được tồn chi tiết Kho Chính.
4. Xác nhận nhận đủ: Kho Văn Phòng tăng đúng số lượng; trạng thái `Đã nhận đủ`; `Đang vận chuyển` về 0.
5. Xác nhận nhận thiếu: bắt buộc ghi chú; kho nhận chỉ tăng số thực nhận; phần thiếu hiển thị `Chênh lệch nhận`.
6. Kho nhận thử sửa model, số lượng gửi hoặc kho gửi qua API: Firestore Rules phải từ chối.
7. Admin hủy phiếu đang vận chuyển: nguồn được hoàn tồn, phiếu giữ lịch sử. Phiếu đã nhận không có thao tác xóa/hủy trực tiếp.
8. Phiếu chuyển cũ chưa có `transferStatus`: tồn hai kho giữ nguyên như V120.
9. Thêm/sửa/xóa kho bằng tài khoản không phải Admin: giao diện và Firestore Rules đều từ chối.

## Triển khai

Phải triển khai kèm `firestore.rules`. Nếu chỉ cập nhật mã giao diện mà chưa deploy Rules, quyền xác nhận kho nhận sẽ chưa hoạt động đúng và lớp bảo vệ máy chủ chưa được áp dụng.
