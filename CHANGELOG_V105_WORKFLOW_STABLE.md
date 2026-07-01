# V105 - Stable nghiệp vụ kế toán & quy trình

## Quyết định nghiệp vụ đã chốt

1. **Doanh số**: tổng giá trị Phiếu bán theo ngày bán.
2. **Thu theo đơn**: số tiền đã thu của chính các Phiếu bán nằm trong kỳ lọc. Chỉ số này dùng để biết các đơn trong kỳ đã thu được bao nhiêu.
3. **Tiền vào quỹ**: tổng dòng tiền thu theo ngày thu trong kỳ, lấy từ Sổ quỹ. Chỉ số này dùng để đối chiếu tiền thực nhận trong kỳ.
4. **Sổ quỹ**: Số dư đầu kỳ + Thu - Chi = Số dư cuối kỳ.
5. **Công nợ**: Tổng Phiếu bán - tổng tiền thu liên quan đến từng Phiếu bán.

## Lý do phải tách “Thu theo đơn” và “Tiền vào quỹ”

Hai chỉ số này không phải lúc nào cũng bằng nhau:

- Nếu tháng này thu công nợ của đơn tháng trước, **Tiền vào quỹ** tăng nhưng **Thu theo đơn tháng này** không tăng.
- Nếu tháng này bán hàng nhưng khách chưa trả tiền, **Doanh số** tăng nhưng **Tiền vào quỹ** chưa tăng.
- Nếu tháng này bán và thu ngay, cả hai đều tăng.

## Cải tiến giao diện Dashboard

- Đổi KPI “Thực thu” thành **Thu theo đơn**.
- Bổ sung KPI **Tiền vào quỹ**.
- Ghi chú rõ nguồn dữ liệu từng chỉ số để tránh hiểu nhầm.

## Cải tiến Sổ quỹ

- Ghi chú lại cách hiểu Sổ quỹ.
- Hiển thị Số dư đầu kỳ / Tổng thu sổ quỹ / Tổng chi sổ quỹ / Số dư cuối kỳ.
- Sổ quỹ vẫn cho phép nhập số dư đầu kỳ để ra số dư cuối kỳ đúng thực tế.

