# replit.md

## Overview

5EVEN is a futuristic educational platform built as a full-stack TypeScript application. It provides digital products (notes, courses, coaching), a contact system, and an admin CMS for content management. The application features a cyberpunk-themed UI with 3D graphics, animations, and a modern dark aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with custom cyberpunk theme (dark mode, neon colors, custom fonts)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **3D Graphics**: React Three Fiber with Drei helpers for hero section visuals
- **Animations**: GSAP with ScrollTrigger and Framer Motion for page transitions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints with Zod schema validation shared between client/server
- **Route Definitions**: Centralized in `shared/routes.ts` with type-safe input/output schemas

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` for shared types, `shared/models/auth.ts` for auth models
- **Migrations**: Drizzle Kit with `db:push` command
- **Tables**: products, messages, site_data, users, sessions

### Authentication
- **Provider**: Replit Auth via OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Implementation**: Located in `server/replit_integrations/auth/`
- **Protected Routes**: Admin endpoints require authentication via `isAuthenticated` middleware

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Vite builds static assets to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Build Script**: Custom `script/build.ts` handles both client and server builds

### Path Aliases
- `@/*` → `client/src/*` (frontend code)
- `@shared/*` → `shared/*` (shared types and schemas)
- `@assets` → `attached_assets/` (static assets)

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations

### Authentication
- Replit OpenID Connect (requires `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`)
- Passport.js with openid-client strategy

### Frontend Libraries
- React Three Fiber ecosystem for 3D rendering
- GSAP for advanced animations
- react-pdf for PDF preview functionality

### Development Tools
- Replit-specific Vite plugins (runtime error overlay, cartographer, dev banner)
- TypeScript with strict mode enabled