V57 - Kiểm tra và sửa đồng bộ khách hàng trên phiếu bán

Mục tiêu sửa:
1. Phiếu bán đã thu tiền vẫn được phép sửa thông tin khách do nhập liệu sai.
2. Khi sửa Tên / SĐT / Địa chỉ / Loại khách trên một phiếu bán, chỉ cập nhật đúng phiếu đó.
3. Đồng bộ thông tin khách của đúng phiếu đang sửa sang:
   - Phiếu thu liên quan
   - Phiếu xuất kho / xuất kho bổ sung / trả hàng liên quan
   - Bảo hành liên quan
   - Báo cáo lấy theo phiếu bán đã cập nhật
4. Không cập nhật hàng loạt các phiếu bán cũ khác.
5. Chọn khách có sẵn theo ID khách hàng duy nhất, không dò theo tên nên không nhầm khi trùng tên.
6. Nếu nhập tay và thay đổi SĐT/Mã KH khác khách cũ, hệ thống không giữ ID khách cũ để tránh gom nhầm công nợ/phiếu thu.

Các điểm đã kiểm tra ở mức code:
- JS không lỗi cú pháp bằng node --check.
- Hàm saveSaleCustomerEdit đã đồng bộ sale/receipt/stockVoucher/warranty.
- Phiếu thu đã lưu thêm customerPhone/customerAddress/customerType.
- Phiếu xuất kho phát sinh từ bán hàng đã lưu thêm customerCode/customerPhone/customerAddress/customerType.
- In phiếu thu hiển thị thêm SĐT và địa chỉ theo snapshot phiếu thu.

Lưu ý kiểm thử thực tế sau khi đưa lên GitHub:
1. Tạo khách A sai thông tin -> tạo phiếu bán 2.150.000 -> đã thu tiền.
2. Mở chi tiết phiếu -> Sửa thông tin KH -> nhập lại đúng tên/SĐT/địa chỉ hoặc chọn khách có sẵn -> Lưu.
3. Kiểm tra Danh sách phiếu bán, Chi tiết phiếu, Phiếu thu, Phiếu xuất kho, Bảo hành, Báo cáo.
4. Kiểm tra các phiếu bán cũ khác không bị đổi theo.
