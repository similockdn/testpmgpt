BẢN V30 - KIỂM TRA & HOÀN THIỆN QUY TRÌNH HỆ THỐNG

Đã cập nhật:
1. Bổ sung mục Nhật ký thao tác trong Hệ thống
   - Ghi nhận thao tác tạo/sửa/xóa dữ liệu chính.
   - Có tìm kiếm nhật ký và xuất Excel.
   - Chỉ Admin hoặc user có quyền Audit được xem.

2. Bổ sung trạng thái sản phẩm
   - Đang kinh doanh / Ngừng bán.
   - Model ngừng bán không được lưu vào Phiếu bán hàng.
   - Vẫn giữ dữ liệu cũ để tra cứu lịch sử.

3. Bổ sung xuất nhật ký vào Excel/Backup
   - Export toàn bộ Excel có thêm sheet Nhật ký.
   - Backup JSON có thêm logs và version v30.

4. Kiểm tra kỹ thuật
   - app.js: đã kiểm tra cú pháp bằng node --check.
   - style.css: số lượng dấu { } cân bằng.
   - index.html: đã kiểm tra các section chính.

Lưu ý khi cập nhật GitHub:
- Chỉ thay code sẽ không mất dữ liệu Firestore.
- Không đổi firebase-config.js sang project khác.
- Backup Firestore trước khi deploy.
- Test lại Admin và 1 tài khoản nhân viên sau khi cập nhật.
