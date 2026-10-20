# SECRET GARDEN — Website quà tặng 20/10

Dự án được tách thành HTML, CSS và JavaScript để dễ mở, xem và chỉnh sửa trong Visual Studio Code.

## Cấu trúc thư mục

```text
secret-garden-vscode/
├── index.html       # Cấu trúc/nội dung website
├── css/
│   └── style.css    # Màu sắc, bố cục, hiệu ứng và responsive
├── js/
│   └── script.js    # Tương tác, quest, hộp quà và Easter egg
└── README.md        # Hướng dẫn này
```

## Mở trong VS Code

1. Giải nén `secret-garden-vscode.zip`.
2. Mở VS Code → **File → Open Folder...** → chọn thư mục `secret-garden-vscode`.
3. Mở `index.html` và chạy bằng trình duyệt. Có thể nhấp đúp `index.html` trong File Explorer; hoặc cài extension **Live Server**, nhấp phải `index.html` → **Open with Live Server**.
4. Khi chỉnh sửa giao diện, sửa `css/style.css`; khi chỉnh sửa hành vi/nút bấm, sửa `js/script.js`; nội dung và cấu trúc nằm trong `index.html`.

## Lưu ý

- Website dùng HTML, CSS và JavaScript thuần, không cần `npm install` hay thư viện ngoài.
- Để các đường dẫn CSS/JS hoạt động, giữ nguyên cấu trúc thư mục tương đối như trên.
- Nhạc nền dreamy ambient được tạo trực tiếp bằng Web Audio API (piano/chime-like synth pads), không cần tải file âm thanh hay cài thư viện ngoài.
- Nhạc bắt đầu nhẹ sau khi bấm **Bắt đầu quest** để tương thích với chính sách autoplay của trình duyệt. Dùng nút **♫ Nhạc** để bật/tắt và thanh nhỏ bên cạnh để chỉnh âm lượng; mặc định âm lượng thấp.
- Tên người tặng được đặt ở phần ký thư là **Danh Hoàng**.
