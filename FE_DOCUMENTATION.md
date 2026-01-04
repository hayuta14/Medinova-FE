# Tài Liệu Frontend - Medinova

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc](#kiến-trúc)
3. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
4. [Các Trang Chính](#các-trang-chính)
5. [Components](#components)
6. [API Integration](#api-integration)
7. [Authentication](#authentication)
8. [Routing](#routing)
9. [Styling](#styling)
10. [Build & Deploy](#build--deploy)

---

## 🎯 Tổng Quan

Frontend của Medinova được xây dựng bằng **Next.js 16.1.1** với **React 19.2.3** và **TypeScript 5**, sử dụng:
- **App Router** (Next.js 13+ routing)
- **Server Components & Client Components**
- **Axios** cho HTTP requests
- **Orval** để tự động generate API clients từ OpenAPI spec
- **Bootstrap 5.3.0** cho UI styling
- **Moment.js** cho date/time handling

---

## 🏗️ Kiến Trúc

### Next.js App Router Architecture

```
┌─────────────────────────────────────┐
│      Pages (App Router)            │
│   - Public Pages                    │
│   - Admin Pages                     │
│   - Doctor Pages                    │
│   - Patient Pages                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Components                      │
│   - Reusable UI Components           │
│   - Layout Components                │
│   - Form Components                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      API Layer                       │
│   - Generated API Clients (Orval)   │
│   - API Utilities (api.ts)          │
│   - Auth Utilities (auth.ts)         │
└─────────────────────────────────────┘
```

### Client vs Server Components

- **Server Components**: Mặc định trong Next.js App Router, render trên server
- **Client Components**: Sử dụng `'use client'` directive, render trên client, có thể sử dụng hooks

---

## 📁 Cấu Trúc Thư Mục

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   ├── globals.css                   # Global styles
│   │
│   ├── login/                        # Public pages
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── blog/
│   │   └── page.tsx
│   ├── team/
│   │   └── page.tsx
│   │
│   ├── dashboard/                    # Patient dashboard
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── appointment/
│   │   └── page.tsx
│   ├── medical-history/
│   │   └── page.tsx
│   │
│   ├── admin/                        # Admin pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── doctors/
│   │   ├── clinics/
│   │   ├── ambulances/
│   │   ├── blogs/
│   │   ├── leaves/
│   │   └── ...
│   │
│   ├── doctor/                       # Doctor pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── schedule/
│   │   ├── emergency/
│   │   ├── ambulance/
│   │   └── ...
│   │
│   ├── services/                     # Service pages
│   │   ├── ambulance/
│   │   ├── emergency/
│   │   ├── blood-testing/
│   │   ├── outdoor-checkup/
│   │   ├── pharmacy/
│   │   └── surgery/
│   │
│   └── api/                          # API routes (Next.js API)
│       ├── auth/
│       └── medical-history/
│
├── components/                       # React Components
│   ├── Navbar.tsx                    # Navigation bar
│   ├── Footer.tsx                    # Footer
│   ├── Topbar.tsx                    # Top bar
│   ├── RequireAuth.tsx               # Auth guard
│   ├── LoginModal.tsx                # Login modal
│   ├── SignupModal.tsx               # Signup modal
│   ├── AppointmentForm.tsx           # Appointment form
│   ├── BackToTop.tsx                 # Back to top button
│   ├── ClientScripts.tsx            # Client-side scripts
│   └── MomentScripts.tsx            # Moment.js scripts
│
├── generated/                        # Auto-generated code
│   └── api/
│       ├── endpoints/                # Generated API endpoints
│       ├── models/                   # Generated models
│       └── schemas/                  # Generated schemas
│
├── lib/                              # Utilities
│   └── api.ts                        # Axios instance & interceptors
│
└── utils/                            # Helper functions
    └── auth.ts                       # Authentication utilities
```

---

## 📄 Các Trang Chính

### Public Pages

#### 1. Home Page (`/`)
- Trang chủ giới thiệu về Medinova
- Hiển thị các dịch vụ, testimonials, team

#### 2. About Page (`/about`)
- Giới thiệu về bệnh viện/phòng khám

#### 3. Contact Page (`/contact`)
- Form liên hệ

#### 4. Blog Page (`/blog`)
- Danh sách bài viết blog

#### 5. Team Page (`/team`)
- Danh sách đội ngũ bác sĩ

#### 6. Login Page (`/login`)
- Form đăng nhập

#### 7. Signup Page (`/signup`)
- Form đăng ký tài khoản

### Patient Pages

#### 1. Dashboard (`/dashboard`)
- Dashboard cho bệnh nhân
- Hiển thị appointments, thông tin cá nhân

#### 2. Profile (`/profile`)
- Quản lý thông tin cá nhân
- Cập nhật profile

#### 3. Appointment (`/appointment`)
- Đặt lịch khám với bác sĩ
- Xem danh sách appointments

#### 4. Medical History (`/medical-history`)
- Xem lịch sử y tế
- Cập nhật thông tin y tế

### Admin Pages (`/admin/*`)

#### 1. Admin Dashboard (`/admin/dashboard`)
- Tổng quan hệ thống
- Thống kê

#### 2. User Management (`/admin/users`)
- Quản lý users
- Cập nhật roles

#### 3. Doctor Management (`/admin/doctors`)
- Quản lý bác sĩ
- Phê duyệt/từ chối bác sĩ
- Xem danh sách pending doctors

#### 4. Clinic Management (`/admin/hospitals`)
- Quản lý phòng khám

#### 5. Ambulance Management (`/admin/ambulances`)
- Quản lý xe cứu thương

#### 6. Blog Management (`/admin/blogs`)
- Quản lý blog posts
- Tạo/sửa/xóa bài viết

#### 7. Leave Requests (`/admin/leaves`)
- Quản lý yêu cầu nghỉ phép của bác sĩ

#### 8. Ranking (`/admin/ranking`)
- Xếp hạng bác sĩ và phòng khám

### Doctor Pages (`/doctor/*`)

#### 1. Doctor Dashboard (`/doctor/dashboard`)
- Dashboard cho bác sĩ
- Thống kê appointments

#### 2. Schedule (`/doctor/schedule`)
- Quản lý lịch làm việc
- Xem appointments

#### 3. Emergency (`/doctor/emergency`)
- Xử lý các trường hợp khẩn cấp
- Phân công xe cứu thương

#### 4. Ambulance (`/doctor/ambulance`)
- Quản lý xe cứu thương được phân công

#### 5. Notifications (`/doctor/notifications`)
- Thông báo cho bác sĩ

### Service Pages (`/services/*`)

- `/services/ambulance` - Dịch vụ xe cứu thương
- `/services/emergency` - Dịch vụ cấp cứu
- `/services/blood-testing` - Xét nghiệm máu
- `/services/outdoor-checkup` - Khám tại nhà
- `/services/pharmacy` - Dịch vụ dược phẩm
- `/services/surgery` - Dịch vụ phẫu thuật

---

## 🧩 Components

### Layout Components

#### Navbar (`components/Navbar.tsx`)
- Navigation bar với menu động
- Hiển thị user info khi đã đăng nhập
- Logout functionality
- Responsive design

**Features:**
- Auto-detect authentication status
- Listen to auth-change events
- Role-based menu items

#### Footer (`components/Footer.tsx`)
- Footer với thông tin liên hệ
- Links đến các trang

#### Topbar (`components/Topbar.tsx`)
- Top bar với thông tin liên hệ

### Auth Components

#### RequireAuth (`components/RequireAuth.tsx`)
- Component wrapper để bảo vệ các trang cần authentication
- Validate token với server
- Redirect về login nếu token không hợp lệ

**Usage:**
```tsx
<RequireAuth>
  <ProtectedPage />
</RequireAuth>
```

#### LoginModal (`components/LoginModal.tsx`)
- Modal form đăng nhập
- Xử lý authentication

#### SignupModal (`components/SignupModal.tsx`)
- Modal form đăng ký
- Validation

### Form Components

#### AppointmentForm (`components/AppointmentForm.tsx`)
- Form đặt lịch khám
- Chọn bác sĩ, thời gian
- Validation

### Utility Components

#### BackToTop (`components/BackToTop.tsx`)
- Button scroll to top

#### ClientScripts (`components/ClientScripts.tsx`)
- Load client-side scripts

#### MomentScripts (`components/MomentScripts.tsx`)
- Load Moment.js scripts

---

## 🔌 API Integration

### API Client Setup

#### Axios Instance (`lib/api.ts`)

**Features:**
- Base URL configuration
- Request interceptor: Thêm JWT token vào header
- Response interceptor: Xử lý errors, 401 redirect
- Silent error handling cho auth requests

**Configuration:**
```typescript
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => true, // Không throw error tự động
});
```

**Request Interceptor:**
- Tự động thêm `Authorization: Bearer <token>` vào header

**Response Interceptor:**
- Xử lý 401: Xóa token, redirect về login
- Silent errors cho auth requests (login/register)
- Throw errors cho các requests khác

### Generated API Clients (Orval)

API clients được tự động generate từ OpenAPI spec:

**Location:** `src/generated/api/endpoints/`

**Usage:**
```typescript
import { getAuthentication } from '@/generated/api/endpoints/authentication/authentication';

const authApi = getAuthentication();
const response = await authApi.login({ email, password });
```

**Generate API Clients:**
```bash
npm run orval
```

**Orval Config (`orval.config.ts`):**
- Input: OpenAPI spec từ backend (`http://localhost:8080/v3/api-docs`)
- Output: Generated endpoints và models
- Mutator: Sử dụng `api` function từ `lib/api.ts`

---

## 🔐 Authentication

### Auth Utilities (`utils/auth.ts`)

**Functions:**
- `getToken()`: Lấy JWT token từ localStorage
- `setToken(token)`: Lưu token vào localStorage
- `removeToken()`: Xóa token và các auth data
- `getUser()`: Lấy user info từ localStorage
- `setUser(user)`: Lưu user info
- `isAuthenticated()`: Kiểm tra đã đăng nhập chưa
- `migrateAuthStorage()`: Migrate data từ auth-storage

**Storage Keys:**
- `token`: JWT token
- `user`: User information

### Authentication Flow

1. **Login:**
   - User nhập email/password
   - Gọi API `/api/auth/login`
   - Lưu token và user vào localStorage
   - Dispatch `auth-change` event
   - Redirect về dashboard

2. **Protected Routes:**
   - Sử dụng `RequireAuth` component
   - Validate token với server
   - Redirect nếu không hợp lệ

3. **Logout:**
   - Gọi API `/api/auth/logout`
   - Xóa token và user từ localStorage
   - Dispatch `auth-change` event
   - Redirect về home

4. **Token Refresh:**
   - Token được validate mỗi khi vào protected page
   - Nếu hết hạn, tự động redirect về login

### Role-based Access

**Roles:**
- `PATIENT`: Bệnh nhân
- `DOCTOR`: Bác sĩ
- `ADMIN`: Quản trị viên

**Route Protection:**
- `/admin/*`: Chỉ ADMIN
- `/doctor/*`: Chỉ DOCTOR
- `/dashboard`, `/profile`: PATIENT hoặc DOCTOR

---

## 🛣️ Routing

### Next.js App Router

**File-based Routing:**
- `app/page.tsx` → `/`
- `app/login/page.tsx` → `/login`
- `app/admin/page.tsx` → `/admin`
- `app/admin/users/page.tsx` → `/admin/users`

**Layouts:**
- `app/layout.tsx`: Root layout (tất cả pages)
- `app/admin/layout.tsx`: Admin layout (chỉ admin pages)
- `app/doctor/layout.tsx`: Doctor layout (chỉ doctor pages)

**Dynamic Routes:**
- `app/detail/[id]/page.tsx` → `/detail/:id`

**API Routes:**
- `app/api/auth/login/route.ts` → `/api/auth/login`
- `app/api/auth/register/route.ts` → `/api/auth/register`

---

## 🎨 Styling

### CSS Framework

**Bootstrap 5.3.0:**
- Responsive grid system
- Components (buttons, forms, modals, etc.)
- Utilities

**Custom CSS:**
- `globals.css`: Global styles
- `public/css/style.css`: Custom styles
- Component-level CSS modules (nếu có)

### Assets

**Images:**
- `public/img/`: Static images
- `public/css/`: CSS files
- `public/js/`: JavaScript files
- `public/lib/`: Third-party libraries

**Fonts:**
- Google Fonts: Roboto, Roboto Condensed
- Font Awesome icons
- Bootstrap Icons

### Responsive Design

- Mobile-first approach
- Bootstrap breakpoints:
  - `sm`: 576px
  - `md`: 768px
  - `lg`: 992px
  - `xl`: 1200px
  - `xxl`: 1400px

---

## 🚀 Build & Deploy

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Generate API Clients

```bash
# Generate từ OpenAPI spec (cần backend đang chạy)
npm run orval
```

### Linting

```bash
npm run lint
```

---

## 📦 Dependencies

### Production Dependencies

- `next`: 16.1.1 - Next.js framework
- `react`: 19.2.3 - React library
- `react-dom`: 19.2.3 - React DOM
- `axios`: 1.13.2 - HTTP client
- `bootstrap`: 5.3.0 - CSS framework
- `jquery`: 3.7.1 - jQuery (for Bootstrap)
- `moment`: 2.30.1 - Date/time library
- `owl.carousel`: 2.3.4 - Carousel component
- `tempusdominus-bootstrap-4`: 5.1.2 - Date/time picker
- `waypoints`: 4.0.1 - Scroll animations

### Development Dependencies

- `typescript`: 5 - TypeScript
- `@types/node`: 20 - Node.js types
- `@types/react`: 19 - React types
- `@types/react-dom`: 19 - React DOM types
- `@types/jquery`: 3.5.29 - jQuery types
- `eslint`: 9 - Linter
- `eslint-config-next`: 16.1.1 - Next.js ESLint config
- `orval`: 7.13.2 - API client generator
- `babel-plugin-react-compiler`: 1.0.0 - React compiler

---

## 🐛 Troubleshooting

### Common Issues

#### 1. API calls fail with CORS error
- **Solution**: Đảm bảo backend CORS config cho phép frontend origin

#### 2. Token không được gửi trong requests
- **Solution**: Kiểm tra `getToken()` và request interceptor

#### 3. Hydration errors
- **Solution**: Sử dụng `suppressHydrationWarning` hoặc `'use client'` directive

#### 4. Generated API clients không update
- **Solution**: Chạy `npm run orval` sau khi backend API thay đổi

#### 5. Authentication state không sync
- **Solution**: Sử dụng `auth-change` event và storage listeners

---

## 📝 Best Practices

1. **Component Organization:**
   - Tách components theo chức năng
   - Reusable components trong `components/`
   - Page-specific components trong page folders

2. **API Calls:**
   - Sử dụng generated API clients từ Orval
   - Xử lý errors properly
   - Loading states

3. **Authentication:**
   - Luôn validate token với server cho protected routes
   - Clear auth data khi logout
   - Handle token expiration

4. **Performance:**
   - Sử dụng Server Components khi có thể
   - Lazy load components nếu cần
   - Optimize images với Next.js Image component

5. **Type Safety:**
   - Sử dụng TypeScript types từ generated models
   - Validate API responses

---

## 🔄 State Management

Hiện tại sử dụng:
- **Local State**: `useState` hooks
- **Local Storage**: Cho authentication state
- **Server State**: Fetch data từ API mỗi khi cần

**Có thể thêm:**
- React Context cho global state
- Zustand hoặc Redux cho complex state management

---

## 📚 Tài Liệu Tham Khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Bootstrap Documentation](https://getbootstrap.com/docs)
- [Orval Documentation](https://orval.dev)
- [Axios Documentation](https://axios-http.com/docs)

---

## 🤝 Đóng Góp

Khi thêm tính năng mới:
1. Tạo page trong `app/` nếu cần
2. Tạo component trong `components/` nếu reusable
3. Sử dụng generated API clients
4. Update documentation
5. Test trên các browsers khác nhau

