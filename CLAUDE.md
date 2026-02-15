# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ticket sales system for UKA på Blindern, a Norwegian student festival. Features Vipps Checkout payment integration, PDF ticket generation with barcodes, entrance scanning, and admin management with SAML2 authentication.

**Tech Stack:**
- Backend: Laravel 12 (PHP 8.5) with MySQL 8.4
- Frontend: Angular 21 (standalone components, no NgModules)
- Payment: Vipps Checkout
- Auth: SAML2 for admin access (requires `ukabillettadmin` group)

## Common Commands

### Backend (from `backend/` directory)

```bash
php artisan migrate           # Run database migrations
php artisan db:seed           # Seed test data
php artisan serve --port 8081 # Start dev server
vendor/bin/phpunit            # Run all tests
vendor/bin/phpunit --filter=TestName  # Run single test
vendor/bin/pint               # Format code (Laravel Pint)
```

OpenTelemetry packages require `--ignore-platform-req=ext-opentelemetry` for local composer operations (extension only available in Docker).

### Frontend (from `frontend/` directory)

```bash
pnpm ng serve --port 3000 --open  # Start dev server
pnpm run build                    # Production build
pnpm test                         # Run tests (Karma + Jasmine)
pnpm run lint                     # Lint with ESLint
```

### E2E Tests (from `e2e-tests/` directory)

```bash
pnpm test                                              # Run against production
BASE_URL=http://localhost:3000 pnpm test -- --grep @frontend  # Local frontend
BASE_URL=http://localhost:8081 pnpm test -- --grep @api       # Local backend
pnpm test:headed                                       # Run with visible browser
pnpm test:ui                                           # Run with Playwright UI
```

Defaults to `https://billett.blindernuka.no`. Set `BASE_URL` env var (or `.env` file) to test locally.
Use separate BASE_URLs for frontend (:3000) and API (:8081) tests when running locally.
Runs hourly via GitHub Actions for monitoring. Also runs post-deploy filtered by `@api` / `@frontend` tags.

### Local Development Setup

```bash
docker compose up database phpmyadmin  # MySQL + phpMyAdmin (localhost:8080, uka_billett/uka_billett)
cd backend && php artisan serve --port 8081
cd frontend && pnpm ng serve --port 3000 --open
```

### Production Deployment

Automatic on push to `main`. Database migrations run manually via SSH.

## Architecture

### Backend Structure

**Core Domain Models** (`backend/app/src/Billett/`):
- `Eventgroup` → `Event` → `Ticketgroup` → `Ticket` (hierarchical)
- `Order` → `Ticket` + `Payment` (order contains tickets and payments)
- `Paymentgroup` → `Paymentsource` (for non-web payments like cash registers)

**Key Patterns:**
- All models implement `ApiQueryInterface` for consistent API querying
- Guest-accessible models have `*Guest` counterparts with limited fields (e.g., `EventGuest`)
- `ModelHelper::getModelPath()` returns Guest models by default; returns full models when `?admin` query param is present AND user is admin
- Namespace: `Blindern\UKA\Billett\`

**Business Logic:**
- Reservation expiry: 10 min incomplete, 30 min locked (payment in progress)
- Online selling freezes 2 hours AFTER event start (allows latecomers)
- `Order.balance`: difference between payments and ticket value
- Ticket states: valid, pending (reserved), revoked (refunded)

### Frontend Structure

- `/a/*` - Admin interface (lazy-loaded from `src/admin/routes.ts`, `requireAdmin` guard)
- `/` - Guest/public interface (from `src/app.routes.ts`)
- Standalone components with `inject()` pattern, Bootstrap 3 SASS
- `frontend/src/apitypes.ts` - TypeScript interfaces for all API responses

### Vipps Testing

Requires ngrok or similar tunnel for local callbacks. Configure in `backend/.env`:
- Get keys from https://portal.vipps.no/56260/developer/api-keys/test
- Set `VIPPS_LOCAL_CALLBACK_URL` to ngrok URL
- Test users at https://portal.vipps.no/56260/developer/test-users
