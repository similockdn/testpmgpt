# QA V122 — Thanh lưu phiếu kho

## Kiểm tra tự động

- `node --check app.js`
- Chạy toàn bộ `qa*.js` và `qa*.py`.
- Kiểm tra riêng `qa_v122_warehouse_bottom_save_action_bar_tests.js`.

## Nghiệm thu giao diện

1. Mở lần lượt Nhập kho, Xuất kho, Chuyển kho và Điều chỉnh kho.
2. Nhập model và số lượng; xác nhận thanh lưu xuất hiện ngay dưới bảng mã hàng.
3. Kiểm tra tên nút lưu thay đổi đúng nghiệp vụ.
4. Thêm/xóa dòng hoặc đổi số lượng; xác nhận số dòng và tổng số lượng cập nhật ngay.
5. Nhấn nút lưu dưới bảng; kết quả phải giống nút lưu phía trên.
6. Trên màn hình nhỏ, nút lưu phải chiếm toàn chiều ngang và không che ô nhập liệu.
7. Nhấn Ctrl+S hoặc ⌘+S trong trang Kho; trình duyệt không mở hộp thoại lưu trang và phần mềm thực hiện lưu phiếu.
