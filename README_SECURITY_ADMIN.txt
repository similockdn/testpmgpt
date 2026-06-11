BẢN FIX BẢO MẬT ADMIN

Đã sửa lỗi: ai cũng có thể bấm 'Tạo Admin lần đầu'.

Chuẩn mới:
1. Chỉ email similockdn@gmail.com được kích hoạt Admin chính.
2. Không còn cơ chế 'tài khoản đầu tiên là Admin'.
3. Tài khoản nhân viên chỉ tạo hồ sơ 'Chưa phân quyền'.
4. Firestore Rules đã chặn việc tự gán role Admin dù người dùng sửa code trên trình duyệt.
5. Admin hợp lệ mới được phân quyền cho nhân viên.

Cần làm sau khi upload:
- Copy firestore.rules lên Firebase > Firestore Database > Rules > Publish.
- Xóa các user/document Admin lạ nếu đã từng tạo test trước đây.
- Đăng nhập bằng similockdn@gmail.com và bấm 'Kích hoạt Admin chính' nếu chưa có hồ sơ users/{UID}.
