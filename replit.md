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

### Recent Changes (December 2025)
- **Modern Landing Page Redesign**: Complete redesign of home-page.tsx with conversion-focused modern UI:
  - Hero section with gradient background (linear-gradient #0052D4 → #4364F7 → #6FB1FC), glassmorphism partner badge, two-line headline, trust badges (100% en ligne, Réponse 48h, Sécurisé), floating house illustration with animation
  - 4 service cards with colorful gradient icons and hover effects
  - "Comment ça marche?" process timeline with 4 connected steps showing time estimates
  - Service types section with 6 detailed cards for all raccordement types
  - Trust section with 3 pillars (+1200 demandes, Procédure conforme, Paiement sécurisé)
  - Final CTA banner with inverted gradient before footer
  - Scroll reveal animations using IntersectionObserver
  - Mobile-first responsive design tested on iPhone 14 viewport

### Recent Changes (October 2025)
- **GTM-Only Analytics Migration (COMPLETED)**: Comprehensive migration to GTM-T2VZD5DL as the sole analytics source. Removed all direct gtag.js references from 10+ files (web-vitals-monitor.ts, lcp-monitor.ts, seo-optimizer.tsx, google-analytics-provider.tsx, google-ads-types.ts, gclid-validator.ts, google-snippet-button.tsx, raccordement-enedis.tsx, confirmation-page.tsx, analytics.ts). All conversion tracking now flows through window.dataLayer.push(). GTM container loads GA4 (G-VJSY5MXCY7) and Google Tag (GT-MJKTJGCK) internally. Clean build verified with no duplicate scripts. Enhanced Conversions ready with email/phone data via dataLayer. See GTM_MIGRATION_COMPLETE.md for full documentation.

### Recent Changes (September 2025)
- **Reusable Trust & FAQ Components**: Created TrustSection component with 3 key trust signals (+1200 demandes traitées, Procédure conforme Enedis, Paiement 100% sécurisé) and FaqSection component with FAQPage JSON-LD schema support. Both components deployed across all service pages and homepage for improved conversion credibility.
- **Service Pages Content Expansion**: Expanded all 6 service pages (raccordement-provisoire, raccordement-definitif, raccordement-collectif, modification-compteur, raccordement-maison-neuve, viabilisation-terrain) to 500-700 words with required H2 structure (Le processus de raccordement, Documents nécessaires, Délais moyens). Integrated TrustSection and FaqSection components on all pages. Removed all "gratuit" and "devis" mentions per requirements.
- **Local City SEO Pages**: Created 3 new city-specific landing pages (/paris, /lyon, /marseille) with unique 300-400 word content, Service JSON-LD schemas with areaServed properties, proper SEO metadata (title, description, canonical, robots), and full integration of TrustSection and FAQ components.
- **Google Ads Enhanced Conversions**: Implemented Enhanced Conversions with SHA-256 client-side hashing for email and phone data in analytics.ts. Includes Consent Mode v2 compliance (ad_storage check), duplicate prevention mechanism, proper error handling, and security best practices. Ready for improved attribution and reduced Google Ads costs.
- **Infrastructure Updates**: Updated App.tsx routes for city pages with lazy loading, updated sitemap.xml with all 3 city pages (priority 0.8), and added TrustSection to homepage for enhanced trust signals above footer.
- **SEO Silo Implementation**: Built comprehensive 3-tier SEO silo structure for local French city rankings:
  - Service Hub: `/raccordement/` - National overview with regional navigation
  - Regional Hubs: `/raccordement/[region]/` - Regional pages listing cities with local expertise
  - City Spokes: `/raccordement/[ville]/` - 500-750 word unique content per city with conversion forms
  - Dynamic routing system supporting 6 regions and 30+ cities
  - LocalBusiness and FAQ JSON-LD schemas for enhanced search visibility
  - Breadcrumb navigation and internal linking structure optimized for SEO authority
  - Unique meta titles (≤60 chars) and descriptions (≤155 chars) per page
  - NAP data (Name, Address, Phone) with local business hours per city
  - Adjacent city linking for improved local search coverage

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
- **SMTP Server**: s3474.fra1.stableserver.net (Stableserver) for reliable email delivery.
- **Email Account**: kevin@monelec.net (sender) → notifications@raccordement-connect.com (recipient).
- **Nodemailer**: Email sending library with SSL/TLS encryption on port 465.
- **SMTP Configuration Updated**: December 2025 - New credentials and destination email configured.

### Analytics & Marketing
- **Google Tag Manager**: GTM-T2VZD5DL (sole analytics script - all tracking via dataLayer)
- **Google Analytics**: GA4 G-VJSY5MXCY7 (loaded by GTM via Google Tag GT-MJKTJGCK)
- **Google Ads**: Conversion tracking with Enhanced Conversions (email/phone via GTM dataLayer), GCLID capture for attribution

### Other Integrations
- **Puppeteer**: Server-side PDF generation.