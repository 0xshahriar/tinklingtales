# Tinkling Tales - Bangles E-commerce Website

## Overview

Tinkling Tales is a static e-commerce website for selling handcrafted bangles in Bangladesh. The site features a product catalog with filtering capabilities, shopping cart functionality, and integration with Google Apps Script for order processing. It's designed as a lightweight, mobile-friendly solution for a small jewelry business offering bridal, daily wear, and festive bangles with cash-on-delivery payment options.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML/CSS/JavaScript**: Pure vanilla JavaScript implementation without frameworks for maximum performance and simplicity
- **Responsive Design**: Mobile-first approach using CSS Grid and Flexbox with Inter font family
- **CSS Custom Properties**: Centralized theming system using CSS variables for consistent styling
- **Component-based Structure**: Modular JavaScript functions for product rendering, cart management, and filtering

### Product Management
- **JSON-based Catalog**: Products stored in `products.json` with structured data including ID, name, price, colors, sizes, finish, images, and tags
- **Dynamic Filtering**: Client-side filtering by search query, color, size, and price range
- **Lazy Loading**: Progressive product display with "Load More" functionality to improve initial page load

### State Management
- **Local Storage Persistence**: Shopping cart data persisted in browser localStorage for session continuity
- **Client-side State**: Simple JavaScript object managing current filters, search query, and cart contents
- **Real-time Updates**: Immediate UI updates for cart additions, removals, and filter changes

### Order Processing
- **Google Apps Script Integration**: Orders submitted to Google Sheets via Apps Script API endpoint
- **Form-based Checkout**: Simple contact form for order details without complex payment processing
- **Cash on Delivery**: Primary payment method for the Bangladesh market

### Static File Serving
- **Node.js HTTP Server**: Custom server implementation for local development and deployment
- **MIME Type Handling**: Proper content-type headers for various file types
- **Security Features**: Path traversal protection and CORS headers for cross-origin requests
- **404 Handling**: Graceful error handling for missing resources

### User Authentication
- **Minimal Auth System**: Basic login/signup pages prepared for future user account features
- **Dashboard Ready**: User dashboard structure in place for order history and profile management

### SEO and Social Media
- **Meta Tag Optimization**: Comprehensive Open Graph and meta descriptions for social sharing
- **Canonical URLs**: Proper canonical link structure for search engine optimization
- **Structured Navigation**: Clear URL structure with dedicated pages for policies and contact information

## External Dependencies

### Third-party Services
- **Google Apps Script**: Backend service for order processing and data submission to Google Sheets
- **Facebook Messenger**: Primary customer communication channel integrated into contact forms
- **Google Fonts**: Inter font family loaded from Google Fonts CDN for consistent typography

### Development Dependencies
- **Node.js HTTP Module**: Built-in Node.js modules for static file serving
- **Netlify Hosting**: Deployment target with custom domain support and HTTPS

### Payment Integration
- **Cash on Delivery**: No online payment gateway integration, relying on traditional COD model
- **Courier Services**: Integration points prepared for nationwide shipping via local courier services

### Analytics and Tracking
- **No Analytics Currently**: Clean implementation without tracking scripts, ready for Google Analytics or similar services if needed