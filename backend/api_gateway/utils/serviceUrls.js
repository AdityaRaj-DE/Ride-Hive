require('dotenv').config();

module.exports = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  rider: process.env.RIDER_SERVICE_URL || 'http://rider-service:3002',
  driver: process.env.DRIVER_SERVICE_URL || 'http://driver-service:3003',
  ride: process.env.RIDE_SERVICE_URL || 'http://ride-service:3004',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005',
  feedback: process.env.FEEDBACK_SERVICE_URL || 'http://feedback-service:3006',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3007',
  pool: process.env.POOL_SERVICE_URL || 'http://pool-service:3008',
  admin: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3009'
};