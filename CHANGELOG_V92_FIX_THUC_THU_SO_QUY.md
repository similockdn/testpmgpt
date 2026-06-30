# V92 - Fix Thực thu / Sổ quỹ / Báo cáo thanh toán

## Quy tắc tài chính đã chốt

1. Doanh số
- Nguồn: phiếu bán hàng trong kỳ.
- Công thức: tổng giá trị phiếu bán (`grand`).

2. Thực thu trên Dashboard
- Nguồn: chính các phiếu bán nằm trong kỳ lọc Dashboard.
- Công thức: tổng số tiền đã thu của từng phiếu bán, chặn tối đa bằng giá trị phiếu.
- Mục tiêu: không còn trường hợp Thực thu trên Dashboard vượt Doanh số của kỳ do thu công nợ cũ.

3. Sổ quỹ
- Nguồn: dòng tiền thực tế phát sinh theo ngày chứng từ.
- Thu: phiếu thu + tiền thu trực tiếp tại phiếu bán.
- Chi: phiếu chi + chi lương.
- Không dùng Sổ quỹ để tính Doanh số.

4. Báo cáo thanh toán
- Nguồn: Sổ quỹ.
- Mục tiêu: tổng hợp tiền vào / tiền ra theo phương thức thanh toán.

## Sửa giao diện
- Đổi mô tả KPI Dashboard: “Thực thu” = “Đã thu của phiếu bán trong kỳ”.
- Đổi “Tổng thu” trong Sổ quỹ thành “Tiền vào trong kỳ”.
- Đổi “Tổng chi” thành “Tiền ra trong kỳ”.
- Bỏ chữ “Tồn tạm tính”, đổi thành “Chênh lệch kỳ”.
- Ghi chú rõ: Chênh lệch kỳ = Tiền vào - Tiền ra, không phải số dư quỹ cuối nếu chưa nhập số dư đầu kỳ.

## Check đã chạy
- node --check app.js
- Check trùng ID trong index.html
- Check thiếu hàm onclick
- Check ZIP giải nén
