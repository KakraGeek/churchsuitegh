# PWA Setup Instructions

## Overview
Your ChurchSuite application now has full PWA (Progressive Web App) functionality! This includes:

- ✅ Service Worker for offline functionality
- ✅ Web App Manifest for app installation
- ✅ Install prompt with obvious and intuitive UI
- ✅ Update notifications
- ✅ Offline fallback page
- ✅ PWA status indicators

## What You Need to Do

### 1. Create PWA Icons
Replace the placeholder files in the `public/` folder with actual PNG icons:

- `public/pwa-192x192.png` - 192x192 pixel icon
- `public/pwa-512x512.png` - 512x512 pixel icon

**Icon Requirements:**
- Format: PNG
- Sizes: 192x192 and 512x512 pixels
- Style: Should look good on both light and dark backgrounds
- Content: Your church logo or a church-related icon

**Tools to Create Icons:**
- [Favicon Generator](https://www.favicon-generator.org/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Canva](https://www.canva.com/) (free design tool)
- [GIMP](https://www.gimp.org/) (free image editor)

### 2. Test PWA Features

#### Install Prompt
- The install prompt appears automatically after 5 seconds
- Shows benefits: "Access from home screen" and "Works offline"
- Platform-specific instructions for iOS, Android, and Desktop
- Users can dismiss it or install immediately

#### Offline Functionality
- Service worker caches pages, assets, and API responses
- Offline page shows when users try to access uncached content
- Auto-retry when connection is restored

#### Update Notifications
- Users get notified when new versions are available
- One-click update process
- Automatic service worker updates

### 3. PWA Features Available

#### Desktop Header
- Shows PWA installation status
- Quick install button when available
- Online/offline status indicator

#### Mobile Experience
- Install prompt at bottom of screen
- Mobile-optimized UI
- Touch-friendly buttons

#### Offline Support
- Cached pages work offline
- Graceful degradation for uncached content
- Beautiful offline page with retry functionality

## Technical Details

### Service Worker
- **Location**: `src/service-worker.ts`
- **Strategy**: Network First for pages, Cache First for assets
- **Caching**: Pages, CSS, JS, images, and API responses
- **Updates**: Automatic with user notification

### Web App Manifest
- **Name**: ChurchSuite Ghana
- **Short Name**: ChurchSuite
- **Theme Color**: #800020 (church burgundy)
- **Background Color**: #ffffff (white)
- **Display**: Standalone (full-screen app experience)

### Install Prompt
- **Timing**: Shows after 3-5 seconds
- **Position**: Bottom of screen (mobile) or right side (desktop)
- **Dismissal**: Session-based (won't show again until page refresh)
- **Benefits**: Clear value proposition with icons

## Testing

### 1. Development
```bash
npm run dev
```
- PWA features work in development
- Service worker registers automatically
- Install prompt appears after delay

### 2. Production Build
```bash
npm run build
npm run preview
```
- Full PWA functionality
- Service worker caches production assets
- Install prompt works as expected

### 3. PWA Testing Tools
- **Chrome DevTools**: Application tab for service worker and manifest
- **Lighthouse**: PWA audit and scoring
- **Mobile Devices**: Test install prompts and offline functionality

## Browser Support

### Full PWA Support
- Chrome (desktop & mobile)
- Edge (desktop & mobile)
- Firefox (desktop & mobile)
- Safari (iOS 11.3+)

### Partial Support
- Safari (desktop) - Limited PWA features
- Older browsers - Graceful degradation

## Customization

### Colors
Update the theme colors in `vite.config.ts`:
```typescript
theme_color: '#800020',      // Your brand color
background_color: '#ffffff',  // App background
```

### Icons
Replace the icon files and update sizes if needed in `vite.config.ts`.

### Install Prompt Timing
Adjust the timing in `src/components/PWAInstallPrompt.tsx`:
```typescript
// Show after 3 seconds instead of 5
setTimeout(() => {
  if (!checkIfInstalled()) {
    setShowInstallPrompt(true)
  }
}, 3000) // Change this value
```

## Troubleshooting

### Install Prompt Not Showing
- Check browser console for errors
- Ensure HTTPS (required for PWA)
- Verify service worker registration
- Check if app is already installed

### Offline Not Working
- Verify service worker is active
- Check cache storage in DevTools
- Ensure offline.html is accessible
- Test with network throttling

### Update Notifications
- Service worker must be registered
- Check for new versions
- Verify update flow in DevTools

## Next Steps

1. **Create and add your PWA icons**
2. **Test on various devices and browsers**
3. **Customize colors and branding**
4. **Test offline functionality**
5. **Deploy and test in production**

Your ChurchSuite application is now a fully functional PWA that provides an excellent user experience across all devices! 🎉
