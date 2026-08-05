# QA V107 - Finance, Debt & Commission Audited

## Kết quả kiểm tra

- `node --check app.js`: đạt.
- Kiểm tra ID HTML trùng: 0 lỗi.
- Kiểm tra handler HTML thiếu: 0 lỗi.
- Bộ kiểm thử tài chính V94/V96/V97/V101/V103/V106: đạt.
- Bộ hồi quy V107 cho công nợ và hoa hồng: đạt.

## Kịch bản V107

1. Chưa thu và thu một phần không phát sinh hoa hồng.
2. Thu đủ bằng một hoặc nhiều phiếu mới phát sinh hoa hồng.
3. Hai phiếu thu giống ngày/số tiền vẫn là hai chứng từ độc lập.
4. Đơn Excel thu đủ được nhận diện đúng.
5. Tỷ lệ 0% không lấy số hoa hồng cũ.
6. Đơn bán tháng trước, thu đủ tháng sau được ghi nhận vào tháng sau.
7. Công nợ đầu kỳ được giảm đúng bởi phiếu thu đầu kỳ.
8. `debtKey` đúng được ưu tiên hơn `saleCode` cũ.
9. Snapshot khách thay đổi không làm mất phiếu thu có `saleId` đúng.
10. Trả hàng giữ đúng chiết khấu và điều chỉnh hoa hồng.
11. Hoàn tiền trả hàng làm giảm tổng đã thu nhưng không làm mất khoản thu gốc.
12. Công kỹ thuật mặc định 100.000/đơn.
13. Firestore không còn quyền catch-all mở toàn bộ dữ liệu.

## Lưu ý triển khai

- Triển khai đồng thời `app.js`, `index.html`, `style.css`, `firebase-config.js` và `firestore.rules`.
- Xuất Backup JSON trước khi thay phiên bản đang chạy.
- Sau triển khai, đăng nhập Admin và đối chiếu thử một đơn cũ có nhiều phiếu thu trước khi dùng chính thức.
