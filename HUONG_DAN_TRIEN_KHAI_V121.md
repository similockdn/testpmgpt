# Hướng dẫn triển khai V121

Gói này là bản triển khai gọn, chứa dưới 20 tệp để có thể tải trực tiếp lên GitHub bằng trình duyệt.

## 1. Cập nhật GitHub Pages

Giải nén ZIP, mở thư mục `erp_v121`, sau đó tải các tệp trong thư mục này lên đúng thư mục gốc của repository đang chạy phần mềm.

Các tệp vận hành chính:

- `index.html`
- `app.js`
- `style.css`
- `firebase-config.js`
- `favicon.svg`

Chọn ghi đè các tệp cũ, Commit changes và chờ GitHub Pages triển khai xong. Sau đó tải lại trang bằng Ctrl+Shift+R hoặc Cmd+Shift+R.

## 2. Cập nhật Firestore Rules — bắt buộc

Mở Firebase Console → Firestore Database → Rules, thay nội dung Rules hiện tại bằng toàn bộ nội dung tệp `firestore.rules`, sau đó chọn Publish.

Nếu dự án đã cấu hình Firebase CLI, có thể chạy:

```bash
firebase deploy --only firestore:rules
```

## 3. Kiểm tra sau triển khai

1. Kho Chính tạo phiếu chuyển sang Kho Văn Phòng: tồn nguồn giảm, kho nhận chưa tăng.
2. Kho Văn Phòng mở phiếu gửi đến và xác nhận số thực nhận: kho nhận mới được cộng tồn.
3. Tạo phiếu Xuất kho: chỉ nhập đối tượng/nơi nhận bên ngoài, không chọn kho nội bộ.
4. Kiểm tra Sổ kho: có cột `Đang vận chuyển` và `Chênh lệch nhận`.

Dữ liệu phiếu chuyển cũ không cần chuyển đổi; hệ thống tự hiểu là đã nhận đủ để giữ nguyên tồn lịch sử.
