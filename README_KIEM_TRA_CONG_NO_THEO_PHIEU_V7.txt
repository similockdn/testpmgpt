BẢN V7 - FIX CÔNG NỢ TRÙNG TÊN / TRÙNG MÃ PHIẾU CŨ

Nguyên tắc đã chỉnh:
1. Công nợ tách theo từng phiếu bán, không gom theo tên khách.
2. Phiếu thu chỉ trừ vào phiếu bán khi khớp saleId/debtKey mạnh.
3. Nếu chỉ có saleCode, bắt buộc thông tin khách phải khớp mã KH hoặc SĐT/địa chỉ.
4. Không dùng tên khách để đối chiếu vì tên có thể trùng.
5. Dữ liệu cũ bị sửa nhầm saleCode/customer sẽ không tự động trừ sang phiếu khác.

Case cần test:
- BH000014: Mr.Tuấn S01B đã thu -> đã thu tối đa bằng tổng phiếu, không trừ qua BH000022.
- BH000022: Mr.Tuấn S6 chưa thu -> không lấy 2.250.000 của BH000014 để trừ. Còn nợ phải là 5.500.000 nếu không có phiếu thu đúng saleId/debtKey.

Lưu ý:
Nếu trong Firestore đã có phiếu thu cũ bị gắn nhầm saleId/debtKey vào BH000022, cần sửa/xóa phiếu thu đó. Code V7 đã chặn trường hợp chỉ trùng tên hoặc chỉ trùng saleCode không đủ thông tin khách.
