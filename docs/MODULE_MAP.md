# MODULE MAP - SỬA LỖI THEO MODULE

Dự án hiện vẫn chạy bằng `index.html + app.js + style.css` để đảm bảo an toàn khi upload GitHub Pages. Tài liệu này chia rõ khu vực nghiệp vụ để khi lỗi ở đâu thì sửa đúng khu vực đó trong `app.js`, không sửa lan sang phần khác.

## 1. Auth / phân quyền
- Từ khóa tìm trong app.js: `currentPerm`, `hasPerm`, `renderPermissions`, `users`, `permissions`
- Khi lỗi đăng nhập hoặc quyền xem/sửa: chỉ kiểm tra nhóm này.

## 2. Khách hàng
- Từ khóa: `customerSnapshot`, `saleCustomer`, `renderCustomers`, `saveCustomer`, `editCustomer`
- Nguyên tắc: không dùng tên khách để liên kết nghiệp vụ; dùng ID/SĐT/snapshot.

## 3. Phiếu bán
- Từ khóa: `saveSale`, `editSale`, `saleDetail`, `calcSaleTotals`, `fillSaleForm`
- Nguyên tắc: sửa khách không được làm đổi `items`, `price`, `qty`, `discount`.

## 4. Công nợ
- Từ khóa: `calcDebtRows`, `saleDebtKey`, `receiptSaleId`, `receiptDebtKey`, `renderDebts`
- Nguyên tắc: mỗi phiếu bán là một dòng công nợ riêng. Không gom theo tên khách.

## 5. Phiếu thu
- Từ khóa: `saveReceipt`, `editReceipt`, `receiptFor`, `receiptDebtRowForEdit`
- Nguyên tắc: phiếu thu phải gắn đúng `saleId/saleCode/debtKey`. Admin sửa phiếu thu phải có lý do.

## 6. Kho / sổ kho
- Từ khóa: `stockVouchers`, `createSupplementStockVoucher`, `voucherWarehouse`, `renderStockBook`
- Nguyên tắc: xuất kho liên kết phiếu bán qua saleId/saleCode, không theo tên khách.

## 7. Bảo hành
- Từ khóa: `warrantyStartFromSale`, `renderWarranty`, `saveWarranty`, `warrantyReasons`, `activeWarranties`
- Nguyên tắc: bảo hành bắt đầu từ ngày hoàn thành lắp; mỗi lần phát sinh lỗi tạo phiếu BH riêng.

## 8. Hoa hồng
- Từ khóa: `commissionEligibleSales`, `saleFullyPaidForCommission`, `saleCommissionBaseValue`, `renderCommissions`, `exportCommission`
- Nguyên tắc: chỉ tính hoa hồng khi thu đủ 100%, nhân viên thường chỉ xem hoa hồng của mình.

## 9. Báo cáo / Dashboard
- Từ khóa: `renderReports`, `renderDashboard`, `calcProfit`, `saleMoneyStatus`
- Nguyên tắc: doanh thu lấy theo phiếu bán chưa hủy, không cộng theo tên khách.

## 10. Audit / hệ thống
- Từ khóa: `logAction`, `renderAudit`, `clearData`, `backup`, `restore`
- Nguyên tắc: thao tác sửa tiền, sửa phiếu thu, hủy phiếu phải ghi nhật ký.
