# V106 - Enterprise Workflow Stable RC

## Cập nhật chính

- Bổ sung tài liệu phân tích nghiệp vụ `ENTERPRISE_V2_WORKFLOW_BLUEPRINT.md`.
- Chuẩn hóa lại cách gọi chỉ số trên giao diện để giảm nhầm lẫn giữa Thu theo đơn và Tiền vào quỹ.
- Bổ sung bộ kiểm thử nghiệp vụ `qa_v106_enterprise_workflow_tests.js`.
- Bổ sung báo cáo QA `QA_V106_RELEASE_CHECKS.md`.

## Nguyên tắc nghiệp vụ chốt

- Doanh số không phải tiền vào quỹ.
- Thu theo đơn không nhất thiết bằng tổng thu sổ quỹ.
- Sổ quỹ chỉ phản ánh dòng tiền thật theo ngày chứng từ.
- Công nợ phải tính theo từng phiếu bán, không trừ tiền theo tên khách.
