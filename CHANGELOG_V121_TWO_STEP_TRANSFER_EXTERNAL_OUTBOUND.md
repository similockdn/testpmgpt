# V121 — Chuyển kho hai bước và xuất kho ra ngoài hệ thống

## Thay đổi nghiệp vụ

- `Xuất kho` không còn chọn kho nội bộ làm kho nhận. Phiếu bắt buộc có loại nơi nhận và tên đối tượng/nơi nhận; có thể ghi thêm số điện thoại, địa chỉ.
- `Chuyển kho` chuyển sang hai bước: kho gửi lập phiếu `Đang vận chuyển`, kho nhận kiểm đếm rồi xác nhận số lượng thực nhận.
- Tồn kho nguồn giảm khi gửi. Tồn kho nhận chỉ tăng sau khi xác nhận. Phiếu chuyển cũ chưa có trạng thái được hiểu là `Đã nhận đủ` để không thay đổi tồn lịch sử.
- Khi nhận thiếu, hệ thống lưu từng dòng gửi/nhận/thiếu và hiển thị `Chênh lệch nhận`; không tự hoàn thiếu về kho gửi.
- Phiếu chuyển không sửa hoặc xóa cứng. Admin chỉ được hủy phiếu đang vận chuyển; phiếu đã nhận phải xử lý bằng phiếu điều chỉnh.

## Phân quyền và an toàn dữ liệu

- Kho nhận được đọc phiếu chuyển gửi đến và chỉ được cập nhật các trường xác nhận nhận hàng.
- Firestore Rules khóa thay đổi kho nguồn, kho nhận, model, số lượng gửi và giá vốn trong thao tác xác nhận.
- Nhân viên kho vẫn chỉ xem tồn của kho được phân quyền.
- Chỉ Admin được thêm, sửa hoặc xóa danh mục kho; nhà cung cấp giữ luồng quản lý hiện có.

## Báo cáo và Excel

- Sổ kho và báo cáo kho bổ sung `Đang vận chuyển` và `Chênh lệch nhận`.
- Báo cáo xuất kho hiển thị loại nơi nhận và đối tượng/nơi nhận thay cho kho nhận nội bộ.
- Báo cáo chuyển kho hiển thị trạng thái, số lượng gửi và số lượng nhận.
- File Excel chứng từ kho bổ sung nơi nhận bên ngoài, trạng thái chuyển và số lượng nhận.

## Tương thích dữ liệu

- Không cần đổi dữ liệu cũ trước khi sử dụng.
- Phiếu OUT cũ có `toWarehouse` vẫn hiển thị giá trị đó như nơi nhận cũ khi xem/sửa/xuất báo cáo.
- Phiếu TRANSFER cũ chưa có `transferStatus` vẫn cộng đủ tồn kho nhận như trước.
