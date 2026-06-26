KIỂM TRA CÔNG NỢ THEO TỪNG PHIẾU - V4

Đã sửa thêm lỗi còn sót:
- Hàm receiptsForSale() cũ vẫn phân bổ phiếu thu theo customerId, có thể làm đơn cùng khách/trùng tên bị trừ nhầm.
- V4 đã đổi receiptsForSale() sang chỉ lấy phiếu thu có saleId / saleCode / debtKey đúng với phiếu bán.

Nguyên tắc hiện tại:
1. Mỗi phiếu bán là 1 dòng công nợ riêng.
2. Không gom theo tên khách.
3. Không gom nhiều phiếu của cùng 1 khách.
4. Phiếu thu chỉ trừ vào đúng phiếu bán được chọn.
5. Phiếu đã thu của Mr.Tuấn S01B không được trừ qua Mr.Tuấn S6.

Đã kiểm tra tĩnh:
- node --check app.js: OK
- calcDebtRows() tạo debtKey sale:<saleId>
- saveReceipt() bắt buộc chọn debtkey theo phiếu
- receiptSaleId() ưu tiên saleId/saleCode/debtKey
- receiptsForSalePayment() lọc phiếu thu theo đúng phiếu bán
- receiptsForSale() đã được sửa để không phân bổ theo khách nữa

Cần test thực tế trên GitHub/Firebase:
- Tạo 2 phiếu cùng tên Mr.Tuấn nhưng khác SĐT/sản phẩm.
- Thu tiền cho phiếu S01B.
- Vào Công nợ kiểm tra phiếu S6 vẫn còn nguyên nợ, không bị trừ.
