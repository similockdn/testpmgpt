SIMILOCK ĐÀ NẴNG ERP - BẢN V47 QA

Đã kiểm tra trước khi bàn giao:
1. node --check app.js: không lỗi cú pháp JavaScript.
2. Kiểm tra style.css: số lượng dấu { và } khớp.
3. Đối chiếu toàn bộ onclick/oninput/onchange trong HTML và modal sinh từ JS: không thiếu hàm gọi từ giao diện.
4. Đối chiếu toàn bộ id được JS gọi với HTML/modal động: không còn thiếu id gây lỗi kiểu is not defined/null.
5. Rà lại các hàm render chính: Dashboard, Bán hàng, Khách hàng, Sản phẩm, Bảng giá, Công nợ, Phiếu thu, Kho, Sổ kho, Báo cáo, Phân quyền.

Đã sửa thêm trong V47:
- Sửa khách trên phiếu bán chỉ đổi đúng phiếu đang sửa, không đổi hàng loạt đơn cũ.
- Phiếu bán lưu snapshot khách hàng riêng: Tên/Mã KH/SĐT/Địa chỉ/Loại khách.
- Cho phép chọn khách có sẵn trong danh mục khi sửa khách trên phiếu bán.
- Khắc phục lỗi v45/v46 bị thiếu một số hàm render/sản phẩm do vá code không an toàn.

Lưu ý khi cập nhật GitHub:
- Chỉ thay file code sẽ không mất dữ liệu Firebase.
- Nên backup Firestore trước khi deploy.
- Sau khi deploy, test nhanh: đăng nhập Admin → tạo phiếu bán chưa thu → kiểm tra Công nợ → sửa khách trên 1 phiếu → kiểm tra các phiếu cùng SĐT không bị đổi hàng loạt.
