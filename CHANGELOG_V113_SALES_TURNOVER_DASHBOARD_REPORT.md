# V113 — Doanh số tất cả phiếu bán trên Dashboard và Báo cáo

## Chỉ số mới

- Tổng doanh số bán hàng lấy theo ngày lập phiếu bán.
- Gồm toàn bộ phiếu còn hiệu lực: đã thu đủ, thu một phần và chưa thu.
- Phiếu hủy không được tính.
- Hiển thị đồng thời Đã thu lũy kế và Còn phải thu để đối chiếu theo công thức:
  `Tổng doanh số = Đã thu lũy kế + Còn phải thu`.

## Dashboard

- Bổ sung thẻ `Tổng doanh số bán hàng` theo bộ lọc ngày của Dashboard.
- Thẻ hiển thị kèm số đã thu và số còn nợ của chính các phiếu bán trong kỳ.
- Giữ nguyên `Tổng doanh thu`: chỉ tính phiếu đạt thu đủ 100% theo ngày thu đủ.

## Báo cáo và Excel

- Bổ sung bốn thẻ tổng quan doanh số theo ngày bán.
- Bổ sung bảng chi tiết mọi phiếu bán trong kỳ và trạng thái thu tiền.
- Bổ sung nút `Xuất doanh số` gồm hai sheet: `Tong_hop_doanh_so` và `Chi_tiet_doanh_so`.
- Giữ riêng nút `Xuất doanh thu thực thu` theo quy tắc thu đủ 100%.
