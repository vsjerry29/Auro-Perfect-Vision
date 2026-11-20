# AURO PERFECT VISION — HOSTINGER CLOUD / BUSINESS PRODUCTION DEPLOYMENT GUIDE

Master step-by-step production deployment guide for running **Auro Perfect Vision** on **Hostinger Business/Unlimited Shared Hosting or Hostinger Cloud/VPS Hosting** using **Hostinger MySQL** without Supabase, Vercel, or external cloud dependencies.

---

## 1. ARCHITECTURE & COMPATIBILITY MATRIX

| Layer | Implementation | Hostinger Compatibility |
|---|---|---|
| **Framework** | **Next.js 16.4.6** (Turbopack, App Router, Security Patched) + **React 19.3.1** | Fully supported |
| **Node.js Engine** | `node >= 20.0.0` (Certified: **Node.js 24 LTS** / **Node.js 20.x LTS**) | Supported in Hostinger hPanel Node.js Selector |
| **Package Manager** | `npm >= 9.0.0` | Default in Hostinger CloudLinux runtime |
| **Database** | Hostinger MySQL 8.0 / MariaDB 10.11 (InnoDB) | Default in Hostinger hPanel |
| **Database Driver** | `mysql2/promise` (pure JS connection pool) + Prisma | Zero native binary compile issues |
| **Session Security** | HMAC-SHA256 Cookie (`apv_staff_session`) + OWASP PBKDF2-HMAC-SHA512 (220,000 iterations) | High security, instant revocation |
| **Proxy / Middleware** | Next.js 16 `proxy.ts` convention + dual-layer Server Action role gates | Edge and Node.js proxy layer |
| **Rate Limiting** | Sliding window (5 attempts / 15 min) + persistent MySQL `audit_logs` | Survives worker restarts and memory resets |
| **Persistent Storage** | External directory `~/apv_storage/uploads` (Tilde `~` expansion supported) | **Survives GitHub redeployment & rebuilds** |
| **Scheduled Tasks** | Hostinger Cron invoking `/api/cron` with `x-cron-secret` | Supported via hPanel Scheduled Tasks |

---

## 2. HOSTINGER PREREQUISITES

Ensure your Hostinger hosting plan supports Node.js:
- **Hostinger Business Web Hosting**
- **Hostinger Cloud Hosting (Cloud Startup, Professional, or Enterprise)**
- **Hostinger KVM VPS**

Verify that **Node.js** is enabled in your hPanel under:
**Websites -> Dashboard -> Advanced -> Node.js**.

---

## 3. HOSTINGER MYSQL DATABASE CONFIGURATION

1. Log in to **Hostinger hPanel** (`https://hpanel.hostinger.com`).
2. Go to **Databases -> Management**.
3. Under **Create a New MySQL Database and Database User**:
   - **Database Name:** e.g., `u123456789_apv` *(Hostinger automatically prepends your username prefix)*.
   - **MySQL Username:** e.g., `u123456789_admin`.
   - **Password:** Generate a strong random password (save securely).
4. Click **Create**.
5. Connection Parameters:
   - **Host:** `127.0.0.1` *(Always use `127.0.0.1` instead of `localhost` on Hostinger to avoid IPv6 resolution delays)*.
   - **Port:** `3306`.
   - **Database Name:** `u123456789_apv`.
   - **User:** `u123456789_admin`.
   - **Password:** `<YourSecurePassword>`.

---

## 4. DATABASE INITIALIZATION & SCHEMA IMPORT

You can import the schema via **phpMyAdmin GUI** or **SSH CLI**.

### Method A: One-Click phpMyAdmin Import (Recommended)
1. In hPanel, under **Databases -> Management**, click **Enter phpMyAdmin** next to your database.
2. Select your database from the left navigation bar.
3. Click the **Import** tab.
4. Click **Choose File** and select:
   ```
   scripts/mysql/schema.sql
   ```
5. Click **Import** (or **Go**).
6. phpMyAdmin will execute all 29 InnoDB DDL table declarations, indexes, and foreign keys.

### Method B: Automated CLI Migration via SSH
```bash
ssh u123456789@your-server-ip -p 65002
cd ~/domains/auroperfectvision.com/public_html
npx tsx scripts/mysql/seed.ts
```

> [!NOTE]
> `schema.sql` creates a clean production schema with zero demonstration records. To import default therapies and site content, run `npx tsx scripts/mysql/seed.ts`.

---

## 5. GENUINELY PERSISTENT FILE STORAGE SETUP

### The Redeployment Problem & Solution
On Hostinger, Git deployments or redeployments pull fresh code into your application directory (`public_html`). Any files stored directly inside `public/uploads` would be overwritten or erased if not tracked by Git.

To ensure uploaded therapy pictures, hero images, and staff documents survive **application restarts, rebuilds, and GitHub redeployments**:

1. Connect to Hostinger via SSH:
   ```bash
   ssh u123456789@your-server-ip -p 65002
   ```

2. Create a persistent storage directory **outside** the replaceable git web root:
   ```bash
   mkdir -p ~/apv_storage/uploads
   mkdir -p ~/apv_storage/private_clinical_docs
   chmod 755 ~/apv_storage/uploads
   chmod 700 ~/apv_storage/private_clinical_docs
   ```

3. Create a persistent symlink to `public/uploads`:
   ```bash
   ln -sfn ~/apv_storage/uploads ~/domains/auroperfectvision.com/public_html/public/uploads
   ```

4. Configure your `.env.production` file:
   ```ini
   UPLOAD_DIR=/home/u123456789/apv_storage/uploads
   PRIVATE_DOCS_DIR=/home/u123456789/apv_storage/private_clinical_docs
   ```

5. **Automated Fallback Route:**
   Even if the symlink is missing, Next.js automatically rewrites `/uploads/:path*` to `/api/uploads/:path*`, streaming files directly from your configured `UPLOAD_DIR` with strict MIME handling and XSS sanitization.

---

## 6. UPLOAD SECURITY & DOCUMENT PRIVACY

- **Allowed Public Image Formats:** JPEG, PNG, WebP (Strictly enforced for all standard staff).
- **SVG Vector Security:** Untrusted SVG uploads are disabled for regular staff. SVG vector uploads are restricted strictly to **Super Administrators**, and undergo comprehensive multi-stage sanitization (blocking `<!DOCTYPE`/`<!ENTITY` XXE injections, `<script>`, event handlers `on*`, and `javascript:` URIs). SVGs are served with `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'` and `X-Content-Type-Options: nosniff`.
- **Sensitive Clinical Documents:** Patient intake scans and clinical medical files are stored in `PRIVATE_DOCS_DIR` and strictly blocked from public HTTP access (`/api/uploads/`). Only authenticated practitioners can view them via authorized EMR routes.

---

## 7. ENVIRONMENT VARIABLES (`.env.production`)

Create `.env.production` (or `.env.local`) in your website root on Hostinger:

```ini
# Node Environment & Port
NODE_ENV=production
PORT=3000

# Base Application URL
NEXT_PUBLIC_APP_URL=https://auroperfectvision.com

# Hostinger MySQL Connection (Pure JS pool on 127.0.0.1:3306)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=u123456789_apv
DB_USER=u123456789_admin
DB_PASSWORD=YourSecureDatabasePassword
DB_POOL_LIMIT=10

# Prisma Connection URL
DATABASE_URL=mysql://u123456789_admin:YourSecureDatabasePassword@127.0.0.1:3306/u123456789_apv

# Staff Authentication (HMAC-SHA256 session key - min 64 random characters)
SESSION_SECRET=auro_perfect_vision_production_session_super_secret_key_2026_auroville_resilient

# Hostinger Scheduled Task Secret (Protects /api/cron)
CRON_SECRET=apv_cron_token_auroville_2026_ultra_secure

# Durable Storage Directories
UPLOAD_DIR=/home/u123456789/apv_storage/uploads
PRIVATE_DOCS_DIR=/home/u123456789/apv_storage/private_clinical_docs

# Initial Bootstrap Passwords (used only if database is completely empty on first launch)
ADMIN_INITIAL_PASSWORD=AuroVision@2026!
THERAPIST_INITIAL_PASSWORD=AnanyaVision@2026!
```

---

## 8. HOSTINGER NODE.JS APPLICATION SETUP

1. In hPanel, go to **Websites -> Dashboard -> Advanced -> Node.js**.
2. Click **Create Application**:
   - **Node.js Version:** Select **24.x LTS** (Certified Production Runtime) or **20.x LTS**.
   - **Application Mode:** **Production**.
   - **Application Root:** `domains/auroperfectvision.com/public_html` (or subdomain).
   - **Application Startup File:** `server.js` (or start script `npm run start`).
3. Click **Create**.

---

## 9. BUILD & DEPLOYMENT PROCEDURE

### Via Hostinger Git Integration
1. In hPanel, go to **Websites -> Dashboard -> Advanced -> Git**.
2. Connect your Git repository.
3. Branch: `main`.
4. Post-Deployment Command:
   ```bash
   npm install --production=false
   npx prisma generate
   npm run build
   # Re-ensure persistent storage symlink survives deploy
   ln -sfn ~/apv_storage/uploads ~/domains/auroperfectvision.com/public_html/public/uploads
   ```
5. Click **Deploy**.

### Via SSH Terminal
```bash
cd ~/domains/auroperfectvision.com/public_html
git pull origin main
npm install
npx prisma generate
npm run build
ln -sfn ~/apv_storage/uploads ~/domains/auroperfectvision.com/public_html/public/uploads
# Restart in hPanel or via PM2:
pm2 restart auro-perfect-vision || pm2 start npm --name "auro-perfect-vision" -- start
```

---

## 10. HOSTINGER SCHEDULED TASKS (CRON JOBS)

Hostinger includes a scheduled task manager in hPanel. Use it to automatically release expired booking holds and send reminders:

1. In hPanel, go to **Advanced -> Cron Jobs**.
2. Select **Common Settings:** **Every 15 minutes** (`*/15 * * * *`).
3. Set **Command:**
   ```bash
   curl -s -H "x-cron-secret: apv_cron_token_auroville_2026_ultra_secure" https://auroperfectvision.com/api/cron > /dev/null 2>&1
   ```
   *(Replace with your actual domain and `CRON_SECRET`)*.
4. Click **Save**.

---

## 11. SSL CONFIGURATION

1. In hPanel, go to **Security -> SSL**.
2. Click **Install SSL** on your domain (Hostinger provides free Let's Encrypt lifetime SSL).
3. Toggle **Force HTTPS** ON.
4. This ensures all cookies transmit with the `Secure` flag and all API interactions are encrypted.

---

## 12. BACKUP & DISASTER RECOVERY

1. **Hostinger Automated Daily Backups:**
   Hostinger Business and Cloud plans automatically create full daily backups of both website files and MySQL databases. Access them under **Files -> Backups** in hPanel.
2. **Manual MySQL Dump via SSH:**
   ```bash
   mysqldump -u u123456789_admin -p -h 127.0.0.1 u123456789_apv > backup_apv_$(date +%F_%T).sql
   ```
3. **Media Uploads Backup:**
   ```bash
   tar -czvf media_backup_$(date +%F).tar.gz ~/apv_storage/uploads/
   ```

---

## 13. POST-DEPLOYMENT VERIFICATION CHECKLIST

After deploying, run these checks to confirm production readiness:

```bash
# 1. Check health endpoint (returns HTTP 200 with database status)
curl -i https://auroperfectvision.com/api/health

# 2. Check cron job endpoint (returns HTTP 200 with released hold count)
curl -i -H "x-cron-secret: apv_cron_token_auroville_2026_ultra_secure" https://auroperfectvision.com/api/cron

# 3. Log in as Super Admin
# Visit: https://auroperfectvision.com/staff/login
# Email: admin@auroperfectvision.com
# Password: AuroVision@2026! (or your ADMIN_INITIAL_PASSWORD)
```

Immediately update the Super Admin password in `/admin/users` after initial login.
