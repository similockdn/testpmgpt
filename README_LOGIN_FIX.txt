SIMILOCK ERP - BẢN FIX ĐĂNG NHẬP

Đã sửa:
1. Chuẩn hóa email về chữ thường khi đăng nhập/tạo tài khoản/phân quyền.
2. Sửa luồng Tạo Admin lần đầu để không bị treo ở lỗi "chưa phân quyền".
3. Nếu nhân viên chưa được phân quyền, hệ thống tự đăng xuất và báo đúng email cần thêm.
4. Thêm thông báo trạng thái khi đăng nhập để dễ biết đang lỗi ở Auth, Firestore hay phân quyền.
5. Render màn hình có bắt lỗi rõ ràng, tránh đăng nhập được nhưng trắng trang.
6. Cập nhật firestore.rules kèm trong bộ file.

Cách cập nhật trên GitHub Pages:
1. Giải nén file zip.
2. Upload đè toàn bộ file lên repository cũ: index.html, app.js, firebase-config.js, style.css, firestore.rules...
3. Vào Firebase Console > Authentication > Sign-in method > bật Email/Password.
4. Vào Firebase Console > Authentication > Settings > Authorized domains:
   - thêm domain GitHub Pages của anh, ví dụ: lampham1685.github.io
5. Vào Firebase Console > Firestore Database > Rules:
   - copy nội dung file firestore.rules
   - bấm Publish.
6. Mở web, nhập email/mật khẩu Admin, bấm "Tạo Admin lần đầu".

Nếu vẫn lỗi:
- auth/unauthorized-domain: thiếu Authorized domains.
- operation-not-allowed: chưa bật Email/Password.
- invalid-credential: sai mật khẩu hoặc tài khoản chưa tồn tại.
- permission-denied: chưa Publish Firestore Rules.
