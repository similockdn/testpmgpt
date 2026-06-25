BẢN V44 - SỬA NHẬP THÔNG TIN KHÁCH HÀNG MỚI

Đã xử lý:
- Thay popup prompt rời rạc bằng form thêm khách nhanh trong Phiếu bán.
- Tách rõ các trường: Mã KH, Tên khách, Loại khách, SĐT, Địa chỉ.
- Không còn lấy nhầm SĐT làm tên khách.
- Không còn lấy nhầm loại khách làm địa chỉ.
- Tự nhận diện số điện thoại từ ô tìm khách nếu người dùng đã nhập trước.
- Chặn lưu nếu tên khách bị trống hoặc giống số điện thoại.
- Nếu SĐT đã tồn tại, hỏi xác nhận để tránh tạo trùng khách.
- Khi lưu khách nhanh xong, tự đưa khách vào Phiếu bán và cập nhật loại khách.
- Rà lại hàm tìm khách trong Phiếu bán để ưu tiên khớp chính xác Mã KH / SĐT / Tên.

Lưu ý:
- Cập nhật lên GitHub chỉ thay code, không xóa dữ liệu Firestore hiện tại.
