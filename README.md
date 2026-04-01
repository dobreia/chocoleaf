# ChocoLeaf

🌐 Live version: https://chocoleaf.hu

---

## 🇭🇺 Magyar / 🇬🇧 English

- [🇭🇺 Magyar leírás](#-magyar-leírás)
- [🇬🇧 English documentation](#-english-documentation)

---

# 🇭🇺 Magyar leírás

A ChocoLeaf egy Node.js és Express alapú webalkalmazás, amely kézműves workshopok és kapcsolódó szolgáltatások webes kezelésére készült.

A rendszer statikus weboldalakat szolgál ki, valamint API végpontokat biztosít foglalások, fizetések és ajándékutalványok kezelésére.

## Fő funkciók

- statikus weboldal kiszolgálása Express szerverrel
- workshopok és képzések listázása
- galéria API képek betöltéséhez
- Barion fizetési integráció
- Cal.com foglaláskezelés (megerősítés, törlés)
- ajándékutalvány vásárlás
- PDF utalvány generálás
- e-mail küldés (foglalás és utalvány esetén)
- jogi oldalak (impresszum, cookie tájékoztató)

## Projekt struktúra

- `server.js` – alkalmazás belépési pontja  
- `routes/` – API route-ok  
- `lib/` – külső integrációk és segédfüggvények  
- `data/` – workshop és egyéb adatok  
- `public/` – statikus HTML, CSS, JS és asset fájlok  

## Használt technológiák

- Node.js
- Express
- PostgreSQL (külső rendszerekkel együtt használva)
- dotenv
- node-fetch
- Nodemailer
- pdf-lib
- fontkit
- sharp
- Barion API
- Cal.com API

## Futtatás lokálisan

### 1. Függőségek telepítése

```bash
npm install
```

### 2. .env fájl létrehozása

```env
PORT=3000
PUBLIC_URL=http://localhost:3000

BARION_API=https://api.test.barion.com
BARION_POSKEY=your_barion_poskey
BARION_PAYEE_EMAIL=your_barion_payee_email
BARION_MERCHANT=your_merchant_email

CAL_API_URL=https://api.cal.com/v2
CAL_API_KEY=your_cal_api_key
CAL_API_VERSION=2024-08-13
CAL_WEBHOOK_SECRET=your_cal_webhook_secret

MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
MAIL_FROM=your_mail_from

COURSES_PATH=./data/courses.json
```

### 3. Alkalmazás indítása

```bash
npm start
```

### 4. Elérhetőség

```
http://localhost:3000
```

## Fontos végpontok

- `GET /health` – rendszer állapot ellenőrzés  
- `GET /api/courses` – kurzusok listája  
- `GET /api/gallery` – galéria képek listája  

- `POST /api/barion/start` – fizetés indítása  
- `POST /api/barion/ipn` – Barion callback  

- `POST /api/cal/:uid/confirm` – foglalás megerősítése  
- `POST /api/cal/:uid/cancel` – foglalás törlése  

- `POST /api/giftcard/start-payment` – utalvány fizetés indítása  
- `GET /api/giftcard/status` – fizetés státusz lekérdezés  
- `POST /api/giftcard/generate` – PDF utalvány generálás és e-mail küldés  

---

# 🇬🇧 English documentation

ChocoLeaf is a Node.js and Express-based web application designed to manage handmade workshops and related services.

The system serves static web pages and provides API endpoints for handling bookings, payments, and gift vouchers.

## Main features

- serving static website via Express server
- listing workshops and courses
- gallery API for loading images
- Barion payment integration
- Cal.com booking management (confirm, cancel)
- gift voucher purchasing
- PDF voucher generation
- email sending (for bookings and vouchers)
- legal pages (imprint, cookie policy)

## Project structure

- `server.js` – application entry point  
- `routes/` – API routes  
- `lib/` – integrations and helper functions  
- `data/` – workshop and other data  
- `public/` – static HTML, CSS, JS and assets  

## Technologies used

- Node.js
- Express
- PostgreSQL (used alongside external services)
- dotenv
- node-fetch
- Nodemailer
- pdf-lib
- fontkit
- sharp
- Barion API
- Cal.com API

## Running locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create a .env file

```env
PORT=3000
PUBLIC_URL=http://localhost:3000

BARION_API=https://api.test.barion.com
BARION_POSKEY=your_barion_poskey
BARION_PAYEE_EMAIL=your_barion_payee_email
BARION_MERCHANT=your_merchant_email

CAL_API_URL=https://api.cal.com/v2
CAL_API_KEY=your_cal_api_key
CAL_API_VERSION=2024-08-13
CAL_WEBHOOK_SECRET=your_cal_webhook_secret

MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
MAIL_FROM=your_mail_from

COURSES_PATH=./data/courses.json
```

### 3. Start the application

```bash
npm start
```

### 4. Access

```
http://localhost:3000
```

## Important endpoints

- `GET /health` – health check  
- `GET /api/courses` – list courses  
- `GET /api/gallery` – list gallery images  

- `POST /api/barion/start` – start payment  
- `POST /api/barion/ipn` – Barion callback  

- `POST /api/cal/:uid/confirm` – confirm booking  
- `POST /api/cal/:uid/cancel` – cancel booking  

- `POST /api/giftcard/start-payment` – start gift card payment  
- `GET /api/giftcard/status` – check payment status  
- `POST /api/giftcard/generate` – generate PDF voucher and send email  
