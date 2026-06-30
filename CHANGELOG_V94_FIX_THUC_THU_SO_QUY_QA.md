# V94 - Sửa nghiêm túc Thực thu / Sổ quỹ

## Quy tắc đã chốt

1. **Doanh số Dashboard** = tổng giá trị phiếu bán trong kỳ lọc.
2. **Thực thu Dashboard** = số tiền đã thu của các phiếu bán trong kỳ lọc, chỉ tính các khoản thu nằm trong kỳ lọc và capped không vượt quá tổng tiền từng phiếu.
3. **Sổ quỹ / Báo cáo thanh toán** = dòng tiền thực tế theo ngày chứng từ:
   - Phiếu thu hợp lệ.
   - Thu trực tiếp trên phiếu bán chỉ dùng cho dữ liệu legacy/chưa lập phiếu thu.
   - Phiếu chi và lương là dòng tiền ra.
4. Chống cộng đôi:
   - Phiếu thu trùng cùng phiếu bán, ngày, số tiền, phương thức chỉ tính một lần.
   - Thu trực tiếp trong phiếu bán không cộng thêm nếu cùng ngày đã có phiếu thu tương ứng.
5. Phiếu thiếu phương thức thanh toán hiển thị **Chưa khai báo** để dễ rà soát dữ liệu cũ.

## Đã kiểm thử bằng tool

- `node --check app.js`: OK.
- Kiểm tra trùng ID trong HTML: OK.
- Kiểm tra thiếu hàm `onclick`: OK.
- Chạy test mô phỏng tài chính `qa_finance_v94_tests.js`: OK.
- Kiểm tra ZIP giải nén: OK.
