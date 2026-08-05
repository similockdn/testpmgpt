# V110 — Ghi nhận hoa hồng theo thu đủ tiền

## Công thức nghiệp vụ

`Hoa hồng = (Tổng thanh toán - VAT) × % hoa hồng lưu trên đơn`

- Tổng thanh toán đã bao gồm phụ thu, nên phụ thu được tính hoa hồng.
- Chưa thu hoặc chỉ thu một phần: hoa hồng phải trả bằng 0.
- Khi tổng các khoản thu hợp lệ đạt 100% giá trị đơn, toàn bộ hoa hồng được ghi nhận vào ngày đó.
- Đơn bán tháng trước nhưng tháng sau mới thu đủ được tính vào thu nhập tháng sau.

## Thay đổi kỹ thuật

- Tách `expectedSaleCommission` (dự kiến theo đơn) và `saleCommission` (đã đủ điều kiện trả).
- Lưu phần trăm hoa hồng trên từng đơn để không bị đổi theo cấu hình nhân viên về sau.
- Báo cáo lợi nhuận ghi rõ hoa hồng dự kiến; báo cáo thu nhập dùng ngày thu đủ 100%.
- Không tạo bút toán âm hoa hồng dự kiến khi hủy phiếu chưa phát sinh thu tiền.
- Bổ sung kiểm thử tự động cho chưa thu, thu một phần, thu đủ khác tháng, phụ thu, VAT và phần trăm trên đơn.
