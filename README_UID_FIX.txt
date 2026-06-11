BẢN FIX UID - Similock Đà Nẵng

Đã sửa toàn bộ luồng phân quyền từ users/{email} sang users/{Firebase Auth UID}.

Admin chính: similockdn@gmail.com

Cách dùng:
1. Upload toàn bộ thư mục lên GitHub Pages.
2. Firebase > Firestore Database > Rules: copy nội dung file firestore.rules rồi Publish.
3. Đăng nhập bằng similockdn@gmail.com.
4. Nếu nhân viên mới chưa có UID: ở màn hình login, nhập email/mật khẩu nhân viên > bấm Tạo tài khoản nhân viên.
5. Sau đó đăng nhập Admin > Phân quyền > Sửa dòng email nhân viên > Lưu phân quyền.

Lưu ý:
- Firestore collection users phải dùng Document ID là UID Firebase Auth.
- Không dùng Document ID là email nữa.

CAP NHAT HOA HONG - CONG KY THUAT
- Nhan vien Sale: nhap commissionPercent (%) khi tao/sua nhan vien.
- Nhan vien Ky thuat: nhap techFee (so tien cong / don) khi tao/sua nhan vien.
- Khi tao don hang: chon Sale se tu lay % hoa hong; chon Ky thuat se tu lay tien cong ky thuat.
- Loi nhuan don = Gia ban - Gia von - Hoa hong Sale - Cong ky thuat.
