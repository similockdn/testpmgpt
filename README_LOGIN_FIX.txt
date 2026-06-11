BẢN FIX ĐĂNG NHẬP SIMILOCK ERP

Admin chính đã cấu hình cố định:
Email: similockdn@gmail.com

Việc đã sửa:
1. App tự tạo/cập nhật document users/similockdn@gmail.com với role Admin.
2. Không còn phụ thuộc vào các document users đang bị lưu sai theo UID.
3. Firestore Rules cho phép email similockdn@gmail.com tự khôi phục quyền Admin.
4. Email phân quyền nhân viên được tự chuyển về chữ thường.

Cách cập nhật:
1. Upload toàn bộ file trong thư mục này lên GitHub Pages.
2. Vào Firebase > Firestore Database > Rules.
3. Copy toàn bộ nội dung file firestore.rules và bấm Publish.
4. Vào Authentication > Users, kiểm tra tài khoản similockdn@gmail.com đã tồn tại.
5. Mở web, nhập similockdn@gmail.com và mật khẩu.
6. Nếu chưa có tài khoản, bấm Tạo Admin lần đầu.

Lưu ý:
- Collection users nên có document ID đúng là: similockdn@gmail.com
- Các document ID dạng UID cũ có thể để nguyên, không ảnh hưởng sau bản fix này.
