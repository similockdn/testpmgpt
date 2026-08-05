# V118 — Làm rõ xuất kho và chọn kho nhận khi chuyển kho

- Phiếu **Xuất kho** được ghi chú rõ là hàng đi ra khỏi hệ thống nên không có trường Kho nhận.
- Khi cần đưa hàng từ Kho Chính sang Kho Văn Phòng, người dùng chọn **Chuyển kho** tại menu bên trái.
- Phiếu Chuyển kho chỉ hiển thị kho nhận khác kho chuyển đi; Kho Chính tự chọn Kho Văn Phòng và ngược lại.
- Danh sách kho nhận tự đồng bộ khi thay đổi kho chuyển đi, mở phiếu cũ hoặc tải lại dữ liệu.
- Bổ sung kiểm tra trước khi lưu để không thể ghi phiếu chuyển kho thiếu kho nhận hoặc nhận về chính kho chuyển đi.
- Hiển thị ngay trên biểu mẫu luồng tồn kho `Kho chuyển đi → Kho nhận` để người dùng kiểm tra trước khi lưu.
- Không thay đổi Firestore Rules và phạm vi xem tồn kho đã áp dụng từ V116.
