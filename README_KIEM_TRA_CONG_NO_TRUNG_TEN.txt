BẢN SỬA CÔNG NỢ TRÙNG TÊN

Đã sửa trọng tâm:
1. Công nợ KHÔNG gom theo tên khách hàng.
2. Công nợ tách theo snapshot khách: SĐT + địa chỉ, sau đó mới đến mã KH/ID nếu thiếu dữ liệu.
3. Phiếu thu có saleId/allocation sẽ đi theo đúng phiếu bán, không lấy tiền đã thu của khách/đơn khác.
4. Trường hợp 2 khách cùng tên nhưng khác SĐT/địa chỉ/sản phẩm sẽ tách công nợ riêng.
5. Không thay đổi sản phẩm, đơn giá, số lượng, chiết khấu, doanh thu khi tính lại công nợ.

Checklist cần test trên GitHub/Firebase:
- Tạo 2 khách cùng tên nhưng khác SĐT và địa chỉ.
- Khách A có đơn 2.250.000 đã thu đủ.
- Khách B có đơn 5.500.000 chưa thu.
- Vào Công nợ: chỉ thấy khách B nợ 5.500.000, không bị trừ 2.250.000 của khách A.
- Bấm Thu tiền khách B: phiếu thu phải gắn đúng khách B.
