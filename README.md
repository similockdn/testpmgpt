# SIMILOCK ERP FIREBASE - Bản nâng cấp kiểu MISA

Bản này chạy bằng HTML/CSS/JS thuần + Firebase Auth + Firestore, phù hợp GitHub Pages.

## Chức năng chính

### 1. Đăng nhập & phân quyền
- Tạo Admin lần đầu.
- Tạo tài khoản nhân viên sau khi Admin phân quyền.
- Phân quyền theo từng menu: Dashboard, Khách hàng, Sản phẩm, Bảng giá, Bán hàng, Kho, Phiếu kho, Nhân viên, Chi phí, Người dùng.
- Quyền riêng: xem giá vốn/lợi nhuận.
- Sale không được xem giá vốn/lợi nhuận nếu không tick quyền.

### 2. Danh mục khách hàng
- Form nhập liệu kiểu MISA.
- Mã khách hàng tự động.
- Loại khách: Khách lẻ, Khách đại lý, CTV.
- SĐT, địa chỉ, mã số thuế, chiết khấu, ghi chú.
- Thêm / sửa / xóa.

### 3. Danh mục sản phẩm
- Model/mã hàng, tên hàng, danh mục, đơn vị tính.
- Giá vốn, giá bán, tồn đầu.
- Thêm / sửa / xóa.

### 4. Quản lý bảng giá
- Bảng giá theo từng nhóm khách.
- Ví dụ: F07 có giá Khách lẻ, Đại lý, CTV khác nhau.
- Thêm / sửa / xóa.

### 5. Bán hàng
- Chọn khách hàng, sản phẩm, số lượng.
- Tự lấy giá theo bảng giá và loại khách.
- Có chiết khấu riêng hoặc lấy chiết khấu từ hồ sơ khách.
- VAT tùy chọn:
  - Không VAT
  - Cộng thêm VAT
  - Giá đã gồm VAT
- Thuế suất: 0%, 8%, 10%.
- Hoa hồng sale, chi phí kỹ thuật, chi phí khác.
- Tự tính doanh thu, VAT, lợi nhuận.
- Tự trừ kho khi tạo phiếu bán.
- In phiếu bán hàng A5.

### 6. Kho hàng
- Tạo phiếu nhập kho.
- Tạo phiếu xuất kho.
- Tạo phiếu điều chỉnh tồn.
- Tự cập nhật tồn kho.
- Lưu lịch sử phiếu kho.
- In phiếu kho A5.

### 7. Nhân viên
- Quản lý nhân viên: tên, phòng ban, điện thoại, email.
- Thêm / sửa / xóa.
- Dùng nhân viên sale khi tạo đơn hàng.

### 8. Chi phí
- Nhập chi phí vận hành, kỹ thuật, marketing, vận chuyển...
- Tự cộng vào báo cáo.

### 9. Dashboard
- Doanh thu.
- VAT.
- Lợi nhuận.
- Số đơn.
- Tồn kho.
- Top nhân viên theo doanh thu/hoa hồng.

## Cách dùng trên GitHub Pages
1. Giữ nguyên `firebase-config.js` nếu Firebase project của anh đang chạy.
2. Nếu đăng nhập lỗi appId, vào Firebase Console > Project settings > Web app > copy lại toàn bộ `firebaseConfig`.
3. Upload các file này lên GitHub.
4. Bật GitHub Pages.
5. Vào Firebase Console > Authentication > Settings > Authorized domains, thêm domain GitHub Pages.
6. Vào Firestore > Rules, dán nội dung file `firestore.rules`.

## Lưu ý quan trọng
- Firestore Rules trong bản này cho phép người đã đăng nhập đọc/ghi. Sau khi chạy ổn, nên siết rules theo vai trò.
- Không nên public dữ liệu thật nếu chưa cấu hình Rules chặt.
