# Social Media Preview Setup Guide

## Overview
This guide covers the implementation of social media previews for ChurchSuite Ghana, optimized for WhatsApp sharing and other social platforms.

## What's Implemented

### 1. Open Graph Meta Tags
- **og:type**: website
- **og:title**: "ChurchSuite Ghana - Smart Church Management"
- **og:description**: Complete church management solution description
- **og:image**: `/brand/social-preview-1200x630.png`
- **og:image:width**: 1200
- **og:image:height**: 630
- **og:site_name**: "ChurchSuite Ghana"
- **og:locale**: "en_GH"

### 2. Twitter Card Meta Tags
- **twitter:card**: summary_large_image
- **twitter:title**: "ChurchSuite Ghana - Smart Church Management"
- **twitter:description**: Optimized description for Twitter
- **twitter:image**: `/brand/social-preview-1200x630.png`

### 3. WhatsApp-Specific Optimizations
- **og:image:type**: image/png
- **og:image:secure_url**: HTTPS version of the image
- **og:image:alt**: Descriptive alt text for accessibility

## Testing Your Social Previews

### 1. Facebook/Open Graph Testing
Use Facebook's Sharing Debugger:
```
https://developers.facebook.com/tools/debug/
```
- Enter your URL
- Click "Debug"
- Click "Scrape Again" to refresh cache

### 2. Twitter Card Testing
Use Twitter's Card Validator:
```
https://cards-dev.twitter.com/validator
```
- Enter your URL
- Preview the card appearance

### 3. WhatsApp Testing
**Important**: WhatsApp caches images aggressively. To test:
1. Share the URL in a WhatsApp chat
2. If the preview doesn't appear correctly, wait a few minutes
3. Try sharing again
4. Clear WhatsApp cache if needed

### 4. LinkedIn Testing
Use LinkedIn's Post Inspector:
```
https://www.linkedin.com/post-inspector/
```

## Image Specifications

### Social Preview Image: `social-preview-1200x630.png`
- **Dimensions**: 1200 × 630 pixels
- **Format**: PNG (recommended for logos and text)
- **File Size**: Optimize for web (under 1MB)
- **Content**: ChurchSuite Ghana branding with logo

### Logo: `logo.png`
- **Dimensions**: Original logo dimensions
- **Format**: PNG with transparency
- **Usage**: Favicon and general branding

## WhatsApp Optimization Tips

### 1. Image Requirements
- **Aspect Ratio**: 1.91:1 (1200×630)
- **Format**: PNG or JPG
- **File Size**: Keep under 1MB for fast loading
- **Content**: Clear, readable text and logo

### 2. Meta Tag Priority
WhatsApp primarily uses Open Graph tags:
- `og:title` - Main headline
- `og:description` - Supporting text
- `og:image` - Preview image
- `og:url` - Canonical URL

### 3. Testing in WhatsApp
1. **Desktop**: Use WhatsApp Web
2. **Mobile**: Share in personal/group chats
3. **Cache**: WhatsApp caches aggressively - may need to wait
4. **HTTPS**: Ensure image URL uses HTTPS

## Troubleshooting

### Common Issues

#### 1. Image Not Appearing
- Check file path: `/brand/social-preview-1200x630.png`
- Verify image exists and is accessible
- Check browser console for 404 errors

#### 2. Wrong Image Showing
- Clear social media platform caches
- Use platform-specific debuggers
- Wait for cache refresh (can take 24-48 hours)

#### 3. Text Not Readable
- Ensure sufficient contrast
- Use large, clear fonts
- Test on mobile devices

### Debugging Steps
1. **Validate HTML**: Check meta tags are present
2. **Test Image URL**: Direct access to image
3. **Check Console**: Look for errors
4. **Use Debuggers**: Platform-specific testing tools
5. **Clear Caches**: Browser and platform caches

## Best Practices

### 1. Content Guidelines
- **Title**: Keep under 60 characters
- **Description**: Keep under 160 characters
- **Image**: High contrast, readable text
- **Branding**: Consistent with website design

### 2. Technical Guidelines
- **HTTPS**: Always use secure URLs
- **Responsive**: Test on various devices
- **Performance**: Optimize image file sizes
- **Accessibility**: Include descriptive alt text

### 3. Platform-Specific
- **Facebook**: Open Graph tags
- **Twitter**: Twitter Card meta tags
- **WhatsApp**: Open Graph + WhatsApp-specific
- **LinkedIn**: Open Graph tags

## Monitoring and Updates

### 1. Regular Testing
- Test monthly on major platforms
- Check after website updates
- Monitor social media engagement

### 2. Analytics
- Track social media traffic
- Monitor sharing patterns
- Analyze engagement metrics

### 3. Updates
- Refresh images periodically
- Update descriptions as needed
- Test new features

## Resources

### Testing Tools
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Open Graph Checker](https://opengraphcheck.com/)

### Documentation
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

**Note**: Social media platforms cache content aggressively. Changes may take 24-48 hours to appear across all instances.
