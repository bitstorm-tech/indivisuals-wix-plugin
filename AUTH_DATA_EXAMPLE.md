# HandleInertiaRequests Authentication Data Sharing

## How It Works

The `HandleInertiaRequests` middleware (located at `app/Http/Middleware/HandleInertiaRequests.php`) shares data with all React components through the `share()` method. This data is available on every page load.

## 1. Middleware Implementation

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'name' => config('app.name'),
        'quote' => ['message' => trim($message), 'author' => trim($author)],
        'auth' => [
            'user' => $request->user(), // This is the authenticated user or null
        ],
        'ziggy' => fn (): array => [
            ...(new Ziggy)->toArray(),
            'location' => $request->url(),
        ],
        'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
    ];
}
```

## 2. TypeScript Types

The shared data structure is defined in `resources/js/types/index.d.ts`:

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Auth {
  user: User;
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  ziggy: Config & { location: string };
  sidebarOpen: boolean;
}
```

## 3. Accessing Auth Data in React Components

### Method 1: Via Page Props (Most Common)

When Laravel controllers render Inertia pages, the shared data is automatically merged with page-specific props:

```tsx
// In your controller
return Inertia::render('admin/prompts', [
    'prompts' => $prompts,
    'categories' => $categories,
]);

// In your React component
interface PromptsProps {
  prompts: Prompt[];
  categories: PromptCategory[];
  auth: {
    user: User;
  };
}

export default function Prompts({ prompts, categories, auth }: PromptsProps) {
  // Access the authenticated user
  const currentUser = auth.user;
  
  return (
    <div>
      <h1>Welcome, {currentUser.name}!</h1>
      <p>Email: {currentUser.email}</p>
    </div>
  );
}
```

### Method 2: Using the usePage Hook

You can access shared data from any component using Inertia's `usePage` hook:

```tsx
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function MyComponent() {
  const { props } = usePage<SharedData>();
  const currentUser = props.auth.user;
  
  // You can also destructure specific properties
  const { auth, sidebarOpen, quote } = usePage<SharedData>().props;
  
  return (
    <div>
      {auth.user ? (
        <p>Logged in as: {auth.user.name}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
```

### Method 3: Accessing Other Shared Data

```tsx
import { usePage } from '@inertiajs/react';

export default function AdminSidebar() {
  const { url, props } = usePage();
  
  // Access current URL
  console.log('Current URL:', url);
  
  // Access app name
  console.log('App name:', props.name);
  
  // Access inspirational quote
  console.log('Quote:', props.quote.message, 'by', props.quote.author);
  
  // Access sidebar state
  console.log('Sidebar open:', props.sidebarOpen);
}
```

## 4. Real-World Examples from the Codebase

### Admin Pages Pattern
Most admin pages receive auth data through props:

```tsx
// pages/admin/prompts.tsx
interface PromptsProps {
  prompts: Prompt[];
  categories: PromptCategory[];
  subcategories: PromptSubCategory[];
  auth: {
    user: User;
  };
}

export default function Prompts({ prompts, categories, subcategories, auth }: PromptsProps) {
  // The auth prop contains the authenticated user
  return <AdminSidebar user={auth.user} />;
}
```

### AdminSidebar Component
The sidebar component receives the user as a prop and uses `usePage` for the current URL:

```tsx
// components/admin/AdminSidebar.tsx
import { usePage } from '@inertiajs/react';

interface AdminSidebarProps {
  user: User;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const { url } = usePage();
  
  const isActive = (path: string) => url === path;
  
  return (
    <aside>
      <p>Welcome, {user.name}</p>
      {/* Rest of sidebar */}
    </aside>
  );
}
```

## 5. Authentication State Checks

To check if a user is authenticated:

```tsx
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function Navigation() {
  const { auth } = usePage<SharedData>().props;
  
  return (
    <nav>
      {auth.user ? (
        <>
          <span>Welcome, {auth.user.name}</span>
          <button onClick={() => router.post('/logout')}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
```

## 6. Best Practices

1. **Type Safety**: Always define proper TypeScript interfaces for your page props including the auth property
2. **Null Checks**: Remember that `auth.user` can be null for unauthenticated users
3. **Consistency**: Use the same method (props vs usePage) consistently within a component
4. **Performance**: The shared data is loaded once per page request, not on every render

## 7. Adding Custom Shared Data

To add more shared data, modify the `share()` method in HandleInertiaRequests:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
            'permissions' => $request->user()?->permissions ?? [],
            'roles' => $request->user()?->roles ?? [],
        ],
        'notifications' => $request->user()?->unreadNotifications ?? [],
        'settings' => [
            'theme' => $request->cookie('theme', 'light'),
            'locale' => app()->getLocale(),
        ],
    ];
}
```

Then update your TypeScript types accordingly:

```typescript
export interface SharedData {
  // ... existing properties
  notifications: Notification[];
  settings: {
    theme: 'light' | 'dark';
    locale: string;
  };
}
```