# Hướng dẫn triển khai V122

Gói triển khai gọn chứa dưới 20 tệp, có thể tải trực tiếp lên GitHub bằng trình duyệt.

## Cập nhật GitHub Pages

1. Giải nén ZIP và mở thư mục `erp_v122`.
2. Tải toàn bộ tệp bên trong lên thư mục gốc của repository đang chạy phần mềm.
3. Chọn ghi đè tệp cũ và Commit changes.
4. Chờ GitHub Pages triển khai, sau đó tải lại trang bằng Ctrl+Shift+R hoặc Cmd+Shift+R.

Các tệp vận hành chính là `index.html`, `app.js`, `style.css`, `firebase-config.js`, `firestore.rules` và `favicon.svg`.

V122 không thay đổi Firestore Rules so với V121. Nếu chưa từng triển khai Rules của V121, vẫn phải đưa nội dung `firestore.rules` lên Firebase Console → Firestore Database → Rules → Publish.

Sau khi cập nhật, mở một nghiệp vụ kho, nhập model và xác nhận có thanh lưu ngay dưới danh sách mã hàng.
