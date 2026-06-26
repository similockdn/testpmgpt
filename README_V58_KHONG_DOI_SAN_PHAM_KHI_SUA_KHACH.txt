BẢN V58 - FIX SỬA KHÁCH KHÔNG ĐỔI SẢN PHẨM

Đã chỉnh:
1. Khi bấm Sửa khách hàng trên phiếu bán, chỉ cho thay đổi:
   - Mã KH
   - Tên khách
   - Số điện thoại
   - Địa chỉ
   - Loại khách

2. Không thay đổi các item sản phẩm bên dưới:
   - Không đổi model
   - Không đổi tên sản phẩm
   - Không đổi số lượng
   - Không đổi đơn giá
   - Không đổi chiết khấu dòng
   - Không đổi thành tiền
   - Không đổi đã thu/còn nợ

3. Đã bỏ gọi refreshSaleItemPricesByCustomerType() sau khi lưu thông tin khách để tránh giá bị tính lại hoặc về 0.

Lưu ý kiểm tra thực tế sau khi upload:
- Mở một phiếu bán đã có sản phẩm và giá > 0.
- Bấm Sửa KH.
- Đổi tên/SĐT/địa chỉ hoặc chọn khách có sẵn.
- Lưu lại.
- Kiểm tra các dòng sản phẩm vẫn giữ nguyên giá và số lượng.
