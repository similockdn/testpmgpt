# QA V93 - Kiểm thử tài chính

## Quy tắc đã kiểm thử

1. Doanh số = tổng `grand` của phiếu bán trong kỳ.
2. Thực thu/Tiền thu = tổng tiền vào từ Sổ quỹ trong kỳ.
3. Sổ quỹ chỉ lấy:
   - Phiếu thu hợp lệ.
   - Thu trực tiếp trên phiếu bán có khóa `paidEntryKey/paidSaleCode` đúng mã phiếu.
   - Phiếu chi/chi phí.
   - Lương.
4. Không cộng đôi thu trực tiếp nếu đã có Phiếu thu cùng phiếu, cùng ngày, cùng số tiền.
5. Dữ liệu cũ thiếu phương thức thanh toán được gom vào nhóm `Chưa khai báo` để kế toán lọc và cập nhật lại.
6. Không gọi `Thu - chi trong kỳ` là số dư quỹ cuối nếu chưa có số dư đầu kỳ.

## Kịch bản đối chiếu

- Bán hàng chưa thu: tăng Doanh số, tăng Công nợ, không tăng Sổ quỹ.
- Bán hàng thu ngay: tăng Doanh số, tăng Sổ quỹ tiền vào một lần.
- Thu công nợ cũ: không tăng Doanh số kỳ hiện tại, tăng Sổ quỹ tiền vào kỳ hiện tại.
- Phiếu chi: tăng tiền ra, giảm Thu - chi trong kỳ.
- Phiếu thu thiếu phương thức: vẫn tính tiền thu, nhưng hiển thị `Chưa khai báo` để lọc xử lý dữ liệu cũ.
