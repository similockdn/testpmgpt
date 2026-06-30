# V89 - Rà soát lại logic tài chính, sổ quỹ và báo cáo thanh toán

## Chuẩn hóa khái niệm tài chính

- Doanh số = tổng giá trị phiếu bán trong kỳ.
- Thực thu = dòng tiền thu thực tế trong kỳ.
- Phiếu thu = nguồn chính ghi nhận thu tiền.
- Phiếu chi / chi phí = nguồn chính ghi nhận chi tiền.
- Sổ quỹ = Phiếu thu + Thu trực tiếp trên phiếu bán + Phiếu chi + Chi lương.
- Công nợ = Tổng phiếu bán - các khoản đã thu gắn đúng phiếu.

## Đã sửa

- Sửa Dashboard: Thực thu lấy theo dòng tiền thu thực tế trong kỳ, không lấy nhầm tổng đã thu của phiếu bán trong kỳ.
- Sửa Sổ quỹ: bổ sung nguồn thu trực tiếp trên Phiếu bán nếu chưa tạo Phiếu thu để không bị thiếu tiền.
- Tránh cộng đôi tiền thu trực tiếp nếu phiếu đã có Phiếu thu liên quan.
- Sửa Báo cáo thanh toán: dùng chung nguồn dữ liệu từ Sổ quỹ đã chuẩn hóa.
- Đổi Chi phí vận hành thành Phiếu chi / Chi phí vận hành để rõ nghiệp vụ tiền ra.
- Bổ sung Phương thức chi cho Phiếu chi.
- Export Excel phiếu chi có thêm phương thức thanh toán.

## Nguyên tắc sau khi nâng cấp

- Muốn số liệu sổ quỹ đúng nhất, mỗi khoản thu công nợ nên tạo Phiếu thu.
- Mỗi khoản tiền ra nên nhập tại Phiếu chi / Chi phí vận hành hoặc Lương nhân viên.
- Các phiếu thu cũ chưa có phương thức thanh toán sẽ hiển thị là "Chưa xác định" để kế toán rà soát lại.
