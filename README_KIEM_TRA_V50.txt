SIMILOCK ĐÀ NẴNG SALES - V50

Nội dung cập nhật:
1. Rà soát lại chức năng sửa thông tin khách hàng trên phiếu bán đã thu tiền.
2. Phiếu đã thu tiền vẫn cho phép sửa Tên / SĐT / Địa chỉ / Loại khách.
3. Chỉ cập nhật đúng phiếu bán đang sửa, không tự đổi hàng loạt phiếu cũ.
4. Cho phép chọn khách hàng đã có trong danh mục khách hàng.
5. Nếu phiếu đã có phiếu thu liên quan, hệ thống đồng bộ lại thông tin khách trên phiếu thu liên quan để không mất trạng thái đã thu.
6. Giữ nguyên tiền hàng, đã thu, còn nợ, kho, sản phẩm khi chỉ sửa thông tin khách.
7. Chuẩn hóa lại tên hiển thị khách hàng trên phiếu bán: ưu tiên snapshot của phiếu, không tự lấy tên mới từ hồ sơ khách làm đổi đơn cũ.
8. Kiểm tra cú pháp app.js bằng node --check: OK.

Lưu ý:
- Các đơn cũ từng bị sửa sai tên trước đây cần mở từng phiếu và sửa đúng lại một lần.
- Cập nhật code lên GitHub không làm mất dữ liệu Firestore nếu không đổi firebase-config và không dùng Clear Data.
