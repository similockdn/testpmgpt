BẢN KIỂM TRA CÔNG NỢ - FIX TRÙNG TÊN KHÁCH

Đã sửa:
1. Công nợ không còn gom theo tên khách hàng.
2. Khóa gom công nợ ưu tiên theo:
   - Customer ID
   - Mã KH
   - Số điện thoại
   - Nếu thiếu các khóa trên thì giữ riêng theo từng phiếu bán/phiếu thu.
3. Hai khách hàng trùng tên nhưng khác SĐT/địa chỉ/sản phẩm sẽ tách thành 2 dòng công nợ riêng.
4. Phiếu thu có liên kết saleId/allocation sẽ đi theo đúng phiếu bán.
5. Bảng công nợ bổ sung thêm cột Địa chỉ và Sản phẩm để dễ phân biệt khách trùng tên.

Đã kiểm tra kỹ thuật:
- app.js: node --check không lỗi cú pháp.
- Không dùng tên khách làm khóa công nợ.
- Không thay đổi sản phẩm, đơn giá, phiếu bán, phiếu thu.
