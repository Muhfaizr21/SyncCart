# SyncCart — Multi-Channel Commerce Orchestration Platform
## 📌 PROJECT REVISI — Go Backend + React Frontend

**Versi:** 2.0 | **Status:** Development Blueprint | **Last Updated:** Jan 2025

---

## 🚀 TECH STACK (REVISED)

### Backend: Golang
```
Framework       : Gin / Echo (REST API)
Database        : PostgreSQL (primary)
Cache Layer     : Redis
ORM             : GORM
Job Queue       : Asynq / bull-go
Authentication  : JWT + OAuth 2.0
Validation      : Validator/v10
Logging         : Zap / Logrus
Monitoring      : Prometheus + Grafana
Testing         : Testify + Mockery
API Docs        : Swagger/OpenAPI
```

### Frontend: React JS
```
UI Framework     : React 18+
Build Tool       : Vite
Styling         : TailwindCSS + shadcn/ui
State Mgmt      : Zustand / Redux Toolkit
HTTP Client     : Axios / React Query
Form Handling   : React Hook Form + Zod
Charts          : Recharts / Chart.js
Notifications   : React Toastify
Auth            : JWT (localStorage/httpOnly cookie)
Routing         : React Router v6
Testing         : Vitest + React Testing Library
```

### Infrastructure
```
Backend Hosting : AWS EC2 / Digital Ocean / Fly.io
Frontend Hosting: Vercel / Netlify
Database        : AWS RDS PostgreSQL / Supabase
Cache           : AWS ElastiCache / Redis Cloud
File Storage    : AWS S3 / Cloudinary
CDN             : CloudFlare
CI/CD           : GitHub Actions
Monitoring      : Sentry + New Relic
```

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │   Products   │  │    Orders    │     │
│  │   Pages      │  │   Pages      │  │    Pages     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           ▼                                  │
│              React Query + Axios (HTTP)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┼────────┐
                   │                 │
        ┌──────────▼──────────┐   ┌──────────────────┐
        │   API Gateway       │   │  Webhook Handler │
        │  (Request Logger)   │   │  (Marketplace)   │
        └──────────┬──────────┘   └──────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│             GO BACKEND (Gin/Echo)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                   │   │
│  │  - Authentication (JWT)                             │   │
│  │  - RBAC Enforcement                                 │   │
│  │  - Rate Limiting                                    │   │
│  │  - Logging                                          │   │
│  │  - CORS                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Route Handlers (Controllers)                        │   │
│  │  - Auth Service                                     │   │
│  │  - Product Service                                  │   │
│  │  - Order Service                                    │   │
│  │  - Marketplace Service                              │   │
│  │  - Subscription Service                             │   │
│  │  - Team/RBAC Service                                │   │
│  │  - Analytics Service                                │   │
│  │  - Admin Service                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Business Logic Layer (Use Cases)                   │   │
│  │  - Product Sync Engine                              │   │
│  │  - Order Processor                                  │   │
│  │  - Stock Reconciliation                             │   │
│  │  - Notification Manager                             │   │
│  │  - Marketplace OAuth Handler                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Layer (Repository Pattern)                    │   │
│  │  - User Repository                                  │   │
│  │  - Store Repository                                 │   │
│  │  - Product Repository                               │   │
│  │  - Order Repository                                 │   │
│  │  - Marketplace Connection Repository                │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────┬───────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
    ┌───▼──┐   ┌──▼──┐   ┌──▼────┐
    │ DB   │   │Redis│   │S3/CDN │
    │ PG   │   │     │   │       │
    └──────┘   └─────┘   └───────┘
```

---

## 📂 PROJECT FOLDER STRUCTURE

### Backend (Golang)
```
synccart-backend/
├── cmd/
│   └── api/
│       └── main.go                 # Entry point
├── config/
│   ├── config.go                   # Configuration loader
│   └── constants.go                # App constants
├── internal/
│   ├── auth/
│   │   ├── handler.go              # Login/Register/JWT endpoints
│   │   ├── service.go              # Auth business logic
│   │   ├── repository.go           # User DB queries
│   │   └── middleware.go           # JWT validation middleware
│   ├── store/
│   │   ├── handler.go              # Store CRUD endpoints
│   │   ├── service.go              # Store business logic
│   │   └── repository.go           # Store DB queries
│   ├── product/
│   │   ├── handler.go              # Product endpoints
│   │   ├── service.go              # Product sync engine
│   │   ├── repository.go           # Product DB queries
│   │   └── marketplace_sync.go     # Sync logic for each marketplace
│   ├── order/
│   │   ├── handler.go              # Order endpoints
│   │   ├── service.go              # Order processing logic
│   │   ├── repository.go           # Order DB queries
│   │   └── webhook.go              # Marketplace webhook handlers
│   ├── marketplace/
│   │   ├── shopee/
│   │   │   ├── client.go           # Shopee API client
│   │   │   ├── oauth.go            # Shopee OAuth flow
│   │   │   ├── products.go         # Shopee product APIs
│   │   │   ├── orders.go           # Shopee order APIs
│   │   │   └── webhook.go          # Shopee webhook handlers
│   │   ├── tokopedia/
│   │   │   ├── client.go
│   │   │   ├── oauth.go
│   │   │   ├── products.go
│   │   │   ├── orders.go
│   │   │   └── webhook.go
│   │   └── tiktok/
│   │       ├── client.go
│   │       ├── oauth.go
│   │       ├── products.go
│   │       ├── orders.go
│   │       └── webhook.go
│   ├── team/
│   │   ├── handler.go              # Team member endpoints
│   │   ├── service.go              # Team management logic
│   │   ├── repository.go           # Team DB queries
│   │   └── rbac.go                 # RBAC enforcement
│   ├── subscription/
│   │   ├── handler.go              # Subscription endpoints
│   │   ├── service.go              # Billing logic
│   │   ├── repository.go           # Subscription DB queries
│   │   └── payment.go              # Payment gateway integration
│   ├── report/
│   │   ├── handler.go              # Report endpoints
│   │   ├── service.go              # Report calculation
│   │   ├── repository.go           # Analytics DB queries
│   │   └── exporter.go             # PDF/Excel export
│   ├── notification/
│   │   ├── service.go              # Notification service
│   │   ├── email.go                # Email sender
│   │   ├── push.go                 # Push notification (future)
│   │   └── repository.go           # Notification history
│   ├── admin/
│   │   ├── handler.go              # Admin endpoints
│   │   ├── service.go              # Admin business logic
│   │   └── repository.go           # Admin queries
│   └── common/
│       ├── middleware.go           # Global middlewares
│       ├── error.go                # Error handling
│       ├── request.go              # Request helpers
│       ├── response.go             # Response formatting
│       └── encryption.go           # Token encryption/decryption
├── pkg/
│   ├── database/
│   │   ├── postgres.go             # DB connection & setup
│   │   └── migrations/             # SQL migrations
│   ├── cache/
│   │   └── redis.go                # Redis client setup
│   ├── jobs/
│   │   ├── sync_products.go        # Product sync job
│   │   ├── sync_orders.go          # Order sync job
│   │   ├── token_refresh.go        # Token refresh job
│   │   └── notification.go         # Notification jobs
│   └── external/
│       ├── payment/
│       │   ├── midtrans.go
│       │   └── xendit.go
│       ├── email/
│       │   └── sendgrid.go
│       ├── storage/
│       │   └── s3.go
│       └── courier/
│           ├── jne.go
│           ├── jnt.go
│           └── sicepat.go
├── models/
│   ├── user.go
│   ├── store.go
│   ├── product.go
│   ├── order.go
│   ├── marketplace_connection.go
│   ├── team_member.go
│   ├── subscription.go
│   ├── notification.go
│   └── activity_log.go
├── routes/
│   ├── auth_routes.go
│   ├── store_routes.go
│   ├── product_routes.go
│   ├── order_routes.go
│   ├── marketplace_routes.go
│   ├── team_routes.go
│   ├── subscription_routes.go
│   ├── report_routes.go
│   ├── admin_routes.go
│   └── webhook_routes.go
├── tests/
│   ├── auth_test.go
│   ├── product_test.go
│   ├── order_test.go
│   └── integration_test.go
├── docs/
│   ├── swagger.yaml                # OpenAPI spec
│   └── DATABASE.md                 # Database design docs
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── go.mod
├── go.sum
└── README.md
```

### Frontend (React)
```
synccart-frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx         # Main sidebar component
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Spinner.jsx
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── SellerDashboard.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── Charts/
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   └── StockSync.jsx
│   │   ├── orders/
│   │   │   ├── OrderList.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   └── ShippingForm.jsx
│   │   ├── marketplace/
│   │   │   ├── MarketplaceList.jsx
│   │   │   ├── ConnectMarketplace.jsx
│   │   │   └── SyncStatus.jsx
│   │   ├── team/
│   │   │   ├── TeamList.jsx
│   │   │   ├── InviteForm.jsx
│   │   │   └── PermissionManager.jsx
│   │   ├── reports/
│   │   │   ├── SalesReport.jsx
│   │   │   ├── ProductReport.jsx
│   │   │   ├── FinanceReport.jsx
│   │   │   └── ExportButton.jsx
│   │   └── subscription/
│   │       ├── PlanSelector.jsx
│   │       ├── InvoiceList.jsx
│   │       └── PaymentForm.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sellers.jsx
│   │   │   ├── AllProducts.jsx
│   │   │   ├── AllOrders.jsx
│   │   │   ├── Subscriptions.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Users.jsx
│   │   │   └── SupportTickets.jsx
│   │   ├── seller/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   ├── Team.jsx
│   │   │   ├── Subscription.jsx
│   │   │   └── Settings.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   └── NotFound.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useStore.js
│   │   ├── useFetch.js
│   │   ├── useRBAC.js
│   │   ├── useNotification.js
│   │   └── useProductSync.js
│   ├── services/
│   │   ├── api/
│   │   │   ├── auth.js
│   │   │   ├── stores.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── marketplace.js
│   │   │   ├── team.js
│   │   │   ├── subscription.js
│   │   │   ├── reports.js
│   │   │   └── admin.js
│   │   └── utils/
│   │       ├── axiosConfig.js
│   │       ├── tokenManager.js
│   │       └── formatters.js
│   ├── store/
│   │   ├── authStore.js
│   │   ├── storeStore.js
│   │   ├── productStore.js
│   │   ├── orderStore.js
│   │   ├── uiStore.js
│   │   └── notificationStore.js
│   ├── context/
│   │   ├── RBACContext.jsx
│   │   ├── StoreContext.jsx
│   │   └── ThemeContext.jsx
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   ├── AdminRoute.jsx
│   │   └── index.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.config.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── permissions.js
│   └── App.jsx
├── public/
│   ├── logo.png
│   └── favicon.ico
├── .env.example
├── .eslintrc.json
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 📋 COMPREHENSIVE TODO LIST — FASE BY FASE

---

## 🔵 PHASE 1: FOUNDATION & SETUP (Week 1-2)

### Backend Setup
- [ ] Initialize Go project structure & go.mod
- [ ] Setup environment variables (.env)
- [ ] Configure PostgreSQL connection (GORM)
- [ ] Setup Redis client
- [ ] Create database migration scripts (migrate CLI)
- [ ] Implement base error handling package
- [ ] Implement request/response helpers
- [ ] Setup Gin/Echo server with basic middleware
  - [ ] Logger middleware
  - [ ] CORS middleware
  - [ ] Rate limiter middleware
  - [ ] Request ID middleware
- [ ] Create database schema migrations:
  - [ ] users table
  - [ ] stores table
  - [ ] store_members table
  - [ ] marketplace_connections table
  - [ ] products table
  - [ ] product_marketplace table
  - [ ] orders table
  - [ ] order_items table
  - [ ] notifications table
  - [ ] invoices table
  - [ ] activity_logs table
  - [ ] sync_logs table
  - [ ] subscriptions table
- [ ] Implement JWT auth package (token generation, validation)
- [ ] Create encryption/decryption utilities for sensitive data
- [ ] Setup Swagger/OpenAPI documentation
- [ ] Setup Docker & docker-compose for local dev
- [ ] Setup GitHub Actions for CI/CD pipeline basic

### Frontend Setup
- [ ] Initialize React + Vite project
- [ ] Install & configure TailwindCSS
- [ ] Setup shadcn/ui component library
- [ ] Configure React Router v6
- [ ] Setup Zustand for state management
- [ ] Setup React Query for server state
- [ ] Configure Axios with interceptors
- [ ] Setup environment variables (.env)
- [ ] Create base folder structure
- [ ] Implement auth context & hooks
- [ ] Create main layout component (Sidebar + Header + Content)
- [ ] Setup ESLint & Prettier
- [ ] Create reusable UI components:
  - [ ] Button component
  - [ ] Input component
  - [ ] Table component
  - [ ] Modal component
  - [ ] Badge component
  - [ ] Card component
  - [ ] Spinner/Loading component
  - [ ] Alert/Toast component
  - [ ] Dropdown/Select component
  - [ ] Pagination component
- [ ] Setup TailwindCSS theme colors (Primary Blue, Secondary Green)
- [ ] Create responsive sidebar skeleton
- [ ] Setup mock API responses for testing
- [ ] Configure build optimization (Vite)

---

## 🟣 PHASE 2: AUTHENTICATION & RBAC (Week 2-3)

### Backend - Authentication
- [ ] Create User model & migration
- [ ] Implement user repository (GORM)
- [ ] Implement password hashing (bcrypt)
- [ ] Create auth service (sign up, login, logout)
- [ ] Implement JWT token generation & validation
- [ ] Create refresh token mechanism
- [ ] Implement forgot password flow
- [ ] Create reset password functionality
- [ ] Setup email verification (SendGrid)
- [ ] Create auth handler endpoints:
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/login
  - [ ] POST /api/auth/refresh-token
  - [ ] POST /api/auth/logout
  - [ ] POST /api/auth/forgot-password
  - [ ] POST /api/auth/reset-password
  - [ ] GET /api/auth/me (current user)
- [ ] Implement JWT validation middleware
- [ ] Create user activity logging

### Backend - RBAC System
- [ ] Create role constants (super_admin, seller, staff)
- [ ] Create permission constants (CRUD operations)
- [ ] Implement permission enforcement middleware
- [ ] Create store_members model with permissions JSON
- [ ] Implement permission checker utility
- [ ] Create RBAC service:
  - [ ] Check user role
  - [ ] Check user permission
  - [ ] Get user accessible stores
  - [ ] Get visible menu items based on role
- [ ] Implement hierarchical authorization:
  - [ ] Super Admin → access all
  - [ ] Owner → access own store + team mgmt
  - [ ] Staff → access based on granted permissions

### Frontend - Authentication
- [ ] Create Login page component
- [ ] Create Register page component
- [ ] Create Forgot Password page
- [ ] Create Reset Password page
- [ ] Implement auth API service
- [ ] Create useAuth hook
- [ ] Setup token storage (localStorage / httpOnly cookie)
- [ ] Implement auto login on refresh (token validation)
- [ ] Create ProtectedRoute component
- [ ] Implement logout functionality
- [ ] Create 2FA setup page (future: TOTP)
- [ ] Add loading & error states
- [ ] Add form validation (React Hook Form + Zod)

### Frontend - RBAC UI
- [ ] Create RBACContext for permission checking
- [ ] Implement useRBAC hook
- [ ] Create conditional menu rendering based on role
- [ ] Create PermissionGuard component for protecting UI elements
- [ ] Implement dynamic sidebar based on permissions
- [ ] Create role-based page access control
- [ ] Add 403 Forbidden page

---

## 🟠 PHASE 3: STORE & ADMIN SETUP (Week 3-4)

### Backend - Store Management
- [ ] Create Store model & migration
- [ ] Implement store repository
- [ ] Create store service:
  - [ ] Create store
  - [ ] Update store info
  - [ ] Get store details
  - [ ] Soft delete store
  - [ ] Get user's stores
- [ ] Create store handler endpoints:
  - [ ] POST /api/stores (create)
  - [ ] GET /api/stores (list user's stores)
  - [ ] GET /api/stores/:storeId (detail)
  - [ ] PATCH /api/stores/:storeId (update)
  - [ ] DELETE /api/stores/:storeId (soft delete)
- [ ] Implement store context in all requests
- [ ] Create store selection middleware
- [ ] Implement subscription plan validation
- [ ] Setup store-level activity logging

### Backend - Admin Panel
- [ ] Create admin service for aggregated queries
- [ ] Create admin handler endpoints:
  - [ ] GET /api/admin/dashboard/summary
  - [ ] GET /api/admin/sellers (paginated list)
  - [ ] GET /api/admin/sellers/:sellerId (detail)
  - [ ] PATCH /api/admin/sellers/:sellerId/status (suspend/activate)
  - [ ] PATCH /api/admin/sellers/:sellerId/plan (change plan)
  - [ ] DELETE /api/admin/sellers/:sellerId
  - [ ] GET /api/admin/users (all users)
  - [ ] GET /api/admin/activity-logs (system logs)
- [ ] Implement admin-only authorization checks
- [ ] Create aggregation queries (total seller, revenue, etc)
- [ ] Implement caching for dashboard metrics

### Frontend - Admin Pages
- [ ] Create Admin Dashboard page
  - [ ] Display total metrics (sellers, orders, revenue)
  - [ ] Seller activity chart
  - [ ] Marketplace connection status
  - [ ] Top 10 sellers by revenue
  - [ ] Alert system (API errors, token expiry)
  - [ ] Filter by date range
  - [ ] Export dashboard data
- [ ] Create Sellers management page:
  - [ ] Sellers list with pagination
  - [ ] Search & filter (by status, plan, registration date)
  - [ ] Seller detail modal
  - [ ] Suspend/activate action
  - [ ] Plan change dialog
  - [ ] Delete confirmation
- [ ] Create Users management page
- [ ] Create System Logs viewer
- [ ] Create Settings page for admin

### Frontend - Seller Pages
- [ ] Create Seller Dashboard page
- [ ] Create Store Settings page
- [ ] Create Store Profile form

---

## 🔴 PHASE 4: MARKETPLACE INTEGRATION (Week 4-6)

### Backend - Marketplace OAuth
- [ ] Create marketplace_connections model
- [ ] Create MarketplaceConnection repository
- [ ] Implement encryption for tokens (AES-256)

#### Shopee Integration
- [ ] Create Shopee API client package
- [ ] Implement Shopee OAuth 2.0 flow:
  - [ ] Generate authorization URL
  - [ ] Handle OAuth callback
  - [ ] Exchange code for token
  - [ ] Store token (encrypted)
  - [ ] Implement token refresh logic
- [ ] Create Shopee API endpoints:
  - [ ] POST /api/marketplaces/shopee/connect (start OAuth)
  - [ ] GET /api/marketplaces/shopee/callback (OAuth callback)
  - [ ] POST /api/marketplaces/shopee/disconnect
  - [ ] GET /api/marketplaces/shopee/status
- [ ] Implement Shopee API wrappers:
  - [ ] Get shop info
  - [ ] Fetch products list
  - [ ] Fetch orders list
  - [ ] Update product price/stock
  - [ ] Update order status
  - [ ] Get tracking status
- [ ] Setup Shopee webhook receiver:
  - [ ] POST /api/webhooks/shopee
  - [ ] Validate webhook signature
  - [ ] Handle product update webhooks
  - [ ] Handle order update webhooks
  - [ ] Queue for async processing

#### Tokopedia Integration
- [ ] Create Tokopedia API client package
- [ ] Implement Tokopedia OAuth 2.0 flow
- [ ] Create Tokopedia API endpoints (same structure as Shopee)
- [ ] Implement Tokopedia API wrappers
- [ ] Setup Tokopedia webhook receiver

#### TikTok Shop Integration
- [ ] Create TikTok API client package
- [ ] Implement TikTok OAuth 2.0 flow
- [ ] Create TikTok API endpoints
- [ ] Implement TikTok API wrappers
- [ ] Setup TikTok webhook receiver

### Backend - Marketplace Management Service
- [ ] Create marketplace service:
  - [ ] List connected marketplaces
  - [ ] Get connection status
  - [ ] Validate token expiry
  - [ ] Auto-refresh expiring tokens
- [ ] Implement connection status monitoring
- [ ] Create sync log mechanism
- [ ] Implement rate limiting for marketplace APIs
- [ ] Setup retry mechanism for failed calls
- [ ] Create error handling for API failures

### Frontend - Marketplace Pages
- [ ] Create Marketplace list page:
  - [ ] Display connected marketplace status
  - [ ] Sync status indicator
  - [ ] Last sync time
  - [ ] Error messages if any
  - [ ] Connect/Disconnect buttons
- [ ] Create OAuth callback handler page
- [ ] Create Marketplace settings modal:
  - [ ] Auto-sync interval configuration
  - [ ] Sync now button
  - [ ] View sync logs
  - [ ] Connection status details
- [ ] Add Marketplace badges to product/order lists

---

## 🟢 PHASE 5: PRODUCT MANAGEMENT (Week 6-8)

### Backend - Product Service
- [ ] Create Product model & migration
- [ ] Create ProductMarketplace model for mappings
- [ ] Create product repository
- [ ] Implement product service:
  - [ ] CRUD operations
  - [ ] Product creation with marketplace selection
  - [ ] Product duplication
  - [ ] Bulk operations
  - [ ] Stock reconciliation
  - [ ] Conflict detection

#### Product Creation & Sync
- [ ] Implement product creation flow:
  - [ ] Create master product in SyncCart
  - [ ] Map to selected marketplaces
  - [ ] Push to marketplace APIs
  - [ ] Store marketplace product IDs
  - [ ] Handle partial failures (some marketplace succeed, some fail)
- [ ] Create product handler endpoints:
  - [ ] POST /api/products (create)
  - [ ] GET /api/products (list with filters)
  - [ ] GET /api/products/:productId
  - [ ] PATCH /api/products/:productId
  - [ ] DELETE /api/products/:productId
  - [ ] POST /api/products/bulk-update (harga/stok)
  - [ ] POST /api/products/:productId/publish (push to marketplace)
  - [ ] POST /api/products/:productId/unpublish
  - [ ] GET /api/products/issues (problematic products)
- [ ] Implement product validation:
  - [ ] Validate required fields
  - [ ] Check image requirements per marketplace
  - [ ] Validate price & stock
  - [ ] Check marketplace-specific rules

#### Stock Sync Engine
- [ ] Create stock sync service:
  - [ ] Manual sync trigger
  - [ ] Automatic sync (background job)
  - [ ] Conflict detection (stock mismatch across marketplace)
  - [ ] Conflict resolution (user choice or auto-merge)
  - [ ] Sync log tracking
- [ ] Create stock sync job:
  - [ ] POST /api/products/sync-stock
  - [ ] Fetch stock from all connected marketplace APIs
  - [ ] Compare with master record
  - [ ] Detect conflicts
  - [ ] Log sync results
- [ ] Implement stock reconciliation:
  - [ ] When order placed → deduct stock from master
  - [ ] When order cancelled → return stock to master
  - [ ] Propagate to all marketplace APIs
  - [ ] Retry if any marketplace fails
  - [ ] Queue for async processing

#### Price Sync
- [ ] Create price sync job
- [ ] Implement price update propagation
- [ ] Handle per-marketplace pricing
- [ ] Implement currency conversion (if needed)

### Backend - Product Webhook Handlers
- [ ] Implement product update webhook handlers:
  - [ ] Shopee product update webhook
  - [ ] Tokopedia product update webhook
  - [ ] TikTok product update webhook
- [ ] Validate webhook signatures
- [ ] Update product info in SyncCart
- [ ] Queue for async processing

### Backend - Product Sync Job Queue
- [ ] Setup Asynq job queue
- [ ] Create daily product sync background job
- [ ] Create hourly stock check job
- [ ] Implement job retry logic
- [ ] Create job result logging
- [ ] Setup job monitoring dashboard

### Frontend - Product Pages

#### Product List Page
- [ ] Create product list with table:
  - [ ] Product image, name, SKU
  - [ ] Price (per marketplace)
  - [ ] Stock status (per marketplace)
  - [ ] Connected marketplaces badges
  - [ ] Status badge (active/inactive/out of stock)
  - [ ] Last sync time
- [ ] Implement search & filter:
  - [ ] Search by name/SKU
  - [ ] Filter by marketplace
  - [ ] Filter by status
  - [ ] Filter by stock (habis/hampir habis/aman)
  - [ ] Filter by category
- [ ] Implement sorting (name, price, stock, latest)
- [ ] Implement pagination
- [ ] Implement bulk actions:
  - [ ] Select multiple products
  - [ ] Bulk update price (modal)
  - [ ] Bulk update stock (modal)
  - [ ] Bulk activate/deactivate
  - [ ] Bulk delete
  - [ ] Bulk publish to marketplace
- [ ] Add row actions (edit, view, delete)
- [ ] Add export to Excel

#### Product Create/Edit Page
- [ ] Create product form with fields:
  - [ ] Name, description
  - [ ] Category selection
  - [ ] SKU input
  - [ ] Price input (base price)
  - [ ] Stock input (base stock)
  - [ ] Weight & dimensions
  - [ ] Image upload (multi)
  - [ ] Marketplace selection checkboxes:
    - [ ] Shopee (price & stock inputs)
    - [ ] Tokopedia (price & stock inputs)
    - [ ] TikTok (price & stock inputs)
- [ ] Implement form validation (Zod)
- [ ] Implement image preview
- [ ] Implement auto-fill from existing product (duplicate)
- [ ] Implement save as draft
- [ ] Implement preview per marketplace
- [ ] Add marketplace-specific requirements modal
- [ ] Implement form error handling

#### Product Detail Page
- [ ] Display product info
- [ ] Show price & stock per marketplace
- [ ] Display sync status per marketplace
- [ ] Show last sync time
- [ ] Show sync errors if any
- [ ] Implement quick edit (inline editing)
- [ ] Show marketplace listing links
- [ ] Show sales analytics for this product
- [ ] Implement delete action

#### Stock Sync Page
- [ ] Create manual sync trigger button
- [ ] Display sync status (in progress/completed)
- [ ] Show items synced count
- [ ] Show conflicts detected
- [ ] Implement conflict resolution:
  - [ ] Select which marketplace's stock to use
  - [ ] Auto-merge option
  - [ ] Manual override
- [ ] Show sync log history:
  - [ ] Last sync time
  - [ ] Items synced
  - [ ] Errors
  - [ ] Duration

#### Problematic Products Page
- [ ] List products with issues:
  - [ ] Stock not synced
  - [ ] Price mismatch
  - [ ] Failed to publish
  - [ ] Rejected by marketplace
  - [ ] Out of stock but still active
- [ ] Filter by issue type
- [ ] Quick fix actions:
  - [ ] Force sync
  - [ ] Update marketplace info
  - [ ] Deactivate product
  - [ ] Delete product
- [ ] Show error details & resolution hints
- [ ] Bulk fix action

---

## 🟡 PHASE 6: ORDER MANAGEMENT (Week 8-10)

### Backend - Order Service
- [ ] Create Order & OrderItem models
- [ ] Create order repository
- [ ] Implement order service:
  - [ ] CRUD operations
  - [ ] Status transitions
  - [ ] Tracking updates
  - [ ] Return/refund handling

#### Order Sync & Webhook
- [ ] Create order sync job:
  - [ ] POST /api/orders/sync-all (manual trigger)
  - [ ] Fetch orders from all connected marketplace APIs
  - [ ] Create/update order records in SyncCart
  - [ ] Store marketplace order IDs
  - [ ] Detect new orders
  - [ ] Log sync results
- [ ] Implement order webhook handlers:
  - [ ] Shopee order update webhook
  - [ ] Tokopedia order update webhook
  - [ ] TikTok order update webhook
  - [ ] Validate webhook signature
  - [ ] Parse order data
  - [ ] Update order status in SyncCart
  - [ ] Trigger notifications
- [ ] Setup order sync background job (every 5 minutes)

#### Order Processing
- [ ] Create order handler endpoints:
  - [ ] GET /api/orders (list with filters)
  - [ ] GET /api/orders/:orderId (detail)
  - [ ] PATCH /api/orders/:orderId/status (update status)
  - [ ] POST /api/orders/:orderId/ship (input tracking number)
  - [ ] POST /api/orders/bulk-ship (batch input resi)
  - [ ] GET /api/orders/needs-processing
  - [ ] POST /api/orders/:orderId/cancel
  - [ ] POST /api/orders/:orderId/return
  - [ ] POST /api/orders/export (export to Excel)
- [ ] Implement order status state machine:
  ```
  New → Processing → Shipped → Delivered → Completed
  New → Cancelled
  Completed → Return Request → Return Approved/Rejected
  ```
- [ ] Implement SLA timer:
  - [ ] Calculate max shipping time per marketplace
  - [ ] Warn if approaching deadline
  - [ ] Flag if SLA exceeded

#### Tracking Integration
- [ ] Implement courier tracking:
  - [ ] JNE API integration
  - [ ] J&T API integration
  - [ ] SiCepat API integration
  - [ ] Fetch tracking status
  - [ ] Update order status based on tracking
  - [ ] Store tracking history
- [ ] Create tracking service
- [ ] Implement auto-confirm delivery (after X days)

#### Order Notifications
- [ ] Send email notification:
  - [ ] Order received
  - [ ] Order ready to ship (to seller)
  - [ ] Order shipped (to buyer)
  - [ ] Order delivered
  - [ ] Order completed
- [ ] Send in-app notifications
- [ ] Send WhatsApp notification (premium)

### Backend - Chat Integration (Future MVP+ but prepare structure)
- [ ] Create chat message model
- [ ] Create message repository
- [ ] Setup WebSocket or webhook for marketplace chat
- [ ] Create message handler endpoints (prepare structure)

### Frontend - Order Pages

#### Order List Page
- [ ] Create order list with table:
  - [ ] Order ID (from marketplace)
  - [ ] Marketplace badge
  - [ ] Buyer name
  - [ ] Product info (name, qty)
  - [ ] Total price
  - [ ] Order status badge
  - [ ] Order date
  - [ ] Time to ship (countdown)
- [ ] Implement search & filter:
  - [ ] Search by order ID, buyer name
  - [ ] Filter by marketplace
  - [ ] Filter by status
  - [ ] Filter by date range
  - [ ] Filter by product
- [ ] Implement sorting (newest, oldest, price)
- [ ] Implement pagination
- [ ] Implement bulk actions:
  - [ ] Print invoice
  - [ ] Print shipping label
  - [ ] Update resi (batch)
  - [ ] Export to Excel
- [ ] Add row actions (view detail, update resi, cancel, chat)

#### Needs Processing Page (Hot List)
- [ ] List orders with "baru" / "menunggu pengiriman" status
- [ ] Highlight orders approaching SLA deadline
- [ ] Add timer countdown (23:45:12 tersisa)
- [ ] Add quick action buttons:
  - [ ] Proses (input resi)
  - [ ] Pack (generate packing slip)
  - [ ] Chat (open chat modal)
- [ ] Add product images for quick reference
- [ ] Implement one-click actions

#### Order Detail Page
- [ ] Display order info:
  - [ ] Order ID, date, time
  - [ ] Marketplace source
  - [ ] Buyer info (name, phone, address)
  - [ ] Shipping address
- [ ] Display order items:
  - [ ] Product image, name, SKU, quantity, price
  - [ ] Product link to detail page
- [ ] Display payment info:
  - [ ] Subtotal, shipping, discount, total
  - [ ] Payment method
  - [ ] Payment status
- [ ] Display shipping info:
  - [ ] Courier selection
  - [ ] Tracking number input
  - [ ] Generate shipping label
  - [ ] Tracking status (live updated)
  - [ ] Estimated delivery date
- [ ] Display order status timeline:
  - [ ] Order placed ✅ (timestamp)
  - [ ] Payment received ✅ (timestamp)
  - [ ] Processing ○ (in progress)
  - [ ] Shipped ○ (pending)
  - [ ] Delivered ○ (pending)
- [ ] Add action buttons:
  - [ ] Mark as shipped (input resi)
  - [ ] Cancel order
  - [ ] Initiate return
  - [ ] Chat buyer

#### Shipped Orders Page
- [ ] List orders with tracking info:
  - [ ] Order ID
  - [ ] Buyer name
  - [ ] Courier + tracking number
  - [ ] Status (Picked up, In transit, Arrived, Delivering, Delivered)
  - [ ] Estimated delivery date
  - [ ] Last status update time
- [ ] Live tracking status indicator
- [ ] Auto-refresh tracking (every 5 minutes)
- [ ] Link to courier tracking page (external)
- [ ] Manual status update button
- [ ] Auto-confirm if no buyer response

#### Completed Orders Page
- [ ] List completed orders
- [ ] Show rating & review from buyer
- [ ] Show revenue recap
- [ ] Implement feedback/review filter
- [ ] Link to reorder function

#### Returns/Cancellations Page
- [ ] List cancelled & return orders
- [ ] Show cancellation/return reason
- [ ] Show evidence (if return)
- [ ] Implement approval workflow:
  - [ ] Approve return → generate return label
  - [ ] Reject return → send message
- [ ] Track refund status
- [ ] Show refund amount

#### Shipping Form Modal/Page
- [ ] Input form for tracking info:
  - [ ] Courier dropdown (JNE, J&T, SiCepat, etc)
  - [ ] Tracking number input
  - [ ] Weight input (auto-filled from product)
  - [ ] Dimensions (auto-filled)
- [ ] Generate shipping label button:
  - [ ] Fetch label from courier API
  - [ ] Display label for printing
  - [ ] Option to print multiple
- [ ] Barcode scanning (mobile)
- [ ] Bulk input resi via Excel upload

---

## 🟢 PHASE 7: REPORTING & ANALYTICS (Week 10-11)

### Backend - Report Service
- [ ] Create report service with aggregation functions
- [ ] Implement analytics queries

#### Sales Report
- [ ] Create sales report endpoints:
  - [ ] GET /api/reports/sales?period=daily|weekly|monthly&from=&to=
  - [ ] Returns: revenue, order count, avg order value, growth %
- [ ] Query data from orders table
- [ ] Cache results (update every 1 hour)
- [ ] Support date range filtering

#### Product Report
- [ ] Create product report endpoints:
  - [ ] GET /api/reports/products/top-selling
  - [ ] GET /api/reports/products/worst-selling
  - [ ] GET /api/reports/products/return-rate
  - [ ] GET /api/reports/products/stock-movement
- [ ] Implement stock movement tracking (restock jobs)
- [ ] Calculate return rate per product

#### Marketplace Report
- [ ] Create marketplace report endpoints:
  - [ ] GET /api/reports/marketplace/:platform
  - [ ] Returns: revenue, order count, avg value, rating per platform
- [ ] Compare marketplace performance
- [ ] Identify best performing channels

#### Finance Report
- [ ] Create finance report endpoints:
  - [ ] GET /api/reports/finance
  - [ ] Returns: revenue, fees, costs, profit, margin
- [ ] Calculate net profit (revenue - fees - operational costs)
- [ ] Estimate taxes
- [ ] Cash flow calculations

#### Report Export
- [ ] Create export service
- [ ] Implement PDF export (ReportLab/Go PDF libraries)
- [ ] Implement Excel export (Go Excel libraries)
- [ ] Implement CSV export
- [ ] Create scheduled export job:
  - [ ] Store scheduled exports
  - [ ] Send via email
  - [ ] Email templates

### Frontend - Report Pages

#### Sales Report Page
- [ ] Display sales metrics:
  - [ ] Total revenue (big number)
  - [ ] Number of orders
  - [ ] Average order value
  - [ ] Growth % vs last period
- [ ] Line chart (revenue over time)
- [ ] Bar chart (orders per day/week/month)
- [ ] Filter by date range
- [ ] Marketplace breakdown widget
- [ ] Export button (PDF/Excel)

#### Product Report Page
- [ ] Display top selling products table:
  - [ ] Product name, image
  - [ ] Units sold
  - [ ] Revenue
  - [ ] % of total revenue
- [ ] Display worst selling products
- [ ] Display high return rate products
- [ ] Filter & sort
- [ ] Link to product detail page
- [ ] Recommendations section

#### Marketplace Report Page
- [ ] Create tabs per marketplace
- [ ] Display per-marketplace metrics:
  - [ ] Total revenue from this platform
  - [ ] % of total revenue
  - [ ] Number of orders
  - [ ] Average rating
  - [ ] Growth trend
- [ ] Marketplace comparison chart
- [ ] Identify best performing marketplace
- [ ] Show sync status & frequency

#### Finance Report Page
- [ ] Display financial metrics:
  - [ ] Total revenue
  - [ ] Platform fees & commissions
  - [ ] Operational costs
  - [ ] Gross profit
  - [ ] Net profit
  - [ ] Profit margin %
- [ ] Breakdown pie chart (revenue sources)
- [ ] Cost breakdown chart
- [ ] Cash flow table
- [ ] Profit margin per marketplace
- [ ] Tax estimation
- [ ] Export for accounting

#### Report Export Dialog
- [ ] Export format selector (PDF/Excel/CSV)
- [ ] Schedule export option
  - [ ] One-time / recurring
  - [ ] Email to recipient
- [ ] Send button
- [ ] Email template preview

---

## 🔵 PHASE 8: TEAM & RBAC (Week 11-12)

### Backend - Team Management
- [ ] Create team/member endpoints:
  - [ ] GET /api/team (list members)
  - [ ] POST /api/team/invite (send invite email)
  - [ ] PATCH /api/team/:memberId/permissions
  - [ ] DELETE /api/team/:memberId
  - [ ] GET /api/team/:memberId/activity
  - [ ] POST /api/team/transfer-ownership
- [ ] Implement invite flow:
  - [ ] Create invitation record
  - [ ] Send email with link
  - [ ] Link expiry (7 days)
  - [ ] Accept invitation → create account / link existing account
- [ ] Implement permission grant system:
  - [ ] Store permissions as JSON array
  - [ ] Check permission on every API endpoint
  - [ ] Return 403 if permission denied
- [ ] Implement activity logging:
  - [ ] Log every user action
  - [ ] Store action type, timestamp, IP, user agent
  - [ ] Store old values & new values for audit trail
- [ ] Implement login history tracking

### Frontend - Team Management Page

#### Team List Section
- [ ] Display team members table:
  - [ ] Name, email, role
  - [ ] Permissions count
  - [ ] Last active time
  - [ ] Join date
  - [ ] Status (active/inactive)
- [ ] Show owner badge
- [ ] Row actions (edit permissions, remove, activity log)

#### Invite Member Section
- [ ] Invite form:
  - [ ] Email input
  - [ ] Role dropdown (Staff only for now)
  - [ ] Permission checkboxes:
    - [ ] Lihat produk
    - [ ] Edit produk
    - [ ] Lihat order
    - [ ] Proses order
    - [ ] Lihat laporan
    - [ ] Kelola marketplace
    - [ ] Kelola tim
    - [ ] Manage settings
  - [ ] Send invite button
- [ ] Show pending invitations:
  - [ ] Email, send date, expiry date
  - [ ] Resend button
  - [ ] Cancel button

#### Permission Manager Modal
- [ ] Display all available permissions
- [ ] Checkbox for each permission
- [ ] Save changes button
- [ ] Preview affected access
- [ ] Confirmation modal (warn if removing permissions)

#### Activity Log Page
- [ ] Display member activity:
  - [ ] Action type (created product, processed order, etc)
  - [ ] Timestamp
  - [ ] Old value → new value (for edits)
  - [ ] IP address
  - [ ] Device info
- [ ] Filter by action type
- [ ] Export activity log

#### Login History Page
- [ ] Display login sessions:
  - [ ] Login time, logout time
  - [ ] IP address, device, browser
  - [ ] Status (active/expired)
  - [ ] Current session indicator
- [ ] Kick session button

---

## 🟡 PHASE 9: SUBSCRIPTION & BILLING (Week 12-13)

### Backend - Subscription Service
- [ ] Create subscription models:
  - [ ] Subscription plan (Free, Starter, Business, Enterprise)
  - [ ] Invoice
  - [ ] Payment transaction
- [ ] Create subscription repository
- [ ] Implement subscription service:
  - [ ] Create trial subscription for new sellers
  - [ ] Upgrade/downgrade plan
  - [ ] Cancel subscription
  - [ ] Handle plan change proration

#### Payment Gateway Integration
- [ ] Integrate Midtrans:
  - [ ] Initialize payment
  - [ ] Handle payment callback
  - [ ] Verify payment status
  - [ ] Handle failed payments
  - [ ] Refund handling
- [ ] Integrate Xendit (alternative):
  - [ ] Same as Midtrans
- [ ] Create payment gateway service abstraction
- [ ] Create payment handler endpoints:
  - [ ] POST /api/subscription/pay (initiate payment)
  - [ ] POST /api/webhooks/payment-gateway (webhook)
  - [ ] GET /api/subscription/status

#### Auto-Renewal
- [ ] Create billing job:
  - [ ] Daily check for expiring subscriptions
  - [ ] Charge card H-1 before expiry
  - [ ] Handle failed charges (retry daily)
  - [ ] Send notification email H-7, H-3, H-1
  - [ ] Downgrade to Free plan after grace period (3 days)
  - [ ] Suspend account if still unpaid

#### Invoicing
- [ ] Create invoice generation:
  - [ ] POST /api/subscription/invoices (list)
  - [ ] GET /api/subscription/invoices/:invoiceId (detail)
  - [ ] GET /api/subscription/invoices/:invoiceId/download (PDF)
- [ ] Invoice PDF template
- [ ] Email invoice to seller

### Backend - Subscription Admin
- [ ] Create admin endpoints:
  - [ ] GET /api/admin/subscriptions (list all)
  - [ ] PATCH /api/admin/subscriptions/:storeId/plan (change plan)
  - [ ] POST /api/admin/subscriptions/coupon (create coupon)
  - [ ] GET /api/admin/subscriptions/revenue (total platform revenue)
  - [ ] GET /api/admin/subscriptions/churn-rate

### Frontend - Subscription Management Page

#### Current Plan Display
- [ ] Show current plan name & price
- [ ] Show subscription expiry date
- [ ] Show renewal date
- [ ] Show usage metrics:
  - [ ] Marketplace slots used / available
  - [ ] Products count / limit
  - [ ] Staff count / limit
  - [ ] Storage usage / limit
- [ ] Show plan features

#### Plan Selector Modal
- [ ] Display all plans:
  - [ ] Free (Rp 0)
  - [ ] Starter (Rp 99K/month)
  - [ ] Business (Rp 299K/month)
  - [ ] Enterprise (Rp 799K/month)
- [ ] Show features per plan
- [ ] Upgrade/downgrade button
- [ ] Show price difference if mid-cycle change
- [ ] Confirm & pay button

#### Add-ons Section
- [ ] List available add-ons:
  - [ ] Extra marketplace (Rp 50K/month)
  - [ ] Extra storage (Rp 25K/month per 1000 items)
  - [ ] Priority support (Rp 100K/month)
- [ ] Toggle add-ons
- [ ] Show updated total price

#### Payment Method
- [ ] Display payment method on file
- [ ] Change payment method button
- [ ] Add new card / bank account form
- [ ] Delete payment method

#### Invoice History
- [ ] Display invoice list:
  - [ ] Invoice date
  - [ ] Amount
  - [ ] Status (paid, pending, failed)
  - [ ] Download PDF
- [ ] Filter by status, date range
- [ ] Export invoices

#### Billing History
- [ ] Display billing events timeline:
  - [ ] Charge date, amount, status
  - [ ] Plan change
  - [ ] Add-on changes

---

## 🟣 PHASE 10: SETTINGS & NOTIFICATIONS (Week 13-14)

### Backend - Settings Service
- [ ] Create settings endpoints:
  - [ ] GET /api/settings (get all settings)
  - [ ] PATCH /api/settings/profile
  - [ ] PATCH /api/settings/shipping
  - [ ] PATCH /api/settings/notifications
  - [ ] POST /api/settings/courier/connect
  - [ ] DELETE /api/settings/courier/:id
  - [ ] PATCH /api/settings/security/password
  - [ ] PATCH /api/settings/security/2fa
  - [ ] GET /api/settings/security/sessions
  - [ ] POST /api/settings/security/sessions/:id/kill

#### Email & Notification Service
- [ ] Integrate SendGrid
- [ ] Create email templates:
  - [ ] Welcome email
  - [ ] Order notification
  - [ ] Stock alert
  - [ ] Subscription reminder
  - [ ] Password reset
- [ ] Create notification service:
  - [ ] Send email
  - [ ] Log notification
  - [ ] Track delivery status
- [ ] Create in-app notification store (database)
  - [ ] Create notification endpoints:
    - [ ] GET /api/notifications
    - [ ] PATCH /api/notifications/:id/read
    - [ ] DELETE /api/notifications/:id

#### Courier Integration
- [ ] Create courier client packages:
  - [ ] JNE API client
  - [ ] J&T Express API client
  - [ ] SiCepat API client
  - [ ] Anteraja API client
  - [ ] GoSend / GrabExpress (future)
- [ ] Implement connection flow:
  - [ ] Store API credentials (encrypted)
  - [ ] Test connection
  - [ ] Verify account
- [ ] Implement courier services:
  - [ ] Auto-generate resi
  - [ ] Request pickup
  - [ ] Fetch tracking status
  - [ ] Get rate quotes

#### Security Features
- [ ] Implement 2FA (TOTP):
  - [ ] Generate QR code
  - [ ] Verify OTP
  - [ ] Backup codes
- [ ] Implement password reset flow
- [ ] Implement login activity monitoring
- [ ] Implement API key generation for developers (future)

### Frontend - Settings Pages

#### Profile Settings
- [ ] Store profile form:
  - [ ] Store name, logo upload
  - [ ] Description textarea
  - [ ] Category dropdown
  - [ ] Contact email, phone
  - [ ] Save button
- [ ] Personal profile:
  - [ ] Full name, email, phone
  - [ ] Avatar upload
  - [ ] Change password button
  - [ ] 2FA setup button

#### Shipping Settings
- [ ] Warehouse address form:
  - [ ] Street address, city, province, postal code
  - [ ] Contact person
  - [ ] Phone number
  - [ ] Warehouse name (for multiple)
  - [ ] Default warehouse selector
- [ ] Multiple warehouse management:
  - [ ] Add/edit/delete warehouse
  - [ ] Set as default
- [ ] Shipping preferences:
  - [ ] Default packaging type
  - [ ] Estimated packing time
  - [ ] Free shipping threshold

#### Notification Settings
- [ ] Email notification preferences:
  - [ ] ☑ Order received
  - [ ] ☑ Stock low alert
  - [ ] ☑ Token expiry warning
  - [ ] ☐ Weekly report
  - [ ] ☐ Monthly report
- [ ] In-app notification preferences
- [ ] Notification frequency settings
- [ ] Test notification button
- [ ] Email preview

#### Courier Integration
- [ ] List connected couriers:
  - [ ] JNE - Connected (account: XXXX)
  - [ ] J&T - Not Connected - [Connect]
  - [ ] SiCepat - Connected
- [ ] Connect courier modal:
  - [ ] API credentials input
  - [ ] Test connection button
  - [ ] Verify button
- [ ] Courier settings:
  - [ ] Default courier
  - [ ] Preferred rate type (Regular, Express, etc)
- [ ] Auto-pickup configuration

#### Security Page
- [ ] Change password form
- [ ] 2FA setup:
  - [ ] Enable 2FA button
  - [ ] Show QR code
  - [ ] Verify OTP
  - [ ] Show backup codes
  - [ ] Download backup codes
- [ ] Active sessions:
  - [ ] Current session badge
  - [ ] Device info, IP, last active
  - [ ] Logout other sessions button
  - [ ] Logout all other sessions
- [ ] Login history:
  - [ ] List of recent logins
  - [ ] IP address, device, time

#### API Keys (Future)
- [ ] Generate API keys for developers
- [ ] Revoke keys
- [ ] Copy/show key
- [ ] API documentation link

### Backend - Admin Settings
- [ ] Create admin settings endpoints:
  - [ ] GET /api/admin/settings
  - [ ] PATCH /api/admin/settings/general (platform name, logo, etc)
  - [ ] GET /api/admin/settings/api-keys (marketplace API keys)
  - [ ] PATCH /api/admin/settings/commission-rate
  - [ ] GET /api/admin/system-logs

### Frontend - Admin Settings

#### General Settings
- [ ] Platform branding:
  - [ ] Platform name
  - [ ] Logo upload
  - [ ] Favicon upload
  - [ ] Color scheme
- [ ] Contact info:
  - [ ] Email
  - [ ] Phone
  - [ ] Office address
- [ ] Time zone & currency settings

#### API Keys Management
- [ ] Marketplace API credentials:
  - [ ] Shopee API key & secret
  - [ ] Tokopedia API credentials
  - [ ] TikTok API credentials
- [ ] Test connection button
- [ ] Credentials validity check
- [ ] Rate limit info per marketplace

#### Commission Rate Settings
- [ ] Set commission rate per plan
- [ ] Set commission rate per marketplace (if applicable)
- [ ] History of commission changes
- [ ] Effective date

#### System Logs Viewer
- [ ] Admin activity logs:
  - [ ] Admin action (login, settings change, etc)
  - [ ] Timestamp, IP, user agent
  - [ ] Details
- [ ] API error logs:
  - [ ] Error type, message
  - [ ] Endpoint, method
  - [ ] Request/response details
  - [ ] Timestamp
- [ ] System event logs:
  - [ ] Payment processed
  - [ ] Subscription created
  - [ ] Marketplace sync
  - [ ] etc
- [ ] Filter & search
- [ ] Export logs

---

## 🟢 PHASE 11: DASHBOARD & UI POLISH (Week 14-15)

### Backend - Dashboard Aggregation
- [ ] Optimize dashboard queries (add indexes)
- [ ] Add caching for dashboard metrics
- [ ] Create real-time dashboard update mechanism (optional: WebSocket)

### Frontend - Seller Dashboard

#### Main Dashboard Page
- [ ] Today's summary cards:
  - [ ] New orders today
  - [ ] Orders to process
  - [ ] Revenue today
  - [ ] Low stock alerts
- [ ] Sales trend chart (7 days)
- [ ] Marketplace performance widget:
  - [ ] Shopee: XX orders, Rp XX
  - [ ] Tokopedia: XX orders, Rp XX
  - [ ] TikTok: XX orders, Rp XX
- [ ] Top 5 products widget:
  - [ ] Product image, name
  - [ ] Units sold
  - [ ] Revenue
- [ ] Important notifications:
  - [ ] Token expiry warning
  - [ ] Out of stock alerts
  - [ ] SLA violations
  - [ ] Chat unread count
- [ ] Quick action buttons:
  - [ ] Process order
  - [ ] Sync stock
  - [ ] View all orders
- [ ] Responsive grid layout
- [ ] Dark mode support
- [ ] Customizable widgets (drag-drop)

### Frontend - Admin Dashboard

#### Overall Summary
- [ ] Total metrics (big numbers):
  - [ ] Total seller registered
  - [ ] Total orders (all-time)
  - [ ] Platform revenue
  - [ ] Active marketplace connections
- [ ] Growth charts:
  - [ ] Seller growth (line chart)
  - [ ] Order volume (bar chart)
  - [ ] Revenue trend (line chart)
- [ ] Marketplace distribution (pie chart)
- [ ] Top sellers widget
- [ ] System alerts:
  - [ ] API errors
  - [ ] Failed payments
  - [ ] Sync issues
  - [ ] Server status

### Frontend - UI Polish & Responsive Design
- [ ] Test all pages on mobile (375px)
- [ ] Test all pages on tablet (768px)
- [ ] Test all pages on desktop (1920px)
- [ ] Implement mobile hamburger menu
- [ ] Optimize touch targets for mobile
- [ ] Implement lazy loading for images
- [ ] Optimize font sizes for readability
- [ ] Implement dark mode toggle
- [ ] Add loading skeletons
- [ ] Add empty state pages
- [ ] Add error boundary components
- [ ] Implement error recovery UI
- [ ] Add toast notifications
- [ ] Add confirmation dialogs
- [ ] Add tooltip hints

### Frontend - Performance Optimization
- [ ] Code splitting per route
- [ ] Implement image optimization (Cloudinary/Vercel)
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize bundle size
- [ ] Enable compression
- [ ] Implement caching strategies
- [ ] Measure Core Web Vitals
- [ ] Audit accessibility (WCAG)

---

## 🔵 PHASE 12: TESTING & QA (Week 15-16)

### Backend Testing

#### Unit Tests
- [ ] Auth service tests
  - [ ] Login/register flow
  - [ ] JWT generation/validation
  - [ ] Password reset
- [ ] Product service tests
  - [ ] CRUD operations
  - [ ] Stock sync logic
  - [ ] Conflict resolution
- [ ] Order service tests
  - [ ] Order creation
  - [ ] Status transitions
  - [ ] Tracking updates
- [ ] Subscription service tests
  - [ ] Plan upgrade/downgrade
  - [ ] Billing calculations
- [ ] RBAC tests
  - [ ] Permission checks
  - [ ] Role-based access

#### Integration Tests
- [ ] End-to-end auth flow
- [ ] Product sync with marketplace
- [ ] Order webhook integration
- [ ] Payment processing flow
- [ ] Subscription renewal flow
- [ ] Notification sending

#### API Tests
- [ ] Test all endpoints:
  - [ ] Status codes (200, 400, 401, 403, 404, 500)
  - [ ] Response format
  - [ ] Error handling
  - [ ] Validation
- [ ] Test rate limiting
- [ ] Test pagination
- [ ] Test filtering & sorting
- [ ] Test authentication/authorization
- [ ] Test input sanitization

#### Performance Tests
- [ ] Load test (concurrent users)
- [ ] Database query optimization
- [ ] API response time testing
- [ ] Memory usage monitoring
- [ ] Database connection pooling

### Frontend Testing

#### Unit Tests
- [ ] Component tests (with React Testing Library)
  - [ ] Render correctly
  - [ ] User interactions
  - [ ] Props validation
  - [ ] Conditional rendering
- [ ] Hook tests
  - [ ] useAuth
  - [ ] useFetch
  - [ ] useRBAC
  - [ ] Custom hooks

#### Integration Tests
- [ ] Login flow
- [ ] Create product flow
- [ ] Process order flow
- [ ] Connect marketplace flow

#### E2E Tests (Cypress/Playwright)
- [ ] Seller registration → dashboard
- [ ] Create product → view → edit → delete
- [ ] Receive order → process → ship
- [ ] Connect marketplace → sync products
- [ ] Subscribe → payment → successful
- [ ] Admin create seller → view in list

#### Accessibility Tests
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast
- [ ] Form labels & validation messages

#### Browser Compatibility
- [ ] Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### QA Checklist

#### Functional Testing
- [ ] All features work as per spec
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Form validation works
- [ ] Search & filter work correctly
- [ ] Pagination works
- [ ] Sorting works
- [ ] Bulk operations work
- [ ] Export functions work
- [ ] Notifications sent correctly

#### Data Integrity
- [ ] No data loss on error
- [ ] Concurrent operations handled correctly
- [ ] Stock sync doesn't cause conflicts
- [ ] Order processing is atomic
- [ ] Payment transactions recorded correctly

#### Security Testing
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF protection working
- [ ] API endpoints require auth
- [ ] RBAC enforced
- [ ] Sensitive data encrypted
- [ ] Session management working
- [ ] Password reset secure
- [ ] Marketplace tokens encrypted

#### Performance Testing
- [ ] Dashboard loads in < 2s
- [ ] List pages load in < 1s
- [ ] Search results in < 500ms
- [ ] Form submission in < 500ms
- [ ] No memory leaks
- [ ] No N+1 queries

#### Cross-Marketplace Testing
- [ ] Product sync works for Shopee
- [ ] Product sync works for Tokopedia
- [ ] Product sync works for TikTok
- [ ] Order sync works for all platforms
- [ ] Webhook handling works
- [ ] Token refresh works

#### Bug Fixes
- [ ] Document all bugs found
- [ ] Reproduce & fix
- [ ] Re-test after fix
- [ ] No regression

---

## 🚀 PHASE 13: DOCUMENTATION & DEPLOYMENT (Week 16-17)

### Backend Documentation
- [ ] Setup Swagger/OpenAPI docs
- [ ] Document all endpoints:
  - [ ] Request/response schema
  - [ ] Error codes
  - [ ] Authentication requirements
  - [ ] Permission requirements
  - [ ] Example payloads
- [ ] Create developer guide:
  - [ ] Setup local development
  - [ ] Running tests
  - [ ] Database migrations
  - [ ] Environment variables
- [ ] Create deployment guide:
  - [ ] Docker setup
  - [ ] Environment variables
  - [ ] Database setup
  - [ ] Redis setup
  - [ ] SSL/TLS setup
  - [ ] Reverse proxy config
  - [ ] Monitoring setup
- [ ] Create API design document:
  - [ ] Architecture decisions
  - [ ] Database design
  - [ ] Service layer design
  - [ ] Error handling strategy
  - [ ] Security considerations

### Frontend Documentation
- [ ] Create component storybook (optional)
- [ ] Document:
  - [ ] Project structure
  - [ ] Component hierarchy
  - [ ] State management
  - [ ] Routing
  - [ ] API integration
- [ ] Create user guide:
  - [ ] Admin features
  - [ ] Seller features
  - [ ] Screenshots
  - [ ] Video tutorials
- [ ] Create developer guide:
  - [ ] Setup local development
  - [ ] Running tests
  - [ ] Building for production
  - [ ] Environment variables
  - [ ] Deployment guide

### Deployment Infrastructure

#### Backend Deployment
- [ ] Choose hosting (AWS EC2, DigitalOcean, Fly.io)
- [ ] Setup production database:
  - [ ] AWS RDS PostgreSQL or managed PostgreSQL
  - [ ] Setup backups (daily)
  - [ ] Setup read replicas (for HA)
- [ ] Setup production cache (Redis):
  - [ ] AWS ElastiCache or Redis Cloud
  - [ ] Configure replication
- [ ] Setup production file storage (S3 bucket)
- [ ] Setup API monitoring:
  - [ ] Sentry for error tracking
  - [ ] New Relic / Datadog for APM
  - [ ] CloudWatch logs
- [ ] Setup email service (SendGrid)
- [ ] Setup payment gateway (Midtrans/Xendit production accounts)
- [ ] Setup Docker image:
  - [ ] Create Dockerfile
  - [ ] Push to Docker registry (DockerHub, ECR)
- [ ] Setup CI/CD:
  - [ ] GitHub Actions workflow
  - [ ] Build docker image
  - [ ] Push to registry
  - [ ] Deploy to server
  - [ ] Health checks
  - [ ] Rollback mechanism
- [ ] Setup domain & SSL:
  - [ ] Register domain
  - [ ] Setup DNS
  - [ ] SSL certificate (Let's Encrypt)
  - [ ] Setup CDN (CloudFlare)
- [ ] Setup monitoring & alerting:
  - [ ] Server monitoring
  - [ ] Database monitoring
  - [ ] API monitoring
  - [ ] Alert rules (email, Slack)

#### Frontend Deployment
- [ ] Choose hosting (Vercel, Netlify)
- [ ] Setup domain pointing to frontend
- [ ] Setup environment variables for production API
- [ ] Setup CI/CD:
  - [ ] Push to GitHub
  - [ ] Trigger build automatically
  - [ ] Run tests
  - [ ] Build production bundle
  - [ ] Deploy to CDN
- [ ] Setup analytics (Google Analytics, Vercel Analytics)
- [ ] Setup error tracking (Sentry)
- [ ] Setup performance monitoring
- [ ] Setup invalidation cache strategy

#### Database Setup
- [ ] Run migrations on production
- [ ] Create indexes for performance:
  - [ ] On user_id, store_id, created_at
  - [ ] On product/order search fields
  - [ ] On status fields
- [ ] Setup automated backups
- [ ] Setup point-in-time recovery
- [ ] Test backup restoration

#### Security Hardening
- [ ] SSL/TLS on all endpoints
- [ ] HTTPS only policy
- [ ] Security headers (CORS, CSP, etc)
- [ ] Rate limiting on APIs
- [ ] API key rotation
- [ ] Database credential rotation
- [ ] Firewall rules (IP whitelist)
- [ ] DDoS protection (CloudFlare)
- [ ] WAF rules (Web Application Firewall)
- [ ] Regular security audit

---

## 🟢 PHASE 14: SOFT LAUNCH & BETA (Week 17-18)

### Preparation
- [ ] Create landing page
- [ ] Create pricing page
- [ ] Create features page
- [ ] Create FAQ page
- [ ] Create blog/documentation site
- [ ] Create social media accounts
- [ ] Create email list for early access

### Soft Launch (Invite-Only Beta)
- [ ] Invite first batch of testers (small business owners)
- [ ] Gather feedback
- [ ] Monitor for critical issues
- [ ] Fix bugs based on feedback
- [ ] Iterate on UX
- [ ] Optimize performance based on real usage

### Beta Testing Activities
- [ ] Run feedback sessions with sellers
- [ ] Conduct usability testing
- [ ] Stress test with real marketplace APIs
- [ ] Test all edge cases
- [ ] Test error scenarios
- [ ] Verify all notifications work
- [ ] Test payment processing
- [ ] Verify email delivery

### Fixes & Improvements Based on Beta
- [ ] Critical bugs (blocks core functionality)
- [ ] Important bugs (affects usability)
- [ ] Nice-to-have improvements
- [ ] Performance optimizations
- [ ] UI/UX improvements

---

## 📊 COMPLETE API ENDPOINT CHECKLIST

### Authentication (8 endpoints)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
PATCH  /api/auth/change-password
```

### Stores (5 endpoints)
```
POST   /api/stores
GET    /api/stores
GET    /api/stores/:storeId
PATCH  /api/stores/:storeId
DELETE /api/stores/:storeId
```

### Products (10 endpoints)
```
POST   /api/products
GET    /api/products
GET    /api/products/:productId
PATCH  /api/products/:productId
DELETE /api/products/:productId
POST   /api/products/bulk-update
POST   /api/products/:productId/publish
POST   /api/products/:productId/unpublish
POST   /api/products/sync-stock
GET    /api/products/issues
```

### Orders (11 endpoints)
```
GET    /api/orders
GET    /api/orders/:orderId
PATCH  /api/orders/:orderId/status
POST   /api/orders/:orderId/ship
POST   /api/orders/bulk-ship
GET    /api/orders/needs-processing
POST   /api/orders/:orderId/cancel
POST   /api/orders/:orderId/return
POST   /api/orders/export
GET    /api/orders/:orderId/tracking
```

### Marketplace (12 endpoints)
```
GET    /api/marketplace
POST   /api/marketplace/:platform/connect
POST   /api/marketplace/:platform/disconnect
POST   /api/marketplace/:platform/reconnect
GET    /api/marketplace/:platform/status
POST   /api/marketplace/:platform/sync
GET    /api/marketplace/:platform/sync-log
PATCH  /api/marketplace/:platform/settings
GET    /api/marketplace/:platform/shop-info
POST   /webhooks/shopee
POST   /webhooks/tokopedia
POST   /webhooks/tiktok
```

### Team (6 endpoints)
```
GET    /api/team
POST   /api/team/invite
PATCH  /api/team/:memberId/permissions
DELETE /api/team/:memberId
GET    /api/team/:memberId/activity
POST   /api/team/transfer-ownership
```

### Subscription (8 endpoints)
```
GET    /api/subscription
POST   /api/subscription/upgrade
POST   /api/subscription/downgrade
POST   /api/subscription/cancel
GET    /api/subscription/invoices
GET    /api/subscription/invoices/:invoiceId
POST   /api/subscription/pay
POST   /webhooks/payment-gateway
```

### Reports (5 endpoints)
```
GET    /api/reports/sales
GET    /api/reports/products
GET    /api/reports/marketplace
GET    /api/reports/finance
POST   /api/reports/export
```

### Settings (11 endpoints)
```
GET    /api/settings
PATCH  /api/settings/profile
PATCH  /api/settings/shipping
PATCH  /api/settings/notifications
POST   /api/settings/courier/connect
DELETE /api/settings/courier/:id
PATCH  /api/settings/security/password
PATCH  /api/settings/security/2fa
GET    /api/settings/security/sessions
POST   /api/settings/security/sessions/:id/kill
GET    /api/notifications
```

### Admin (15 endpoints)
```
GET    /api/admin/dashboard/summary
GET    /api/admin/sellers
GET    /api/admin/sellers/:sellerId
PATCH  /api/admin/sellers/:sellerId/status
PATCH  /api/admin/sellers/:sellerId/plan
DELETE /api/admin/sellers/:sellerId
GET    /api/admin/users
GET    /api/admin/subscriptions
GET    /api/admin/subscriptions/revenue
PATCH  /api/admin/settings
GET    /api/admin/settings/api-keys
PATCH  /api/admin/settings/commission-rate
GET    /api/admin/system-logs
GET    /api/admin/activity-logs
```

**Total Endpoints: ~96 API endpoints**

---

## 💻 DEVELOPMENT TEAM ALLOCATION

Assuming 2-3 person team:

**Developer 1 (Backend Lead):**
- Setup project structure & database
- Auth & RBAC implementation
- Product service & sync engine
- Marketplace integrations (lead)
- Backend testing

**Developer 2 (Frontend Lead):**
- React setup & component library
- Layout & sidebar implementation
- Dashboard & main pages
- Forms & modals
- Frontend testing

**Developer 3 (Full Stack / Flexible):**
- Order service & processing
- Subscription & billing
- Reports & analytics
- Settings & notifications
- DevOps & deployment
- Integration testing

---

## 📅 PROJECT TIMELINE ESTIMATE

```
Phase 1:  Week 1-2   (2 weeks)  — Foundation
Phase 2:  Week 2-3   (2 weeks)  — Auth & RBAC
Phase 3:  Week 3-4   (2 weeks)  — Store & Admin Setup
Phase 4:  Week 4-6   (2 weeks)  — Marketplace Integration (critical path)
Phase 5:  Week 6-8   (2 weeks)  — Product Management
Phase 6:  Week 8-10  (2 weeks)  — Order Management
Phase 7:  Week 10-11 (1 week)   — Reports
Phase 8:  Week 11-12 (1 week)   — Team & RBAC
Phase 9:  Week 12-13 (1 week)   — Subscription
Phase 10: Week 13-14 (1 week)   — Settings & Notifications
Phase 11: Week 14-15 (1 week)   — Dashboard Polish
Phase 12: Week 15-16 (1 week)   — Testing & QA
Phase 13: Week 16-17 (1 week)   — Deployment
Phase 14: Week 17-18 (1 week)   — Beta & Launch

**TOTAL: ~18 weeks (4.5 months) for 1-2 developer, 12 weeks (3 months) for 3 developers**
```

---

## 🎯 LAUNCH CHECKLIST (Final Week)

- [ ] All tests passing
- [ ] Production environment ready
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Incident response plan ready
- [ ] Status page setup
- [ ] Support email configured
- [ ] Announcement drafted
- [ ] Landing page live
- [ ] Email list ready
- [ ] Social media posts ready
- [ ] Beta user feedback compiled
- [ ] All known bugs documented/fixed
- [ ] Performance acceptable
- [ ] Security audit completed
- [ ] Data backup tested
- [ ] Rollback plan documented
- [ ] Launch go/no-go meeting

---

*Dokumen revisi ini dibuat untuk panduan development SyncCart dengan tech stack Go + React.*
*Versi: 2.0 | Tanggal: Januari 2025 | Prepared by: PM Berpengalaman*