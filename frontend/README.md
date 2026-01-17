# Ride Sharing App - Frontend

A simple React + TypeScript frontend for the Ride Sharing App.

## Features

- **User Authentication**: Login and Register for both Riders and Drivers
- **Rider Dashboard**: Request rides and view ride history
- **Driver Dashboard**: Manage availability and view profile
- **Tailwind CSS**: Modern, responsive styling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the backend API Gateway is running on `http://localhost:5000`

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns)

## Usage

### As a Rider:
1. Register/Login as a User
2. Go to Rider Dashboard
3. Enter pickup and drop locations
4. Request a ride
5. View your ride history

### As a Driver:
1. Register/Login as a Driver (Captain)
2. Fill in vehicle information (color, plate, capacity, type)
3. Go to Driver Dashboard
4. Toggle availability to start accepting rides
5. View your profile

## API Configuration

The API base URL is configured in `src/services/api.ts`. By default, it points to `http://localhost:5000` (API Gateway).

If you need to change this, update the `API_BASE_URL` constant in `src/services/api.ts`.

## Project Structure

```
src/
├── context/          # Auth context for state management
├── pages/            # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── RiderDashboard.tsx
│   └── DriverDashboard.tsx
├── services/         # API service layer
│   └── api.ts
├── App.tsx           # Main app component with routing
└── main.tsx          # Entry point
```
