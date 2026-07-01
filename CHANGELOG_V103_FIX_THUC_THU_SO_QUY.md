# V103 - Sửa nghiêm túc Thực thu & Sổ quỹ

## Logic đã chốt

- Doanh số = tổng giá trị Phiếu bán theo ngày bán.
- Thực thu = tiền thực tế thu trong kỳ.
- Tổng thu Sổ quỹ = Thực thu trong cùng kỳ.
- Tiền vào Sổ quỹ gồm:
  1. Phiếu thu.
  2. Khoản thu trực tiếp được nhập ngay trên Phiếu bán.
- Tiền ra Sổ quỹ gồm:
  1. Phiếu chi.
  2. Lương.

## Lý do sửa

Các bản trước chỉ lấy Phiếu thu cho Sổ quỹ. Trong thực tế hệ thống có ô "Đã thu" ngay trên Phiếu bán; các khoản này là tiền thực nhận nhưng chưa sinh Phiếu thu riêng, nên bị thiếu trong Thực thu và Tổng thu Sổ quỹ.

## Kết quả mong muốn

Khi cùng bộ lọc ngày:

- Dashboard / Thực thu = Sổ quỹ / Tổng thu.
- Nếu có bán chịu, Doanh số > Thực thu.
- Nếu có thu công nợ cũ, Thực thu có thể > Doanh số.
- Số dư cuối kỳ = Số dư đầu kỳ + Tổng thu - Tổng chi.
