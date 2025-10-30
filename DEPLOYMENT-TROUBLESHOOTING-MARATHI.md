# 🔧 Deployment Errors कसे सोडवायचे (Marathi Guide)

## Error: "npm run build exited with 1"

हा error म्हणजे build process मध्ये काहीतरी चूक झाली आहे. खालील steps follow करा:

---

## ✅ पहिला उपाय: Prisma Generate (सर्वात common)

### Vercel मध्ये:

**Step 1: Settings बदला**
1. Vercel Dashboard → तुमचा Project → **Settings**
2. **General** → **Build & Development Settings**
3. Override करा:
   - **Build Command**: `prisma generate && npm run build`
   - **Install Command**: `npm install`

**Step 2: Environment Variables तपासा**

**Settings** → **Environment Variables** मध्ये **हे सर्व असणे आवश्यक आहे:**

```
DATABASE_URL = <Vercel Postgres ने automatically दिलेले>
NEXTAUTH_URL = https://तुमचे-app-नाव.vercel.app
NEXTAUTH_SECRET = <तुमचे secret - खाली पाहा कसे generate करायचे>
NODE_ENV = production
```

**NEXTAUTH_SECRET कसे generate करायचे:**
```bash
openssl rand -base64 32
```
हा command terminal मध्ये run करा, output copy करा

**Step 3: Database (अगदी महत्वाचे!)**

Vercel मध्ये PostgreSQL database हवा:

1. **Storage** टॅबवर जा
2. **Create Database** वर क्लिक करा
3. **Postgres** निवडा
4. Database create झाल्यावर, Vercel automatically `DATABASE_URL` add करेल

**Step 4: Schema अपडेट करा**

तुमच्या local computer वर:

```bash
# SQLite ऐवजी PostgreSQL schema वापरा
cp prisma/schema.production.prisma prisma/schema.prisma

# Git commit आणि push करा
git add .
git commit -m "Fix: Update schema for production PostgreSQL"
git push
```

**Step 5: Redeploy करा**

Vercel मध्ये:
1. **Deployments** टॅबवर जा
2. तीन dots (...) क्लिक करा
3. **Redeploy** निवडा

---

## ✅ दुसरा उपाय: Build Logs तपासा

### Actual error message शोधा:

1. Vercel → **Deployments** → Failed deployment
2. **View Build Logs** वर क्लिक करा
3. Error message शोधा

**Common errors आणि त्यांचे उपाय:**

### 1️⃣ Error: "Cannot find module '@prisma/client'"

**उपाय:**
```bash
# package.json मध्ये हे असल्याची खात्री करा:
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma generate && next build"
}
```

मी आधीच तुमच्या package.json मध्ये add केले आहे, फक्त push करा:
```bash
git add package.json
git commit -m "Fix: Add prisma generate to build scripts"
git push
```

### 2️⃣ Error: "Environment variable not found: DATABASE_URL"

**उपाय:**
- Vercel मध्ये Postgres database add करा (Storage tab)
- किंवा manually `DATABASE_URL` environment variable add करा

### 3️⃣ Error: "Type error" किंवा TypeScript errors

**उपाय:**
```bash
# Local मध्ये build करून पाहा काय error आहे ते:
npm run build

# Errors fix करा आणि push करा
```

### 4️⃣ Error: "NEXTAUTH_SECRET environment variable is not set"

**उपाय:**
Environment variables मध्ये `NEXTAUTH_SECRET` add करा:
```bash
# Generate करा:
openssl rand -base64 32

# Output copy करून Vercel मध्ये paste करा
```

---

## ✅ तिसरा उपाय: Fresh Deployment

सगळे साफ करून नव्याने deploy करा:

**Vercel मध्ये:**

1. **Settings** → **General** → scroll down
2. **Delete Project** वर क्लिक करा (घाबरू नका, code safe आहे GitHub वर)
3. नवीन project बनवा:
   - **New Project** → Repository import करा
   - Environment variables add करा (वरच्या steps follow करा)
   - Database add करा (Storage → Postgres)
   - Deploy करा

---

## ✅ चौथा उपाय: Local Build Test

तुमच्या computer वर build test करा:

```bash
# Production schema वापरा
cp prisma/schema.production.prisma prisma/schema.prisma

# Environment variables सेट करा
export DATABASE_URL="postgresql://test:test@localhost:5432/test"
export NEXTAUTH_SECRET="test-secret-key-for-local-testing"
export NEXTAUTH_URL="http://localhost:3000"

# Build करा
npm run build

# Error आला का बघा
```

जर local मध्ये build होत असेल पण Vercel मध्ये होत नसेल, तर Environment Variables ची problem आहे.

---

## 🎯 Checklist: Deploy करण्यापूर्वी तपासा

Deploy करण्यापूर्वी हे सर्व तपासा:

- [ ] **Vercel Postgres database** create केला आहे का? (Storage tab)
- [ ] **Environment Variables** सर्व set केले आहेत का?
  - [ ] `DATABASE_URL` (Vercel automatically add करेल)
  - [ ] `NEXTAUTH_URL` (तुमचा Vercel app URL)
  - [ ] `NEXTAUTH_SECRET` (generated secret)
  - [ ] `NODE_ENV = production`
- [ ] **prisma/schema.prisma** PostgreSQL साठी आहे का? (SQLite नाही)
- [ ] **package.json** मध्ये prisma generate script आहे का?
- [ ] Latest code **git push** केला आहे का?

---

## 📊 Deployment Status तपासा

**Vercel Deployment Logs मध्ये:**

✅ **Successful steps दिसावेत:**
```
Installing dependencies...
✓ Dependencies installed
Running build command...
✓ Prisma client generated
✓ Build completed
```

❌ **Failed step कुठे आहे ते बघा:**
```
❌ Build failed
Error: ...
```

---

## 🆘 अजूनही Error येत आहे?

### Option 1: Railway वापरा (Alternative)

Railway कधी कधी Vercel पेक्षा सोपे असते:

1. [railway.app](https://railway.app) वर जा
2. GitHub सह login करा
3. **New Project** → **Deploy from GitHub**
4. Repository निवडा
5. **Add PostgreSQL** database
6. Environment variables add करा
7. Deploy!

### Option 2: मला logs पाठवा

तुमचा build error logs copy करून मला पाठवा, मी specific solution देईन:

1. Vercel → Deployments → Failed deployment
2. **View Build Logs**
3. पूर्ण error message copy करा
4. मला विचारा

---

## 💡 Common Mistakes (चुकूच नका!)

❌ **चूक**: SQLite schema production मध्ये वापरली
✅ **योग्य**: PostgreSQL schema वापरा

❌ **चूक**: Environment variables चुकीचे किंवा missing
✅ **योग्य**: सर्व variables योग्यरित्या set करा

❌ **चूक**: Database create केला नाही
✅ **योग्य**: Vercel Postgres किंवा अन्य database add करा

❌ **चूक**: Prisma generate चुकले build मध्ये
✅ **योग्य**: postinstall script add करा

---

## 📞 मदत हवी?

या steps follow केल्यानंतरही अडचण असेल तर:

1. **Error message** चे screenshot पाठवा
2. **Build logs** copy करून पाठवा
3. कोणत्या platform वर deploy करत आहात ते सांगा (Vercel/Railway/Render)

मी लगेच मदत करेन! 😊

---

## ✨ Success झाल्यावर:

Deploy success झाल्यावर:

1. ✅ तुमची website live आहे
2. ✅ `https://your-app.vercel.app` वर जा
3. ✅ Account create करा (Sign up)
4. ✅ Login करा
5. ✅ Settings मध्ये Dhan API credentials add करा
6. ✅ Portfolio enjoy करा! 🎉

---

**Happy Deploying! 🚀**
