# V107 - Finance, Debt & Commission Audited

## Công nợ và phiếu thu

- Công nợ tiếp tục được tách tuyệt đối theo từng phiếu bán.
- Không còn gộp hai phiếu thu hợp lệ chỉ vì trùng ngày, số tiền và phương thức.
- Ưu tiên khóa `saleId`/`debtKey` thay vì mã phiếu hiển thị cũ.
- Phiếu thu công nợ đầu kỳ giữ đúng khóa `opening:{customerId}`.
- Snapshot khách hàng cũ không làm mất liên kết khi phiếu thu đã có `saleId` đúng.
- Chặn số tiền thu bằng 0 hoặc âm.
- Hủy phiếu thu theo cơ chế mềm, bắt buộc lý do và giữ nhật ký; chỉ Admin được hủy/sửa.

## Hoa hồng và thu nhập

- Hoa hồng Sale, công kỹ thuật và tiền xăng chỉ được ghi nhận khi đơn đã thu đủ 100%.
- Kỳ hoa hồng lấy theo ngày tổng thu lũy kế lần cuối đạt 100%, không lấy ngày bán.
- Tỷ lệ 0% luôn cho kết quả 0, không lấy lại số hoa hồng cũ.
- Cơ sở hoa hồng được tính lại từ tổng tiền trừ VAT hiện tại, tránh dữ liệu snapshot cũ.
- Công kỹ thuật mặc định tính theo đơn, không nhân số lượng sản phẩm.
- Bổ sung trạng thái, ngày hưởng và lịch sử earned/reversed/adjustment trên đơn.
- Báo cáo thu nhập của nhân viên thường chỉ trả dữ liệu đúng nhân viên được liên kết.
- Hiệu suất kỹ thuật lọc bảo hành theo đúng kỳ.

## Trả hàng và hoàn tiền

- Trả một phần giữ đúng chiết khấu %; chiết khấu số tiền được phân bổ theo tỷ lệ hàng còn lại.
- Lưu giá bán và giá trị hàng trả trên phiếu trả hàng để báo cáo không bị mất sau khi đơn thay đổi.
- Bổ sung trạng thái `Đã hoàn tiền`, phương thức hoàn và dòng chi hoàn tiền trong Sổ quỹ.
- Tiền hoàn được trừ khỏi tổng đã thu, công nợ và điều kiện hoa hồng.
- Ghi nhận điều chỉnh hoa hồng khi trả hàng làm thay đổi cơ sở tính.

## Báo cáo, Excel và bảo mật

- Xuất bán hàng dùng số đã thu/còn nợ tính trực tiếp từ phiếu thu hiện hành.
- Xuất hoa hồng tuân theo bộ lọc, có ngày bán, ngày đủ 100%, tổng đã thu và còn nợ.
- Xuất Sổ quỹ có số dư lũy kế.
- Import đơn đã thu lưu đủ khóa thanh toán, nhân viên, ngày thu và trạng thái hoa hồng.
- Chặn dữ liệu âm ở doanh thu, chi phí, lương, kho, giá bán, giá vốn và công nợ đầu kỳ.
- Bỏ quy tắc Firestore catch-all cho phép mọi hồ sơ đọc/ghi toàn bộ; thay bằng quyền theo collection.
- Không tự ý sửa phương thức thanh toán cũ trong lúc tải dữ liệu.
- Cập nhật hotline in phiếu thành 0902.950.816 và bổ sung loại khách Công ty trên phiếu bán.

## Kiểm thử

- Bổ sung `qa_v107_finance_commission_tests.js` kiểm tra trực tiếp các hàm trong `app.js`.
- Sửa `qa_static_checks.py` để chạy được ở mọi thư mục thay vì đường dẫn `/mnt/data/erp_v94`.
