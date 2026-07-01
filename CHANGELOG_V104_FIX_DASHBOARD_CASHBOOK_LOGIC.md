# V104 - Chốt lại cách tính Thực thu Dashboard và Sổ quỹ

## Sửa nghiệp vụ
- Dashboard: **Thực thu** = số tiền đã thu cho các phiếu bán có ngày bán trong kỳ lọc.
- Sổ quỹ: **Tổng thu sổ quỹ** = dòng tiền thực tế theo ngày chứng từ thu/chi.
- Không ép Dashboard Thực thu phải khớp Sổ quỹ khi kỳ lọc có thu công nợ cũ hoặc thu cho phiếu bán ngoài kỳ.

## Lý do sửa
Trước đây Dashboard lấy trực tiếp từ Sổ quỹ nên khi có phiếu thu công nợ cũ, Thực thu bị lớn hơn Doanh số trong kỳ, gây hiểu nhầm là sai số.
