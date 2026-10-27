# تجهيز رفع الوطنية TV إلى Google Play

مرشح البناء الحالي: `8.6.4`، `versionCode 42`، الحزمة `com.elwataniatv.app`، و`targetSdk 36`.

## مفتاح الرفع الجديد

لم يُعثر على المفتاح القديم. أُنشئ مفتاح **Upload key** جديد وشهادته في `Projects/apkwatia/release-signing/`. ملف `upload_certificate.pem` شهادة عامة؛ ملف JKS وكلمة مروره خاصّان ولا يدخلان المستودع.

- **إذا كان هذا أول إصدار لهذا التطبيق في Play Console** ولم يوجد سجل سابق لهذا المعرّف: أنشئ الإدراج مرة واحدة، ثم استخدم المفتاح الجديد عند إعداد Play App Signing.
- **إذا كان التطبيق موجوداً وPlay App Signing مفعّلاً**: من صفحة **App integrity** اطلب **Upload key reset**، وارفع `upload_certificate.pem`. انتظر موافقة Google قبل رفع AAB الموقع بهذا المفتاح.
- **إذا كان هناك إصدار منشور من دون Play App Signing**: لا تستبدل مفتاحه بالمفتاح الجديد؛ يلزم المفتاح الأصلي أو قرار من دعم Play Console. لا تغيّر `applicationId` ولا تنشئ إدراجاً مكرراً قبل حسم حالة الحساب.

الحزمة الحالية `Projects/apkwatia/releases/ElWataniaTV-v8.6.4-release-upload-signed-42.aab` موقّعة ومتحققة محلياً. ارفعها إلى **Internal testing** فقط بعد حسم الحالة أعلاه والتأكد أن `versionCode 42` أعلى من الموجود في Play Console. لم أرفعها إلى Play Console.

إعادة ضبط Upload key لا تغيّر مفتاح التطبيق الذي تستخدمه Google لتوقيع النسخ الموزعة. احفظ نسخة احتياطية ثانية من JKS وكلمة مروره في مكان آمن خارج الجهاز والمستودع.

## تحقق ما قبل الرفع

- تأكد أن أعلى `versionCode` في Play Console أقل من `42`. لا تعتمد على رقم المستودع أو صفحة التحميل وحدها.
- يحقق `targetSdk 36` شرط Google Play للتطبيقات الجديدة والتحديثات الهاتفية اعتباراً من 31 أغسطس 2026.
- استخدم **AAB موقّعاً** لا APK debug. التوقيع بالـUpload key لا يجعل APK المباشر قابلاً لتحديث نسخة Play؛ Google تعيد توقيع ما توزعه بمفتاح التطبيق.
- ارفع أولاً إلى **Internal testing**، وثبّت النسخة من Play على BlueStacks 5 وجهاز Android فعلي، واختبر الصوت والصورة وتبديل القنوات والإشعارات والتدوير والعودة من الخلفية.
- التقط لقطات شاشة حقيقية من النسخة النهائية؛ يطلب Play لقطتين على الأقل عبر أنواع أجهزة مختلفة. لا توجد لقطات Store Listing أصلية بعد. راجع [متطلبات صور المتجر](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).
- راجع سياسة الخصوصية، Data safety، تصنيف المحتوى، الجمهور المستهدف، وإقرار الإعلانات بحسب السلوك الفعلي في النسخة المرفوعة.
- لا تحدّث صفحة التنزيل العامة قبل نجاح الاختبار الداخلي والتأكد من توقيع التحديث.

## إنشاء AAB بعد الموافقة

وفّر القيم التالية محلياً أو في أسرار بيئة بناء محمية؛ لا تضعها في Git:

- `RELEASE_STORE_FILE`: مسار ملف JKS.
- `RELEASE_STORE_PASSWORD`: كلمة مرور المخزن.
- `RELEASE_KEY_ALIAS`: `watania-upload`.
- `RELEASE_KEY_PASSWORD`: كلمة مرور المفتاح.

ثم نفّذ `./gradlew bundleRelease`. بناء Release الآن يرفض الإخراج إذا غابت بيانات التوقيع أو لم يوجد ملف JKS، لتجنب إنشاء AAB غير صالح ورفعه بالخطأ.

المراجع الرسمية: [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756) · [متطلبات مستوى API](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
