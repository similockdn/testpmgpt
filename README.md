# Similock Đà Nẵng COMPLETE - bản hoàn thiện

## Các nâng cấp chính
- Kho theo quy trình chuẩn: phiếu nhập, phiếu xuất, điều chỉnh, kiểm kê. Một chứng từ có nhiều dòng hàng.
- Kiểm kê đúng chênh lệch: nhập tồn thực tế, hệ thống tự tính tồn hệ thống và số lệch.
- Chặn xuất kho âm.
- Phiếu bán hàng nhiều sản phẩm, VAT tùy chọn, công nợ tự tính.
- Công nợ khách hàng + phiếu thu.
- Bảo hành theo phiếu bán, SĐT, model/serial.
- Bảng giá có thời hạn hiệu lực, import/export CSV.
- Import CSV khách hàng/sản phẩm/bảng giá có kiểm tra trùng và sai dữ liệu cơ bản.
- Xóa chứng từ bắt buộc nhập XOA để xác nhận.
- Nhật ký hệ thống và backup JSON toàn bộ dữ liệu.
- Phân quyền chuẩn: Admin, Sale, Kỹ thuật, Kho, Kế toán.

## Lưu ý Firebase
File `firebase-config.js` đã cập nhật đúng project `smilockdng` và `appId` đầy đủ.

## File import mẫu
- `khach_hang_mau_import.csv`
- `san_pham_mau_import.csv`
- `bang_gia_mau_import.csv`

## Cách dùng nhanh
1. Upload toàn bộ file lên GitHub Pages hoặc Firebase Hosting.
2. Tạo Admin lần đầu bằng email/mật khẩu.
3. Vào Phân quyền tạo email cho nhân viên.
4. Nhập danh mục sản phẩm/khách hàng/bảng giá.
5. Tạo phiếu kho nhập đầu kỳ.
6. Bắt đầu bán hàng, thu tiền, bảo hành.

## Cập nhật Excel import/export
- Các mục Khách hàng, Sản phẩm, Bảng giá, Nhân viên, Chi phí, Kho, Bảo hành đã có nút Mẫu Excel / Nhập Excel / Xuất Excel.
- Mục Báo cáo và Hệ thống có xuất Excel doanh thu, chi phí và toàn bộ dữ liệu nhiều sheet.
- File import hỗ trợ .xlsx, .xls, .csv. Nên tải Mẫu Excel trước rồi nhập đúng tên cột.
- Phiếu kho import theo từng dòng sản phẩm: các dòng cùng mã phiếu sẽ tự gom thành một chứng từ kho.
