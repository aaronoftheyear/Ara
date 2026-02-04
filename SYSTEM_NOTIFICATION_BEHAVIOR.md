# System Notification Behavior Specification

## What We Agreed On

### Desktop Behavior
- ✅ **Always inline** - Shows in normal message flow
- ✅ **Simple and static** - No fixed positioning
- ✅ **Visible immediately** - Part of the conversation

### Mobile Behavior  
- ✅ **Initial state:** Notification appears in its natural position in message flow (NOT fixed)
- ✅ **When scrolling:** Notification stays in its position (scrolls with content)
- ✅ **NOT fixed to bottom** - Should behave like a regular message

## Key Points from Discussion

**User Request:**
> "so the inicial system notifications shouldnt be floating about the mesasges because its immidiatly where it supposed to be so it should fall in line with the messages"

**Translation:**
- Initial notifications should be in normal flow (not floating/fixed)
- They're already where they belong
- Should be part of the message list

**Earlier Request:**
> "on mobil. system messages; they ofcourse make it autoscroll. i want to change that. I want the focus to be on the messagfes ljust lik ewe did with the recommendations."

**Translation:**
- System messages should NOT cause auto-scroll to bottom
- Should behave like recommendations (stop at message content)
- See ChatWindow.tsx for implementation

## Current Implementation (CORRECT)

### ChatWindow.tsx
```typescript
} else if (lastMessage.role === 'system') {
  // For system messages, scroll to show the message content but not to the very bottom
  const messageElements = scrollRef.current.querySelectorAll('[data-message-index]');
  if (messageElements.length > 0) {
    const lastMessageElement = messageElements[messageElements.length - 1];
    lastMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

### SystemNotification.tsx (NEEDS FIX)
**Current (WRONG):**
- Starts with `isFixed = false` on desktop ✅
- Sets `isFixed = true` on mobile ❌ (WRONG - should stay false)

**Should Be:**
- Always `isFixed = false` (no fixed positioning)
- Just a simple inline notification
- Desktop and mobile behave the same

## CORRECTED: Actual Agreement

### Mobile Behavior (Fixed Until Reached)
1. **Notification appears** → Fixed at `bottom-32` (128px from bottom, above suggestions)
2. **User scrolls up** → Notification stays fixed at bottom-32
3. **Placeholder reaches bottom-32 position** → Unfix notification
4. **Placeholder becomes visible** → Fixed notification removed
5. **Notification stays in flow** → Never goes back to fixed

### Key Logic
```typescript
const fixedNotificationPosition = window.innerHeight - 128; // bottom-32

if (placeholderRect.top <= fixedNotificationPosition) {
  setIsFixed(false);
  setHasReachedPosition(true); // Permanent state
}
```

### Permanent State
```typescript
setHasReachedPosition(true);
// Once set, prevents any future changes
// handleScroll early returns if hasReachedPosition === true
```

### Desktop Behavior
- ✅ **Always inline** - No fixed positioning on desktop
- ✅ **Simple flow** - Part of normal message list

## Implementation (CORRECT)

**Dual Rendering:**
1. **Placeholder** - Always in message flow, hidden when `isFixed`
2. **Fixed notification** - Only shown on mobile when `isFixed`
3. **Scroll detection** - Monitors placeholder position
4. **One-way transition** - Fixed → Inline (never reverses)

