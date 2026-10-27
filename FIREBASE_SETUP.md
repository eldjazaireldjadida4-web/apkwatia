# 🔥 دليل إعداد Firebase لتطبيق الوطنية TV (نسخة أندرويد)

هذا الدليل يشرح خطوة بخطوة كيف تربط **تطبيق الأندرويد الأصلي (Kotlin + Compose)** و**لوحة الإدارة** بـ Firebase.

---

## الخطوة 1 — أنشئ مشروع Firebase

1. افتح [Firebase Console](https://console.firebase.google.com).
2. افتح مشروع الإنتاج الحالي `elwataniatvapp` (لا تنشئ مشروعاً جديداً عند تجهيز النسخة النهائية).
3. اقبل الشروط → **تعطيل** Google Analytics (اختياري).

---

## الخطوة 2 — أضف تطبيق Android

1. من لوحة المشروع اضغط على أيقونة **🤖 Android**.
2. املأ الحقول:
   - **Android package name**: `com.elwataniatv.app` (مطابق لـ `applicationId` في `app/build.gradle.kts` — **مهم جداً**)
   - **App nickname**: `الوطنية TV`
3. اضغط **Register app**.
4. **حمّل ملف `google-services.json`** وضعه في مجلد التطبيق القياسي `app/`:
   ```
   elwataniatv-Channel/
   ├── settings.gradle.kts
   ├── app/
   │   └── google-services.json   ← هنا (المسار المفضّل)
   └── …
   ```
   > يدعم إعداد Gradle الحالي أيضاً وضع الملف في جذر المشروع، ويقوم CI بنسخه إلى `app/` قبل البناء. استخدم مساراً واحداً محلياً ولا ترفع الملف؛ فهو مستثنى في `.gitignore`.

5. لتفعيل FCM (إشعارات الدفع) أضف إلى `app/build.gradle.kts`:
   ```kotlin
   plugins {
       id("com.google.gms.google-services")  // بعد إضافة في gradle/libs.versions.toml
   }
   ```
   والاعتمادية:
   ```kotlin
   implementation("com.google.firebase:firebase-messaging-ktx")
   ```

---

## الخطوة 3 — تفعيل الخدمات في Console

1. **Firestore Database** → Create database (وضع الإنتاج). سجّل موقع قاعدة البيانات الفعلي كما يظهر في Console؛ مشروع الإنتاج الحالي يستخدم `eur3`. لا تغيّر الموقع بعد إنشاء قاعدة البيانات. **قرار المنطقة طُبّق في الكود**: الدوال مضبوطة على `europe-west1` (ضمن eur3) — إن أظهرت Console موقعاً مختلفاً، غيّر `REGION` في `functions/index.js` قبل نشر Functions.
2. **Authentication**:
   - فعّل **Email/Password** (لحساب المسؤول).
   - فعّل **Anonymous** (لجلسات مستخدمي التطبيق — تطلبها القواعد).
3. **الخطة المجانية (Spark) — القرار الحالي**:
  - فعّل Firestore وAuthentication فقط.
  - الفلترة مجانية: فلتر العميل (`ProfanityFilter.kt`) + القواعد المشددة (createdAt server timestamp، تعليق كل 30 ثانية، رابط واحد، 500 حرف) — انشر القواعد بـ `firebase deploy --only firestore:rules`.
  - Cloud Functions غير منشورة (تتطلب Blaze إن أُريدت لاحقاً)؛ الإشعارات تظهر داخل التطبيق من مستندات `notifications`.
  - Storage غير مستخدمة.

---

## الخطوة 4 — انشر قواعد الأمان

استخدم الملف **المرفق** `admin/firestore.rules` — وليس أي نسخة مبسطة من إنترنت:

1. من Console → Firestore → **Rules** tab.
2. الصق محتوى `admin/firestore.rules` → **Publish**.

> ⚠️ القواعد المرفقة تشترط `request.auth.token.admin == true` للمسؤول — أي مستخدم مجهول (Anonymous) **ليس** مسؤولاً. لا تستبدلها بنسخة تسمح بـ `email != null`.

### إعداد حساب المسؤول

1. أنشئ مستخدم في Authentication (Email/Password).
2. شغّل سكربت إضافة الـ claim (يتطلب service account):
   ```bash
   node scripts/set-admin-claim.js admin@elwataniatv.dz
   ```

---

## الخطوة 5 — لوحة الإدارة (الويب)

تستخدم `admin/index.html` إعداد Web الثابت الخاص بالمشروع `elwataniatvapp`؛ لا توجد شاشة تسمح بتغيير المشروع. بيانات Firebase Web العامة ليست مفتاح Admin ولا تمنح صلاحية بمفردها؛ الوصول الفعلي محكوم بتسجيل Firebase Authentication وFirestore Rules وcustom claim `admin: true`.

استضف اللوحة عبر Firebase Hosting باتباع `admin/DEPLOY.md`. لا تضع ملف Service Account JSON أو مفتاحاً خاصاً أو كلمة مرور داخل HTML أو Git.

يُنشئ `scripts/build-hosting.js` إعداد Firebase Web من `admin/firebase-config.js` المحلي المستثنى من Git أو من متغيرات `FIREBASE_WEB_*`. لا يتضمن ذلك مفتاح Admin؛ البناء يوقف النشر إذا غابت بيانات تطبيق Web الأساسية، بدلاً من نشر لوحة غير متصلة.

---

## فحص الربط (تأكيد سريع)

- [ ] `google-services.json` في `app/` (أو في الجذر وفق دعم Gradle الحالي)
- [ ] `applicationId` = `com.elwataniatv.app`
- [ ] Authentication: Email/Password + Anonymous مفعّلان
- [ ] Firestore rules = `admin/firestore.rules`
- [ ] حساب المسؤول يحمل claim `admin: true`
- [ ] عدم نشر Cloud Functions أو تفعيل Cloud Storage في الخطة المجانية؛ Functions موجودة محلياً وغير منشورة
