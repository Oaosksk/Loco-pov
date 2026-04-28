# Quick Testing Guide

## 🔐 Testing Authentication

### Email/Password Signup
1. Open the app (not logged in)
2. Click "Sign up" at the bottom
3. Enter any email and password (min 6 characters)
4. Click "Create account"
5. Check your email for verification link
6. Click the link to verify
7. Return to app and log in

### Google OAuth
1. Click "Continue with Google"
2. Select your Google account
3. Grant permissions
4. You're logged in!

---

## 📝 Testing Notes Page

### Masonry Layout
1. Navigate to Notes page
2. Click "Folders" view
3. Observe varied container heights
4. Containers should have different sizes (24px, 28px, 32px, 36px, 40px)
5. Layout should look clustered and dynamic

---

## ⏰ Testing Reminders/Alarms

### Creating an Alarm
1. Navigate to Alarms & Reminders page
2. Click "+ Add" button (top right)
3. Select "Alarm"
4. Fill in:
   - Title: "Wake up"
   - Date: Tomorrow
   - Time: 1 minute from now (for testing)
   - Repeat: "Once" or "Weekdays"
5. Click "Done"
6. Alarm appears in list with alarm clock icon

### Creating a Reminder
1. Click "+ Add" button
2. Select "Reminder"
3. Fill in:
   - Title: "Call mom"
   - Note: "Discuss weekend plans"
   - Date: Today
   - Time: 2 minutes from now
5. Click "Done"
6. Reminder appears in list with bell icon

### Testing Toggle Switch
1. Find any alarm/reminder in the list
2. Click the toggle switch on the right
3. Switch should turn gray (OFF)
4. Card should become semi-transparent
5. Click again to turn back ON (green)

### Testing Settings Menu
1. Hover over any alarm/reminder card
2. Click the three-dot menu (appears on hover)
3. Settings sheet opens
4. Try different sounds:
   - Click "Beep" → Click speaker icon to preview
   - Click "Chime" → Preview
   - Click "Bell" → Preview
   - Click "Alert" → Preview
5. Click "Upload Custom Sound"
6. Select an audio file (MP3, WAV, etc.)
7. Custom audio appears in list
8. Click "Delete" to remove the alarm/reminder

### Testing Notifications

**For Alarms**:
1. Create an alarm for 1 minute from now
2. Wait for the alarm to trigger
3. Should see full-screen notification with:
   - Large alarm icon
   - Current time display
   - Alarm title
   - "Dismiss" button
4. Click "Dismiss" to stop

**For Reminders**:
1. Create a reminder for 1 minute from now
2. Wait for reminder to trigger
3. Should see popup notification (top-right) with:
   - Bell icon
   - Reminder title and note
   - "Remind in 10 mins" button
   - "Got it" button
4. Click "Remind in 10 mins" to snooze
5. Notification will reappear after 10 minutes
6. If you miss it, it will show 3 times at 5-minute intervals

### Testing Sorting
1. Create multiple alarms/reminders with different times
2. They should appear sorted by time (earliest first)
3. Alarms section appears first
4. Reminders section appears second
5. Within each section, sorted by trigger time

---

## 🎵 Testing Audio

### Default Tones
1. Open settings for any alarm/reminder
2. Click speaker icon next to each tone
3. Should hear distinct sounds:
   - Beep: High-pitched (880 Hz)
   - Chime: Mid-tone (523 Hz)
   - Bell: Pleasant (659 Hz)
   - Alert: Urgent (1047 Hz)

### Custom Audio
1. Click "Upload Custom Sound"
2. Select an MP3 or WAV file
3. File should appear as "Custom Audio"
4. Select it and save
5. When alarm/reminder triggers, your audio plays

---

## 🐛 Troubleshooting

### Notifications Not Showing
- Check browser notification permissions
- Go to browser settings → Site settings → Notifications
- Ensure "Allow" is selected for your app

### Audio Not Playing
- Check browser audio permissions
- Ensure device volume is not muted
- Try clicking on the page first (some browsers require user interaction)

### Verification Email Not Received
- Check spam folder
- Wait a few minutes (can take up to 5 minutes)
- Try signing up again with a different email

### Toggle Switch Not Working
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

---

## ✅ Expected Behavior

### Authentication
- ✅ Any email can sign up
- ✅ Verification email sent automatically
- ✅ Google OAuth works
- ✅ Clear error messages

### Notes
- ✅ Varied container heights
- ✅ Masonry layout
- ✅ All features work

### Reminders/Alarms
- ✅ Type selection appears
- ✅ Toggle switch works
- ✅ Settings menu opens
- ✅ Sounds play
- ✅ Custom audio uploads
- ✅ Sorted by time
- ✅ Notifications trigger
- ✅ Snooze works

---

## 📱 Mobile Testing

1. Open app on mobile device
2. Test all features above
3. Notifications should work in PWA mode
4. Toggle switches should be touch-friendly
5. Full-screen alarm notification should cover entire screen

---

## 🚀 Quick Test Scenario

**5-Minute Full Test**:
1. Sign up with new email (1 min)
2. Create 2 folders in Notes (1 min)
3. Create 1 alarm for 2 minutes from now (30 sec)
4. Create 1 reminder for 3 minutes from now (30 sec)
5. Toggle one OFF and back ON (10 sec)
6. Open settings and preview sounds (30 sec)
7. Wait for notifications to trigger (2-3 min)
8. Test snooze and dismiss (30 sec)

**Total Time**: ~5 minutes
**Result**: All major features tested ✅

---

## 📞 Need Help?

If something doesn't work:
1. Open browser console (F12)
2. Look for error messages
3. Take a screenshot
4. Note the steps to reproduce
5. Check IMPLEMENTATION_SUMMARY.md for details
