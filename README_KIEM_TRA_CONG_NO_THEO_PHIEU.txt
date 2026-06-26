BẢN FIX CÔNG NỢ THEO TỪNG PHIẾU BÁN

Mục tiêu:
- Không gom công nợ theo tên khách hàng.
- Không gom nhiều phiếu bán của cùng một khách vào một dòng công nợ.
- Mỗi phiếu bán là một dòng công nợ riêng.
- Phiếu thu chỉ trừ vào đúng phiếu bán được chọn.

Đã chỉnh:
1. calcDebtRows()
   - Tạo công nợ theo từng phiếu bán.
   - Mỗi dòng có debtKey dạng sale:<saleId>.

2. salePaymentInfo()
   - Tính đã thu = tiền thu lúc tạo phiếu + phiếu thu có saleId/saleCode đúng phiếu.
   - Không phân bổ tiền theo tên khách hoặc nhóm khách.

3. saveReceipt()
   - Bắt buộc thu tiền từ một dòng công nợ theo phiếu bán.
   - Lưu saleId, saleCode và debtKey của đúng phiếu bán.

4. renderDebts()
   - Bổ sung cột Mã phiếu.
   - Hiển thị sản phẩm riêng từng phiếu.

Tình huống cần test:
- Mr.Tuấn đơn S01B đã thu 2.250.000.
- Mr.Tuấn đơn S6 tổng 5.500.000 chưa thu.
Kết quả đúng:
- S01B nằm trong công nợ đã tất toán hoặc không còn ở công nợ phải thu.
- S6 vẫn còn nợ 5.500.000.
- Không lấy tiền thu của S01B trừ sang S6.
