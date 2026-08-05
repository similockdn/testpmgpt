# V116 — Tách phạm vi kho và menu nghiệp vụ dọc

- Cố định vai trò **Kho Chính** chỉ có phạm vi `Kho Chính`; vai trò **Kho Văn Phòng** chỉ có phạm vi `Kho Văn Phòng`.
- Nhân viên Kho Chính vẫn lập phiếu xuất kho và chuyển hàng từ Kho Chính sang Kho Văn Phòng.
- Kho nhận được cộng tồn và có dòng `Chuyển đến` trong nhật ký của chính kho đó, nhưng phiếu chi tiết chỉ hiện cho kho chuyển đi.
- Dữ liệu chứng từ kho của hai vai trò kho được tải theo phạm vi kho, thay vì tải toàn bộ collection.
- Dashboard, danh mục sản phẩm, sổ kho, báo cáo kho và cảnh báo tồn dùng tồn của kho được phân quyền.
- File xuất sản phẩm, chứng từ kho và sổ kho không còn chứa số tồn hoặc phiếu của kho ngoài phạm vi.
- Nhập Excel chứng từ kho bị từ chối nếu dòng dữ liệu thuộc kho không được phân quyền.
- Bổ sung kiểm tra quyền khi in, sửa và xóa trực tiếp một phiếu kho.
- Firestore Rules kiểm tra kho nguồn khi tạo/sửa/xóa và chỉ cho đọc chứng từ liên quan tới kho được giao.
- Gom 5 nghiệp vụ `Nhập kho`, `Xuất kho`, `Chuyển kho`, `Điều chỉnh kho`, `Trả lại hàng bán` thành menu dọc trong trang Kho hàng.
- Menu nghiệp vụ đồng bộ trạng thái đang chọn với loại chứng từ và tự chuyển sang bố cục hai cột trên điện thoại.

## Lưu ý triển khai

Khi đưa V116 lên môi trường đang chạy, cần triển khai kèm tệp `firestore.rules` để lớp giới hạn kho phía máy chủ có hiệu lực.
