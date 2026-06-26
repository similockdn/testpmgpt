BẢN SỬA CÔNG NỢ TRÙNG TÊN - KIỂM SOÁT PHÂN BỔ TIỀN THU

Đã chỉnh lại logic công nợ:
1. Không gom công nợ theo tên khách.
2. Không dùng customerId đơn lẻ của phiếu thu để trừ công nợ khi không có snapshot rõ ràng.
3. Phiếu thu chỉ được phân bổ vào công nợ khi:
   - Có saleId/saleCode gắn với phiếu bán; hoặc
   - Có snapshot SĐT/Mã KH/Địa chỉ khớp chính xác; hoặc
   - Được tạo từ nút Thu tiền trên đúng dòng công nợ.
4. Không dùng paidTotal cũ để tính lại công nợ vì paidTotal chỉ là trạng thái phân bổ và có thể bị sai sau khi sửa khách.
5. Dòng Thu tiền hiện đi theo debtKey riêng của từng nhóm công nợ, tránh trừ nhầm giữa 2 khách trùng tên.

Cần test thực tế trên Firebase:
- Tạo 2 khách cùng tên, khác SĐT/địa chỉ.
- Khách A: đơn 2.250.000, đã thu đủ.
- Khách B: đơn 5.500.000, chưa thu.
- Vào Công nợ: chỉ khách B còn nợ 5.500.000, không bị trừ 2.250.000.
- Bấm Thu tiền trên khách B: phiếu thu phải đi đúng dòng khách B.
