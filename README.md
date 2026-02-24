# Evenoo - Event Management Platform

A comprehensive event management platform built with React Native and Expo, enabling participants to discover and register for events, organizers to create and manage events, and vendors to offer services.

## Overview

Evenoo is a multi-role platform supporting four user types:
- **Participants**: Discover, register, and attend events
- **Organizers**: Create, manage, and promote events
- **Vendors**: Offer services and manage bookings
- **Admins**: Oversee platform operations and approvals

## Tech Stack

### Frontend
- **React Native 0.81.5** - Cross-platform mobile framework
- **Expo 54.0.10** - Managed workflow for React Native
- **Expo Router 6.0.8** - File-based routing
- **React 19.1.0** - UI library
- **TypeScript 5.9.2** - Type safety
- **Zustand 5.0.11** - State management

### Styling & UI
- **React Native StyleSheet** - Native styling
- **Expo Linear Gradient** - Gradient backgrounds
- **Lucide React Native** - Icon library
- **Expo Vector Icons** - Additional icon set

### Database & Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **@supabase/supabase-js 2.58.0** - Supabase client

### Navigation
- **Expo Router** - App routing and navigation
- **React Navigation** - Native navigation components
- **Bottom Tabs** - Tab-based navigation

### Native APIs
- **Expo Camera** - Camera functionality
- **Expo Clipboard** - Clipboard operations
- **Expo Haptics** - Vibration feedback
- **Expo Web Browser** - External links

### Development
- **Babel 7.25.2** - JavaScript transpiler
- **Expo Lint** - Code linting
- **TypeScript** - Static type checking

## Project Structure

```
/
├── app/                           # Expo Router pages
│   ├── (admin)/                   # Admin routes
│   │   ├── approvals.tsx          # Event approval management
│   │   ├── users.tsx              # User management
│   │   └── index.tsx              # Admin dashboard
│   ├── (auth)/                    # Authentication flows
│   │   ├── sign-in.tsx            # Login page
│   │   ├── sign-up.tsx            # Registration page
│   │   ├── role-selection.tsx     # User role selection
│   │   └── welcome.tsx            # Welcome screen
│   ├── (organizer)/               # Organizer routes
│   │   ├── create.tsx             # Event creation
│   │   ├── events.tsx             # Event list management
│   │   ├── profile.tsx            # Organizer profile
│   │   ├── event/[id].tsx         # Event details
│   │   └── index.tsx              # Organizer dashboard
│   ├── (participant)/             # Participant routes
│   │   ├── explore.tsx            # Event discovery
│   │   ├── notifications.tsx      # User notifications
│   │   ├── tickets.tsx            # Event tickets
│   │   ├── wallet.tsx             # Wallet management
│   │   ├── profile.tsx            # User profile
│   │   ├── event/[id].tsx         # Event details
│   │   └── index.tsx              # Participant dashboard
│   ├── (vendor)/                  # Vendor routes
│   │   ├── bookings.tsx           # Vendor bookings
│   │   ├── inventory.tsx          # Service inventory
│   │   ├── profile.tsx            # Vendor profile
│   │   └── index.tsx              # Vendor dashboard
│   ├── _layout.tsx                # Root layout
│   ├── index.tsx                  # Auth flow router
│   └── +not-found.tsx             # 404 page
├── components/                    # Reusable UI components
│   ├── ui/                        # Shared UI components
│   │   ├── Card.tsx               # Card container
│   │   ├── Badge.tsx              # Status badges
│   │   ├── Input.tsx              # Text input
│   │   ├── GradientButton.tsx     # Gradient button
│   │   └── ErrorBoundary.tsx      # Error handling
│   ├── organizer/
│   │   └── StatCard.tsx           # Dashboard stats
│   └── participant/
│       ├── EventCard.tsx          # Event listing card
│       └── TicketCard.tsx         # Ticket display
├── lib/                           # Utilities and config
│   ├── supabase.ts                # Supabase client setup
│   └── theme.ts                   # Theme configuration
├── hooks/                         # React hooks
│   ├── useTheme.ts                # Theme management
│   └── useFrameworkReady.ts       # Framework initialization
├── store/                         # Zustand stores
│   ├── authStore.ts               # Authentication state
│   └── eventDraftStore.ts         # Event creation draft
├── types/                         # TypeScript types
│   └── index.ts                   # Type definitions
├── supabase/                      # Database migrations
│   └── migrations/                # SQL migration files
├── assets/                        # Static assets
│   └── images/                    # App icons and images
└── .env                           # Environment variables
```

## Key Features

### Authentication
- Email/password signup and login
- Multi-role user system
- Secure session management with Supabase Auth

### Event Management
- Create events with comprehensive details
- Multiple event types (individual/team)
- Flexible registration and payment options
- Event status tracking (draft/pending/live/completed/cancelled)
- File submission support

### User Roles

#### Participant
- Browse and search events
- Register for events individually or in teams
- Manage tickets and event attendance
- Wallet for payments
- View notifications

#### Organizer
- Create and publish events
- Manage registrations and participants
- Track event analytics
- Set pricing and fees
- Manage vendor bookings

#### Vendor
- List services and inventory
- Manage booking requests
- Track availability
- Handle vendor inquiries

#### Admin
- Approve event creation
- Manage users
- Monitor platform activity

### Data Models

#### Core Entities
- **Users** - Platform users with roles and profiles
- **Events** - Comprehensive event details and settings
- **Registrations** - Individual and team event registrations
- **Tickets** - Event tickets for participants
- **Payments** - Transaction and wallet management
- **Vendors** - Service provider profiles
- **Categories** - Event categorization

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `users` - User accounts and profiles
- `events` - Event details and configuration
- `registrations` - Event registrations
- `tickets` - Event tickets
- `wallet_transactions` - Payment records
- `notifications` - User notifications
- `vendors` - Vendor profiles
- `vendor_inventory` - Vendor services
- `vendor_bookings` - Vendor booking requests
- `categories` - Event categories
- `subcategories` - Event subcategories

Row Level Security (RLS) policies ensure users only access their own data.

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Expo CLI
- Supabase account

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building
```bash
npm run build:web
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Development Workflow

### Adding New Routes
Place new route files in the `/app` directory following Expo Router conventions. Use group folders like `(auth)`, `(organizer)` for organization.

### Creating Components
Add reusable components to `/components` directory, organized by feature area (ui, organizer, participant, vendor).

### State Management
Use Zustand stores in `/store` directory for global state. Create a new store for each major feature.

### Type Definitions
Add new types to `/types/index.ts` and keep them organized by feature.

## Security

- Database queries use Row Level Security (RLS) policies
- Authentication handled through Supabase
- Sensitive operations require proper authorization
- User input validation on both client and server

## Performance Optimizations

- Code splitting through Expo Router
- Lazy loading of routes
- Efficient state management with Zustand
- Memoization for expensive computations
- Image optimization

## Troubleshooting

### Authentication Issues
- Clear app cache and restart dev server
- Verify environment variables are set correctly
- Check Supabase connection status

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `npm run clean` (if available)
- Check TypeScript errors: `npm run typecheck`

## Future Enhancements

- Push notifications
- Social media integration
- Advanced analytics dashboard
- In-app messaging
- Event recommendations
- Real-time collaboration features

## License

Private project - All rights reserved

## Support

For issues and questions, contact the development team.
