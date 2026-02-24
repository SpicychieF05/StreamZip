# StreamZip - Testing Guide

## Pre-Testing Checklist

Before starting tests, ensure:
- [ ] Node.js 18+ installed
- [ ] Redis server running
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001

## Unit Testing Checklist

### Backend Tests

#### 1. URL Validation Tests
```bash
# Test valid YouTube URLs
✅ https://www.youtube.com/watch?v=dQw4w9WgXcQ
✅ https://youtu.be/dQw4w9WgXcQ
✅ https://www.youtube.com/embed/dQw4w9WgXcQ

# Test invalid URLs
❌ https://vimeo.com/123456
❌ https://example.com
❌ not-a-url
❌ (empty string)
```

#### 2. Rate Limiting Tests
```bash
# Test general rate limit (10/hour)
- Make 10 requests within 1 hour → Should succeed
- Make 11th request → Should return 429 error

# Test playlist rate limit (3/hour)
- Make 3 playlist requests → Should succeed
- Make 4th request → Should return 429 error
```

#### 3. Job Service Tests
```bash
# Test job creation
- Create job → Returns valid UUID
- Job status starts at "queued"

# Test job status updates
- Job transitions: queued → processing → completed
- Progress updates: 0 → 10 → 30 → 100

# Test job cleanup
- Jobs older than 1 hour are deleted
```

#### 4. YouTube Service Tests
```bash
# Test video info retrieval
- Valid video URL → Returns metadata
- Private video → Returns 403 error
- Invalid video ID → Returns 404 error
- Age-restricted video → Returns 403 error

# Test downloads
- Download video → Creates MP4 file
- Download audio → Creates M4A file
- File saved to temp directory
```

### Frontend Tests

#### 1. Home Screen Tests
```bash
✅ Logo displays correctly
✅ URL input field visible
✅ Paste button works (clipboard access)
✅ Analyze button enabled when URL present
✅ Analyze button disabled when URL empty
✅ Error message displays on invalid URL
```

#### 2. Video Preview Tests
```bash
✅ Thumbnail displays
✅ Title displays
✅ Duration formatted correctly (mm:ss)
✅ Author name displays
✅ Download Video button visible
✅ Download Audio button visible
✅ Back button returns to home
```

#### 3. Job Progress Tests
```bash
✅ Progress bar animates
✅ Percentage displays
✅ Spinner animates
✅ Status text updates correctly
✅ Transitions through states: queued → processing → completed
```

#### 4. Download Ready Tests
```bash
✅ Success icon displays
✅ Filename shows
✅ Download button works
✅ New Download button returns to home
✅ "Available for 1 hour" note visible
```

## Integration Testing

### Test Case 1: Single Video Download (Happy Path)
```
1. Open http://localhost:3001
2. Paste YouTube video URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
3. Click "Analyze"
   Expected: Video preview appears with thumbnail, title, duration
4. Click "Download Video (MP4)"
   Expected: Progress screen appears
5. Wait for processing
   Expected: Progress bar animates, percentage updates
6. Download completes
   Expected: Download Ready screen with download link
7. Click download link
   Expected: File downloads to browser
8. Click "New Download"
   Expected: Returns to home screen

✅ Pass / ❌ Fail
```

### Test Case 2: Single Audio Download
```
1. Open http://localhost:3001
2. Paste YouTube video URL
3. Click "Analyze"
4. Click "Download Audio (M4A)"
   Expected: Progress screen appears
5. Wait for processing
6. Download completes
   Expected: M4A file available for download

✅ Pass / ❌ Fail
```

### Test Case 3: Invalid URL Handling
```
1. Open http://localhost:3001
2. Paste invalid URL: https://vimeo.com/123456
3. Click "Analyze"
   Expected: Error message "Invalid YouTube URL"

✅ Pass / ❌ Fail
```

### Test Case 4: Private Video Handling
```
1. Open http://localhost:3001
2. Paste private video URL
3. Click "Analyze"
   Expected: Error message "Private video cannot be accessed"

✅ Pass / ❌ Fail
```

### Test Case 5: Rate Limiting
```
1. Make 10 successful downloads
2. Attempt 11th download within the hour
   Expected: Error message "Too many requests from this IP"
3. Wait 1 hour
4. Attempt download
   Expected: Success

✅ Pass / ❌ Fail
```

### Test Case 6: Empty URL Submission
```
1. Open http://localhost:3001
2. Leave URL field empty
3. Click "Analyze"
   Expected: Button disabled OR error "Please enter a YouTube URL"

✅ Pass / ❌ Fail
```

### Test Case 7: File Cleanup
```
1. Download a video successfully
2. Wait 1 hour
3. Try to access the file URL
   Expected: File not found (404)

✅ Pass / ❌ Fail
```

## Mobile Responsive Testing

### Mobile Devices (≤480px)
```
Test on:
- iPhone 12 Pro (390x844)
- iPhone SE (375x667)
- Samsung Galaxy S21 (360x800)
- Google Pixel 5 (393x851)

Checklist:
✅ Single column layout
✅ No horizontal scroll
✅ Tap targets ≥48px
✅ Text readable (≥16px)
✅ Buttons full-width
✅ Padding appropriate (16px)
✅ Input field usable
✅ Paste button accessible
```

### Tablet (481px-1023px)
```
Test on:
- iPad (768x1024)
- iPad Pro (834x1194)

Checklist:
✅ Centered layout
✅ Appropriate max-width
✅ Same functionality as mobile
✅ Slightly larger components
```

### Desktop (≥1024px)
```
Test on:
- MacBook (1440x900)
- Desktop (1920x1080)

Checklist:
✅ Centered container (max 900px)
✅ Same functionality as mobile
✅ Action buttons side-by-side (VideoPreview)
✅ No feature differences
```

## Color Scheme Verification

### Mandatory Colors (PRD Section 7.2)
```
✅ Primary Red: #FF0000
✅ Primary White: #FFFFFF
✅ Text Dark: #0F0F0F
✅ Border Light: #E5E5E5

Usage Verification:
✅ Background is white
✅ Primary buttons are red
✅ Secondary buttons are white with red border
✅ Progress bar is red
✅ Error text is red
✅ No additional accent colors
```

## Performance Testing

### Page Load Time
```
Test: Open http://localhost:3001
Expected: < 2 seconds (PRD requirement)

Chrome DevTools:
1. Open DevTools → Network tab
2. Disable cache
3. Reload page
4. Check "Load" time

✅ Pass / ❌ Fail: _____ seconds
```

### Analyze Response Time
```
Test: Analyze a YouTube URL
Expected: < 5 seconds (PRD requirement)

1. Paste URL
2. Click "Analyze"
3. Measure time to video preview

✅ Pass / ❌ Fail: _____ seconds
```

### Download Completion Time
```
Test: Download a video
Expected: < 60 seconds for single video (PRD KPI)

1. Start download
2. Wait for completion
3. Measure time

✅ Pass / ❌ Fail: _____ seconds
```

## Browser Compatibility Testing

### Primary (Mobile)
```
✅ Chrome Mobile (Android) - Latest
✅ Safari Mobile (iOS) - Latest
✅ Samsung Internet - Latest
```

### Secondary (Desktop)
```
✅ Chrome - Latest
✅ Firefox - Latest
✅ Safari - Latest
✅ Edge - Latest
```

## Security Testing

### Input Validation
```
Test malicious inputs:
❌ javascript:alert('xss')
❌ <script>alert('xss')</script>
❌ ../../../etc/passwd
❌ DROP TABLE users;

Expected: All rejected or sanitized
```

### Rate Limit Bypass
```
Test: Try to bypass rate limiting
- Change IP (VPN)
- Clear cookies
- Use different user agents

Expected: Rate limit still applies per IP
```

### File Access
```
Test: Try to access files outside /files
- http://localhost:3000/../package.json
- http://localhost:3000/files/../src/server.js

Expected: Access denied (403 or 404)
```

## Load Testing

### Concurrent Users
```
Test: 10 concurrent users
Expected: All succeed

Tools: Apache Bench or Artillery
```bash
ab -n 100 -c 10 http://localhost:3000/health
```

Expected: All requests succeed
```

## Error Handling Testing

### Network Errors
```
1. Disconnect internet
2. Try to download
   Expected: Network error message

3. Reconnect internet
4. Retry
   Expected: Success
```

### Redis Down
```
1. Stop Redis server
2. Try to download
   Expected: Queue error, graceful handling

3. Start Redis
4. Try again
   Expected: Success
```

### Disk Full
```
(Difficult to test locally)
Expected: Error message, no crash
```

## Accessibility Testing

### Keyboard Navigation
```
✅ Tab through all interactive elements
✅ Enter submits form
✅ Escape closes modals (if any)
✅ Focus indicators visible
```

### Screen Reader
```
✅ Logo announced
✅ Input field has label
✅ Buttons have descriptive text
✅ Error messages announced
```

## Test Results Summary

```
Date: __________
Tester: __________

Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___

Pass Rate: ____%

Critical Issues: ___
Major Issues: ___
Minor Issues: ___

MVP Ready: ✅ Yes / ❌ No

Notes:
_______________________________
_______________________________
_______________________________
```

## Automated Testing (Future)

### Backend Tests (Jest)
```javascript
// Example: tests/urlValidator.test.js
describe('URL Validator', () => {
  test('accepts valid YouTube URLs', () => {
    const result = validateYouTubeUrl('https://youtube.com/watch?v=test');
    expect(result.valid).toBe(true);
  });
  
  test('rejects invalid URLs', () => {
    const result = validateYouTubeUrl('https://vimeo.com/123');
    expect(result.valid).toBe(false);
  });
});
```

### Frontend Tests (Jest + React Testing Library)
```javascript
// Example: tests/VideoPreview.test.js
describe('VideoPreview', () => {
  test('renders video title', () => {
    render(<VideoPreview video={mockVideo} />);
    expect(screen.getByText('Mock Title')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright/Cypress)
```javascript
// Example: e2e/download.spec.js
test('complete download flow', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.fill('input', 'https://youtube.com/watch?v=test');
  await page.click('button:has-text("Analyze")');
  await page.click('button:has-text("Download Video")');
  await expect(page.locator('.progress')).toBeVisible();
});
```

## Bug Report Template

```markdown
### Bug Report

**Title**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Screenshot**: (if applicable)

**Environment**:
- OS: 
- Browser: 
- Screen size: 

**Severity**: Critical / Major / Minor

**Notes**:
```

## Sign-off

```
✅ All critical tests passed
✅ No blocking issues
✅ MVP acceptance criteria met
✅ Ready for production deployment

Approved by: __________
Date: __________
```
