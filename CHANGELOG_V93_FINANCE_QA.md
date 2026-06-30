# V93 - Rà soát lại Sổ quỹ / Thực thu

Quy tắc tài chính đã chuẩn hóa:

- Doanh số: tổng giá trị phiếu bán trong kỳ.
- Thực thu / Tiền thu: dòng tiền thực nhận trong kỳ từ Sổ quỹ.
- Sổ quỹ: Phiếu thu + thu trực tiếp hợp lệ - Phiếu chi/lương.
- Thu trực tiếp không bị cộng đôi nếu đã có phiếu thu cùng phiếu, cùng ngày, cùng số tiền.
- Phiếu thu thiếu phương thức không còn ghi "Chưa xác định", đổi thành "Chưa khai báo" để dễ lọc và xử lý dữ liệu cũ.
- Bỏ cách gọi dễ hiểu nhầm "Tồn tạm tính" / "Chênh lệch lũy kế", đổi thành "Thu - chi trong kỳ" và "Lũy kế trong kỳ".

Các kiểm tra đã chạy:

- node --check app.js
- Kiểm tra trùng ID trong index.html
- Kiểm tra onclick thiếu hàm trong app.js
- Kiểm tra ZIP giải nén được
