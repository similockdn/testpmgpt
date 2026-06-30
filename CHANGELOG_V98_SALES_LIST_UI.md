# V98 - Tối ưu giao diện Danh sách phiếu bán

## Cập nhật
- Thiết kế lại bảng Danh sách phiếu bán dễ đọc hơn.
- Phiếu bán trong ngày được ưu tiên hiển thị lên đầu.
- Thêm nhãn `NEW` cho phiếu bán hôm nay.
- Cột sản phẩm hiển thị dạng chip model + số lượng.
- Dòng khách hàng gọn hơn: tên, SĐT, địa chỉ rút gọn.
- Cột trạng thái công nợ và kho chuyển sang badge nhỏ dễ nhìn.
- Dòng tổng cuối bảng thêm Phiếu hôm nay.
- Bảng có vùng cuộn ngang riêng, không làm vỡ giao diện.

## Kiểm tra
- `node --check app.js`: OK.
- `qa_static_checks.py`: không trùng ID, không thiếu hàm onclick.
- ZIP giải nén OK.
