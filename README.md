# Grab Delivery Assistant

Hệ thống quản lý, đồng bộ và hiển thị thông tin các điểm giao hàng (Multi-stop) dành cho tài xế Grab.

## Cấu trúc dự án (Monorepo)
- `apps/api`: Backend Express.js (Kết nối với Supabase, quản lý CORS).
- `apps/web`: Frontend React/Vite (Giao diện hiển thị, thiết kế tối ưu cho Mobile).
- `tools/bookmarklet`: Công cụ cào dữ liệu (DOM Extractor) từ trang web của Grab.

## Hướng dẫn Deploy lên Render.com

### 1. Backend (API)
- Tạo mới **Web Service** trên Render.
- Kết nối tới Github Repo.
- Cấu hình:
  - Root Directory: để trống
  - Build Command: `npm install`
  - Start Command: `cd apps/api && npm start`
- Biến môi trường (Environment Variables):
  - `PORT`: `10000`
  - `SUPABASE_URL`: Link Supabase của bạn
  - `SUPABASE_SERVICE_ROLE_KEY`: Key Service Role Supabase
  - `CORS_ORIGIN`: `*` (hoặc link Frontend của bạn)

### 2. Frontend (Web Dashboard)
- Tạo mới **Static Site** trên Render.
- Kết nối tới Github Repo.
- Cấu hình:
  - Root Directory: để trống
  - Build Command: `npm install && npm run build --workspace=apps/web`
  - Publish Directory: `apps/web/dist`
- Biến môi trường (Environment Variables):
  - `VITE_API_BASE_URL`: (Link Web Service API ở trên)
  - `VITE_SUPABASE_URL`: Link Supabase
  - `VITE_SUPABASE_ANON_KEY`: Key Anon Supabase

---

## ⚠️ QUAN TRỌNG: Cập nhật Bookmarklet khi chạy thực tế

Bookmarklet là đoạn mã Javascript chạy trực tiếp trên điện thoại/trình duyệt của bạn để lấy dữ liệu từ trang web Grab. Nó cần biết địa chỉ API để gửi dữ liệu về.

Mỗi khi bạn thay đổi đường link API (ví dụ: chuyển từ localhost sang link thật trên Render), bạn **bắt buộc phải tạo lại Bookmarklet**.

**Các bước thực hiện:**

1. Mở file `apps/web/.env`
2. Cập nhật biến `VITE_API_BASE_URL` trỏ về địa chỉ API mới của bạn.
   *Ví dụ:* `VITE_API_BASE_URL=https://grab-assistant-api.onrender.com`
3. Mở Terminal (Command Prompt) tại thư mục gốc của dự án.
4. Chạy lệnh sau để build lại mã Bookmarklet:
   ```bash
   node scripts/build-bookmarklet.js
   ```
5. Mở file `tools/bookmarklet/index.js`, copy toàn bộ nội dung mã vùa được tạo ra bên trong.
6. Cập nhật (hoặc tạo mới) Bookmark trên điện thoại / máy tính của bạn với đoạn mã mới này.

> **Mẹo trên điện thoại:** Khi lưu bookmarklet, hãy đặt tên dễ nhớ (ví dụ: `Sync Grab`). Khi muốn chạy trên trang Grab, hãy gõ tên `Sync Grab` vào thanh địa chỉ URL của trình duyệt và nhấn vào kết quả có hình ngôi sao.
