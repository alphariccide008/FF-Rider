# 🗺️ Google Maps API Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "FlexyFuel-Rider"
4. Click "Create"

## Step 2: Enable Required APIs

In your Google Cloud Console:

1. Go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - ✅ **Maps SDK for Android**
   - ✅ **Maps SDK for iOS**
   - ✅ **Geolocation API**
   - ✅ **Directions API** (optional, for route optimization)
   - ✅ **Distance Matrix API** (optional, for ETA calculations)

## Step 3: Create API Keys

### Create Android API Key:

1. Go to **APIs & Services** → **Credentials**
2. Click "**+ CREATE CREDENTIALS**" → "**API key**"
3. A key will be generated
4. Click "**Restrict Key**" to secure it
5. In "Application restrictions":
   - Select "**Android apps**"
   - Click "**+ Add an item**"
   - Package name: `com.flexyfuel.rider`
   - SHA-1 certificate fingerprint: (see below how to get it)
6. In "API restrictions":
   - Select "**Restrict key**"
   - Check "**Maps SDK for Android**"
7. Click "**Save**"

### Get SHA-1 Fingerprint (Android):

**For Debug builds:**
```bash
cd android
./gradlew signingReport
```
Look for the SHA1 under "Variant: debug"

**For Release builds:**
```bash
keytool -list -v -keystore your-release-key.keystore
```

### Create iOS API Key:

1. Click "**+ CREATE CREDENTIALS**" → "**API key**"
2. Click "**Restrict Key**"
3. In "Application restrictions":
   - Select "**iOS apps**"
   - Click "**+ Add an item**"
   - Bundle ID: `com.flexyfuel.rider`
4. In "API restrictions":
   - Select "**Restrict key**"
   - Check "**Maps SDK for iOS**"
5. Click "**Save**"

## Step 4: Add Keys to Your App

Open `app.json` and add your keys:

```json
{
  "expo": {
    "android": {
      "package": "com.flexyfuel.rider",
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSy..."  ← Paste your Android API key here
        }
      }
    },
    "ios": {
      "bundleIdentifier": "com.flexyfuel.rider",
      "config": {
        "googleMapsApiKey": "AIzaSy..."  ← Paste your iOS API key here
      }
    }
  }
}
```

## Step 5: Rebuild Your App

After adding the keys, you **MUST rebuild** the app:

### For Android:
```bash
npx expo prebuild --clean
npx expo run:android
```

### For iOS:
```bash
npx expo prebuild --clean
npx expo run:ios
```

**Note:** `expo start` alone won't work - you need native rebuild!

## Step 6: Test the Integration

1. Open the app on your device/emulator
2. Grant location permissions when prompted
3. Accept an order and click "Start Trip"
4. The map should load showing:
   - Your current location
   - Customer delivery location
   - Route between them

## Common Issues & Solutions

### Issue: "Map doesn't load / shows blank screen"
**Solution:**
- Verify API keys are correct in `app.json`
- Make sure you rebuilt the app after adding keys
- Check if Maps SDK for Android/iOS is enabled in Google Cloud
- Verify bundle ID/package name matches your restrictions

### Issue: "Authorization failed"
**Solution:**
- Check SHA-1 fingerprint is correct for Android
- Ensure bundle ID matches for iOS
- Wait 5-10 minutes after creating keys (propagation delay)

### Issue: "This app is not authorized to use Google Maps"
**Solution:**
- Verify API key restrictions match your app
- For testing, temporarily remove restrictions
- Check billing is enabled on Google Cloud (required even for free tier)

## Important Notes

⚠️ **Billing Required**: Google Maps requires a billing account to be set up, even though you get $200 free credits per month. You won't be charged unless you exceed the free tier.

💰 **Free Tier Limits**:
- Up to 28,500 map loads per month (FREE)
- Most small to medium apps stay within free tier

🔒 **Security**:
- Always restrict your API keys
- Never commit unrestricted keys to public repositories
- Use different keys for development and production

## Testing Without Real API Keys

For local testing, you can use Google Maps URLs:
```typescript
// Already implemented in delivery-details.tsx
const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
Linking.openURL(url);
```

This opens Google Maps app without requiring API keys.

## Cost Estimation

For 1000 active riders with:
- 10 deliveries per day
- 30 location updates per delivery
- = 300,000 map loads/month

**Cost**: ~$400/month (after $200 free credit)

Most startups stay under free tier initially.

## Next Steps

After setup:
- [ ] Test on physical Android device
- [ ] Test on physical iOS device
- [ ] Test location tracking during delivery
- [ ] Verify customer tracking screen works
- [ ] Test admin dashboard with multiple riders

## Resources

- [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)
- [React Native Maps Docs](https://github.com/react-native-maps/react-native-maps)
- [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Need Help?** Check the [troubleshooting section](#common-issues--solutions) or contact support.
