BẢN V58 - KIỂM SOÁT SỬA ĐƠN GIÁ / SẢN PHẨM

Nội dung cập nhật:
1. Khi sửa thông tin khách hàng trên phiếu bán:
   - Chỉ cập nhật Tên khách, SĐT, Địa chỉ, Loại khách, Mã KH/ID khách.
   - Không thay đổi sản phẩm, số lượng, đơn giá, chiết khấu, tổng tiền, đã thu, còn nợ, giá vốn, kho.

2. Khi sửa đơn giá / số lượng / sản phẩm / chiết khấu / phụ thu / công kỹ thuật / tiền xăng / kho:
   - Không tạo phiếu bán mới.
   - Không cộng trùng doanh thu.
   - Cập nhật lại đúng mã phiếu cũ.
   - Bắt buộc nhập lý do chỉnh sửa.
   - Ghi nhật ký thao tác vào logs với giá trị cũ, giá trị mới, item cũ, item mới và lý do.

3. Phiếu đã thu tiền:
   - Nếu sửa giá tăng: hệ thống tính lại còn nợ = Tổng mới - Đã thu thực tế.
   - Nếu sửa giá giảm: hệ thống giữ đã thu thực tế và báo cáo có thể hiện dư thu theo logic hiện có.
   - Đã thu không tự cộng thêm.

4. Phiếu đã xuất kho:
   - Nhân viên thường chỉ sửa thông tin khách.
   - Admin/người có quyền sửa đơn mới được sửa dữ liệu tài chính và phải nhập lý do.

Checklist cần test trên link test trước khi đưa lên bản chính:
- Tạo phiếu 2.150.000, thu đủ.
- Sửa tên/SĐT/địa chỉ khách: sản phẩm và đơn giá không đổi.
- Sửa đơn giá 2.150.000 -> 2.450.000: doanh thu phiếu = 2.450.000, còn nợ = 300.000, không tạo phiếu mới.
- Sửa đơn giá 2.150.000 -> 2.000.000: doanh thu phiếu = 2.000.000, không tạo phiếu mới.
- Kiểm tra Công nợ, Phiếu thu, Dashboard, Báo cáo, Hoa hồng, Lợi nhuận.
