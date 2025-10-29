# StatusIO Implementation FAQ

## Testing Different Status States During Development

### Quick Start

After loading the page, open your browser's **Developer Console** and use the `testStatusIO()` function to test different status states.

### Available Test Commands

```javascript
// Test minor issues (yellow background with orange icon)
testStatusIO('minor')

// Test major issues (red background with dark red icon)
testStatusIO('major')

// Test critical issues (red background with dark red icon)
testStatusIO('critical')

// Test maintenance mode (blue background with dark blue icon)
testStatusIO('maintenance')

// Test operational/healthy status (green background with green icon)
testStatusIO('operational')
// or
testStatusIO('none')
```

### What Each Status Looks Like

| Status | Background Color | Icon Color | Text Color | Font Weight | Description |
|--------|-----------------|------------|------------|-------------|-------------|
| **Minor** | `#fce588` (Light Yellow) | `#d97706` (Orange) | `#d97706` (Orange) | 400 (Regular) | Some services experiencing minor issues |
| **Major** | `#ef8278` (Light Red) | `#991b1b` (Dark Red) | `#fff` (White) | 400 (Regular) | Major service disruption detected |
| **Critical** | `#ef8278` (Light Red) | `#991b1b` (Dark Red) | `#fff` (White) | 400 (Regular) | Critical systems are down |
| **Maintenance** | `#6bb3e8` (Light Blue) | `#1e40af` (Dark Blue) | `#fff` (White) | 400 (Regular) | Scheduled maintenance in progress |
| **Operational** | `#D7EBDD` (Light Green) | `#379B55` (Green) | `#379B55` (Green) | 400 (Regular) | All systems operational |

### How It Works

Each test command will:

- ✅ Update the status message with appropriate emoji
- ✅ Apply the correct background color
- ✅ Set the icon color
- ✅ Apply the appropriate font weight
- ✅ Log the action to the console

You can call these commands as many times as you want to quickly cycle through the different states and check the colors!

## Important Notes

### 🚨 Before Production Deployment

**Remove the dev helper code** from `assets/statusio.js` before deploying to production. The code is marked with clear comments:

```javascript
// ===== TEMPORARY DEV HELPER =====
// ... code ...
// ===== END DEV HELPER =====
```

Lines to remove: **352-401** (approximately)

### Console Message

When you load the page in development, you'll see this message in the console:

```
🧪 Dev helper available! Use testStatusIO("minor"|"major"|"critical"|"maintenance"|"operational") in console
```

## API Information

### Status API Endpoint

- **URL**: `https://status.vagaro.com/api/v2/status.json`
- **Status Page**: `https://status.vagaro.com/`

### Update Frequency

- **Immediate Update**: On page load
- **Periodic Updates**: Every 5 minutes
- **Paused**: When page is hidden (tab inactive)
- **Resumed**: When page becomes visible again

### Configuration

The script includes retry logic and timeout handling:

- **Timeout**: 10 seconds per request
- **Max Retries**: 3 attempts
- **Retry Delay**: Exponential backoff (1s, 2s, 4s)
- **Loading Timeout**: 15 seconds before showing fallback

## Accessibility Features

The status bar includes:

- ✅ `role="button"` for screen readers
- ✅ `tabindex="0"` for keyboard navigation
- ✅ `aria-label` with descriptive text
- ✅ Keyboard support (Enter or Space to open status page)

## Clickable Behavior

The entire status bar is clickable and will:

1. Open the status page in a new tab (`https://status.vagaro.com/`)
2. Works with both mouse clicks and keyboard (Enter/Space)

## Error Handling

If the API is unavailable, the script will:

1. Retry up to 3 times with exponential backoff
2. Show "Status information unavailable" if all retries fail
3. Show "Visit status page for latest updates" if loading takes too long
4. Display a gray indicator for unknown status

## File Locations

- **JavaScript**: `/assets/statusio.js`
- **Styles**: `/styles/_status-io.scss`
- **Template**: `/templates/home_page.hbs` (status bar HTML)

## Troubleshooting

### Status bar not showing?

- Check if `statusio-bar` element exists in the DOM
- Check browser console for initialization messages

### Colors not updating?

- Verify the API response format
- Check browser console for error messages
- Test with `testStatusIO()` commands to isolate the issue

### API not responding?

- Check network tab for failed requests
- Verify the API endpoint is accessible
- Check CORS settings if testing locally
