# Replit.md

## Overview

Raccordement-Elec.fr (now portail-electricite.com) is a French electrical connection service platform designed to streamline electrical connection requests for individuals, real estate developers, subdividers, and businesses in France. The platform provides a multi-step user experience, secure payment processing, automated notifications, and a comprehensive administration system for managing customer interactions and requests. The project aims to provide an easy and efficient way to manage electrical connection processes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite)
- **UI**: Tailwind CSS with Radix UI
- **Form Management**: React Hook Form with Zod
- **Routing**: Wouter

### Backend
- **Server**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with role-based access control (Admin, Manager, Agent)
- **File Storage**: Local file system for documents
- **Email**: SMTP integration

### Key Features
- **Multi-step Form System**: Progressive form completion with validation.
- **Payment Processing**: Stripe integration for secure payments and automated PDF receipt generation (Puppeteer).
- **Reference Generation**: Automatic unique reference number creation.
- **Admin Interface (CRM)**: Dashboard, request management (CRUD), user management, payment tracking, and lead management.
- **Email System**: Automated notifications with professional HTML templates, SMTP integration, and email queueing.
- **UI/UX Decisions**: Focus on consistent design using Radix UI components, responsive design, and accessibility enhancements (e.g., keyboard navigation, screen reader support, prefers-reduced-motion).
- **Technical Implementations**: Optimized performance (e.g., LCP under 2.5s target, streamlined rendering path, GPU acceleration), comprehensive SEO (JSON-LD, Open Graph, Twitter Cards), robust error handling, and browser compatibility (polyfills for older browsers).
- **Mobile Optimizations**: Floating CTA button with smart show/hide behavior, enhanced mobile form validation with proper keyboard types, lazy loading images, mobile-first loading strategies, and touch-optimized interface elements.

### Recent Changes (August 2025)
- **Mobile-First Enhancements**: Implemented floating CTA button positioned bottom-right with gradient blue design, pulse animations, and intelligent visibility control based on scroll position.
- **Form Optimization**: Added mobile-specific form validation, proper input types (email, tel, numeric), autocomplete attributes, and enhanced touch targets (minimum 44px).
- **Performance Improvements**: Integrated lazy loading for images, mobile image optimization, network-aware loading strategies, and reduced motion support.
- **Content Updates**: Removed outdated "plateforme digitale enedis" text and updated footer description for better brand consistency.
- **SMTP Migration Complete**: Successfully migrated from premium234.web-hosting.com (Namecheap) to s4015.fra1.stableserver.net with notification@portail-electricite.com sender. All payment and lead notifications now use the new configuration and deliver to bonjour@portail-electricite.com in real-time.
- **SEO Optimization Complete**: Implemented comprehensive SEO with 12 primary meta tags, Open Graph properties, Twitter Cards, 5 Schema.org structured data types, sitemap.xml, robots.txt, and performance optimizations. Ready for maximum search engine visibility.

## External Dependencies

### Payment Processing
- **Stripe**: Payment gateway for secure transactions.

### Email Services
- **SMTP Server**: s4015.fra1.stableserver.net (Stableserver) for reliable email delivery.
- **Email Account**: notification@portail-electricite.com (sender) → bonjour@portail-electricite.com (recipient).
- **Nodemailer**: Email sending library with SSL/TLS encryption on port 465.

### Analytics & Marketing
- **Google Analytics**: Conversion tracking.
- **Google Ads**: Conversion tracking (including GCLID capture).

### Other Integrations
- **Puppeteer**: Server-side PDF generation.