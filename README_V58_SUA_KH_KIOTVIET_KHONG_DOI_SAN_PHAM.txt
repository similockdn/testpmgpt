BẢN V58 - SỬA POPUP SỬA KHÁCH HÀNG TRÊN PHIẾU BÁN

Đã chỉnh:
1. Popup Sửa thông tin khách hàng không dùng select/datalist kiểu cũ nữa.
2. Thêm ô tìm khách hàng kiểu KiotViet: gõ tên / SĐT / mã KH / địa chỉ.
3. Kết quả hiện thành danh sách khách rõ ràng, click trực tiếp vào khách cần chọn.
4. Không hiển thị Firestore Document ID ra giao diện.
5. Khi chọn khách có sẵn, hệ thống lấy theo ID khách nội bộ, tránh nhầm khách trùng tên.
6. Khi lưu sửa khách trên phiếu bán đã lưu: chỉ cập nhật thông tin khách trên phiếu đó và chứng từ liên quan.
7. Không cập nhật lại items sản phẩm.
8. Không đổi đơn giá về 0.
9. Không đổi số lượng, chiết khấu, thành tiền, đã thu, còn nợ, giá vốn, kho.
10. Đồng bộ snapshot khách sang phiếu thu, phiếu xuất kho, bảo hành theo đúng saleId/saleCode.

Đã kiểm tra kỹ thuật:
- app.js: node --check không lỗi cú pháp.
- Không còn dùng popup select cũ ở luồng sửa khách.
- Có CSS mới cho danh sách tìm khách trong popup.

Lưu ý kiểm thử sau khi upload:
1. Mở phiếu bán đã thu tiền.
2. Bấm Sửa thông tin KH.
3. Tìm khách khác bằng tên/SĐT.
4. Click đúng khách trong danh sách.
5. Bấm Lưu thông tin khách.
6. Kiểm tra sản phẩm, đơn giá, số lượng, chiết khấu, tổng tiền không thay đổi.
7. Kiểm tra phiếu thu/xuất kho/bảo hành hiển thị đúng thông tin khách mới.
