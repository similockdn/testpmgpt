# V111 — Ghi nhận doanh thu và nguồn khách hàng

## Quy tắc doanh thu

- Đơn chỉ mới cọc nhưng chưa lắp: không tính doanh thu.
- Đơn đã lắp nhưng chưa thu đủ: chưa tính doanh thu.
- Đơn đã thu đủ nhưng chưa lắp: chưa tính doanh thu.
- Chỉ ghi nhận toàn bộ doanh thu khi đồng thời đã lắp và đã thu đủ 100%.
- Ngày ghi nhận là ngày hoàn tất điều kiện sau cùng: ngày lắp hoặc ngày thu đủ, lấy ngày muộn hơn.
- Vì vậy đơn bán/cọc tháng trước nhưng lắp hoặc thu đủ tháng sau được đưa vào doanh thu tháng sau.

## Báo cáo và xuất Excel

- Dashboard và Báo cáo doanh thu dùng ngày ghi nhận, không còn dùng ngày bán để cộng doanh thu tháng.
- Báo cáo hiển thị riêng số tiền cọc chưa lắp bị loại khỏi doanh thu kỳ.
- Bổ sung bảng chi tiết doanh thu ghi nhận.
- Bổ sung nút `Xuất doanh thu` theo khoảng thời gian đang lọc.
- File doanh thu, bán hàng và hoa hồng có thêm `Nguồn khách hàng`.
- Nguồn khách hàng được lưu vào snapshot của phiếu bán để giữ đúng dữ liệu lịch sử.

## Kiểm thử

- Cọc chưa lắp.
- Thu đủ nhưng chưa lắp.
- Đã lắp nhưng chưa thu đủ.
- Thu đủ sau ngày lắp.
- Lắp sau ngày thu đủ.
- Phân tháng ghi nhận và cột nguồn khách hàng.
