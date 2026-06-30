# V96 - Chốt lại logic Thực thu & Sổ quỹ

## Quy tắc tài chính đã sửa

1. **Doanh số**
   - Nguồn: Phiếu bán hàng.
   - Công thức: tổng giá trị phiếu bán trong kỳ.

2. **Thực thu Dashboard**
   - Nguồn duy nhất: Phiếu thu.
   - Công thức: tổng tiền phiếu thu trong kỳ theo ngày phiếu thu.
   - Không cộng trường `paid`/thu trực tiếp trên phiếu bán để tránh cộng đôi.

3. **Tổng thu Sổ quỹ**
   - Nguồn duy nhất: Phiếu thu.
   - Không cộng thu trực tiếp từ phiếu bán.
   - Phiếu thu thiếu phương thức thanh toán được chuẩn hóa là **Chuyển khoản**.

4. **Tổng chi Sổ quỹ**
   - Nguồn: Phiếu chi + chi lương.

5. **Thu - chi trong kỳ**
   - Là phát sinh ròng trong kỳ.
   - Không gọi là tồn quỹ cuối kỳ nếu chưa có số dư đầu kỳ.

## Kiểm thử đã chạy

- `node --check app.js`
- kiểm tra trùng ID
- kiểm tra thiếu hàm `onclick`
- test mô phỏng tài chính V96:
  - không cộng paid trực tiếp trên phiếu bán
  - tổng thu sổ quỹ chỉ bằng phiếu thu
  - thực thu Dashboard khớp tổng phiếu thu
  - phiếu thu thiếu phương thức mặc định Chuyển khoản
