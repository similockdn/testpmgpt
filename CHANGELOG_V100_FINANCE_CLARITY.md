# V100 - Chốt lại cách hiểu Thực thu và Sổ quỹ

## Đã sửa
- Dashboard: `Thực thu` chuyển sang đúng nghĩa dòng tiền thực nhận trong kỳ, lấy từ Phiếu thu.
- Sổ quỹ: `Tổng thu theo phiếu thu` là cùng nguồn dữ liệu với Dashboard `Thực thu` khi cùng bộ lọc ngày.
- Bỏ cách hiểu Thực thu là tiền đã thu của riêng các phiếu bán trong kỳ, vì cách này làm người dùng nhầm với dòng tiền thực tế.
- Thêm ghi chú trực tiếp trong Sổ quỹ:
  - Doanh số = tổng phiếu bán theo ngày bán.
  - Thực thu/Tổng thu sổ quỹ = tổng phiếu thu theo ngày thu tiền.
  - Hai số có thể khác nhau khi thu công nợ cũ hoặc bán chịu.

## Quy tắc tài chính đã chốt
- Doanh số = Tổng giá trị phiếu bán theo ngày bán.
- Thực thu = Tổng phiếu thu theo ngày thu tiền.
- Tổng thu Sổ quỹ = Tổng phiếu thu theo ngày thu tiền.
- Tổng chi Sổ quỹ = Phiếu chi + lương theo ngày chứng từ.
- Phát sinh ròng = Tổng thu - Tổng chi, chưa phải số dư cuối nếu chưa nhập số dư đầu kỳ.
