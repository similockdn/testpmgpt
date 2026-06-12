BẢN RÀ SOÁT & VÁ LỖI CODE MINI ERP SIMILOCK

Đã kiểm tra lại cú pháp app.js bằng node --check: không phát hiện lỗi cú pháp.

Các điểm đã bổ sung/vá:
1. Sửa trạng thái thanh toán một phần:
   - Trước đây khi tạo đơn có thanh toán ngay một phần, code kiểm tra nhầm totals.paid.
   - Nay dùng đúng số tiền Thanh toán ngay để hiển thị: Chưa thu tiền / Thanh toán một phần / Đã thu tiền.

2. Sau khi lưu/sửa đơn bán:
   - Tự đồng bộ lại trạng thái công nợ cho khách hiện tại.
   - Nếu sửa đơn đổi khách hàng, đồng bộ lại cả khách cũ và khách mới.

3. Phiếu thu:
   - Khi nhập số tiền thu lớn hơn công nợ còn lại, hệ thống cảnh báo trước khi lưu.
   - Vẫn cho phép lưu nếu chủ động xác nhận, để xử lý trường hợp khách đặt cọc/thu dư.

4. Công nợ:
   - Không hiển thị số âm ở cột Còn nợ.
   - Nếu khách thu dư, hiển thị badge “Thu dư ...”.

5. Kho:
   - Phiếu điều chỉnh kho cho phép nhập số âm/dương đúng nghiệp vụ.
   - Phiếu nhập/xuất/kiểm kê vẫn chặn số âm.

6. Kiểm tra kho khi bán hàng kiêm xuất kho:
   - Sửa lại câu cảnh báo tồn kho rõ nghĩa hơn.

Gợi ý nên bổ sung ở bản sau:
- Phiếu chuyển kho riêng: Kho Chính -> Kho Văn Phòng và ngược lại.
- Cho phiếu thu chọn trực tiếp đơn hàng cần thu, thay vì phân bổ FIFO tự động.
- Báo cáo tồn kho theo từng kho có lọc ngày.
- Sao lưu/khôi phục dữ liệu bằng file JSON theo từng ngày.
