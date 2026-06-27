BẢN CẬP NHẬT MODULE BẢO HÀNH

Đã bổ sung:
1. Menu Bảo hành hoạt động như module riêng với 3 tab:
   - Phiếu bảo hành
   - Lịch sử bảo hành
   - Báo cáo nhanh

2. Phiếu bảo hành:
   - Tìm phiếu bán theo mã phiếu / tên khách / SĐT / model.
   - Tự đổ khách hàng, SĐT, địa chỉ, model, ngày lắp.
   - Lý do bảo hành có nhiều lựa chọn.
   - Cho phép nhập lý do khác.
   - Có mô tả lỗi, kết quả xử lý, ngày tiếp nhận, ngày hoàn thành.
   - Có nhân viên tiếp nhận, kỹ thuật xử lý, mức ưu tiên, trạng thái.

3. Lịch sử bảo hành:
   - Xem lại toàn bộ lịch sử bảo hành theo khách, SĐT, mã phiếu, model.
   - Mỗi lần bảo hành là 1 phiếu riêng.

4. Báo cáo nhanh:
   - Tổng phiếu bảo hành.
   - Thống kê theo trạng thái.
   - Thống kê theo lý do.
   - Thống kê theo model.

Nguyên tắc dữ liệu:
- Bảo hành liên kết theo saleId / saleCode, không liên kết theo tên khách.
- Tránh nhầm khách trùng tên.
- Bảo hành tính từ ngày lắp / ngày hoàn thành lắp đã lưu trên phiếu bán.

Đã kiểm tra:
- app.js không lỗi cú pháp bằng node --check.
- style.css cân bằng dấu { }.
- Không đổi Firebase config/database.
