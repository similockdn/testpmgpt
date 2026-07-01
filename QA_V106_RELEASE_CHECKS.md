# QA V106 - Enterprise Workflow Stable RC

## Kiểm tra kỹ thuật đã chạy

- `node --check app.js`: OK
- Kiểm tra trùng ID trong `index.html`: 0 lỗi
- Kiểm tra hàm `onclick` thiếu trong `app.js`: 0 lỗi
- Kiểm thử nghiệp vụ mô phỏng: OK
- ZIP giải nén kiểm tra: OK

## Kịch bản nghiệp vụ đã mô phỏng

1. Bán hàng trong kỳ có thu trực tiếp.
2. Bán hàng trong kỳ thu một phần bằng phiếu thu.
3. Thu công nợ cũ trong kỳ.
4. Phiếu chi và lương trong kỳ.
5. Tính công nợ theo từng phiếu bán.
6. Đối chiếu Doanh số / Thu theo đơn / Tiền vào quỹ / Sổ quỹ.

## Kết luận

Bản V106 là bản Release Candidate theo hướng Enterprise Workflow Stable. Các chỉ số tài chính đã được tách rõ theo nguồn dữ liệu:

- Doanh số: phiếu bán.
- Thu theo đơn: tiền đã thu của phiếu bán trong kỳ.
- Tiền vào quỹ: chứng từ thu theo ngày thu.
- Sổ quỹ: số dư đầu kỳ + thu - chi.
- Công nợ: phiếu bán - tiền đã thu theo từng phiếu.
