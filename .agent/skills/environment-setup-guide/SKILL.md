---
name: environment-setup-guide
description: Projenin ilk kurulumu (Initial Setup) için adım adım rehber. Backend, frontend, database ve local AI yapılandırması.
---

# Proje Kurulum Rehberi (Quick Start)

## 1. Klasör Yapısı Oluşturma
```powershell
mkdir stockpilot-ai
cd stockpilot-ai
mkdir stockpilot-backend
mkdir stockpilot-frontend
```

## 2. Backend Kurulumu
```powershell
cd stockpilot-backend
npm init -y
npm install express pg dotenv axios zod cors helmet morgan firebase-admin
npm install -D typescript @types/express @types/pg @types/node @types/cors ts-node-dev
npx tsc --init
```

**backend/.env**
```env
PORT=3001
DATABASE_URL=postgres://user:pass@localhost:5432/stockpilot
GEMMA_BASE_URL=http://localhost:11434
DEMO_MODE=true
# FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-key.json
```

## 3. Frontend Kurulumu
```powershell
cd ../stockpilot-frontend
npm create vite@latest . -- --template react-ts
npm install axios zustand lucide-react recharts react-router-dom firebase clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
```

## 4. PostgreSQL Hazırlık
PostgreSQL'de `stockpilot` adında bir veritabanı oluştur ve `postgresql-patterns` skill'indeki SQL şemasını çalıştır.

## 5. Local AI (Gemma 3 4B)
```powershell
ollama run gemma3:4b
```
Modelin çalıştığını test etmek için: `http://localhost:11434/api/tags`

## 6. Projeyi Başlatma

**Backend (package.json scripts):**
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "seed": "ts-node src/db/seed.ts"
}
```

**Frontend (package.json scripts):**
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

## 7. İlk Test Adımları
1. Backend ve Frontend sunucularını başlat.
2. Tarayıcıda `http://localhost:5173` adresine git.
3. Eğer Login ekranı gelirse "Demo Admin" butonuyla geç.
4. "Demo Veri Yükle" (Seed) butonuna basarak veritabanını doldur.
5. Dashboard'un dolduğunu doğrula.
