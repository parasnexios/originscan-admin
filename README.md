# originscan-admin

Central Management Control Portal for **OriginScan** built with React, Vite, and Ant Design 5.

## Features
- **Dashboard**: Real-time KPI statistics and 7-day scanning trend visualization with Recharts
- **Manufacturers**: Management of production units, 3-character unit codes, FSSAI licence numbers, and active status
- **Branches & Distribution**: Regional hubs tracking across states
- **Products (SKUs)**: Product master, SKU codes, categories, auto slug generation
- **Batches**: Batch production tracker with status lifecycle (`Active`, `Recalled`, `Blocked`) and bulk CSV import
- **QR Code Generator**: Instant batch-level QR generation, live preview, and vector SVG / high-resolution PNG downloads
- **Display Settings**: Brand configuration and live consumer mobile verification screen preview
- **Scan Logs & Audit**: Geographic verification logs with CSV export and administrative activity tracking
- **RBAC**: Multi-role permission matrix and user management

## Getting Started

```bash
npm install
npm run dev
```

Runs by default on `http://localhost:5174`.
