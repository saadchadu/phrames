# Toast System Visual Guide

## Toast Appearance

### Success Toast (Green)
```
┌─────────────────────────────────────────┐
│ ✓  Success                              │
│    Refund processed successfully!       │
│    Refund ID: cf_refund_123456     [×]  │
└─────────────────────────────────────────┘
```
- **Background:** Light green (`bg-green-50`)
- **Border:** Green (`border-green-200`)
- **Icon:** Green checkmark
- **Use for:** Successful operations

### Error Toast (Red)
```
┌─────────────────────────────────────────┐
│ ✕  Error                                │
│    Failed to process refund             │
│    Please try again later          [×]  │
└─────────────────────────────────────────┘
```
- **Background:** Light red (`bg-red-50`)
- **Border:** Red (`border-red-200`)
- **Icon:** Red X circle
- **Use for:** Errors and failures

### Info Toast (Blue)
```
┌─────────────────────────────────────────┐
│ ℹ  Info                                 │
│    Payment ID copied to clipboard       │
│                                     [×]  │
└─────────────────────────────────────────┘
```
- **Background:** Light blue (`bg-blue-50`)
- **Border:** Blue (`border-blue-200`)
- **Icon:** Blue info circle
- **Use for:** Informational messages

## Toast Position

```
┌─────────────────────────────────────────────┐
│                                    [Toast 1]│
│                                    [Toast 2]│
│                                    [Toast 3]│
│                                             │
│                                             │
│         Your App Content Here               │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```
- **Desktop:** Top-right corner
- **Mobile:** Full width at top
- **Z-index:** 9999 (above everything)
- **Stacking:** Vertical, newest on top

## Refund Modal

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌───────────────────────────────────┐    │
│   │ Process Refund              [×]   │    │
│   │                                   │    │
│   │ You are about to refund ₹299     │    │
│   │ This will deactivate the          │    │
│   │ associated campaign.              │    │
│   │                                   │    │
│   │ Refund Reason (Optional)          │    │
│   │ ┌───────────────────────────────┐ │    │
│   │ │ Customer requested refund     │ │    │
│   │ │                               │ │    │
│   │ └───────────────────────────────┘ │    │
│   │                                   │    │
│   │         [Cancel] [Process Refund] │    │
│   └───────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

## User Flow Examples

### 1. Refund Flow
```
User clicks "Refund" button
         ↓
Modal opens with amount and reason field
         ↓
User enters reason (optional)
         ↓
User clicks "Process Refund"
         ↓
Button shows "Processing..."
         ↓
API call completes
         ↓
Modal closes
         ↓
✅ Success toast appears: "Refund processed successfully! Refund ID: xxx"
         ↓
Toast auto-dismisses after 5 seconds
```

### 2. Copy to Clipboard Flow
```
User clicks on Payment ID
         ↓
ID copied to clipboard
         ↓
✅ Success toast appears: "Payment ID copied!"
         ↓
Toast auto-dismisses after 5 seconds
```

### 3. Campaign Action Flow
```
User clicks action button (e.g., Deactivate)
         ↓
Confirmation modal opens
         ↓
User confirms action
         ↓
Button shows "Processing..."
         ↓
API call completes
         ↓
Modal closes
         ↓
✅ Success toast appears: "Campaign updated successfully"
         ↓
Table refreshes
         ↓
Toast auto-dismisses after 5 seconds
```

### 4. Error Flow
```
User performs action
         ↓
API call fails
         ↓
❌ Error toast appears: "Failed to perform action"
         ↓
User can retry
         ↓
Toast auto-dismisses after 5 seconds
```

## Toast Behavior

### Auto-dismiss
- **Duration:** 5 seconds
- **Animation:** Fade out
- **Stacking:** Older toasts dismiss first

### Manual Dismiss
- **Button:** X icon in top-right of toast
- **Action:** Immediate removal
- **Animation:** Fade out

### Multiple Toasts
```
[Toast 1] ← Oldest (dismisses first)
[Toast 2]
[Toast 3] ← Newest (dismisses last)
```

## Responsive Design

### Desktop (> 640px)
```
┌─────────────────────────────────────────────┐
│                            [Toast] ← 384px  │
│                                             │
│         Content                             │
└─────────────────────────────────────────────┘
```
- Width: 384px (24rem)
- Position: Fixed top-right
- Margin: 1rem from edges

### Mobile (≤ 640px)
```
┌─────────────────────────────────────────────┐
│ [Toast - Full Width]                        │
│                                             │
│         Content                             │
└─────────────────────────────────────────────┘
```
- Width: Full width minus padding
- Position: Fixed top
- Margin: 1rem from edges

## Code Examples

### Basic Toast
```typescript
import { toast } from '@/components/ui/toaster';

// Success
toast('Operation completed!', 'success');

// Error
toast('Something went wrong', 'error');

// Info
toast('Payment ID copied', 'info');
```

### With Async Operation
```typescript
async function handleAction() {
  try {
    setLoading(true);
    const result = await api.doSomething();
    toast('Action completed successfully', 'success');
  } catch (error) {
    toast(error.message || 'Action failed', 'error');
  } finally {
    setLoading(false);
  }
}
```

### With Modal
```typescript
const [modalOpen, setModalOpen] = useState(false);

async function handleConfirm(data: string) {
  try {
    await api.doSomething(data);
    toast('Success!', 'success');
    setModalOpen(false);
  } catch (error) {
    toast('Failed', 'error');
  }
}

return (
  <>
    <button onClick={() => setModalOpen(true)}>
      Open Modal
    </button>
    
    <MyModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      onConfirm={handleConfirm}
    />
  </>
);
```

## Accessibility

- ✅ Keyboard accessible (ESC to close modals)
- ✅ Screen reader friendly (aria-labels)
- ✅ Focus management
- ✅ Color contrast compliant
- ✅ Non-blocking (doesn't prevent page interaction)

## Best Practices

### DO ✅
- Use success toast for completed actions
- Use error toast for failures
- Use info toast for neutral information
- Keep messages concise and clear
- Include relevant IDs or details
- Auto-dismiss after 5 seconds

### DON'T ❌
- Don't use for critical errors (use modal instead)
- Don't show too many toasts at once
- Don't use for long messages
- Don't block user interaction
- Don't use native alerts/confirms/prompts

## Toast vs Modal

### Use Toast When:
- Quick feedback needed
- Non-critical information
- Success/error confirmation
- Copy to clipboard feedback
- Auto-dismissible message

### Use Modal When:
- User confirmation required
- Data input needed
- Critical action
- Detailed information
- User must acknowledge

## Summary

The toast system provides:
1. **Consistent UX** across the entire app
2. **Clear visual feedback** with colors and icons
3. **Non-blocking** user experience
4. **Professional appearance** matching your brand
5. **Responsive design** for all devices
6. **Accessibility** for all users

No more ugly browser alerts! 🎉
