# Hướng dẫn Import Sản phẩm từ Excel

## Tổng quan

Tính năng import sản phẩm từ file Excel cho phép bạn nhập hàng loạt sản phẩm và biến thể vào hệ thống một cách nhanh chóng và hiệu quả.

## Cấu trúc File Excel

### Sheet: "Sản phẩm và Biến thể"

File Excel template có 14 cột được chia thành 2 nhóm:

#### Thông tin Sản phẩm (Cột A-F):

- **Mã sản phẩm** (A): Mã duy nhất cho sản phẩm (bắt buộc)
- **Tên sản phẩm** (B): Tên hiển thị của sản phẩm (bắt buộc)
- **Mô tả sản phẩm** (C): Mô tả chi tiết sản phẩm (tùy chọn)
- **Danh mục ID** (D): ID của danh mục sản phẩm (bắt buộc)
- **Giá gốc sản phẩm** (E): Giá cơ bản của sản phẩm (tùy chọn, mặc định 0)
- **URL hình ảnh sản phẩm** (F): Link hình ảnh chính của sản phẩm (tùy chọn)

#### Thông tin Biến thể (Cột G-N):

- **Mã biến thể** (G): Mã duy nhất cho biến thể (bắt buộc)
- **Tên biến thể** (H): Tên hiển thị của biến thể (tùy chọn)
- **Màu sắc** (I): Màu của biến thể (tùy chọn)
- **Kích thước** (J): Kích thước của biến thể (tùy chọn)
- **Thương hiệu** (K): Thương hiệu của biến thể (tùy chọn)
- **Giá biến thể** (L): Giá riêng của biến thể (tùy chọn, mặc định = giá sản phẩm)
- **Số lượng tồn kho** (M): Số lượng có sẵn (tùy chọn, mặc định 0)
- **URL hình ảnh biến thể** (N): Link hình ảnh của biến thể (tùy chọn)

## Quy tắc Import

### 1. Dữ liệu bắt buộc:

- Mã sản phẩm
- Tên sản phẩm
- Danh mục ID
- Mã biến thể

### 2. Xử lý cột Thương hiệu:

- **Nếu có giá trị**: Biến thể sẽ có thương hiệu đó
- **Nếu để trống**: Biến thể sẽ không có thương hiệu (giá trị null)

### 3. Quy tắc nhóm dữ liệu:

- Các dòng có cùng **Mã sản phẩm** sẽ được nhóm thành một sản phẩm
- Mỗi dòng trong nhóm sẽ tạo ra một biến thể của sản phẩm đó
- Thông tin sản phẩm (tên, mô tả, giá gốc, hình ảnh) chỉ cần nhập ở dòng đầu tiên của mỗi sản phẩm

### 4. Validation:

- Không cho phép trùng mã sản phẩm trong hệ thống
- Không cho phép trùng mã biến thể trong cùng một sản phẩm
- Danh mục ID phải tồn tại trong hệ thống

## Ví dụ Dữ liệu

| Mã SP | Tên SP       | Mô tả SP       | DM ID | Giá SP | Hình SP  | Mã BT    | Tên BT      | Màu   | Size | Thương hiệu | Giá BT | Tồn kho | Hình BT    |
| ----- | ------------ | -------------- | ----- | ------ | -------- | -------- | ----------- | ----- | ---- | ----------- | ------ | ------- | ---------- |
| SP001 | Áo thun nam  | Áo cotton 100% | 1     | 150000 | url1.jpg | SP001-V1 | Áo trắng S  | Trắng | S    | Nike        | 150000 | 50      | url1-1.jpg |
| SP001 | Áo thun nam  |                | 1     |        |          | SP001-V2 | Áo đen M    | Đen   | M    | Nike        | 150000 | 30      | url1-2.jpg |
| SP002 | Quần jean nữ | Quần slim fit  | 2     | 300000 | url2.jpg | SP002-V1 | Quần xanh S | Xanh  | S    |             | 300000 | 25      | url2-1.jpg |
| SP002 | Quần jean nữ |                | 2     |        |          | SP002-V2 | Quần đen M  | Đen   | M    | Levi's      | 350000 | 20      | url2-2.jpg |

**Kết quả:**

- Sản phẩm SP001 có 2 biến thể, cả 2 đều có thương hiệu Nike
- Sản phẩm SP002 có 2 biến thể: biến thể 1 không có thương hiệu, biến thể 2 có thương hiệu Levi's

## Cách sử dụng

### 1. Tải template:

- Vào trang quản lý sản phẩm
- Click nút "Tải Template Excel"
- Tải file template về máy

### 2. Điền dữ liệu:

- Mở file Excel đã tải
- Điền thông tin theo cấu trúc mẫu
- Lưu file

### 3. Import:

- Quay lại trang quản lý sản phẩm
- Click nút "Import Excel"
- Chọn file Excel đã điền
- Click "Import"
- Kiểm tra kết quả import

## Lưu ý quan trọng

1. **Cột Thương hiệu**: Có thể để trống nếu biến thể không có thương hiệu cụ thể
2. **Định dạng giá**: Nhập số nguyên (VD: 150000 thay vì 150,000)
3. **URL hình ảnh**: Phải là link hợp lệ, có thể để trống
4. **Danh mục ID**: Phải là ID thực tế có trong hệ thống
5. **Mã sản phẩm/biến thể**: Không được trùng với dữ liệu hiện có

## Xử lý lỗi

Nếu có lỗi trong quá trình import:

- Hệ thống sẽ hiển thị danh sách lỗi chi tiết
- Các sản phẩm đã import thành công vẫn được lưu
- Sửa lỗi trong file Excel và import lại
