# Campaign Creation - Quick Guide

## What You Need

To create and share campaigns, you need:

1. **Firebase** - For user authentication and database
2. **S3 Storage** - For storing frame images
3. **Environment variables** - Configured in `.env`

## Step-by-Step: Create Your First Campaign

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Create an Account
1. Visit http://localhost:3000
2. Click "Sign up"
3. Enter email and password
4. You'll be redirected to the dashboard

### 3. Create a Campaign
1. From the dashboard, click "Create Campaign" or visit `/dashboard/campaigns/new`
2. Fill in the form:

   **Campaign Name** (required)
   - Example: "Summer Festival 2024"
   - This is the display name users will see

   **URL Slug** (required)
   - Example: "summer-festival-2024"
   - Must be unique and URL-friendly (lowercase, hyphens only)
   - Auto-generated from the name, but you can customize it

   **Description** (optional)
   - Example: "Join our summer celebration! Add this frame to your photo."
   - Shown on the public campaign page

   **Visibility** (required)
   - **Public**: Anyone can find and use the campaign
   - **Unlisted**: Only people with the direct link can access it

   **Frame Image** (required)
   - Must be a PNG file
   - Must have transparency (alpha channel)
   - Minimum size: 1080x1080 pixels
   - Recommended: Square or portrait orientation

3. Click "Create Campaign"

### 4. Get Your Shareable Link
After creation, you'll see:
- Campaign management page
- **Shareable link**: `/c/your-slug`
- Full URL: `http://localhost:3000/c/your-slug`

Click "Copy Link" to copy the full URL to your clipboard.

### 5. Share the Link
Send the link to users. They can:
1. Visit the link
2. Upload their photo
3. Adjust position and zoom
4. Download the final image (PNG or JPEG)

## Example Frame Requirements

### Good Frame Examples:
✅ PNG with transparent background
✅ 1080x1080px or larger
✅ Frame elements around the edges
✅ Clear center area for user photos

### Common Issues:
❌ JPEG files (no transparency)
❌ PNG without alpha channel
❌ Too small (less than 1080px)
❌ Completely opaque (no transparency)

## Creating a Test Frame

If you need a test frame, you can create one using:

### Using Photoshop/GIMP:
1. Create new image: 1080x1080px
2. Add a transparent layer
3. Draw a border/frame around the edges
4. Keep the center transparent or semi-transparent
5. Export as PNG with transparency

### Using Canva:
1. Create custom size: 1080x1080px
2. Add elements around the edges
3. Download as PNG with transparent background

### Using Figma:
1. Create frame: 1080x1080px
2. Design your frame elements
3. Export as PNG

## Campaign Management

After creating a campaign, you can:

### View Analytics
- **Visits**: How many people viewed the campaign page
- **Renders**: How many times users uploaded a photo
- **Downloads**: How many images were downloaded

### Edit Campaign
- Change name, description, visibility
- Update the slug (creates redirect from old slug)
- Archive/unarchive the campaign

### Update Frame
- Replace the frame image
- New frame goes live immediately
- Old frame is kept in storage

### Copy Link
- Quick copy button for the shareable link
- Share via social media, email, QR code, etc.

## Testing the Flow

### Test as Creator:
1. Create a campaign
2. Copy the shareable link
3. Verify the campaign appears in your dashboard

### Test as User:
1. Open the shareable link in an incognito/private window
2. Upload a test photo
3. Adjust position and zoom
4. Download the result
5. Verify the frame is correctly applied

## Troubleshooting

### "Slug already exists"
- Try a different slug
- The app will suggest an available one with a number suffix

### "Frame image is required"
- Make sure you selected a file
- Check that it's a PNG file

### "PNG must have transparency"
- Your PNG doesn't have an alpha channel
- Re-export with transparency enabled

### "PNG must be at least 1080px"
- Your image is too small
- Resize to at least 1080x1080px

### Images not loading on campaign page
- Check S3 configuration in `.env`
- Verify S3 bucket is accessible
- Check browser console for errors

### "Unauthorized" when creating campaign
- Make sure you're logged in
- Try logging out and back in
- Check Firebase configuration

## Next Steps

Once your campaign is live:

1. **Share the link** - Social media, email, website
2. **Monitor analytics** - Check the campaign management page
3. **Engage users** - Encourage downloads and shares
4. **Update as needed** - Change description, replace frame
5. **Create more campaigns** - No limit on campaigns per user

## Production Checklist

Before going live:

- [ ] Configure production Firebase project
- [ ] Set up production S3 bucket
- [ ] Update `NUXT_PUBLIC_SITE_URL` to your domain
- [ ] Test campaign creation end-to-end
- [ ] Test shareable links work
- [ ] Verify images load correctly
- [ ] Check analytics are recording
- [ ] Test on mobile devices
- [ ] Set up monitoring and backups

## Tips for Success

1. **Frame Design**: Keep important elements away from the center where user photos will be
2. **Aspect Ratio**: Square (1:1) works best for social media
3. **File Size**: Optimize PNGs to reduce storage costs
4. **Slug Names**: Use descriptive, memorable slugs
5. **Descriptions**: Add clear instructions for users
6. **Testing**: Always test the full flow before sharing widely
