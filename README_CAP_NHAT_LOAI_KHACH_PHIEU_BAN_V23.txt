CẬP NHẬT V23 - LOẠI KHÁCH TRONG PHIẾU BÁN

Đã bổ sung trường Loại khách trong phần Bán hàng / Thông tin đơn hàng:
- Khách lẻ
- CTV
- Đại lý

Chức năng:
- Khi chọn khách hàng đã có hồ sơ, hệ thống tự lấy Loại khách theo danh mục khách hàng.
- Người dùng vẫn có thể đổi Loại khách ngay trên phiếu bán cho từng đơn.
- Giá sản phẩm tự áp dụng theo bảng giá đang hoạt động của Loại khách được chọn.
- Khi đổi Loại khách, các dòng sản phẩm đã nhập sẽ tự cập nhật lại đơn giá theo bảng giá tương ứng.
- Khi lưu phiếu, hệ thống lưu customerType/customerGroup vào đơn bán.
- In A5 và chi tiết đơn tiếp tục hiển thị Loại khách.

Đã kiểm tra:
- JS không lỗi cú pháp bằng node --check.
- HTML có đủ trường saleCustomerType.
- Tìm khách theo mã/tên/SĐT/địa chỉ vẫn hoạt động.
- Thêm nhanh khách có chọn Loại khách.
