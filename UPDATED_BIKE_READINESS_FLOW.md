# 🔄 Updated Bike Readiness Flow

## Changes Made

The bike readiness checklist has been completely redesigned to show **problems/issues** when "Not Ready" is selected.

---

## ✅ New Flow

### **When Rider Clicks "Ready":**
1. No checklist appears
2. Status immediately set to READY
3. Rider goes **ONLINE** (green badge)
4. Can receive new orders
5. Button says "Go Online"

### **When Rider Clicks "Not Ready":**
1. **Problem checklist appears** with 6 issues:
   - ❌ Battery low
   - ❌ Brakes are not working properly
   - ❌ Lights are non-functional
   - ❌ Tires are in bad shape
   - ❌ Don't have safety helmet
   - ❌ Bad safety helmet

2. **Must select at least one problem**
   - Cannot save without selecting issues
   - Error shows if no problems selected

3. **Confirmation dialog appears:**
   - Shows number of issues selected
   - Warns about going offline

4. **Status set to NOT READY:**
   - Rider goes **OFFLINE** (red badge)
   - Cannot receive new orders
   - Button says "Save & Go Offline"

5. **Problems saved to database:**
   - Records which issues were selected
   - Timestamp of when reported
   - Type marked as "problems"

---

## 📱 Profile Screen Updates

### **Online Status (Green):**
```
┌─────────────────────────────┐
│ 🚲  Rider Status            │
│     Flexyfuel Partner       │
│                   [ONLINE]  │ ← Green badge
└─────────────────────────────┘
```

### **Offline Status (Red):**
```
┌─────────────────────────────┐
│ 🚲  Rider Status            │
│     Flexyfuel Partner       │
│                  [OFFLINE]  │ ← Red badge
└─────────────────────────────┘

┌─────────────────────────────┐
│ ⚠️ You're Currently Offline │
│    Update your bike status  │
│    to start receiving       │
│    orders                   │
│                             │
│  [Update Bike Status]       │
└─────────────────────────────┘
```

---

## 🗂️ Database Schema

### Data Stored in `safetyChecklist` (JSON field):

**When Ready:**
```json
{
  "type": "ready",
  "items": [],
  "timestamp": "2026-02-10T13:30:00.000Z",
  "bikeReady": true
}
```

**When Not Ready:**
```json
{
  "type": "problems",
  "items": [
    "battery_low",
    "brakes_bad",
    "no_helmet"
  ],
  "timestamp": "2026-02-10T13:30:00.000Z",
  "bikeReady": false
}
```

---

## 🎯 Problem Items

| ID | Label | Icon |
|---|---|---|
| `battery_low` | Battery low | battery-dead |
| `brakes_bad` | Brakes are not working properly | hand-left |
| `lights_bad` | Lights are non-functional | bulb-outline |
| `tires_bad` | Tires are in bad shape | disc |
| `no_helmet` | Don't have safety helmet | shield-outline |
| `bad_helmet` | Bad safety helmet | shield-half-outline |

---

## 🔄 Complete User Flow

### **Scenario 1: Rider is Ready**
```
1. Open app
2. Go to Profile
3. Click "Bike Safety Check"
4. Click "Ready" card
5. Green info box appears: "Your bike is ready!"
6. Click "Go Online"
7. ✅ Status: ONLINE (green)
8. Can receive orders
```

### **Scenario 2: Rider Has Issues**
```
1. Open app
2. Go to Profile → Shows "OFFLINE" in red
3. Click "Update Bike Status" button
4. Click "Not Ready" card
5. Problem checklist appears
6. Select issues (e.g., Battery low, No helmet)
7. Red warning box appears
8. Click "Save & Go Offline"
9. Confirmation: "You have selected 2 issue(s)"
10. Click "Confirm"
11. ✅ Status: OFFLINE (red)
12. Cannot receive orders
13. Profile shows warning card
```

### **Scenario 3: Rider Fixes Issues**
```
1. Fix bike issues (charge battery, get helmet, etc.)
2. Open app
3. Profile shows "OFFLINE" with warning
4. Click "Update Bike Status"
5. Click "Ready" card
6. Click "Go Online"
7. ✅ Status: ONLINE (green)
8. Warning disappears from profile
9. Can receive orders again
```

---

## 🧪 Testing

### **Test Ready Status:**
```bash
1. Open bike readiness screen
2. Click "Ready" card
   → Should NOT show any checklist
   → Green info box appears
3. Click "Go Online"
   → Should succeed immediately
4. Check profile
   → Should show "ONLINE" in green
   → No warning card
5. Check backend logs
   → "Rider ... is now READY and ONLINE"
6. Check database
   → bikeReady: true
   → isAvailable: true
   → safetyChecklist.type: "ready"
```

### **Test Not Ready Status:**
```bash
1. Open bike readiness screen
2. Click "Not Ready" card
   → Problem checklist should appear
3. Try clicking "Save & Go Offline" without selecting problems
   → Should show error: "Please select at least one issue"
4. Select 2-3 problems (e.g., Battery low, No helmet)
5. Click "Save & Go Offline"
   → Confirmation dialog appears
   → Shows "You have selected 2 issue(s)"
6. Click "Confirm"
   → Should succeed
7. Check profile
   → Should show "OFFLINE" in red
   → Red warning card appears
8. Check backend logs
   → "Rider ... is NOT READY and OFFLINE - Issues: battery_low, no_helmet"
9. Check database
   → bikeReady: false
   → isAvailable: false
   → safetyChecklist.items: ["battery_low", "no_helmet"]
```

### **Test Status Persistence:**
```bash
1. Set status to "Not Ready"
2. Close app completely
3. Reopen app
4. Go to Profile
   → Should still show "OFFLINE"
5. Go to Bike Readiness
   → Status should still be "Not Ready"
```

---

## 🎨 Visual Indicators

### **Ready Status:**
- ✅ Green checkmark icon
- ✅ "Ready" text
- ✅ Green background on selected card
- ✅ Green info box
- ✅ "Go Online" button (primary)
- ✅ Profile badge: ONLINE (green)

### **Not Ready Status:**
- ❌ Red X icon
- ❌ "Not Ready" text
- ❌ Red background on selected card
- ❌ Red problem checklist
- ❌ Red warning box
- ❌ "Save & Go Offline" button (outline)
- ❌ Profile badge: OFFLINE (red)
- ❌ Profile warning card

---

## 📊 Backend Logs

### **When Going Online:**
```
✅ Rider abc123 is now READY and ONLINE
PATCH /api/v1/riders/bike-ready 200
```

### **When Going Offline:**
```
❌ Rider abc123 is NOT READY and OFFLINE - Issues: battery_low, brakes_bad
PATCH /api/v1/riders/bike-ready 200
```

---

## ✅ Benefits of New Flow

1. **Clearer Intent:**
   - "Ready" = No issues, good to go
   - "Not Ready" = Has specific problems

2. **Better Tracking:**
   - Know exactly what's wrong with bikes
   - Can analyze common issues
   - Help riders maintain bikes

3. **Simpler Ready Flow:**
   - No checklist when everything is fine
   - Faster to go online

4. **Forced Problem Reporting:**
   - Can't go offline without saying why
   - Better data for management

5. **Visual Feedback:**
   - Profile clearly shows online/offline
   - Warning when offline
   - Easy to fix and go back online

---

## 🔄 Migration Notes

### **Old Checklist (Removed):**
```
✅ Battery is sufficiently charged
✅ Brakes are working properly
✅ Lights are functional
✅ Tires are in good condition
✅ Have safety helmet
```

### **New Problem List (Added):**
```
❌ Battery low
❌ Brakes are not working properly
❌ Lights are non-functional
❌ Tires are in bad shape
❌ Don't have safety helmet
❌ Bad safety helmet
```

### **Behavior Change:**
- **Before:** Must check all items before any status selection
- **After:**
  - Ready → No checklist
  - Not Ready → Must select problems

---

**Status:** ✅ Fully Implemented
**Version:** 2.0
**Date:** 2026-02-10
