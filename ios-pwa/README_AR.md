# نسخة iPhone — الوطنية TV

هذا مجلد تطبيق ويب تقدّمي (PWA) يعمل من Safari ويمكن إضافته إلى الشاشة الرئيسية على iPhone. **ليس تطبيق iOS أصلياً ولا ملف IPA، ولم يُنشر في App Store.** استخدام PWA هو المسار العملي الآن لمشاركة مصدر Firebase وبيانات البث مع Android دون تعريض مشروع Android لتغييرات كبيرة.

## ما يتضمنه

- واجهة عربية RTL متجاوبة مع شاشة iPhone، ومشغّل Safari الأصلي لتدفقات HLS وروابط YouTube المسموح بها.
- قراءة قنوات البث النشطة من مجموعة Firestore العامة `streams` فقط؛ لا تُستخدم بيانات اعتماد Admin ولا يُسمح بالكتابة.
- معالجة آمنة لروابط البث والشعارات وتضمين YouTube.
- manifest وأيقونات iPhone وService Worker يخزّن محلياً ملفات الواجهة وتهيئة Firebase العامة لتشغيل الغلاف عند انقطاع الشبكة؛ لا تُخزّن أسماء القنوات أو روابط البث دون اتصال.
- تهيئة Firebase Web العامة تُحقن عند بناء Hosting في `admin/hosting-dist/ios/config.js`، ولا تُحفظ في المصدر أو المستودع؛ لا تُستخدم مفاتيح Firebase Admin مطلقاً في المتصفح.

## البناء والاختبار

من جذر المشروع:

```sh
node --test ios-pwa/tests/core.test.js
bash scripts/check-security-contracts.sh
node scripts/build-hosting.js
```

يُبنى المسار محلياً تحت `admin/hosting-dist/ios/`. يحتاج البناء إلى إعداد Firebase Web المحلي المستثنى من Git، ويُبقي صفحة التنزيل العامة الحالية دون تغيير.

## تثبيته على iPhone

بعد نشر Hosting بموافقة مالك المشروع، افتح `https://elwataniatvapp.web.app/ios/` في Safari، ثم استخدم **مشاركة → إضافة إلى الشاشة الرئيسية**. التشغيل يتطلب اتصال الإنترنت؛ قد يختلف دعم بعض روابط HLS أو YouTube باختلاف البلد ومصدر البث.

## الانتقال إلى App Store

يتطلب تطبيقاً أصلياً منفصلاً في Swift/SwiftUI أو مشروعاً متعدد المنصات، وجهاز macOS يعمل بإصدار Xcode المطلوب، وحساب Apple Developer، واختبار التوقيع ورفع نسخة TestFlight. صفحة PWA وحدها لا تنتج IPA ولا تكفي لإرسال تطبيق إلى App Store.
