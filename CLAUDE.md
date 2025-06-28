# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: PHP Configuration Requirements

This application requires PHP to be configured with specific upload limits:
- `upload_max_filesize = 4M` (minimum)
- `post_max_size = 8M` (should be larger than upload_max_filesize)

See `docs/PHP_UPLOAD_CONFIGURATION.md` for detailed setup instructions for different environments.

## Initial Setup

When setting up a new server or development environment, run these commands:

```bash
composer install
cp .env.example .env
touch database/database.sqlite  # Create SQLite database file
php artisan key:generate
php artisan migrate
php artisan db:seed  # Seeds database with categories and prompts
php artisan storage:link  # IMPORTANT: Creates symlink for public file access
bun install
```

### Required Environment Variables

- `OPENAI_API_KEY` - Required for AI image generation functionality

## Development Commands

### Backend Commands

- `composer run dev` - Start development environment (Laravel server + queue + logs + Vite)
- `composer run dev:ssr` - Start with SSR support
- `composer run test` - Run PHP tests (uses Pest)
- `php artisan test` - Alternative command to run tests
- `php artisan serve` - Start Laravel server only
- `php artisan queue:listen --tries=1` - Start queue worker
- `php artisan pail -vv --timeout=0` - Start log viewer
- `php artisan migrate` - Run database migrations
- `php artisan tinker` - Laravel REPL
- `php artisan config:clear` - Clear config cache (useful before tests)
- `php artisan inertia:start-ssr` - Start SSR server (used with dev:ssr command)

### Frontend Commands

- `bun run dev` - Start Vite dev server
- `bun run build` - Build for production
- `bun run build:ssr` - Build with SSR support
- `bun run lint` - Run ESLint (with auto-fix)
- `bun run types` - TypeScript type checking
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting

### Code Quality

- Laravel Pint is configured for PHP formatting
- ESLint + Prettier for JavaScript/TypeScript
  - Prettier: 150 char line width, single quotes, semicolons
  - ESLint: TypeScript support, React hooks rules enforced
- TypeScript strict mode enabled with path aliases (@/_ for resources/js/_)

## Architecture Overview

This is a Laravel + Inertia.js + React application focused on AI-powered image processing.

### Tech Stack

- **Backend**: Laravel 12.17.0 with PHP 8.2+
- **Frontend**: React 19 with TypeScript
- **Bridge**: Inertia.js 2.0 for SPA behavior
- **Styling**: Tailwind CSS 4 + shadcn-ui
- **AI Integration**: Custom OpenAiService using Guzzle HTTP client (DALL-E 2 and GPT-Image-1 models)
- **Testing**: Pest (PHP), no frontend tests configured

### Key Architectural Patterns

#### Laravel + Inertia.js Integration

- Pages are React components in `resources/js/pages/`
- Routes use `Route::inertia()` for simple page rendering
- API routes return JSON, Inertia routes return React components
- CSRF protection required for all POST requests

#### File Storage Pattern

- Original images stored in `storage/app/private/images/`
- Generated images stored in `storage/app/private/generated/`
- Images served via secure controller routes, not direct access
- UUID-based filenames for uniqueness and security

#### Component Structure

- React components use TypeScript interfaces for props
- Form handling via native fetch with CSRF tokens
- File uploads use FormData with validation on backend
- Preview functionality using URL.createObjectURL()

### Development Notes

- Make all React components and web pages responsive -> working on Mobile and Desktop
- Don't hessitate to correct me if I am saying something wrong or do bad decisions!
- Skeptical mode: question everything, suggest simpler explanations, stay grounded
- Use and spawn sub-agents to run tasks in parallel whenever possible
- Private image storage requires route-based access control
- ALWAYS read the latest documentation from context7
- Concurrent development setup runs all services simultaneously
- Use `git mv` to move files that are under version control
- Avoid useless or unnecessary comments

#### React

- Don't use `React.memo`, `useCallback` or `useMemo` since the React compiler handles these optimizations automatically
- Follow Rules of React (https://react.dev/reference/rules) strictly
- Use Tailwind flex to design the layout
- Create small, self contained components or subcomponents where it is usefull
- Create custom hooks where it is usefull
- Move subcomponents and custom hooks into dedicated folders
- Use shadcn-ui and Tailwind CSS for the styling in the frontend
- New UI components must be generated with shadcn-ui with `bunx --bun shadcn@latest add` (rename files to PascalCase after generation)
- Check for compiler errors with `bun run types` at the end
- Check for linter errors with `bun run lint` at the end
- Format all changed files (except php) with `prettier` at the very end
- Use `PascalCase` for components file names except page components (in page folder)
- Use `kebab-case` for page components (in page folder)

#### Laravel

- Use as much Laravel functionallity in the backend as possible
- Use Inertia functionallity whereever possible
- Use PHP nullsafe syntax (`?->`) whereever it is usefull
- Use `Laravel Pint` after changing php files

## Authentication Pattern

This application uses passwordless authentication:

- Email-based registration and login (case-insensitive)
- User profiles include: first_name, last_name, phone_number
- Registration integrated into multi-step wizard flow

## AI Image Generation

### OpenAI Integration

- Custom `OpenAiService` class for image generation
- Supports DALL-E 2 and GPT-Image-1 models
- Master prompt system for consistent image stylization
- Automatic PNG format conversion
- Base64 JSON response format

### Image Handling

- Original images: `storage/app/private/images/`
- Generated images: `storage/app/private/generated/`
- React Image Crop integration for user image editing
- Secure controller-based image serving (no direct access)

## Wizard/Multi-Step Forms

The application uses a custom wizard pattern:

- `useWizardNavigation` hook for state management
- Step validation before navigation allowed
- Sticky mobile navigation buttons
- Progress indicators and step labels
- Integrated with user registration flow

## API Patterns

- `apiFetch` utility for CSRF-protected API requests
- API resource controllers for prompts and mugs
- Consistent error handling and validation

## Key Dependencies

- **framer-motion**: Animation library for UI transitions
- **react-image-crop**: Image cropping functionality
- **Guzzle HTTP**: HTTP client for OpenAI API calls
- **clsx + tailwind-merge**: Utility for dynamic class names
