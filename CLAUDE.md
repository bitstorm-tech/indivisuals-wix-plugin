# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend Commands
- `composer run dev` - Start development environment (Laravel server + queue + logs + Vite)
- `composer run dev:ssr` - Start with SSR support
- `composer run test` - Run PHP tests (uses Pest)
- `php artisan serve` - Start Laravel server only
- `php artisan queue:listen --tries=1` - Start queue worker
- `php artisan pail --timeout=0` - Start log viewer
- `php artisan migrate` - Run database migrations
- `php artisan tinker` - Laravel REPL

### Frontend Commands
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run build:ssr` - Build with SSR support
- `npm run lint` - Run ESLint (with auto-fix)
- `npm run types` - TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Code Quality
- Laravel Pint is configured for PHP formatting
- ESLint + Prettier for JavaScript/TypeScript
- TypeScript strict mode enabled

## Architecture Overview

This is a Laravel + Inertia.js + React application focused on AI-powered image processing.

### Tech Stack
- **Backend**: Laravel 12 with PHP 8.2+
- **Frontend**: React 19 with TypeScript
- **Bridge**: Inertia.js 2.0 for SPA behavior
- **Styling**: Tailwind CSS 4 + DaisyUI
- **AI Integration**: OpenAI API via `openai-php/laravel`
- **Testing**: Pest (PHP), no frontend tests configured
- **Database**: SQLite (development)

### Key Architectural Patterns

#### Laravel + Inertia.js Integration
- Pages are React components in `resources/js/pages/`
- Routes use `Route::inertia()` for simple page rendering
- API routes return JSON, Inertia routes return React components
- CSRF protection required for all POST requests

#### OpenAI Integration
- Configuration in `config/openai.php` with environment variables
- Direct API calls using `OpenAI::images()->edit()` facade
- Image processing workflow: upload → store locally → generate via API → store result

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

### Current Implementation Status
- Image upload and OpenAI processing implemented in `ImageController`
- Basic React image picker component functional
- Prompt model created but not fully utilized
- Routes configured for image operations

### Development Notes
- Uses SQLite for simplicity in development
- German UI text in image picker component
- Concurrent development setup runs all services simultaneously
- Private image storage requires route-based access control