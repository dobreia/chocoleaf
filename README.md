# ChocoLeaf

🌐 Élő verzió: https://chocoleaf.hu

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

server.js – alkalmazás belépési pontja  
routes/ – API route-ok  
lib/ – külső integrációk és segédfüggvények  
data/ – workshop és egyéb adatok  
public/ – statikus HTML, CSS, JS és asset fájlok  

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

1. Függőségek telepítése

npm install

2. Hozz létre egy .env fájlt a következő változókkal

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

3. Alkalmazás indítása

npm start

4. Elérhetőség

http://localhost:3000

## Fontos végpontok

GET /health – rendszer állapot ellenőrzés  
GET /api/courses – kurzusok listája  
GET /api/gallery – galéria képek listája  

POST /api/barion/start – fizetés indítása  
POST /api/barion/ipn – Barion callback  

POST /api/cal/:uid/confirm – foglalás megerősítése  
POST /api/cal/:uid/cancel – foglalás törlése  

POST /api/giftcard/start-payment – utalvány fizetés indítása  
GET /api/giftcard/status – fizetés státusz lekérdezés  
POST /api/giftcard/generate – PDF utalvány generálás és e-mail küldés  


## Dokumentáció

A részletes dokumentáció külön fájlban érhető el.
