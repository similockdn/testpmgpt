# QA V116 — Phạm vi kho và menu nghiệp vụ dọc

- [x] Vai trò Kho Chính luôn có phạm vi hiệu lực duy nhất là Kho Chính.
- [x] Vai trò Kho Văn Phòng luôn có phạm vi hiệu lực duy nhất là Kho Văn Phòng.
- [x] Kho Chính được chọn Kho Văn Phòng làm kho nhận khi lập phiếu chuyển.
- [x] Danh sách phiếu chuyển chỉ hiện cho kho chuyển đi; kho nhận chỉ thấy dòng chuyển đến trong nhật ký kho của mình.
- [x] Số nhập, xuất, điều chỉnh và tồn kho được tính theo kho được phân quyền.
- [x] Dashboard và danh mục sản phẩm không dùng tổng tồn của kho khác.
- [x] Xuất Excel chứng từ kho đã lọc theo quyền kho.
- [x] Nhập Excel không ghi được chứng từ vào kho ngoài phạm vi.
- [x] In, sửa và xóa phiếu kho đều kiểm tra lại quyền trên phiếu.
- [x] Firestore Rules kiểm tra kho khi đọc và ghi chứng từ kho.
- [x] Năm nghiệp vụ kho hiển thị thành một menu dọc, có trạng thái đang chọn.
- [x] Bố cục kho responsive trên laptop, tablet và điện thoại.
- [x] Không có ID HTML trùng và không thiếu hàm onclick.
- [x] JavaScript hợp lệ qua `node --check`.
