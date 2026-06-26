V58 - Fix công nợ theo từng phiếu bán V6

Mục tiêu sửa:
- Không gom công nợ theo tên khách.
- Không gom công nợ theo customerId nếu cùng khách có nhiều phiếu.
- Mỗi phiếu bán là một dòng công nợ riêng.
- Phiếu thu chỉ trừ vào đúng phiếu bán nếu có saleId / saleCode / debtKey.
- Thanh toán một phần cũ không có khóa phiếu sẽ KHÔNG tự động trừ để tránh lấy tiền của đơn Mr.Tuấn S01B trừ qua đơn Mr.Tuấn S6.
- Khoản paid trực tiếp trên phiếu chỉ được tính nếu gắn đúng mã phiếu hoặc là phiếu cũ đã thu đủ.

Case cần test:
1. BH000014 - Mr.Tuấn - S01B - Tổng 2.250.000 - Đã thu đủ.
   Kết quả: Nằm ở danh sách đã tất toán, không ảnh hưởng phiếu khác.

2. BH000022 - Mr.Tuấn khác SĐT/địa chỉ - S6 - Tổng 5.500.000 - Chưa thu.
   Kết quả: Còn nợ đủ 5.500.000 nếu chưa có phiếu thu đúng BH000022.

3. Tạo phiếu thu từ dòng công nợ BH000022.
   Kết quả: Chỉ trừ BH000022, không trừ BH000014 hoặc khách trùng tên khác.

Lưu ý dữ liệu cũ:
- Nếu trước đây đã nhập nhầm paid trực tiếp vào sai phiếu, V6 sẽ không tự dùng thanh toán một phần đó nếu không có khóa phiếu hợp lệ.
- Nếu cần ghi nhận thu tiền cho phiếu nào, vào Công nợ → đúng dòng phiếu đó → Thu tiền.
