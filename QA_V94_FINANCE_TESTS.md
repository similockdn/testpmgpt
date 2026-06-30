# QA V94 - Kiểm thử tài chính

Các tình huống đã test:

1. Bán hàng có thu ngay trên phiếu bán.
2. Bán hàng thu thêm bằng phiếu thu.
3. Phiếu thu công nợ cũ ngoài kỳ bán hàng không làm tăng Thực thu Dashboard của kỳ bán hàng.
4. Phiếu thu bị trùng cùng phiếu/ngày/số tiền/phương thức chỉ tính một lần trong Sổ quỹ.
5. Phiếu bán bị hủy không tính vào Dashboard và Sổ quỹ.
6. Sổ quỹ phân biệt Tổng thu, Tổng chi và Thu - chi trong kỳ, không gọi là số dư cuối kỳ.
