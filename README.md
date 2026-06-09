# Similock ERP Firebase

Bản này chạy được trên GitHub Pages/Vercel, dữ liệu đồng bộ bằng Firebase:
- Firebase Authentication: đăng nhập email/mật khẩu
- Firestore Database: lưu khách hàng, sản phẩm, đơn hàng, kho, nhân viên, chi phí, phân quyền

## 1. Tạo Firebase Project

Vào Firebase Console:
https://console.firebase.google.com/

Tạo project mới, ví dụ:
`similock-erp`

## 2. Bật Authentication

Firebase Console > Authentication > Sign-in method:
- Enable Email/Password

## 3. Bật Firestore Database

Firebase Console > Firestore Database:
- Create database
- Chọn Production mode
- Region gần Việt Nam: asia-southeast1 nếu có

## 4. Dán Rules

Vào Firestore Database > Rules.

Copy toàn bộ nội dung trong file:
`firestore.rules`

Dán vào và bấm Publish.

## 5. Lấy firebaseConfig

Firebase Console > Project settings > General > Your apps:
- Add app: Web
- Copy firebaseConfig

Mở file:
`firebase-config.js`

Dán cấu hình thật vào.

Ví dụ:
```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "similock-erp.firebaseapp.com",
  projectId: "similock-erp",
  storageBucket: "similock-erp.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

## 6. Upload lên GitHub Pages

Upload các file này lên GitHub:
- index.html
- style.css
- app.js
- firebase-config.js

Vào:
Settings > Pages
- Source: Deploy from branch
- Branch: main
- Folder: /root
- Save

## 7. Tạo Admin lần đầu

Mở link GitHub Pages.

Nhập email admin, ví dụ:
`admin@similock.vn`

Nhập mật khẩu, ví dụ:
`123456`

Bấm:
`Tạo Admin lần đầu`

Sau đó hệ thống tự đăng nhập.

## 8. Tạo nhân viên và phân quyền

Admin vào mục:
`Phân quyền`

Nhập email nhân viên, ví dụ:
`sale1@similock.vn`

Tick quyền:
- Khách hàng
- Sản phẩm
- Bán hàng
- Kho hàng

Không tick:
- Xem giá vốn
- Xem lợi nhuận

Bấm:
`Lưu phân quyền`

Nhân viên ra màn hình đăng nhập, nhập email đó + mật khẩu mới, bấm:
`Tạo tài khoản nhân viên`

Sau đó đăng nhập.

## Quyền gợi ý

### Admin
Tick tất cả quyền.

### Sale
Tick:
- Khách hàng
- Sản phẩm
- Bán hàng
- Kho hàng

Không tick:
- Xem giá vốn
- Xem lợi nhuận
- Xóa dữ liệu

### Kỹ thuật
Tick:
- Bán hàng
- Kho hàng

### Kế toán
Tick:
- Dashboard
- Khách hàng
- Bán hàng
- Chi phí
- Xem lợi nhuận

## Lưu ý

Đây là bản Firebase chạy không cần server riêng. Bảo mật tốt hơn localStorage, nhưng vẫn là bản mini ERP cơ bản.
