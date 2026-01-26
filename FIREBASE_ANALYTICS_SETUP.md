# 📊 Firebase Analytics Setup untuk Next.js

## ✅ Environment Variables Sudah Cukup

Environment variable yang diperlukan untuk Firebase Analytics **sudah ada**:

```env
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-7NBLHP2WS4
```

## 🔧 Setup yang Sudah Diterapkan

File `src/lib/firebase/config.js` sudah di-update untuk mendukung Firebase Analytics dengan cara yang benar untuk Next.js:

### ✅ Yang Sudah Benar:

1. ✅ `measurementId` sudah ada di `firebaseConfig`
2. ✅ Analytics diinisialisasi hanya di **client-side** (browser)
3. ✅ Check `typeof window !== 'undefined'` untuk memastikan hanya jalan di browser
4. ✅ Check `isSupported()` untuk memastikan Analytics didukung
5. ✅ Export `analytics` untuk digunakan di components

## 📝 Cara Menggunakan Analytics di Component

### Method 1: Langsung Import (Recommended)

```javascript
'use client'  // Pastikan component adalah client component

import { analytics } from '@/lib/firebase/config';
import { logEvent } from 'firebase/analytics';

function MyComponent() {
  const handleClick = () => {
    if (analytics) {
      logEvent(analytics, 'button_click', {
        button_name: 'subscribe'
      });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Method 2: Dynamic Import (Jika perlu lazy load)

```javascript
'use client'

import { useEffect } from 'react';
import { app } from '@/lib/firebase/config';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

function MyComponent() {
  useEffect(() => {
    // Initialize analytics on client-side only
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          const analytics = getAnalytics(app);
          logEvent(analytics, 'page_view', {
            page_path: window.location.pathname
          });
        }
      });
    }
  }, []);

  return <div>My Component</div>;
}
```

### Method 3: Custom Hook (Recommended untuk reusability)

Buat file `src/hooks/useAnalytics.js`:

```javascript
'use client'

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase/config';
import { logEvent } from 'firebase/analytics';

export function useAnalytics() {
  const trackEvent = (eventName, eventParams) => {
    if (analytics && typeof window !== 'undefined') {
      logEvent(analytics, eventName, eventParams);
    }
  };

  const trackPageView = (pagePath) => {
    trackEvent('page_view', {
      page_path: pagePath || window.location.pathname
    });
  };

  return { trackEvent, trackPageView };
}
```

Gunakan di component:

```javascript
'use client'

import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView();
  }, []);

  const handlePurchase = () => {
    trackEvent('purchase', {
      value: 100,
      currency: 'USD'
    });
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

## ⚠️ Important Notes untuk Next.js

1. **Analytics HANYA untuk Client-Side**
   - ❌ Tidak bisa digunakan di Server Components
   - ❌ Tidak bisa digunakan di Server Actions
   - ✅ Hanya bisa digunakan di Client Components (`'use client'`)

2. **Check `typeof window !== 'undefined'`**
   - Next.js melakukan SSR, jadi `window` tidak tersedia di server
   - Selalu check sebelum menggunakan Analytics

3. **Measurement ID sudah cukup**
   - Tidak perlu environment variable tambahan
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` sudah ada di config

## ✅ Checklist

- [x] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` sudah ada di environment variables
- [x] Analytics sudah diinisialisasi di `config.js` (client-side only)
- [ ] Import dan gunakan `analytics` di components yang memerlukan tracking
- [ ] Test Analytics di browser (check Network tab untuk requests ke Google Analytics)

## 🔍 Verifikasi Analytics Berjalan

1. Buka browser DevTools (F12)
2. Tab **Network**
3. Filter: `analytics` atau `collect`
4. Refresh halaman
5. Seharusnya ada request ke `https://www.google-analytics.com/g/collect`

Atau cek di Firebase Console:
- Buka: https://console.firebase.google.com/project/crm-pt-rad/analytics
- Lihat **Realtime** events

## 📚 Referensi

- [Firebase Analytics Docs](https://firebase.google.com/docs/analytics)
- [Firebase Analytics for Web](https://firebase.google.com/docs/analytics/get-started?platform=web)
- [Next.js Analytics Setup](https://firebase.google.com/docs/analytics/get-started?platform=web#next.js)






