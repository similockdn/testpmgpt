# README KIỂM TRA ERP FINAL

Ngày kiểm tra: 2026-06-27 03:05

## Kết quả rà soát kỹ thuật

- JavaScript syntax (`node --check app.js`): OK
- CSS đóng/mở ngoặc `{ }`: OK (781 mở / 781 đóng)
- HTML ID: 293 ID, 0 ID trùng
- Hàm gọi từ nút bấm/ onchange / oninput: 97 hàm, thiếu 0 hàm
- DOM ID được tham chiếu trong JS: 286 ID
- ID thiếu do popup tạo động: 26 ID
- ID thiếu cần chú ý: 0 ID

## Các quy trình trọng tâm đã rà logic trong code

1. Công nợ tách theo từng phiếu bán, không gom theo tên khách.
2. Phiếu thu chỉ gắn theo `saleId / saleCode / debtKey` để tránh trừ nhầm khách trùng tên.
3. Hoa hồng chỉ tính khi phiếu bán thu đủ 100%.
4. Hoa hồng Sale tính trên doanh số tính hoa hồng gồm tiền hàng + phụ thu - chiết khấu.
5. Bảo hành tính từ ngày hoàn thành lắp đặt.
6. Bảo hành tách thành 2 luồng: sản phẩm đang bảo hành và tạo phiếu bảo hành khi phát sinh lỗi.
7. Hủy phiếu bán dùng trạng thái hủy, không xóa cứng phiếu đã phát sinh nghiệp vụ.
8. Admin được sửa phiếu thu đã tất toán, bắt buộc nhập lý do và tính lại công nợ theo phiếu bán.
9. Sửa thông tin khách trên phiếu bán chỉ cập nhật snapshot khách, không đổi sản phẩm/đơn giá/số lượng/chiết khấu.

## Ghi chú triển khai

Dữ liệu vẫn nằm trong Firebase Firestore. Upload code lên GitHub không làm mất dữ liệu nếu giữ nguyên `firebase-config.js`, không đổi project Firebase và không bấm Clear Data.

## Checklist test sau khi upload link test

- Đăng nhập Admin.
- Tạo 2 khách cùng tên nhưng khác SĐT/địa chỉ.
- Tạo 2 phiếu bán khác nhau cho 2 khách đó.
- Thu tiền phiếu 1, không thu phiếu 2.
- Kiểm tra Công nợ: phiếu 1 hết nợ, phiếu 2 còn đủ nợ.
- Sửa thông tin khách trên phiếu đã thu, kiểm tra sản phẩm/đơn giá không đổi.
- Sửa phiếu thu bằng Admin, kiểm tra công nợ cập nhật đúng phiếu.
- Tạo bảo hành từ phiếu bán, kiểm tra ngày bắt đầu bảo hành từ ngày hoàn thành lắp.
- Xuất hoa hồng theo từng nhân viên, kiểm tra chỉ có đơn đã thu đủ 100%.
