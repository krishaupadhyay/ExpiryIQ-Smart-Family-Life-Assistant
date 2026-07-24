# ExpiryIQ-Smart-Family-Life-Assistant
5th sem group Project
# ExpiryIQ 🏠✨
### AI-Powered Smart Family Life Assistant

ExpiryIQ is a unified, AI-driven web application that helps Indian families track, predict, and stay on top of every recurring household responsibility — medicines, documents, groceries, bills, insurance, appliances, and family events — from a single intelligent dashboard.

Instead of juggling multiple apps, sticky notes, and WhatsApp reminders, ExpiryIQ brings everything a family needs to keep track of into one place, using OCR to auto-extract expiry dates from scanned documents and predictive logic to remind users before deadlines are missed.

---

## 📌 Problem Statement

Families manage dozens of recurring, time-sensitive responsibilities every day — medicine schedules, document renewals, LPG bookings, insurance premiums, utility bills, and festival planning — scattered across physical files, reminder apps, and memory. This fragmentation leads to expired documents, lapsed insurance, missed medicine doses, and forgotten bills.

**ExpiryIQ solves this** by consolidating every household "expiry" or "due date" into one intelligent, shared, AI-powered platform.

---

## 🧩 Core Modules

| Module | Description |
|---|---|
| **MediTrack** | Tracks medicines, dosage timing, and refill stock with caregiver alerts for elderly family members |
| **PantryIQ** | Tracks groceries, perishables, and staples with expiry and reorder alerts |
| **DocuVault** | OCR-based tracker for Aadhaar, PAN, Passport, DL, Voter ID, RC, PUC, and insurance documents |
| **PolicyWatch** | Tracks insurance premium due dates and grace periods |
| **UtilityDesk** | Manages utility bills, LPG cylinder booking, and society maintenance reminders |
| **HomeCare** | Tracks appliance warranty/service schedules and domestic help attendance & salary |
| **FamilyPulse** | Unified family calendar aggregating due dates, tasks, and events from every module |
| **AI Assistant** | Proactive recommendations, predictive alerts, and natural-language household insights |
| **Dashboard** | Consolidated overview of daily activities, reminders, and AI-generated insights |

---

## 🚀 Tech Stack

**Frontend**
- React.js + Vite
- TypeScript
- Tailwind CSS
- Recharts (data visualization)

**Backend**
- Node.js
- Express.js (REST API)

**Database**
- MySQL (structured data)
- File storage for scanned documents/images (referenced via file path/URL)

**AI / OCR**
- Python microservice for OCR extraction and predictive/recommendation logic

---

## 🏗️ System Architecture

```
┌─────────────────────┐
│   Presentation Layer │  React.js + Vite + TypeScript + Tailwind + Recharts
└──────────┬───────────┘
           │ REST API (HTTPS)
┌──────────▼───────────┐
│  Application Layer    │  Node.js + Express.js
└──────────┬───────────┘
           │
   ┌───────┴────────┐
┌──▼───┐        ┌────▼─────┐
│ MySQL │        │ AI/OCR   │  Python microservice
│  DB   │        │ Service  │  (extraction + predictions)
└───────┘        └──────────┘
           │
┌──────────▼───────────┐
│  Notification Layer   │  Scheduled jobs → Email / SMS / Push
└───────────────────────┘
```

---

## 📂 Project Structure

```
ExpiryIQ/
├── client/                 # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── modules/        # MediTrack, PantryIQ, DocuVault, etc.
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
├── server/                 # Node.js + Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── package.json
├── ocr-service/            # Python OCR/AI microservice
│   ├── app.py
│   └── requirements.txt
├── database/                # MySQL schema & migrations
│   └── schema.sql
├── docs/                    # SRS, ER diagrams, reports
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- Python (v3.9+)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/ExpiryIQ.git
cd ExpiryIQ
```

### 2. Setup the backend
```bash
cd server
npm install
cp .env.example .env   # add your MySQL credentials
npm run dev
```

### 3. Setup the frontend
```bash
cd client
npm install
npm run dev
```

### 4. Setup the OCR/AI microservice
```bash
cd ocr-service
pip install -r requirements.txt
python app.py
```

### 5. Setup the database
```bash
mysql -u root -p < database/schema.sql
```

---

## 🎯 Key Features

- 📸 **OCR-based document scanning** — auto-extracts expiry dates from photographed/scanned documents and bills
- 🔔 **Smart, escalating reminders** across medicines, documents, bills, and insurance
- 🤖 **AI-driven predictions** — medicine refill forecasting, consumption-based reorder alerts
- 👨‍👩‍👧‍👦 **Multi-user family accounts** with role-based access (Admin, Adult, Elderly, Child)
- 📅 **Unified family calendar** consolidating every due date in one place
- 📊 **Interactive dashboard** with charts and daily/weekly insights

---

## 📄 Documentation

- [Software Requirements Specification (SRS)](./docs/ExpiryIQ_SRS.docx)

---

## 🛣️ Future Enhancements

- Voice-based interaction with the AI Assistant
- Wearable device integration for medication adherence
- Multi-language support for regional Indian languages
- Native mobile apps (iOS/Android)

---

## 👥 Team

| Name | Role |

| Prachi Rana | Frontend /AI-ML dev |
| Krisha Upadhyay | Backend Dev|
---

## 📜 License

This project is developed for academic purposes as part of a semester project.
