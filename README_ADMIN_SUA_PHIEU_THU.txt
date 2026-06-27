BẢN CẬP NHẬT: ADMIN SỬA PHIẾU THU ĐÃ TẤT TOÁN

Nội dung đã cập nhật:
1. Admin được phép sửa phiếu thu đã lưu, kể cả phiếu bán đã tất toán.
2. Nhân viên thường không được sửa phiếu thu đã lưu.
3. Phiếu thu luôn gắn theo từng phiếu bán: saleId / saleCode / debtKey.
4. Khi sửa số tiền phiếu thu:
   - Công nợ của đúng phiếu bán được tính lại.
   - Trạng thái phiếu bán được cập nhật lại: Đã thu tiền / Thanh toán một phần / Chưa thu tiền.
   - Hoa hồng chỉ tính khi phiếu bán thu đủ 100%, nên nếu sửa giảm phiếu thu làm đơn chưa đủ tiền thì hoa hồng sẽ tự không tính.
   - Báo cáo thu tiền / công nợ / dashboard đọc lại theo dữ liệu phiếu thu mới.
5. Nếu sửa số tiền hoặc ngày thu, hệ thống bắt buộc nhập lý do sửa.
6. Có ghi nhật ký thao tác khi sửa phiếu thu.

Lưu ý vận hành:
- Không thu tiền theo tên khách hàng để tránh trùng tên.
- Không gộp công nợ theo khách. Mỗi phiếu bán là một dòng công nợ riêng.
- Nếu dữ liệu cũ từng bị phiếu thu gắn sai phiếu bán, cần mở phiếu thu đó bằng Admin và chỉnh lại đúng phiếu bán trước khi đối chiếu.

Checklist nên test sau khi upload:
1. Tạo phiếu bán 5.500.000 chưa thu -> Công nợ hiển thị 5.500.000.
2. Thu đủ 5.500.000 -> Công nợ chuyển sang đã tất toán.
3. Admin sửa phiếu thu từ 5.500.000 xuống 2.000.000 -> Công nợ phiếu đó còn 3.500.000.
4. Admin sửa lại phiếu thu thành 5.500.000 -> Công nợ về 0.
5. Kiểm tra hoa hồng: chỉ hiển thị khi phiếu đã thu đủ 100%.
6. Kiểm tra khách trùng tên: phiếu thu không được trừ sang phiếu khác.
