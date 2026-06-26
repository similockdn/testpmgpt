BẢN V51 - KIỂM TRA QUY TRÌNH SỬA PHIẾU BÁN

Đã cập nhật:
1. Khi bấm Sửa từ tab Danh sách phiếu bán, hệ thống tự chuyển về tab Phiếu bán hàng.
2. Không còn hiện popup/cửa sổ hướng dẫn "bấm vào tab Phiếu bán hàng để sửa".
3. Phiếu đã thu tiền/đã xuất kho: nhân viên vẫn được sửa thông tin khách hàng, không cho sửa tiền hàng/kho/sản phẩm để tránh lệch dữ liệu.
4. Admin vẫn có thể mở sửa toàn bộ phiếu nếu cần.
5. Sửa thông tin khách trên phiếu bán chỉ cập nhật đúng phiếu đó, không ghi đè hàng loạt đơn cũ.
6. Có thể chọn khách có sẵn trong danh mục khi sửa khách trên phiếu.

Đã kiểm tra kỹ thuật:
- app.js: node --check OK.
- Rà các hàm onclick chính trong HTML.
- Rà quy trình: Danh sách phiếu bán -> Sửa -> tự mở tab Phiếu bán hàng -> load dữ liệu phiếu.
- Rà logic phiếu đã thu tiền: chỉ sửa thông tin khách hàng nếu không phải Admin.

Lưu ý:
- Kiểm tra thực tế trên Firebase/GitHub cần deploy file mới và hard refresh trình duyệt để tránh cache bản cũ.
