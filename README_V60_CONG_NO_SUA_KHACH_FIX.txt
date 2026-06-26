V60/V58 Fix - Sửa khách trên phiếu bán đã thu tiền không tạo công nợ ảo

Đã kiểm tra và chỉnh:
1. Phiếu thu có saleId/allocation sẽ gom công nợ theo phiếu bán hiện tại, không theo khách cũ.
2. Khi sửa khách trên phiếu bán đã thu tiền, phiếu thu liên quan được cập nhật customerId/customerCode/name/phone/address/type và gắn saleId nếu thiếu.
3. Công nợ dùng paidTotal làm trạng thái bảo vệ khi phiếu đã thu đủ, tránh tạo dòng công nợ mới ảo.
4. Sửa khách chỉ cập nhật thông tin khách/snapshot, không đổi items, đơn giá, số lượng, chiết khấu, tổng tiền, đã thu, còn nợ.
5. Nên test: mở phiếu đã thu tiền -> sửa khách -> kiểm tra Danh sách phiếu bán, Phiếu thu, Công nợ, Báo cáo.
