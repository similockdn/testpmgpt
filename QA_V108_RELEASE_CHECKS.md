# QA V108 Release Checks

- `node --check app.js`
- `python3 qa_static_checks.py`
- `python3 qa_static_v101.py`
- `node qa_v108_commission_sales_dashboard_tests.js`
- Chạy toàn bộ bộ kiểm thử tài chính và quy trình từ V94 đến V107.
- Đóng gói ZIP, kiểm tra `unzip -t` và chạy lại kiểm thử trên thư mục giải nén mới.
