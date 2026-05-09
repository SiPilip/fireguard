# Notification Tables Migration

This migration adds three new tables to support real-time push notifications in the FireGuard application.

## Tables Created

### 1. `device_tokens`
Stores FCM device tokens for push notification delivery.

**Columns:**
- `id` - Primary key
- `user_id` - Foreign key to users table
- `device_token` - Unique FCM device token (VARCHAR 255)
- `platform` - Device platform (ENUM: 'android', 'ios')
- `is_active` - Token active status (BOOLEAN)
- `created_at` - Token registration timestamp
- `updated_at` - Last update timestamp
- `last_used_at` - Last time token was used for notification

**Indexes:**
- `idx_user_id` - For querying tokens by user
- `idx_device_token` - For quick token lookups
- `idx_active` - For filtering active tokens

### 2. `notification_preferences`
Stores user preferences for notification types.

**Columns:**
- `id` - Primary key
- `user_id` - Foreign key to users table (UNIQUE)
- `approved` - Receive notifications for approved reports (BOOLEAN, default TRUE)
- `in_progress` - Receive notifications for in-progress reports (BOOLEAN, default TRUE)
- `completed` - Receive notifications for completed reports (BOOLEAN, default TRUE)
- `verified` - Receive notifications for verified reports (BOOLEAN, default TRUE)
- `false_report` - Receive notifications for false reports (BOOLEAN, default TRUE)
- `created_at` - Preference creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- `idx_user_id` - For querying preferences by user

### 3. `notification_logs`
Logs all notification delivery attempts for monitoring and debugging.

**Columns:**
- `id` - Primary key
- `report_id` - Foreign key to reports table
- `user_id` - Foreign key to users table
- `device_token` - Device token used for delivery (VARCHAR 255)
- `status_change` - Report status that triggered notification (VARCHAR 50)
- `title` - Notification title (VARCHAR 255)
- `body` - Notification body text (TEXT)
- `delivery_status` - Delivery result (ENUM: 'sent', 'failed', 'retry')
- `error_message` - Error details if delivery failed (TEXT)
- `retry_count` - Number of retry attempts (INT, default 0)
- `sent_at` - Notification send timestamp

**Indexes:**
- `idx_report_id` - For querying logs by report
- `idx_user_id` - For querying logs by user
- `idx_sent_at` - For time-based queries
- `idx_delivery_status` - For filtering by delivery status

## Running the Migration

```bash
node scripts/add-notification-tables.mjs
```

## Requirements Satisfied

This migration satisfies the following requirements from the spec:
- **Requirement 1.4**: Device token storage with user association
- **Requirement 6.4**: Notification preferences storage per user
- **Requirement 2.7**: Notification delivery logging
- **Requirement 10.3**: Error tracking and monitoring

## Notes

- All tables use InnoDB engine with utf8mb4 charset
- Foreign keys are set with CASCADE delete to maintain referential integrity
- The migration is idempotent - it checks if tables exist before creating them
- Default values are set for notification preferences (all enabled by default)
