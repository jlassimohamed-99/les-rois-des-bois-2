# إعداد ملف البيئة (.env)

قم بإنشاء ملف `.env` في مجلد `backend/` مع المحتوى التالي:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/les-rois-des-bois
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

## شرح المتغيرات:

- **PORT**: منفذ تشغيل الخادم (افتراضي: 5000)
- **MONGODB_URI**: رابط اتصال MongoDB
  - محلي: `mongodb://localhost:27017/les-rois-des-bois`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/les-rois-des-bois`
- **JWT_SECRET**: مفتاح سري لتوقيع JWT (يجب تغييره في الإنتاج)
- **JWT_EXPIRE**: مدة صلاحية JWT (افتراضي: 7 أيام)
- **NODE_ENV**: بيئة التشغيل (development/production)

## ملاحظات:

⚠️ **مهم:** لا ترفع ملف `.env` إلى Git! فهو موجود في `.gitignore`

