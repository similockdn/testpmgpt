# SIMILOCK ERP - KAS giao diện / MISA quy trình

Bản nâng cấp gồm:
- Giao diện gần kiểu KAS: sidebar tối, dashboard KPI, card hiện đại.
- Bán hàng nhiều sản phẩm trên 1 phiếu, VAT tùy chọn, in phiếu A5.
- Tìm khách hàng ngay khi bán, tạo khách nhanh tại phiếu bán.
- Admin có quyền sửa/xóa đơn bán.
- Kho chuẩn MISA: Phiếu nhập, xuất, điều chỉnh, kiểm kê. Một phiếu nhiều mã hàng. Có sửa/xóa theo quyền.
- Sổ kho: tồn đầu, nhập, xuất, điều chỉnh, tồn cuối theo từng model.
- Công nợ: theo khách hàng, phiếu thu, đã thu/còn nợ.
- Bảo hành: lưu khách, SĐT, model/serial, ngày lắp, hạn bảo hành.
- Bảng phân quyền chuẩn: Admin, Sale, Kỹ thuật, Kho, Kế toán.
- Import/export CSV khách hàng, sản phẩm, sổ kho, bán hàng.

## Cài đặt Firebase
1. Giữ nguyên `firebase-config.js` hoặc copy lại appId đầy đủ từ Firebase Console.
2. Bật Authentication > Email/Password.
3. Tạo Firestore Database.
4. Dán nội dung `firestore.rules` vào Firestore Rules và Publish.
5. Upload toàn bộ file lên GitHub Pages hoặc Firebase Hosting.

## Tạo Admin lần đầu
- Nhập email + mật khẩu.
- Bấm **Tạo Admin lần đầu**.
- Sau đó đăng nhập bình thường.

## Lưu ý quan trọng
- Nếu đang chạy trên GitHub Pages mà không thấy cập nhật, bấm Ctrl + Shift + R hoặc Clear Site Data.
- Nếu đăng nhập lỗi, kiểm tra Firebase Console đã bật Email/Password và appId trong `firebase-config.js` đã đủ.

## Bảng giá có thời hạn

Module Bảng giá đã hỗ trợ:
- Import CSV bảng giá.
- Export CSV bảng giá.
- Ngày hiệu lực từ / đến.
- Trạng thái đang áp dụng hoặc ngưng áp dụng.
- Khi tạo phiếu bán, hệ thống tự lấy giá còn hiệu lực theo Model + nhóm khách + ngày bán.
- Nếu không có bảng giá còn hiệu lực, hệ thống dùng giá bán trong danh mục sản phẩm.

File mẫu: `bang_gia_mau_import.csv`

Cột import bắt buộc/khuyến nghị:

```csv
code,type,price,validFrom,validTo,active,note
S01,Khách lẻ,2350000,2026-06-01,2026-06-30,true,Giá lẻ tháng 6
```
