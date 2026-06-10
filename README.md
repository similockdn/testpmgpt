# Similock ERP Firebase

Chức năng đã bổ sung:
- Danh mục sản phẩm: model, tên, danh mục, ĐVT, giá vốn, giá bán, tồn đầu.
- Quản lý bảng giá theo loại khách: Khách lẻ, Khách đại lý, CTV.
- Danh mục nhân viên: tên, phòng ban, SĐT, email.
- Bán hàng: tạo đơn, trừ kho, tính chiết khấu, hoa hồng, chi phí kỹ thuật, chi phí khác.
- VAT tùy chọn: không VAT, cộng VAT, giá đã gồm VAT.
- In phiếu bán hàng khổ A5.
- Kho hàng: tạo phiếu nhập kho, xuất kho, điều chỉnh tồn.
- In phiếu kho khổ A5.
- Phân quyền: ẩn giá vốn/lợi nhuận với nhân viên không có quyền `viewCost`.

## Cách chạy
1. Tạo Firebase Project.
2. Bật Authentication bằng Email/Password.
3. Tạo Firestore Database.
4. Dán cấu hình Firebase vào `firebase-config.js`.
5. Dán nội dung `firestore.rules` vào Firestore Rules và Publish.
6. Upload 3 file `index.html`, `style.css`, `app.js`, `firebase-config.js` lên GitHub Pages.
7. Mở web, nhập email admin + mật khẩu, bấm `Tạo Admin lần đầu`.
