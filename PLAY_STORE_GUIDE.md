# دليل نشر تطبيق الوطنية TV على Google Play Store

دليل رفع تطبيق Android القائم `com.elwataniatv.app` إلى Google Play. مرشح الإصدار الحالي `v8.6.4 / versionCode 42` ويستهدف API 36. أُنشئ مفتاح رفع جديد خارج المستودع؛ رفع الإصدار إلى القائمة الحالية يتوقف على حالة Play App Signing واعتماد إعادة ضبط مفتاح الرفع في Play Console. تحقق من أعلى versionCode قبل الرفع.

---

## ١. ما تحتاجه قبل البدء

### تحقّق من حالة التطبيق والتوقيع أولاً

الحزمة البرمجية `com.elwataniatv.app` موجودة، لكن لم يتم التحقق من وجود إدراج لها في Play Console. لا تنشئ إدراجاً مكرراً ولا تغيّر `applicationId` قبل البحث عن الحزمة في حساب المالك.

- **إذا كانت هذه أول مرة تُرفع فيها الحزمة إلى Play:** أنشئ إدراجاً واحداً للحزمة نفسها، وسجّل في Play App Signing، واستخدم مفتاح الرفع الجديد.
- **إذا كان لها إدراج سابق وPlay App Signing مفعّلاً:** من **Test and release → Setup → App integrity → App signing** اطلب **Request upload key reset** وارفع `upload_certificate.pem`. انتظر موافقة Google؛ المفتاح الجديد مفتاح رفع فقط، وتبقى Google مسؤولة عن مفتاح توقيع التطبيق.
- **إذا كان لها إدراج قديم بلا Play App Signing:** لا يطابق المفتاح الجديد توقيع التطبيق القديم. استرجع المفتاح الأصلي أو اطلب توجيه Play Support؛ لا تغيّر معرّف الحزمة كحل سريع.

لا تثبّت APK موقّعاً بمفتاح الرفع فوق نسخة Play: Google يوقّع النسخة الموزعة بمفتاح التطبيق. اختبر التحديث من Internal testing.

المراجع: [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756) · [متطلبات مستوى API](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en) · [توقيع التطبيقات](https://developer.android.com/studio/publish/app-signing).

> **حالة هذا الإصدار:** AAB `8.6.4 / 42` موقّع ومتحقق محلياً؛ لا يمكن تأكيد أهلية الرفع أو أعلى `versionCode` من دون فحص Play Console. ملف keystore وكلمات المرور خارج Git؛ Gradle يقرأ `RELEASE_STORE_FILE` و`RELEASE_STORE_PASSWORD` و`RELEASE_KEY_ALIAS` و`RELEASE_KEY_PASSWORD` من خصائص أو متغيرات بيئية محمية.

| البند | التفاصيل |
|------|---------|
| **حساب Google Play Developer** | مطلوب؛ الرسوم والتحقق والمتطلبات تختلف حسب البلد والحساب، راجع ما يظهر في Play Console |
| **حساب Google** | استخدم حساب المالك أو مسؤولاً مخولاً للنشر |
| **التحقق من الهوية** | جهّز مستندات الحساب إذا طلبها Play Console |
| **بيانات المؤسسة** | أكملها فقط إذا كان نوع الحساب يتطلبها |
| 📦 **AAB إصدار Android** | مرشح `8.6.4` (`versionCode 42`)؛ وقّعه مفتاح الرفع الجديد، ولا ترفعه قبل اعتماد إعادة ضبطه في Play Console |
| 🖼️ **أيقونة التطبيق** | `store-assets/icon-512.png` موجودة؛ راجعها قبل الرفع |
| 🖼️ **Feature Graphic** | `store-assets/feature-graphic.png` موجودة (1024×500) |
| 📸 **Screenshots** | لا توجد لقطات شاشة محفوظة في المستودع؛ يجب التقاطها من التطبيق الفعلي (1080×1920 لـ Android) |
| 📝 **سياسة الخصوصية** | الرابط التشغيلي المتحقق: `https://elwataniatvapp.web.app/privacy` |

---

## ٢. الحساب وإدراج التطبيق

1. افتح [Play Console](https://play.google.com/console) بحساب المالك أو مسؤول مخوّل.
2. أكمل اتفاقية المطوّر والتحقق والبيانات التي يطلبها Play Console لهذا الحساب والبلد؛ لا تعتمد على رسوم أو مدة تحقق ثابتة من دليل قديم.
3. ابحث عن `com.elwataniatv.app` في الحساب قبل إنشاء أي إدراج.
4. إذا لم يوجد إدراج، أنشئ واحداً باسم `الوطنية TV`، واللغة العربية، ثم اختر تصنيف المحتوى والسعر وفق المنتج الفعلي.
5. إذا ظهر أن الحزمة مسجلة لدى حساب آخر، أوقف الإنشاء واتبع إجراءات إثبات الملكية الرسمية؛ لا تغيّر `applicationId` ولا تنشئ نسخة مكررة.

---

## ٤. إعداد صفحة المتجر (Store Listing)

### نص عربي (للجمهور الجزائري)

**App name** (30 حرف max):
```
الوطنية TV
```

**Short description** (80 حرف max):
```
الوطنية TV: الأرشيف، الأخبار، المواقع الرسمية، والبث عند توفره
```

**Full description** (4000 حرف max):
```
📺 الوطنية TV — تطبيق Android الرسمي للقناة الوطنية الجزائرية

يوفّر التطبيق الوصول إلى أرشيف البرامج، الأخبار، المواقع والصفحات الرسمية، وإعدادات المستخدم. يستخدم البث المباشر رابط HLS الرسمي الأساسي عند توفر المصدر، مع عدم ادعاء وجود رابط احتياطي خارجي غير معتمد.

✨ المميزات الحالية:
📂 أرشيف البرامج والبحث والفلترة
🔔 تنبيهات ومحتوى إخباري عند توفره
🌐 تصفح المواقع الإخبارية الرسمية
📱 صفحات الوسائط الاجتماعية الرسمية للقناة
🎥 قناة YouTube الرسمية
⚙️ وضع ليلي وإعدادات قابلة للتخصيص
📤 مشاركة المحتوى بسهولة

ملاحظة مهمة: لا يضمن التطبيق بثاً HD أو بثاً متواصلاً 24/7. جودة البث وتوفره يعتمدان على المصدر الرسمي، ولا يوجد رابط احتياطي خارجي معتمد حالياً.

📞 للتواصل: contact@elwataniatv.dz
🌐 الموقع: https://elwataniatv.dz
```

### نص إنجليزي (للوصول الدولي)

**Short description**:
```
Algerian National TV app: archive, news, official links, and live when enabled
```

**Full description**:
```
📺 Elwataniatv TV — The official Android app for Algeria's National TV channel

Access the channel's program archive, news, official websites and social pages, plus user settings. The live screen uses the official primary HLS stream when available; no unapproved external backup stream is advertised.

✨ Current features:
📂 Program archive with search and filtering
🔔 Notifications and news content when available
🌐 Official news websites
📱 Official social media pages
🎥 Official YouTube channel
⚙️ Dark mode and customizable settings
📤 Easy content sharing

Important: the app does not promise HD or continuous 24/7 streaming. Stream availability and quality depend on the official source, and no unapproved external backup stream is advertised.

📞 Contact: contact@elwataniatv.dz
🌐 Website: https://elwataniatv.dz
```

### الأيقونة (Icon)
- الأيقونة الرسمية موجودة في `store-assets/icon-512.png` بمقاس 512×512، والنسخة الكبيرة في `store-assets/icon-1024.png`. راجع الشعار قبل الرفع ولا تستبدله بملف placeholder.

### Feature Graphic
- `store-assets/feature-graphic.png` موجودة بمقاس 1024×500.
- راجعها قبل الرفع وتأكد من أنها تمثل التطبيق الفعلي ولا توحي ببث HD أو بث دائم.

### Screenshots (مطلوبة قبل الإرسال)
- لا توجد لقطات Store Listing محفوظة حالياً في المستودع.
- توصي متطلبات Play الحالية بلقطتين على الأقل عبر أنواع أجهزة مختلفة؛ راجع متطلبات الفئات والأبعاد التي يعرضها Play Console عند الرفع.
- التقط الصور من الإصدار الحقيقي، ولا تستخدم mockups مضللة أو تعرض بثاً غير متاح على أنه يعمل.
- أمثلة: البث، الأرشيف، الأخبار، والمواقع. أضف وصفاً بديلاً واضحاً لكل لقطة.

### فيديو ترويجي (اختياري)
أضفه فقط إذا كان يعرض وظائف موجودة فعلاً في الإصدار، ومن دون ادعاءات عن توفر البث أو جودته لا يمكن التحقق منها.

---

## ٥. تصنيفات التطبيق

### Category
- **Application category**: `News & Magazines`
- **Tags**: `News`, `Live TV`, `Streaming`

### Content Rating (مهم — يجب إكماله للنشر)
1. اضغط **Content rating → Start questionnaire**
2. أجب على الأسئلة بصدق:
   - **Email**: contact@elwataniatv.dz
   - **Category**: News
   - **Violence**: لا (إلا إذا كانت الأخبار تحوي عنفاً صريحاً → اختر مناسب)
   - **Sexual content**: لا
   - **Profanity**: لا
   - **Drugs**: لا
   - **Gambling**: لا
   - **User-generated content**: نسخة Release تعطل التعليقات العامة (`PUBLIC_COMMENTS_ENABLED=false`). لا تفعّلها في Play قبل إضافة شروط وموافقة، وإبلاغ عن المحتوى والمستخدمين، وحظر المستخدمين، ومراجعة مستمرة وفق [سياسة Google Play للمحتوى الذي ينشئه المستخدمون](https://support.google.com/googleplay/android-developer/answer/9876937).
   - **Location sharing**: لا
3. توقّع التصنيف: `Everyone` أو `Teen`

### Target audience
- **Age groups**: `13+` (لا تختر "للأطفال" إلا إذا كنت تتبع COPPA)

- **Privacy policy**:
- استخدم رابط سياسة الخصوصية التشغيلي المتحقق: `https://elwataniatvapp.web.app/privacy`
- المصدر النصي الموحد هو `privacy.html`، وتلخصه النسخة العربية `PRIVACY_POLICY_AR.md`.

### Data safety
أكمل النموذج بصدق وفق إعدادات الإصدار المنشور فعلياً:
- **Data collected**: معرّف Firebase مجهول، معرّف تثبيت الجهاز، توكن FCM عند تفعيل الإشعارات، بيانات تقنية لازمة للتشغيل، وملاحظات خاصة يرسلها المستخدم. التعليقات العامة معطّلة في Release؛ أعد تدقيق Data Safety إذا أُعيد تفعيلها.
- **Data shared with third parties**: تُعالج بعض البيانات عبر Google Firebase لتوفير المصادقة وFirestore وFCM؛ راجع سياسة الخصوصية قبل الإقرار النهائي.
- **Data is encrypted in transit**: ✅ نعم حيث يدعم المصدر HTTPS/TLS.
- **Users can request data deletion**: ✅ نعم عبر contact@elwataniatv.dz، مع توضيح نطاق الحذف في نموذج Play.

---

## ٦. بناء ورفع AAB Android

هذا المستودع تطبيق Android أصلي مبني بـ Kotlin وJetpack Compose؛ شغّل Gradle من جذر المستودع:

```bash
./gradlew bundleRelease
# ينتج: app/build/outputs/bundle/release/app-release.aab
```

مرشح الاختبار `8.6.4` (`versionCode 42`) يُبنى من المصدر ويُوقّع بمفتاح الرفع الجديد الموجود خارج المستودع. تحقق من توقيع AAB ومن أن `42` أعلى من الإصدار المسجل في Play Console؛ لا ترفع قبل قبول إعادة ضبط مفتاح الرفع. لا تستخدم APK Debug كتحديث للإصدار المنشور.

### رفع الـ AAB
1. **Play Console → Release → Production → Create new release**
2. اضغط **Upload** وارفع `app-release.aab`
3. **Release name**: استخدم `versionName` و`versionCode` اللذين تم التحقق منهما في Play Console؛ لا تفترض رقماً من هذا الدليل.
4. **Release notes** (يظهر للمستخدمين عند التحديث):
   ```
   ✨ تحديث الوطنية TV:
   - أرشيف وبرامج مع بحث وفلترة
   - تحسينات في الإشعارات والإعدادات
   - شاشة بث تُفعّل عند توفر رابط رسمي
   ```

⚠️ مفتاح الرفع لا يساوي مفتاح توقيع التطبيق. احتفظ بالـkeystore وكلمتي المرور في مدير كلمات مرور مع نسخة احتياطية مشفّرة؛ لا ترفعها إلى GitHub أو إلى لوحة Firebase أو إلى صفحة تنزيل عامة.

---

## ٧. تجربة داخلية (Internal Testing)

قبل النشر للجمهور، جرّب على دائرتك:

1. **Play Console → Internal testing → Create new release**
2. ارفع AAB
3. أضف **testers** (إيميلاتهم)
4. شارك رابط الاختبار معهم
5. اطلب تقييمات وملاحظات
6. صحّح الأخطاء قبل النشر العام

---

## ٨. النشر للجمهور

1. **Production → Create new release**
2. ارفع AAB (نفس النسخة من Internal testing إذا سار جيداً)
3. اضغط **Review release**
4. تأكّد من أن جميع الأقسام مكتملة (✅ خضراء)
5. اضغط **Start rollout to production**

⏱️ **مدة المراجعة**: عادة 1-7 أيام (أحياناً أقصر للتطبيقات الموثقة)

---

## ٩. بعد النشر

### المراقبة
- **Statistics**: تثبيتات، إلغاءات، تقييمات
- **Crashes & ANRs**: راقب Android Vitals وحدود Play Console الحالية، وأصلح الأعطال قبل التوسع.
- **Reviews**: ردّ بوضوح واحترام؛ لا تعد المستخدمين بميزات غير موجودة.

### التحديثات
كل تحديث:
1. ارفع `versionCode` و`versionName` في `app/build.gradle.kts`.
2. أعد البناء: `./gradlew bundleRelease` بعد توفير توقيع release خارج المستودع.
3. ارفع AAB الجديد عبر **Production → Create new release**

### الترويج
- ✅ **رابط مباشر**: `https://play.google.com/store/apps/details?id=com.elwataniatv.app`
- ✅ **Badge HTML** للموقع: [play.google.com/intl/en_us/badges](https://play.google.com/intl/en_us/badges/)
- ✅ **شارك على وسائل التواصل** (Facebook، Instagram، Twitter)
- ✅ **اعرض في القناة** (banner أو شاشة OBT)

---

## ١٠. ASO (App Store Optimization)

لزيادة تنزيلات التطبيق:

### كلمات مفتاحية (في الوصف العربي)
- البث المباشر، قناة الوطنية، تلفزيون الجزائر، أخبار عاجلة، الجزيرة، الجزائر، تلفزيون مباشر، live tv

### تشجيع التقييمات
- اطلب من المشاهدين تقييم التطبيق بعد فتحه 5 مرات (يمكن إضافة هذه الميزة لاحقاً)
- ردّ على كل تقييم — حتى السلبية (يظهر للمستخدمين الجدد)

### تحديثات مدروسة
أصدر تحديثاً عند وجود إصلاحات أو تحسينات مفيدة ومختبرة. لا تنشر تحديثات شكلية لمجرد زيادة عدد الإصدارات.

---

## ١١. مشاكل شائعة وحلولها

| المشكلة | الحل |
|--------|------|
| **مصادقة Firebase لا تعمل** | فعّل Anonymous Auth في Firebase production وتأكد من وجود `google-services.json` الصحيح؛ التطبيق لا يستخدم Google Sign-In. |
| **رفض ملف الإصدار** | ابنِ `bundleRelease` من جذر المستودع وارفع AAB موقّعاً من الإصدار الحالي |
| **"App is not optimized for tablets"** | راجع التحذير على أجهزة فعلية؛ هذا المستودع يخص تطبيق Android فقط |
| **"Privacy policy required"** | استخدم `https://elwataniatvapp.web.app/privacy` بعد التحقق من HTTP 200 |
| **"Target SDK does not meet the current Play requirement"** | المصدر الحالي يستخدم `targetSdk = 36`؛ تحقق من الموعد والحد المطلوبين حالياً في Play Console |
| **"Use Play App Signing"** | اقبل — Google يحفظ المفتاح بأمان |
| **رفض المراجعة بسبب "spammy content"** | راجع وصف المتجر، أزل التكرار، استعمل وصفاً طبيعياً |
| **"Misleading icon"** | الأيقونة يجب أن تعكس محتوى التطبيق فعلياً |

---

## ١٢. ملحق: تحديثات لاحقة

### إضافة Firebase Analytics (اختياري، بعد قرار المنتج)
1. اتبع `FIREBASE_SETUP.md`.
2. ضع `google-services.json` الصحيح في مسار Android المخصص له، ولا ترفعه إذا كان يحتوي أسرار بيئة غير مناسبة.
3. أضف اعتماد Android/Firebase الرسمي فقط إلى Gradle بعد مراجعة سياسة الخصوصية.
4. أعد تشغيل اختبارات Gradle ثم ابنِ الإصدار.

### إضافة AdMob (اختياري، خارج نطاق الإصدار الحالي)
لا تضف SDK أو إعلانات إلى هذا الإصدار دون قرار منتج ومراجعة Data safety وسياسة الخصوصية.

### إضافة Push Notifications (Firebase Cloud Messaging)
- جاهز في الكود! فقط أكمل إعداد Firebase
- ادفع إشعارات من Firebase Console أو من لوحة admin

---

## ١٣. روابط مفيدة

- 📖 [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- 📖 [Android App Bundle](https://developer.android.com/guide/app-bundle)
- 📖 [Android Developer Distribution Agreement](https://play.google.com/about/developer-distribution-agreement.html)
- 🛠️ [Play Console Best Practices](https://developer.android.com/distribute/best-practices)
- 📊 [Firebase Console](https://console.firebase.google.com)
- 💰 [AdMob](https://admob.google.com)

---

## ١٤. خلاصة الـ checklist السريع

قبل ضغط "Start rollout":

- [ ] حساب Play Console مفعّل والتحقق المطلوب مكتمل
- [ ] بحثت عن `com.elwataniatv.app` واستخدمت الإدراج القائم أو أنشأت إدراجاً واحداً إذا لم يوجد
- [ ] أكملت Store listing (نص عربي + إنجليزي)
- [ ] رفعت أيقونة 512×512
- [ ] رفعت Feature Graphic 1024×500
- [ ] رفعت لقطات فعلية تحقق الحد الأدنى ومتطلبات أنواع الأجهزة التي يعرضها Play Console
- [ ] أكملت Content rating
- [ ] أكملت Target audience
- [ ] رفعت Privacy Policy URL
- [ ] أكملت Data safety form
- [ ] اجتاز AAB اختبار Internal testing قبل أي نشر إنتاجي
- [ ] كتبت Release notes
- [ ] خزّنت مواد التوقيع ونسخة keystore خارج المستودع في مكان آمن
- [ ] تحققت من رابط البث الرسمي الحقيقي على جهاز فعلي
- [ ] تحققت من Firebase production والقواعد المنشورة والخدمات المطلوبة فعلياً
- [ ] جرّبت Internal testing مع 5+ أشخاص
- [ ] ضغطت "Start rollout to production"
- [ ] تابعت حالة المراجعة ورسائل Play Console حتى اكتمال النشر

لا تعتبر النشر مكتملاً إلا بعد موافقة Play Console وظهور الإدراج فعلياً في البلدان المستهدفة.
