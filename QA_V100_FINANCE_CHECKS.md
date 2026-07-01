# QA V100 - Kiểm tra tài chính

Đã chạy kiểm tra tĩnh:
- `node --check app.js`: OK.
- Kiểm tra trùng ID trong index.html: 0 lỗi.
- Kiểm tra hàm onclick/onchange/oninput thiếu: 0 lỗi.

Đã kiểm tra logic tài chính trong code:
- Dashboard `Thực thu` dùng `cashbookRows(range.from, range.to).reduce(... income ...)`.
- Sổ quỹ `Tổng thu theo phiếu thu` dùng cùng nguồn `cashbookRows(from, to).reduce(... income ...)`.
- Vì cùng nguồn dữ liệu, khi cùng bộ lọc ngày, Dashboard `Thực thu` phải khớp với Sổ quỹ `Tổng thu theo phiếu thu`.

Quy tắc đối chiếu:
- Nếu Doanh số khác Thực thu: không phải lỗi, vì Doanh số là phiếu bán, còn Thực thu là phiếu thu.
- Nếu Thực thu khác Tổng thu Sổ quỹ khi cùng ngày lọc: cần kiểm tra bộ lọc ngày hoặc dữ liệu phiếu thu bị thiếu ngày/số tiền.
