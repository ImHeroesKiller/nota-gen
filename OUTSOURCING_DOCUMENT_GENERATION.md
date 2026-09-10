# Outsourcing Document Generation Tools
## PERADA Tools - Document Generation untuk Outsourcing Company

---

## 📋 Overview

Suite baru **Outsourcing Document Generation** telah ditambahkan ke PERADA Tools untuk mendukung operasional outsourcing company. Suite ini terdiri dari 3 tools utama yang saling terintegrasi melalui database.

---

## 🎯 Tools yang Ditambahkan

### 1. SLA Document Generator 📋
**ID:** `sla-document-generator`  
**Module:** Service Agreements  
**Database Table:** `sla_documents`

**Fitur:**
- Generate dokumen Service Level Agreement (SLA)
- Input data klien dan layanan
- Setting SLA metrics (response time, resolution time, availability)
- Klausul penalti
- Generate PDF profesional
- Terintegrasi dengan database

**Database Schema:**
```sql
CREATE TABLE sla_documents (
    id SERIAL PRIMARY KEY,
    sla_number VARCHAR(100) NOT NULL UNIQUE,
    client_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    service_description TEXT NOT NULL,
    service_period_start DATE NOT NULL,
    service_period_end DATE NOT NULL,
    response_time INTEGER,
    resolution_time INTEGER,
    availability_percentage DECIMAL(5, 2),
    penalty_clause TEXT,
    penalty_amount DECIMAL(15, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    signed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. Work Order Generator 📝
**ID:** `work-order-generator`  
**Module:** Service Agreements  
**Database Table:** `work_orders`

**Fitur:**
- Generate work order untuk klien
- Input detail pekerjaan
- Kebutuhan sumber daya (manpower, skills)
- Timeline dan estimasi jam kerja
- Perhitungan biaya
- Generate PDF profesional
- Terintegrasi dengan database

**Database Schema:**
```sql
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    wo_number VARCHAR(100) NOT NULL UNIQUE,
    client_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    wo_date DATE NOT NULL,
    work_title VARCHAR(255) NOT NULL,
    work_description TEXT NOT NULL,
    work_type VARCHAR(100),
    required_manpower INTEGER DEFAULT 1,
    required_skills TEXT,
    start_date DATE,
    end_date DATE,
    estimated_hours INTEGER,
    hourly_rate DECIMAL(15, 2),
    total_cost DECIMAL(15, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approved_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3. Client Proposal Generator 💼
**ID:** `client-proposal-generator`  
**Module:** Client Proposals  
**Database Table:** `client_proposals`

**Fitur:**
- Generate proposal outsourcing untuk klien
- Input detail proposal
- Breakdown biaya (manpower, operational, management fee)
- Perhitungan total biaya
- Generate PDF profesional
- Terintegrasi dengan database

**Database Schema:**
```sql
CREATE TABLE client_proposals (
    id SERIAL PRIMARY KEY,
    proposal_number VARCHAR(100) NOT NULL UNIQUE,
    client_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    proposal_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    proposal_title VARCHAR(255) NOT NULL,
    proposal_description TEXT NOT NULL,
    service_type VARCHAR(100),
    total_manpower INTEGER DEFAULT 1,
    manpower_cost DECIMAL(15, 2) DEFAULT 0,
    operational_cost DECIMAL(15, 2) DEFAULT 0,
    management_fee DECIMAL(15, 2) DEFAULT 0,
    total_cost DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    sent_date DATE,
    negotiated_date DATE,
    accepted_date DATE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔗 Integrasi Database

### Workflow Connections

```
SLA Document Generator
    ↓
Work Order Generator
    ↓
Client Proposal Generator
```

**Penjelasan:**
1. **SLA Document** dibuat terlebih dahulu untuk mendefinisikan service level agreement dengan klien
2. **Work Order** dibuat berdasarkan SLA yang sudah ada untuk mendefinisikan pekerjaan spesifik
3. **Client Proposal** dibuat untuk mengajukan proposal outsourcing ke klien baru

### Database Relationships

```
sla_documents
    ↓ (client_id)
client_proposals
    ↓ (client_id)
work_orders
```

**Foreign Keys:**
- `sla_documents.client_id` → clients.id
- `work_orders.client_id` → clients.id
- `client_proposals.client_id` → clients.id

---

## 📊 Database Triggers

### Trigger 1: Auto-update Proposal Status
```sql
CREATE TRIGGER trg_update_proposal_on_accept
BEFORE UPDATE ON client_proposals
FOR EACH ROW
EXECUTE FUNCTION fn_update_proposal_on_accept();
```

**Fungsi:**
- Auto-update `accepted_date` ketika status berubah menjadi 'accepted'

### Trigger 2: Auto-update Work Order Status
```sql
CREATE TRIGGER trg_update_wo_status
BEFORE UPDATE ON work_orders
FOR EACH ROW
EXECUTE FUNCTION fn_update_wo_status();
```

**Fungsi:**
- Auto-update `approved_date` ketika status berubah menjadi 'approved'
- Auto-update `completed_date` ketika status berubah menjadi 'completed'

---

## 🎨 UI Components

### SLA Document Generator
- Form input SLA
- Tabel daftar SLA
- Generate PDF button
- Status badge (draft, sent, accepted, active, expired, terminated)

### Work Order Generator
- Form input work order
- Tabel daftar work order
- Generate PDF button
- Status badge (pending, approved, in_progress, completed, cancelled)

### Client Proposal Generator
- Form input proposal
- Tabel daftar proposal
- Generate PDF button
- Status badge (draft, sent, negotiated, accepted, rejected, expired)

---

## 📝 Sample Data

### SLA Documents
```sql
INSERT INTO sla_documents (sla_number, client_name, service_type, service_description, service_period_start, service_period_end, response_time, resolution_time, availability_percentage, status)
VALUES 
    ('SLA-2026-001', 'PT ABC Manufacturing', 'Security Services', 'Penyediaan jasa security untuk pabrik', '2026-01-01', '2026-12-31', 15, 24, 99.50, 'active'),
    ('SLA-2026-002', 'PT XYZ Tower', 'Cleaning Services', 'Penyediaan jasa cleaning service untuk gedung perkantoran', '2026-01-01', '2026-12-31', 30, 48, 99.00, 'active');
```

### Work Orders
```sql
INSERT INTO work_orders (wo_number, client_name, wo_date, work_title, work_description, work_type, required_manpower, start_date, end_date, estimated_hours, hourly_rate, total_cost, status)
VALUES 
    ('WO-2026-001', 'PT ABC Manufacturing', '2026-01-05', 'Event Security', 'Penyediaan security untuk event perusahaan', 'event', 10, '2026-01-15', '2026-01-15', 80, 25000, 2000000, 'approved'),
    ('WO-2026-002', 'PT XYZ Tower', '2026-01-08', 'Deep Cleaning', 'Deep cleaning untuk seluruh lantai', 'cleaning', 5, '2026-01-20', '2026-01-22', 120, 20000, 2400000, 'pending');
```

### Client Proposals
```sql
INSERT INTO client_proposals (proposal_number, client_name, proposal_date, valid_until, proposal_title, proposal_description, service_type, total_manpower, manpower_cost, operational_cost, management_fee, total_cost, status)
VALUES 
    ('PROP-2026-001', 'PT DEF Corporation', '2026-01-10', '2026-02-10', 'Outsourcing Security Services', 'Proposal penyediaan jasa security untuk 1 tahun', 'security', 20, 1200000000, 120000000, 120000000, 1440000000, 'sent'),
    ('PROP-2026-002', 'PT GHI Building', '2026-01-12', '2026-02-12', 'Outsourcing Cleaning Services', 'Proposal penyediaan jasa cleaning service untuk 1 tahun', 'cleaning', 15, 900000000, 90000000, 90000000, 1080000000, 'draft');
```

---

## 🚀 Cara Penggunaan

### 1. Setup Database
```bash
# Jalankan SQL schema
psql -U your_user -d your_database -f database/schema_suite1_human_capital.sql
```

### 2. Gunakan Tools
1. Buka PERADA Tools
2. Navigasi ke **Outsourcing Document Generation**
3. Pilih tool yang diinginkan:
   - **SLA Document Generator** - untuk membuat SLA
   - **Work Order Generator** - untuk membuat work order
   - **Client Proposal Generator** - untuk membuat proposal

### 3. Generate PDF
1. Isi form dengan data yang diperlukan
2. Klik "Generate PDF"
3. PDF akan otomatis ter-download

---

## 📊 Statistik

### Total Tools: 60 tools
- Suite 1: Human Capital & Outsourcing - 13 tools
- Suite 2: Logistics, Fleet & Facility - 11 tools
- Suite 3: Customs, Import & Trade - 6 tools
- Suite 4: Finance, Billing & Corporate Legal - 11 tools
- Suite 5: Field, Mining & Site Operations - 7 tools
- Suite 6: Document Management & PDF Processing - 8 tools
- **Suite 7: Outsourcing Document Generation - 3 tools** (BARU)

### Database Tables: 16 tables
- 13 tables existing
- **3 tables baru** (sla_documents, work_orders, client_proposals)

### Database Triggers: 7 triggers
- 5 triggers existing
- **2 triggers baru** (trg_update_proposal_on_accept, trg_update_wo_status)

---

## ✅ Status

**Build Status:** ✅ SUCCESS  
**TypeScript Errors:** ✅ NONE  
**Database Integration:** ✅ COMPLETE  
**Workflow Integration:** ✅ COMPLETE  

---

**Version:** 1.0  
**Date:** 2026-01-09  
**Status:** ✅ PRODUCTION READY
