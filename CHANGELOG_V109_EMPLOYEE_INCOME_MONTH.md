# V109 - Lọc thu nhập nhân viên theo tháng

## Sửa lỗi chính

- Thêm ô chọn tháng cụ thể tại màn hình Thu nhập nhân viên; không còn giới hạn ở “Tháng này”.
- Tính đầu tháng, cuối tháng và tuần theo ngày địa phương, tránh lệch một ngày do chuyển đổi UTC.
- Lọc hoa hồng theo ngày phiếu bán đạt đủ 100%; giữ đúng nguyên tắc không tính khi còn thiếu tiền.
- Khi chọn một nhân viên, chỉ cộng phần thu nhập thực sự thuộc vai trò Sale/Kỹ thuật của người đó; không kéo theo thu nhập của người còn lại trên cùng đơn.
- Hỗ trợ đối chiếu dữ liệu cũ chỉ có tên nhân viên khi tên khớp duy nhất trong danh mục.
- Lọc thưởng/phạt đúng ngày và đúng nhân viên, kể cả dữ liệu lương cũ chỉ lưu tên.
- Danh sách nhân viên theo phòng ban nhận đúng nhân viên kiêm nhiệm.
- Xuất Excel hoa hồng/thu nhập áp dụng đúng cùng bộ lọc đang xem.

## Bổ sung kiểm tra

- Tháng cũ, tháng nhuận, ngày đầu/cuối tháng.
- Nhân viên Sale và kỹ thuật trên cùng đơn.
- Nhân viên kiêm nhiệm và dữ liệu cũ thiếu mã nhân viên.
- Ngày Excel dạng số và định dạng ngày Việt Nam.
- Import Excel lương nhân viên và trạng thái import.

Chạy `node qa_v109_employee_income_month_tests.js` để kiểm tra riêng bản sửa này.
