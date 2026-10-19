import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Semua request /api diteruskan ke backend Go, sehingga browser melihat satu origin
// (cookie session tetap first-party dan tidak perlu CORS).
// Target memakai 127.0.0.1 (bukan "localhost") karena backend hanya listen di IPv4 127.0.0.1,
// sedangkan Node.js bisa me-resolve "localhost" ke IPv6 ::1.
const apiProxy = {
  '/api': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: false,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: apiProxy,
  },
  // `npm run preview` menyajikan hasil build (dist/) — dipakai untuk akses dari HP lewat Tailscale.
  preview: {
    port: 4173,
    strictPort: true,
    // Hanya listen di komputer ini; akses dari luar lewat `tailscale serve` (HTTPS, hanya perangkat Anda).
    host: '127.0.0.1',
    proxy: apiProxy,
    // Izinkan alamat Tailscale (nama-komputer.nama-tailnet.ts.net). Host lain tetap ditolak Vite.
    allowedHosts: ['.ts.net'],
  },
  build: {
    rolldownOptions: {
      output: {
        // Pisahkan library pihak ketiga agar cache browser bertahan antar rilis aplikasi.
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'bootstrap', test: /node_modules[\\/](bootstrap|@popperjs)[\\/]/ },
            { name: 'vendor', test: /node_modules[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node', // test komponen/hook memakai komentar @vitest-environment jsdom
    include: ['src/**/*.test.{js,jsx}'],
  },
})
