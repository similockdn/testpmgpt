CẬP NHẬT BẢO MẬT PHIÊN ĐĂNG NHẬP - AUTO LOGOUT 15 PHÚT

Đã bổ sung vào app.js:

1. Tự động đăng xuất sau 15 phút không thao tác
- Theo dõi thao tác: click, gõ phím, rê chuột, chạm màn hình, scroll, quay lại tab.
- Nếu không có hoạt động đủ 15 phút: tự signOut Firebase và quay về màn hình đăng nhập.

2. Cảnh báo trước khi hết phiên
- Sau 14 phút không thao tác sẽ hiện hộp cảnh báo.
- Đếm ngược 60 giây.
- Người dùng có thể bấm "Tiếp tục làm việc" để giữ phiên.
- Hoặc bấm "Đăng xuất" để thoát ngay.

3. Đồng bộ nhiều tab
- Nếu đăng xuất ở một tab, các tab khác cũng nhận lệnh logout.
- Nếu thao tác ở một tab, các tab khác cũng được reset thời gian timeout.

4. Ghi log
- Ghi log Logout timeout khi phiên hết hạn.
- Ghi log Logout khi người dùng bấm đăng xuất.

5. Lưu ý
- Timeout mặc định: 15 phút.
- Cảnh báo trước: 1 phút.
- Có thể chỉnh trong app.js tại:
  IDLE_TIMEOUT_MS = 15 * 60 * 1000
  IDLE_WARNING_MS = 14 * 60 * 1000
