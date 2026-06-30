# V97 - Chốt lại Thực thu và Sổ quỹ

## Lỗi đã xử lý
- Dashboard Thực thu trước đây lấy toàn bộ phiếu thu trong kỳ nên bị phình số khi khách trả công nợ cũ hoặc thu cho phiếu bán khác kỳ.
- Sổ quỹ và Dashboard dùng cùng chữ "thu" nên dễ hiểu nhầm.

## Quy tắc mới
- Doanh số = tổng giá trị phiếu bán có ngày bán trong kỳ.
- Thực thu đơn kỳ = số tiền đã thu của các phiếu bán có ngày bán trong kỳ.
- Tiền vào sổ quỹ = toàn bộ dòng tiền vào theo phiếu thu có ngày thu trong kỳ.
- Vì vậy Thực thu đơn kỳ và Tiền vào sổ quỹ có thể khác nhau nếu trong kỳ có thu công nợ cũ.

## Kiểm thử
- node --check app.js
- python3 qa_static_checks.py
- node qa_finance_v94_tests.js
- node qa_finance_v96_tests.js
- node qa_finance_v97_tests.js
- unzip -t file zip
