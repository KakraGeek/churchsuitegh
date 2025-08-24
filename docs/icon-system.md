# Icon System Guide

ChurchSuite Ghana uses a centralized icon system built on [Lucide React](https://lucide.dev/) for consistent, professional iconography throughout the application.

## ✨ Features

- **Centralized Management**: All icons imported from one source
- **Church-Specific Mappings**: Pre-configured icons for common church features
- **Consistent Sizing**: Predefined size system for uniformity
- **Type Safety**: Full TypeScript support
- **Tree Shaking**: Only used icons are bundled
- **Easy to Use**: Simple helper components

## 🎯 Quick Start

### Basic Usage

```tsx
import { Users, Calendar, Mail } from '@/lib/icons'

function MyComponent() {
  return (
    <div>
      <Users className="h-6 w-6" />
      <Calendar size={24} />
      <Mail size="md" />
    </div>
  )
}
```

### Church Icon Helper

```tsx
import { ChurchIcon } from '@/lib/icons'

function MemberCard() {
  return (
    <div>
      <ChurchIcon name="pastor" size="lg" className="text-purple-600" />
      <ChurchIcon name="members" size="md" />
      <ChurchIcon name="active" size="sm" />
    </div>
  )
}
```

## 📦 Available Icons

### Church-Specific Icons

| Category | Icons |
|----------|-------|
| **Member Roles** | `pastor`, `admin`, `leader`, `member`, `visitor` |
| **Member Status** | `active`, `inactive`, `transferred`, `suspended`, `deceased` |
| **Features** | `members`, `events`, `giving`, `communications`, `attendance` |
| **Actions** | `add`, `edit`, `delete`, `view`, `search`, `filter` |
| **Contact** | `email`, `phone`, `sms` |

### General Icons

All Lucide React icons are available through the centralized system:

```tsx
// Navigation
import { Home, Menu, ChevronDown } from '@/lib/icons'

// Actions  
import { Plus, Edit, Trash, Search } from '@/lib/icons'

// Communication
import { Mail, Phone, MessageSquare } from '@/lib/icons'

// Status
import { Check, AlertCircle, XCircle } from '@/lib/icons'
```

## 📏 Icon Sizes

Predefined size system for consistency:

| Size | Pixels | Usage |
|------|--------|-------|
| `xs` | 12px | Small indicators, badges |
| `sm` | 16px | Inline text, compact UI |
| `md` | 20px | Default size, buttons |
| `lg` | 24px | Headers, cards |
| `xl` | 32px | Large buttons, features |
| `2xl` | 48px | Hero sections, empty states |

### Usage Examples

```tsx
// Using size names
<Users size="lg" />

// Using pixels directly
<Calendar size={24} />

// Using Tailwind classes (recommended for custom styling)
<Mail className="h-5 w-5" />
```

## 🎨 Best Practices

### 1. Use Centralized System

❌ **Don't do this:**
```tsx
import { Users } from 'lucide-react'
```

✅ **Do this:**
```tsx
import { Users } from '@/lib/icons'
```

### 2. Use Church Icon Helper

❌ **Don't do this:**
```tsx
import { Crown, Shield, Users } from '@/lib/icons'

function RoleIcon({ role }: { role: string }) {
  switch (role) {
    case 'pastor': return <Crown />
    case 'admin': return <Shield />
    default: return <Users />
  }
}
```

✅ **Do this:**
```tsx
import { ChurchIcon } from '@/lib/icons'

function RoleIcon({ role }: { role: ChurchIcon }) {
  return <ChurchIcon name={role} />
}
```

### 3. Consistent Sizing

❌ **Don't do this:**
```tsx
<Users className="h-5 w-5" />
<Calendar className="h-6 w-6" />
<Mail className="h-4 w-4" />
```

✅ **Do this:**
```tsx
<Users size="md" />
<Calendar size="md" />  
<Mail size="md" />
```

### 4. Semantic Color Classes

```tsx
// Status colors
<ChurchIcon name="active" className="text-green-600" />
<ChurchIcon name="inactive" className="text-gray-500" />
<ChurchIcon name="suspended" className="text-red-600" />

// Role colors
<ChurchIcon name="pastor" className="text-purple-600" />
<ChurchIcon name="admin" className="text-blue-600" />
<ChurchIcon name="member" className="text-gray-600" />
```

## 🔧 Adding New Icons

### 1. Update the Icon Library

```typescript
// src/lib/icons.ts
export {
  // Add new icons here
  NewIcon,
} from 'lucide-react'
```

### 2. Add to Church Icons (if applicable)

```typescript
// src/lib/icons.ts
export const churchIcons = {
  // existing icons...
  newFeature: NewIcon,
} as const
```

### 3. Update TypeScript Types

The types will be automatically updated when you add to the `churchIcons` object.

## 🎯 Migration Guide

If you have existing components using direct Lucide imports:

1. **Replace imports:**
   ```tsx
   // Before
   import { Users, Calendar } from 'lucide-react'
   
   // After  
   import { Users, Calendar } from '@/lib/icons'
   ```

2. **Update church-specific usage:**
   ```tsx
   // Before
   import { Crown } from 'lucide-react'
   const isPastor = role === 'pastor'
   return isPastor ? <Crown /> : null
   
   // After
   import { ChurchIcon } from '@/lib/icons'
   return <ChurchIcon name="pastor" />
   ```

3. **Standardize sizes:**
   ```tsx
   // Before
   <Users className="h-6 w-6" />
   
   // After
   <Users size="lg" />
   ```

## 📖 Demo Page

View all available icons and examples at `/icon-demo` (development only).

---

**Benefits of this system:**
- ✅ Consistent iconography
- ✅ Better bundle optimization  
- ✅ Easier maintenance
- ✅ Type safety
- ✅ Church-specific semantics
- ✅ Reduced import complexity
