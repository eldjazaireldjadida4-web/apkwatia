# الوطنية TV — Android Application (Kotlin & Jetpack Compose)

التطبيق الرسمي لقناة **الوطنية TV** الجزائرية، تمت إعادة إنجازه بالكامل بلغة **Kotlin** وواجهات **Jetpack Compose** الحديثة مع بنية **Clean Architecture / MVVM** وتكامل **Room Database**.

## 📊 حالة المشروع (2026-10-27 — v8.6.3 مرشح إصدار)

| المجال | الحالة |
|---|---|
| الحزمة | `com.elwataniatv.app` (namespace + applicationId) ✅ |
| إصدار v8.6.3 | مشغّل أفقي متجاوب وقائمة قنوات قابلة للإخفاء، مزامنة تعليقات لا تحفظ الفشل، وتعطيل التعليقات العامة في Release؛ التفاصيل في `docs/RELEASE_NOTES_V8.6.3_AR.md` ✅ |
| التطبيق يقرأ كل المحتوى والهوية ومفاتيح الواجهة من Firestore (لوحة التحكم تتحكم كلياً) | ✅ |
| التعليقات العامة | ⛔ معطّلة في Release لحين اكتمال الموافقة والإبلاغ والحظر والإشراف؛ تبقى متاحة في Debug فقط |
| التفاعلات التجميعية | ⏸️ القراءة متاحة؛ الكتابة متوقفة مؤقتاً حتى نشر جامع server-side موثوق |
| الإشعارات داخل التطبيق | ✅ تظهر كشريط في شاشة البث |
| SSL للبث | ✅ التحقق القياسي من شهادات TLS، بدون تجاوز أمني |
| التحقق من البناء | ✅ v8.6.3: 69 اختبار وحدة، lintDebug/lintRelease، build debug وcompileDebugAndroidTestKotlin؛ AAB Release غير موقّع |
| الهوية البصرية الموحدة | شعار التطبيق وSplash وAndroid TV ولوحة الإدارة تستخدم شعار الوطنية TV الرسمي الموحد | ✅ |
| التحكم عن بعد | الاسم، الشعار النصي، الشعار، ألوان Material، شاشة الترحيب، الأرشيف، البنرات، EPG، أقسام التواصل والمواقع، الصيانة والتحديثات من Firebase | ✅ |
| إصلاحات v8.1.3 | تحسين عرض RTL، زيادة قابلية قراءة عناوين شريط التنقل، حجب القيم التجريبية، وربط زر الأخبار بوجهة YouTube | ✅ |
| تحسينات v8.1.4 | ربط هوية البطل الرئيسي والبطاقات بشعار Firebase، ضبط ترتيب وتفعيل منصات التواصل، وتحسين RTL في المزيد وتفاصيل الأرشيف | ✅ |
| إصلاحات v8.1.5 | إزالة طلب إشعارات مفاجئ من cold start، تأجيل Firebase إلى ما بعد أول frame، واستبدال foreground المشوّه في adaptive icon بالشعار الرسمي النظيف | ✅ |
| إصلاحات v8.1.6 | ضبط RTL للنصوص المختلطة وEPG، إزالة ارتفاع المشغل الثابت، السماح بلف تسميات التنقل، والتحقق الآمن من روابط البنرات، مع build 29 موقّع | ✅ |
| إصلاحات v8.1.7 | تخفيف Typography والبطل الرئيسي وشريط التنقل، توحيد Archive/Social/Websites، مطابقة skeleton، نقل selectedStream إلى LiveViewModel، وتشديد فحص الروابط | ✅ |
| إصلاحات v8.1.8 | إعادة فحص نهائية للخطوط خفّضت History وOnboarding وGlobalErrorBoundary إلى 18sp، مع إعادة اختبار كاملة للمصدر والبناء والمحاكي | ✅ |
| إصلاحات v8.1.9 | تثبيت ContentOrRtl في النصوص الديناميكية، إزالة العناوين العربية الصلبة من fallback، تعطيل الخبر الافتراضي قبل Firebase، وإضافة fallback مترجم لاسم القناة | ✅ |
| صفحة التحميل العامة | ما زالت تعرض v8.6.0 / versionCode 30؛ لا تستخدمها لتحديث نسخة أحدث حتى إصلاح الرقم والتوقيع |
| **متبقٍّ عند المستخدم:** | اختبار الإطلاق النهائي على أجهزة حقيقية وتأكيد محتوى القنوات من لوحة الإدارة |

⚠️ **قبل الإطلاق:** نسخة Release تخفي التعليقات العامة حتى اكتمال أدوات الشروط والإبلاغ والحظر والإشراف. اختبر Anonymous Auth وApp Check وقواعد Firestore المنشورة على `elwataniatvapp`، وتحقق من رابط الخصوصية، التشغيل على جهاز فعلي، وحقوق بث المحتوى. لا يوجد مفتاح توقيع إنتاجي في المستودع؛ خرج `bundleRelease` الحالي غير موقّع ولا يصلح للرفع. تحقق من أعلى رقم إصدار في Play Console قبل اعتماد `versionCode 41`.

## 📦 آخر إصدار قابل للتجربة

مرشح الاختبار الحالي `v8.6.3 / versionCode 41` مرتبط بمشروع Firebase الصحيح، واجتاز 69 اختبار وحدة وlintDebug/lintRelease وبناء debug وتجميع اختبارات Android. خرج Release بُني لكنه **غير موقّع**؛ لا ترفعه إلى Play. لم يكتمل اختبار واجهة حقيقي على BlueStacks لهذه النسخة. صفحة التحميل العامة ما زالت تعرض `v8.6.0 / versionCode 30`. يلزم مفتاح الرفع الصحيح أو إعادة ضبط Upload Key عبر Play Console، ثم AAB موقّع واختبار داخلي ولقطات شاشة حقيقية.

## 🌟 الميزات الرئيسية

- **البث المباشر (Live Stream)**: مشغل ExoPlayer/Media3 لتدفق HLS الرسمي الذي يحدده مسؤول القناة في Firestore. لا ينشئ التطبيق رابطاً احتياطياً أو مصدراً وهمياً عند غياب الرابط؛ تضاف المصادر الرسمية الإضافية من لوحة التحكم فقط.
- **الأخبار العاجلة (Breaking News)**: شريط تفاعلي يفتح فيديو YouTube الذي يحدده المسؤول، أو أحدث فيديو من الأرشيف عند غياب الرابط.
- 📅 **جدول البرامج (EPG)**: عرض تفاعلي لجدول بث برامج اليوم مع إمكانية تفعيل التنبيهات.
- **أرشيف البرامج (Archive Catalog)**: بحث وفلترة حسب التصنيف مع مشغل YouTube مدمج، وتحكم المسؤول في نشر كل حصة أو نشرة وظهورها في الشاشة الرئيسية.
- 🌐 **المواقع الصحفية (News Directory)**: تصفح أهم المواقع الإخبارية الجزائرية بمتصفح WebView مدمج وسريع.
- **منصات التواصل الاجتماعي (Social Feeds)**: قسم مستقل للصفحات الرسمية، مع إدارة الاسم والرابط والوصف والشعار واللون والترتيب وحالة الظهور من لوحة Firebase.
- ⚙️ **الإعدادات والتفضيلات**: دعم كامل للوضع الليلي، خيارات اللغة، التنبيهات، ونموذج إرسال الملاحظات.
- 🎨 **هوية القناة الموحدة**: شعار الوطنية TV الرسمي مستخدم في أيقونة التطبيق، شاشة الترحيب، البث، Android TV، صفحة التحميل ولوحة الإدارة.
- 🛠️ **تحكم Firebase موسع**: تغيير اسم القناة وشعارها النصي، رابط الشعار، صورة الترحيب، ألوان الواجهة، Dynamic Color، إظهار الأرشيف والبنرات وأقسام التواصل والمواقع، وضع الصيانة، الإصدارات، وروابط المنصات دون إعادة نشر APK.

## 🛠️ البنية التقنية

- **اللغة**: Kotlin
- **واجهات المستخدم**: Jetpack Compose & Material 3 (M3)
- **قواعد البيانات المحلية**: Room Database (KSP)
- **إدارة الحالة**: ViewModel, StateFlow, Coroutines
- **التنقل**: Navigation Compose
- **مشغل الفيديو**: ExoPlayer / Media3 & WebView Component

## 🚀 البناء والتشغيل

1. **المتطلبات**: Android Studio Ladybug / AGP 8.8+ / JDK 17+ / Android SDK 36
2. **البناء**:
   ```bash
   ./gradlew assembleDebug
   # Release/AAB: ./gradlew bundleRelease
   # التوقيع اختياري محلياً عبر RELEASE_STORE_FILE وRELEASE_STORE_PASSWORD
   # وRELEASE_KEY_ALIAS وRELEASE_KEY_PASSWORD (بيئة/Gradle properties فقط).
   ```
3. **الاختبارات والفحص**:
   ```bash
   ./gradlew test
   ./gradlew lint
   ```

## 🔥 Firebase ولوحة الإدارة

- **إعداد Firebase خطوة بخطوة**: راجع [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md)
- **قواعد الأمان المحلية**: [`admin/firestore.rules`](admin/firestore.rules) — يجب اختبارها ونشرها يدوياً؛ لا يفترض هذا المستودع أنها منشورة حالياً
- **لوحة الإدارة**: [`admin/index.html`](admin/index.html) — صفحة مستقلة تستضيفها على أي استضافة
- **الخدمات السحابية**: يستخدم التطبيق Firestore وFirebase Authentication وApp Check وFCM. اختبارات قواعد Firestore المحلية 30/30. Cloud Functions غير منشورة؛ التعليقات العامة معطّلة في Release إلى أن يكتمل الإشراف.
- **سكريبتات**: [`scripts/`](scripts/) — `set-admin-claim.js` و`generate-keystore.sh`

## 📦 جاهزية المتجر

- `applicationId = com.elwataniatv.app` (مثبّت في `app/build.gradle.kts`)
- **UGC / Google Play:** `PUBLIC_COMMENTS_ENABLED=false` في Release و`true` في Debug. أبقِ التعليقات العامة معطّلة في إصدار Play حتى تنفيذ الشروط والموافقة والإبلاغ عن المحتوى والمستخدمين والحظر والمراجعة المستمرة.
- **التوقيع:** لا يوجد Upload/Release keystore في المستودع؛ `bundleRelease` الحالي غير موقّع ولا يُرفع إلى Play.
- أصول المتجر في [`store-assets/`](store-assets/) — `icon-512.png` و`icon-1024.png` و`feature-graphic.png` موجودة؛ لقطات الشاشة غير موجودة بعد
- راجع [`PLAY_STORE_GUIDE.md`](PLAY_STORE_GUIDE.md) للرفع النهائي



## نشر لوحة التحكم

لوحة التحكم موجودة في `admin/index.html`. نشرها الموصى به هو Firebase Hosting من مجلد `admin`:

```bash
cd admin
firebase use elwataniatvapp
firebase deploy --only hosting
```

بعد النشر افتح رابط Firebase Hosting الذي يعرضه Firebase CLI. إعداد `admin/firebase.json` يبني شجرة نشر آمنة في `admin/hosting-dist` من allowlist فقط، وهو مسار مستقبلي اختياري. روابط Firebase Hosting التشغيلية المتحقَّق من استجابتها هي `https://elwataniatvapp.web.app/privacy` و`https://elwataniatvapp.web.app/admin/`؛ نطاق `elwataniatv.dz` ليس ضمن إعدادات المشروع الحالية. لا تضع مفاتيح API أو كلمات مرور داخل التطبيق؛ لوحة الإدارة تعتمد على Firebase Auth وcustom claim باسم `admin: true`.
