# Web Invoice Penjualan (React)

Frontend aplikasi pencatatan invoice penjualan. React + Vite (JavaScript), Bootstrap 5.3, Bootstrap Icons,
React Router, TanStack Query, axios, react-hook-form + zod.

## Prasyarat

- Node.js LTS (20.19+ atau 22.12+) dan npm
- Backend Go berjalan di `http://localhost:8080` (lihat `../project-api-invoice-penjualan-papa-golang`)

## Perintah

```bash
npm install        # pasang dependensi (sekali)
npm run dev        # server development di http://localhost:5173
npm run build      # build production ke folder dist/
npm run preview    # coba hasil build secara lokal
npm test           # unit test (vitest)
npm run lint       # eslint
```

## Proxy Vite & konfigurasi API

Saat `npm run dev`, semua request ke `/api/...` diteruskan Vite ke `http://localhost:8080` (lihat `vite.config.js`).
Browser hanya melihat satu origin (`localhost:5173`), sehingga cookie session `httpOnly` bekerja tanpa pengaturan CORS tambahan.

`VITE_API_BASE_URL` (lihat `.env.example`) default-nya `/api`. Biarkan `/api` jika frontend dan backend disajikan
dari domain yang sama (disarankan, termasuk di production).

## Struktur

```
src/
├── main.jsx            import Bootstrap CSS/JS, Bootstrap Icons, CSS kustom
├── App.jsx             QueryClientProvider, ToastProvider, AuthProvider, router
├── styles/app.css      gaya tambahan & aturan responsive
├── api/                axios client (+ interceptor 401) dan fungsi per endpoint
├── auth/               AuthProvider, useAuth, ProtectedRoute
├── components/         Navbar, StatCard, filter periode, pagination, modal hapus, toast, dll.
├── pages/              Login, Home (dashboard), Daftar Invoice, Form Invoice, 404
├── hooks/              React Query hooks, useListParams (state list di URL), useDebounce
└── utils/              format Rupiah/tanggal, parse nominal, skema zod, helper Bootstrap
```

Catatan:

- Data user login ada di React Context; token session **tidak pernah** disentuh JavaScript (cookie `httpOnly`).
- Semua filter daftar invoice (`page, limit, start_date, end_date, store_id, search, sort_by, sort_order`)
  disimpan di URL, jadi bisa di-bookmark / dibagikan / memakai tombol Back.
- Pesan validasi form sama persis dengan backend (`src/utils/invoiceSchema.js`).
- Tanggal `sale_date` diformat tanpa pergeseran hari, apa pun zona waktu komputer.
