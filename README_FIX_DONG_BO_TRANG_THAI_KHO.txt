CẬP NHẬT ĐỒNG BỘ TRẠNG THÁI KHO - DANH SÁCH PHIẾU BÁN

Đã sửa lỗi giao diện ngoài Danh sách phiếu bán hàng hiển thị "Đã xuất kho" trong khi vào Chi tiết lại là "Chưa xuất kho".

Nguyên nhân:
- Danh sách bên ngoài trước đây đang kiểm tra cả cờ stockExported cũ.
- Chi tiết đơn hàng kiểm tra theo phiếu xuất kho thực tế.
- Khi dữ liệu cũ có stockExported=true nhưng chưa có phiếu xuất kho, hai nơi bị lệch trạng thái.

Đã sửa:
- Danh sách phiếu bán hàng chỉ hiển thị "Đã xuất kho" khi đơn bán có phiếu xuất kho thật sự liên quan.
- Nếu chưa có phiếu xuất kho liên quan thì luôn hiển thị "Chưa xuất kho".
- Trạng thái bên ngoài và bên trong Chi tiết đã đồng bộ theo cùng một logic.

Quy trình đúng:
1. Đơn bán chưa tạo phiếu xuất kho => Danh sách: Chưa xuất kho; Chi tiết: Chưa xuất kho.
2. Đơn bán đã có phiếu xuất kho => Danh sách: Đã xuất kho; Chi tiết: hiển thị mã phiếu và nút Xem/In phiếu xuất kho.
