Bản v43 - Fix quy trình công nợ sau khi lưu phiếu bán

Đã kiểm tra và sửa:
- Phiếu bán lưu doanh thu nhưng không hiện ở Công nợ phải thu.
- Chuẩn hoá lại cách gom công nợ theo customerId / mã KH / SĐT để tránh mất công nợ khi dữ liệu khách bị sai hoặc đổi tên.
- Công nợ hiện lấy từ toàn bộ phiếu bán + công nợ đầu kỳ - tiền đã thu trên đơn - phiếu thu.
- Nếu phiếu bán có khách bị lệch ID nhưng còn mã KH/SĐT, hệ thống vẫn đưa vào Công nợ.
- Chặn lưu phiếu khi chưa chọn/tạo được khách hàng để tránh tạo doanh thu không có công nợ.
- Rà lại tính Đã thu / Còn nợ trong danh sách phiếu bán, chi tiết đơn, công nợ, dashboard và báo cáo.

Gợi ý test sau khi upload:
1. Tạo phiếu bán mới, Khách trả = 0 → vào Công nợ phải thu phải thấy đơn.
2. Tạo phiếu bán Khách trả một phần → Công nợ còn lại đúng.
3. Tạo phiếu bán Khách trả đủ → không nằm trong Công nợ phải thu, chuyển xuống Đã tất toán.
4. Tạo phiếu thu → số còn nợ giảm đúng.
