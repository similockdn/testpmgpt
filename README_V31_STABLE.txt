SIMILOCK ĐÀ NẴNG ERP - v31 Stable

Cập nhật:
- Sửa lỗi stockBookDateFilter is not defined.
- Bổ sung stockDateInRange và nút xóa lọc ngày sổ kho hoạt động ổn định.
- Thiết kế lại Phân quyền trực quan theo nhóm chức năng.
- Thêm nút Áp dụng theo vai trò, Chọn tất cả, Bỏ chọn tất cả, Chọn/Bỏ theo nhóm.
- Bảng danh sách phân quyền hiển thị tóm tắt quyền bằng chip dễ đọc.
- Bổ sung lại hàm Sửa/In chứng từ kho để tránh lỗi nút bấm.
- Kiểm tra JS bằng node --check: không lỗi cú pháp.
- Kiểm tra CSS đóng/mở ngoặc: hợp lệ.
- Kiểm tra onclick/onchange/oninput trong HTML/JS: không còn hàm thiếu.

Lưu ý khi cập nhật GitHub:
- Chỉ thay code, dữ liệu Firestore/Auth không mất.
- Không đổi firebase-config.js sang project khác.
- Backup Firestore trước khi cập nhật nếu đang chạy thật.
