# FastLane Deployment Guide

## ✅ Pre-Deployment Checklist

### Database Setup
- [x] Supabase database configured
- [x] FastLane schema applied (`complete-fastlane-schema.sql`)
- [x] RLS policies fixed (bookings table RLS disabled)
- [x] Booking number triggers working (FB123456 format)
- [x] Media storage bucket created and configured

### Code Repository
- [x] Code pushed to GitHub: https://github.com/mironism/fastlane
- [x] All FastLane transformations completed
- [x] Infinite loop issues resolved
- [x] Build passing locally

## 🚀 Vercel Deployment Steps

1. **Go to Vercel**: https://vercel.com
2. **Import Project**: Select `mironism/fastlane` from GitHub
3. **Configure Settings**:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variables** (Add these in Vercel dashboard):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jrcvyqpplvchpokouxbl.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyY3Z5cXBwbHZjaHBva291eGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjY2OTcsImV4cCI6MjA2NjEwMjY5N30.MWaZIcTuObJ3O1PFj2BXQQyiCKJuf7bq5oao6ieKhSo
   ```

5. **Deploy**: Click "Deploy" button

## 🧪 Post-Deployment Testing

After deployment, test these key flows:

### Customer Flow
1. Visit your Vercel URL
2. Navigate to `/vendor/[vendorId]` (replace with actual vendor ID)
3. Select activities and add to cart
4. Choose date/time
5. Fill contact form
6. Confirm booking → Should get booking number (FB123456)

### Admin Flow
1. Sign in as vendor
2. Go to `/admin/bookings`
3. View bookings list
4. Mark bookings as complete/active

## 🎯 Success Criteria
- ✅ App loads without errors
- ✅ Activities display correctly
- ✅ Booking flow works end-to-end
- ✅ Booking numbers auto-generate
- ✅ Admin can manage bookings
- ✅ Mobile responsive design works

## 🔧 Troubleshooting

### Common Issues
- **Build fails**: Check environment variables are set
- **Database connection**: Verify Supabase URL/key
- **Images not loading**: Check Supabase storage policies
- **Booking creation fails**: Verify RLS is disabled on bookings table

### Quick Fixes
```sql
-- If booking creation still fails, run in Supabase SQL Editor:
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
```

## 📱 QR Code Generation

After deployment, generate QR codes for each vendor:
- URL format: `https://your-vercel-url.vercel.app/vendor/[vendorId]`
- Use any QR generator (qr-code-generator.com, etc.)
- Print and place at beach locations

---

🏖️ **FastLane is ready for Turkish beach activities!** 