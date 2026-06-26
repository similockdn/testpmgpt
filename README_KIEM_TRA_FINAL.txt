KIỂM TRA FILE V58 FINANCIAL EDIT CONTROL

Đã kiểm tra tĩnh trước khi bàn giao:
- app.js: node --check không lỗi cú pháp.
- style.css: số lượng dấu { } cân bằng.
- index.html có load đúng app.js và style.css.
- Các hàm render chính đã được export ra window cho HTML inline onclick/oninput.
- Có cơ chế sửa khách riêng trên phiếu bán: chỉ cập nhật snapshot khách, không cập nhật items/price/qty/discount/grand/cost.
- Có cơ chế kiểm soát sửa dữ liệu tài chính: nếu thay đổi sản phẩm/số lượng/đơn giá/chiết khấu/phụ thu/kho/hoa hồng/công kỹ thuật thì bắt buộc nhập lý do và ghi nhật ký.
- Sửa khách trên phiếu bán có đồng bộ phiếu thu/xuất kho/bảo hành theo đúng saleId/saleCode.

Lưu ý vận hành an toàn:
1. Test trên link phụ trước khi thay bản chính.
2. Backup Firestore trước khi upload.
3. Không đổi firebase-config.js sang project khác.
4. Không bấm Clear Data khi đang dùng dữ liệu thật.
5. Khi sửa tiền/sản phẩm: kiểm tra lại doanh thu, công nợ, phiếu thu, kho, hoa hồng, lợi nhuận.
