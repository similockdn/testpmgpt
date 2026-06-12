CẬP NHẬT QUY TRÌNH 2 KHO - SIMILOCK ERP

1. Cấu trúc kho chuẩn:
- Kho Chính: nhập hàng từ hãng/nhà cung cấp, quản lý tồn tổng.
- Kho Văn Phòng: kho phục vụ bán hàng/lắp đặt hằng ngày.

2. Luồng chuẩn:
- Nhập kho: mặc định vào Kho Chính.
- Chuyển kho: tạo Phiếu chuyển kho từ Kho Chính sang Kho Văn Phòng.
- Bán hàng: mặc định xuất từ Kho Văn Phòng. Nếu tick Kiêm xuất kho thì tạo phiếu xuất kho và trừ đúng kho đã chọn.
- Kiểm kho: kiểm riêng từng kho.

3. Đã cập nhật trong code:
- Thêm loại chứng từ: Phiếu chuyển kho.
- Thêm Kho chuyển đi và Kho nhận.
- Chặn chuyển cùng một kho.
- Chặn chuyển vượt tồn kho tại kho chuyển đi.
- Sổ kho hiển thị: Nhập, Xuất, Chuyển kho, Điều chỉnh, Kho Chính, Kho Văn Phòng, Tổng tồn.
- Tổng tồn không bị thay đổi khi chuyển kho.
- Bán hàng mặc định chọn Kho Văn Phòng để đúng thực tế lắp đặt hằng ngày.

4. Gợi ý vận hành:
- Hàng mới nhập vào Kho Chính.
- Mỗi ngày/tuần chuyển số lượng cần bán/lắp sang Kho Văn Phòng.
- Sale/Kỹ thuật xuất hàng từ Kho Văn Phòng.
- Chỉ xuất trực tiếp Kho Chính khi cần xử lý đơn đặc biệt.
