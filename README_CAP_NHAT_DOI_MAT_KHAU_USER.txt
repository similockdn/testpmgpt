CẬP NHẬT: USER TỰ ĐỔI PASSWORD

Đã bổ sung nút "Đổi mật khẩu" trên thanh trên cùng, cạnh email người dùng và nút Đăng xuất.

Quy trình:
1. User đăng nhập vào hệ thống.
2. Bấm "Đổi mật khẩu".
3. Nhập mật khẩu hiện tại.
4. Nhập mật khẩu mới và nhập lại mật khẩu mới.
5. Hệ thống xác thực lại mật khẩu hiện tại bằng Firebase Auth.
6. Nếu đúng, cập nhật mật khẩu mới bằng updatePassword.

Lưu ý:
- Mật khẩu mới tối thiểu 6 ký tự theo chuẩn Firebase Auth.
- Nếu mật khẩu hiện tại sai, hệ thống báo lỗi và không đổi mật khẩu.
- Chức năng áp dụng cho tất cả user đã đăng nhập, không cần quyền Admin.
