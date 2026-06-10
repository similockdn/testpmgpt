# SIMILOCK ERP MISA MINI PRO

Bản nâng cấp theo quy trình MISA mini cho SIMILOCK: bán hàng, kho, công nợ, thu tiền, bảo hành, phân quyền, nhật ký sửa/xóa, import/export.

## Tính năng chính
- Dashboard hiện đại: doanh thu, lợi nhuận, công nợ, cảnh báo tồn kho.
- Bán hàng: 1 phiếu bán có nhiều sản phẩm, tìm khách đã lưu, tạo khách nhanh, VAT tùy chọn, in A5.
- Quản trị đơn: Admin/Kế toán có quyền sửa/xóa đơn.
- Công nợ: theo khách hàng, ghi nhận phiếu thu, cập nhật còn nợ.
- Kho: 1 phiếu nhập/xuất/điều chỉnh có nhiều mã hàng, in A5.
- Sổ kho: tồn hiện tại, nhập, xuất, điều chỉnh theo từng model.
- Bảo hành: ngày lắp, serial/IMEI, hết hạn, tra cứu theo SĐT/serial.
- Danh mục: khách hàng, sản phẩm, bảng giá, nhân viên, chi phí.
- Import/export CSV: khách hàng và sản phẩm.
- Backup toàn bộ dữ liệu JSON.
- Nhật ký sửa/xóa/import.
- Firestore Rules phân quyền cơ bản.

## Cách chạy trên GitHub Pages
1. Upload toàn bộ file lên repository.
2. Vào Settings → Pages → Deploy from branch → chọn `main` và `/root`.
3. Mở link GitHub Pages.

## Cấu hình Firebase
File `firebase-config.js` đang giữ project `smilockdng`.
Nếu đăng nhập lỗi, vào Firebase Console → Project settings → Web app → copy đầy đủ `appId` dán lại.

## Firebase cần bật
- Authentication → Sign-in method → Email/Password → Enable.
- Firestore Database → Create database.
- Rules → dán nội dung `firestore.rules`.

## Lần đầu sử dụng
1. Nhập email admin + mật khẩu.
2. Bấm `Tạo Admin lần đầu`.
3. Đăng nhập lại.
4. Vào Phân quyền để thêm email nhân viên.

## Collection sử dụng
users, customers, products, priceLists, staff, sales, receipts, stockVouchers, warranties, expenses, audit.

## Lưu ý quan trọng
- Khi sửa/xóa phiếu kho cũ, bản web tĩnh này chưa tự hoàn nguyên tồn kho như backend chuyên nghiệp. Muốn chuẩn tuyệt đối cần Cloud Functions để ghi sổ kho bất biến.
- Phiếu bán mới sẽ tự trừ tồn kho. Khi sửa đơn cũ, nên kiểm tra lại tồn kho thủ công hoặc nâng cấp thêm Cloud Functions.
