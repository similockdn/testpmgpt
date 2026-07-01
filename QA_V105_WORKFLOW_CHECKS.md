# QA V105 - Kiểm thử nghiệp vụ kế toán

## Kiểm thử đã thực hiện

### 1. Kiểm tra cú pháp
- `node --check app.js`: OK

### 2. Kiểm tra giao diện
- Không trùng ID trong `index.html`.
- Không thiếu hàm xử lý chính trong `onclick`.
- Dashboard có đủ KPI: Doanh số, Thu theo đơn, Tiền vào quỹ, Công nợ, Đơn hàng, Kho, Bảo hành.

### 3. Kiểm thử nghiệp vụ mô phỏng

#### Kịch bản A - Bán trong kỳ và thu ngay
- Phiếu bán: 10.000.000
- Thu: 10.000.000
- Doanh số: 10.000.000
- Thu theo đơn: 10.000.000
- Tiền vào quỹ: 10.000.000
- Công nợ: 0

#### Kịch bản B - Bán trong kỳ nhưng chưa thu
- Phiếu bán: 10.000.000
- Thu: 0
- Doanh số: 10.000.000
- Thu theo đơn: 0
- Tiền vào quỹ: 0
- Công nợ: 10.000.000

#### Kịch bản C - Thu công nợ cũ trong kỳ
- Phiếu bán tháng trước: 10.000.000
- Phiếu thu tháng này: 10.000.000
- Doanh số tháng này: 0
- Thu theo đơn tháng này: 0
- Tiền vào quỹ tháng này: 10.000.000
- Công nợ: giảm 10.000.000

#### Kịch bản D - Bán tháng này, tháng sau mới thu
- Doanh số tháng này tăng.
- Thu theo đơn tháng này chưa tăng.
- Tiền vào quỹ tháng này chưa tăng.
- Tháng sau khi thu, Tiền vào quỹ tháng sau tăng.

## Kết luận

V105 tách rõ hai khái niệm dễ nhầm:

- **Thu theo đơn**: phục vụ quản trị bán hàng theo ngày bán.
- **Tiền vào quỹ**: phục vụ kế toán quỹ theo ngày thu.

