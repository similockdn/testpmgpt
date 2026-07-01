# SIMILOCK ERP Enterprise v2 - Workflow Stable Blueprint

## 1. Nguyên tắc triển khai

Bản này chốt lại nguyên tắc nghiệp vụ để tránh nhầm lẫn giữa bán hàng, thu tiền, công nợ và sổ quỹ.

Mỗi chỉ số chỉ có một nguồn dữ liệu chính:

| Chỉ số | Nguồn đúng | Không lấy từ |
|---|---|---|
| Doanh số | Phiếu bán | Phiếu thu / Sổ quỹ |
| Thu theo đơn | Phiếu bán trong kỳ + các khoản thu gắn với chính phiếu đó | Tổng thu sổ quỹ |
| Tiền vào quỹ | Phiếu thu / thu trực tiếp đã khóa chứng từ | Doanh số |
| Công nợ | Phiếu bán - tiền đã thu theo từng phiếu | Sổ quỹ tổng hợp |
| Sổ quỹ | Số dư đầu kỳ + Thu - Chi | Doanh số / Công nợ |
| Lợi nhuận | Doanh số trước VAT - Giá vốn - hoa hồng - công kỹ thuật - chi phí | Phiếu thu |

## 2. Quy trình bán hàng

1. Tạo khách hàng.
2. Tạo phiếu bán.
3. Nếu khách cọc, ghi nhận tiền thu theo phiếu bán hoặc lập phiếu thu.
4. Lên lịch lắp đặt.
5. Xuất kho.
6. Kỹ thuật lắp đặt.
7. Thu tiền còn lại bằng phiếu thu.
8. Hoàn thành đơn hàng.

## 3. Trạng thái đơn hàng đề xuất

- Mới tạo
- Đã xác nhận
- Đã cọc
- Chờ lắp
- Đang lắp
- Đã lắp - Chưa thu đủ
- Hoàn thành
- Bảo hành
- Hủy

## 4. Trạng thái lắp đặt

- Chưa lên lịch
- Đã lên lịch
- Đang lắp
- Đã lắp
- Bảo hành
- Hủy

Trạng thái lắp đặt không thay thế trạng thái thanh toán. Một đơn có thể đã lắp nhưng vẫn còn nợ.

## 5. Công nợ

Công nợ được tách theo quản trị thực tế:

- Đã cọc - Chưa lắp
- Đã lắp - Chưa thanh toán
- Quá hạn
- Đã tất toán
- Tất cả

Công thức chuẩn:

```text
Công nợ từng phiếu = Tổng tiền phiếu bán - Tổng tiền đã thu gắn với phiếu đó
```

## 6. Sổ quỹ

Sổ quỹ là dòng tiền thật, không phải doanh số.

```text
Số dư cuối kỳ = Số dư đầu kỳ + Tổng thu trong kỳ - Tổng chi trong kỳ
```

- Thu: phiếu thu hoặc khoản thu trực tiếp đã được khóa với phiếu bán.
- Chi: phiếu chi và lương.
- Sổ quỹ lọc theo ngày chứng từ thu/chi.

## 7. Vì sao Doanh số / Thu theo đơn / Tiền vào quỹ có thể khác nhau

Ví dụ tháng 7:

- Bán tháng 7: 100 triệu.
- Thu trong tháng 7 cho đơn tháng 7: 70 triệu.
- Thu công nợ đơn tháng 6 trong tháng 7: 30 triệu.

Kết quả:

- Doanh số tháng 7 = 100 triệu.
- Thu theo đơn tháng 7 = 70 triệu.
- Tiền vào quỹ tháng 7 = 100 triệu.

Không phải lỗi. Đây là khác biệt giữa quản trị bán hàng và kế toán quỹ.

## 8. Danh mục

Menu Danh mục là đúng hướng. Nên dùng để quản lý dữ liệu nền:

- Danh mục sản phẩm
- Nhóm khách hàng
- Kho hàng
- Nhân viên
- Kỹ thuật
- Phương thức thanh toán
- Loại phiếu thu
- Loại phiếu chi
- Trạng thái đơn hàng
- Trạng thái lắp đặt
- Lý do bảo hành
- Mức tồn kho tối thiểu

## 9. Điều kiện gọi là Stable

Một bản chỉ được gọi là stable khi đối chiếu được:

```text
Phiếu bán → Công nợ → Phiếu thu → Sổ quỹ → Dashboard → Báo cáo
```

Nếu một trong các báo cáo lệch nhưng không giải thích được theo nguồn dữ liệu ở trên, bản đó chưa đạt stable.
