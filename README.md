# Ride-Hive: Microservices-Based Urban Mobility Ecosystem

![Ride-Hive Hero Banner](file:///C:/Users/rajba/.gemini/antigravity/brain/a8016d54-7122-4c89-b149-95e6b7377bbe/ride_hive_hero_1778694009081.png)

## Overview
Ride-Hive is a distributed, microservices-based ride-sharing platform designed for high scalability, real-time event orchestration, and premium user interaction. The system leverages a decentralized architecture to handle authentication, ride lifecycles, payment processing, and real-time notifications across specialized service boundaries.

The platform features a futuristic Glassmorphism-based UI/UX across three distinct frontends: Rider, Driver (Tactical Command Center), and Admin.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Microservices](#core-microservices)
3. [Technical Workflows](#technical-workflows)
4. [API Reference](#api-reference)
5. [Data Dictionary](#data-dictionary)
6. [Client-Side Architecture](#client-side-architecture)
7. [Design System](#design-system)
8. [Installation and Execution](#installation-and-execution)

---

## System Architecture
The Ride-Hive ecosystem is composed of 11 independent microservices that communicate via a combination of RESTful APIs and asynchronous WebSockets.

### Infrastructure Components
- **API Gateway**: Orchestrates request routing and WebSocket proxying.
- **Service Discovery**: Internal service-to-service communication managed via environment-defined URLs.
- **Real-time Layer**: Socket.io for bi-directional event streaming.
- **Database Layer**: Per-service MongoDB collections for data isolation.

---

## Core Microservices

### 1. API Gateway (Port: 3000)
- **Purpose**: Single entry point for all client requests.
- **Responsibilities**: Request proxying, CORS management, and WebSocket orchestration for the Ride Service.

### 2. Auth Service (Port: 3001)
- **Purpose**: Identity and Access Management (IAM).
- **Responsibilities**: JWT issuance, user/driver registration, session management, and wallet balance initialization.

### 3. Rider Service (Port: 3002)
- **Purpose**: Rider-specific data management.
- **Responsibilities**: Rider profile lifecycle and historical data persistence.

### 4. Driver Service (Port: 3003)
- **Purpose**: Driver operations and availability management.
- **Responsibilities**: Real-time location tracking, availability status, subscription management, and driver-specific financial tracking.

### 5. Ride Service (Port: 3004)
- **Purpose**: Core business logic and ride orchestration.
- **Responsibilities**: Ride lifecycle management (Request, Accept, Start, Complete), fare calculation, and OTP verification.

### 6. Payment Service (Port: 3005)
- **Purpose**: Transactional integrity and financial processing.
- **Responsibilities**: Payment creation, wallet synchronization, and transaction history tracking.

### 7. Feedback Service (Port: 3006)
- **Purpose**: Rating and review aggregation.
- **Responsibilities**: Managing bi-directional ratings between riders and drivers.

### 8. Notification Service (Port: 3007)
- **Purpose**: Communication orchestration.
- **Responsibilities**: Sending system alerts, ride status updates, and transactional notifications via Email and Push channels.

### 9. Pool Service (Port: 3008)
- **Purpose**: Multi-passenger ride optimization.
- **Responsibilities**: Logic for ride-sharing, route overlapping, and collaborative fare calculation.

### 10. Admin Service (Port: 3009)
- **Purpose**: Operational oversight and analytics.
- **Responsibilities**: System-wide monitoring, user management, and high-level financial reporting.

---

## Technical Workflows

### 1. Ride Request Lifecycle
1. **Initiation**: Rider submits a request via `POST /ride/request` with GeoJSON coordinates.
2. **Orchestration**: The Ride Service calculates distance, duration, and fare using internal routing utilities.
3. **Discovery**: The Ride Service queries the Driver Service (`GET /nearby`) for drivers within a specific radius.
4. **Broadcast**: The Ride Service emits a `ride_broadcast` event via the API Gateway to all available drivers.
5. **Acceptance**: A driver accepts the ride via `POST /ride/accept/:rideId`, which updates the ride status to `ACCEPTED` and toggles driver availability.

### 2. Real-time Location Updates
Drivers emit location updates to the Driver Service via `PUT /driver/location`. During an active ride, these coordinates are proxied in real-time to the Rider App via WebSockets for live tracking on the tactical map.

### 3. Payment and Completion
Upon ride completion (`POST /ride/complete/:rideId`), the Ride Service triggers the Payment Service to create a transaction record, deduct funds from the rider's wallet, and add earnings to the driver's profile.

---

## API Reference

The system endpoints are exposed through the API Gateway on port `3000`. Authentication is handled via JWT in the `Authorization` header (`Bearer <token>`).

### Auth Service (via `/auth`)
- `POST /otp/send`: Initiates OTP delivery to a mobile number.
- `POST /otp/verify`: Validates OTP and processes Login/Registration. Returns JWT and user profile.
- `POST /refresh`: Rotates refresh tokens and issues a new access token.
- `POST /logout`: Invalidates the current session and revokes refresh tokens.
- `GET /me`: Returns the authenticated user's profile and active role.
- `POST /role/activate`: Switches the user's `activeRole` between `rider` and `driver`.

### Rider Service (via `/rider`)
- `POST /onboard`: Initial profile setup for new riders.
- `PATCH /profile`: Modifies existing rider profile attributes.
- `GET /profile`: Retrieves the rider's specific data and preferences.

### Driver Service (via `/driver`)
- `POST /onboard/basic`: Captures basic identity and contact information.
- `POST /onboard/vehicle`: Captures vehicle specifications (Model, Plate, Color).
- `POST /onboard/documents`: Processes legal documents (License, Insurance).
- `GET /me`: Returns the comprehensive driver profile.
- `PATCH /me`: Updates driver-specific information.
- `PUT /availability`: Manages the driver's online/offline status for ride matching.
- `PUT /location`: Real-time GPS coordinate updates for the tactical map.
- `GET /wallet`: Retrieves current earnings, balance, and transaction history.
- `POST /wallet/add-funds`: Processes fund additions to the driver wallet.
- `POST /subscription/subscribe`: Enrolls the driver in a subscription plan.
- `GET /subscription/status`: Returns current plan validity and expiry.

### Ride Service (via `/ride`)
- `POST /`: Creates a new ride request (Rider-side).
- `GET /active`: Fetches the currently active ride session for the user.
- `GET /available`: Returns available ride requests for scanning drivers.
- `POST /:id/accept`: Driver acceptance of a pending ride request.
- `POST /:id/arriving`: Alerts the rider that the driver is reaching the pickup point.
- `POST /:id/start`: Transitions ride to `STARTED` state (Requires 4-digit OTP).
- `POST /:id/complete`: Finalizes the ride and initiates the payment cycle.
- `POST /:id/cancel`: Rider-initiated cancellation of a request or active ride.
- `POST /:id/cancel-driver`: Driver-initiated cancellation of an accepted ride.
- `GET /history`: Returns historical ride logs for the authenticated user.
- `GET /:id`: Retrieves full details and status of a specific ride.
- `POST /sos`: Triggers an emergency SOS alert to the Admin console.
- `POST /estimate`: Provides fare and ETA estimates for a prospective route.
- `POST /route`: Returns GeoJSON geometry for map rendering.

#### Pooling Operations (via `/ride/pool`)
- `POST /create`: Initializes a new shared-ride pool.
- `POST /:rideId/add`: Adds a secondary rider to an existing pool.
- `POST /update-stop`: Recalculates route and stops for a multi-passenger ride.
- `GET /available`: Lists active pools eligible for matching.

### Payment Service (via `/payment`)
- `POST /create`: Generates a new transaction record for a completed ride.
- `GET /status/:paymentId`: Queries real-time transaction status.
- `PATCH /refund/:paymentId`: Initiates a refund for a failed or disputed ride.
- `GET /driver/:driverId`: Fetches payout and earning history for a driver.

### Notification Service (via `/notification`)
- `POST /send`: Dispatches a system-generated notification.
- `GET /:userId`: Retrieves the notification inbox for a specific user.
- `PUT /:id/read`: Updates the read status of a notification.

### Feedback Service (via `/feedback`)
- `POST /submit`: Submits a rating and written review for a completed ride.
- `GET /target/:targetId`: Fetches aggregated reviews for a user or driver.

### Admin Service (via `/admin`)
- `POST /otps`: Internal endpoint for syncing OTP logs (Internal Service Key required).
- `GET /otps`: Accesses global OTP logs for debugging.
- `GET /drivers/pending`: Lists drivers awaiting document verification.
- `POST /drivers/:userId/approve`: Grants operational approval to a driver.
- `GET /db/:collection`: Administrative database explorer for auditing.
- `PUT /db/:collection/:id`: Direct record manipulation for support operations.
- `GET /analytics`: Aggregated platform metrics (Revenue, Active Users, System Health).

---

## Internal Service APIs

These endpoints are strictly for service-to-service communication and are protected by the `x-internal-key` header.

### Auth Internal
- `PATCH /internal/users/:userId/onboarding`: Syncs onboarding status from other services.
- `GET /internal/users/:userId`: Fetches full user entity (Mobile, Roles, Wallet).
- `PATCH /internal/wallet/:userId`: Modifies wallet balance (Add/Deduct).

### Driver Internal
- `GET /subscription-status/:userId`: Validates driver eligibility for ride matching.
- `GET /by-user/:userId`: Resolves a User ID to a Driver entity.
- `PATCH /:userId/status`: Internal status updates.
- `PATCH /:id/earnings`: Updates driver earning ledger.

---

## Data Dictionary

### User Entity (Auth Service)
- `mobileNumber`: Primary identifier.
- `roles`: Boolean mapping (rider, driver, admin).
- `activeRole`: Current operational mode.
- `onboarding`: Object tracking progress across services.
- `walletBalance`: Current financial standing.

### Driver Entity (Driver Service)
- `userId`: Reference to Auth User.
- `vehicleInfo`: Specifications for the active vehicle.
- `location`: Current GeoJSON `Point`.
- `isAvailable`: Operational availability flag.
- `subscription`: Current active plan and expiry.
- `rating`: Running average of feedback scores.

### Ride Entity (Ride Service)
- `riderId` / `driverId`: Reference pointers.
- `pickup` / `destination`: Geographic coordinates.
- `fare`: Total calculated price.
- `status`: Lifecycle state (REQUESTED, ACCEPTED, STARTED, COMPLETED, CANCELLED).
- `otp`: Secure 4-digit code for ride verification.
- `paymentStatus`: Financial state (PENDING, PAID, REFUNDED).

---

## Client-Side Architecture

### Driver App: Tactical Command Center
- **Scanning Mode**: Optimized state for receiving and evaluating ride offers.
- **Tactical View**: Interactive map navigation that activates upon ride start.
- **Dual Mode Support**: Capability to handle both standard and pool requests.

### Rider App: Seamless Booking
- **Map Selection**: Interactive pickup and drop-off pinning.
- **Live Tracking**: Real-time visualization of the assigned driver's approach.
- **Glassmorphism UI**: High-blur, minimalist interface for a premium experience.

---

## Design System
The project implements a **Glassmorphism SaaS** design philosophy:
- **Visuals**: Depth through `backdrop-blur-xl` and 1px borders.
- **Theming**: Integrated support for dark and light modes with semantic tokens.
- **Typography**: Optimized system-font stack for readability.

---

## Installation and Execution

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (v6.0 or higher)
- npm (v9.0 or higher)

### Setup and Execution
1. **Repository Initialization**:
   ```bash
   git clone https://github.com/AdityaRaj-DE/Ride-Hive.git
   cd Ride-Hive
   npm install
   ```
2. **Environment Configuration**: Configure `.env` files in each `backend/` service directory.
3. **Launch Ecosystem**:
   ```bash
   npm run dev
   ```

---

**System Architecture and Technical Documentation maintained by Aditya Raj.**

