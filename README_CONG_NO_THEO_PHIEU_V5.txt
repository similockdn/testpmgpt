BẢN FIX V5 - CÔNG NỢ THEO TỪNG PHIẾU BÁN

Mục tiêu:
- Không gom công nợ theo tên khách hàng.
- Không gom nhiều phiếu của cùng một khách.
- Mỗi phiếu bán là một dòng công nợ riêng.
- Phiếu thu chỉ trừ vào đúng phiếu bán qua saleId / saleCode / debtKey.

Sửa thêm ở V5:
- Không tự lấy tiền đã thu cũ kiểu "paid" nếu đó là dữ liệu cũ thanh toán một phần không có dấu xác nhận theo phiếu.
- Tránh trường hợp đơn Mr.Tuấn S01B đã thu 2.250.000 bị trừ nhầm sang đơn Mr.Tuấn S6 5.500.000.
- Tiền nhập trực tiếp trên phiếu bán mới sẽ được đánh dấu paidSource=sale_form và paidEntryKey=mã phiếu để vẫn tính đúng.
- Dữ liệu cũ thanh toán đủ toàn bộ đơn vẫn được nhận diện nếu paid = grand và trạng thái Đã thu tiền.

Checklist cần test trên Firebase:
1. Mr.Tuấn S01B tổng 2.250.000 đã thu đủ -> không hiện công nợ.
2. Mr.Tuấn S6 tổng 5.500.000 chưa thu -> hiện còn nợ 5.500.000.
3. Bấm Thu tiền trên S6, thu 1.000.000 -> S6 còn nợ 4.500.000, S01B không đổi.
4. Hai khách trùng tên nhưng khác SĐT/địa chỉ -> không trừ nhầm tiền.
5. Một khách có nhiều phiếu -> mỗi phiếu là một dòng công nợ riêng.
