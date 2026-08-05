# V108 - Hoa hồng, lọc phiếu bán và Dashboard tuần

## Hoa hồng

- Hoa hồng Sale, công kỹ thuật và tiền xăng chỉ phát sinh khi số thực thu của đúng phiếu đạt 100% giá trị đơn.
- Số thực thu được tính từ khoản thu trực tiếp có khóa phiếu, cộng phiếu thu còn hiệu lực và trừ tiền đã hoàn.
- Không sử dụng `paidTotal`, `debtLeft`, `commissionStatus` lưu sẵn để tự mở hoa hồng.
- Phiếu thu bị hủy hoặc khoản hoàn tiền làm thực thu xuống dưới 100% sẽ thu hồi điều kiện hưởng hoa hồng.
- Nếu thu bù lại đủ, kỳ hoa hồng chuyển sang ngày thu bù đạt 100%.
- Đối chiếu tiền VND theo số nguyên để tránh sai số thập phân rất nhỏ làm treo công nợ.

## Danh sách phiếu bán

- Thêm tìm kiếm theo tháng bán.
- Thêm khoảng ngày bán từ ngày - đến ngày.
- Thêm nút lọc nhanh Hôm nay và Xóa lọc.
- Tổng phiếu, số lượng, doanh số, đã thu và còn nợ cập nhật theo kết quả đang lọc.

## Dashboard

- Thêm biểu đồ doanh số từng ngày của tuần hiện tại, đủ từ Thứ 2 đến Chủ nhật.
- Biểu đồ chỉ cộng phiếu bán còn hiệu lực, loại phiếu đã hủy.
- Hiển thị tổng doanh số và số phiếu bán trong tuần.

## Kiểm thử

- Thêm `qa_v108_commission_sales_dashboard_tests.js` cho các tình huống thu thiếu, thu đủ, hủy phiếu thu, hoàn tiền, thu bù, dữ liệu lưu sẵn sai, trùng phiếu thu và biểu đồ tuần.
