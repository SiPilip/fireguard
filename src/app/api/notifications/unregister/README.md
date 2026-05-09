# Device Token Unregister Endpoint

## Endpoint
`DELETE /api/notifications/unregister`

## Purpose
Allows mobile apps to unregister their FCM device tokens when users log out, preventing notifications from being sent to logged-out devices.

## Requirements
- **Requirement 1.6**: WHEN a user logs out, THE Mobile_App SHALL remove the Device_Token from the Backend_API

## Request

### Headers
- `Authorization: Bearer <JWT_TOKEN>` (required)
- `Content-Type: application/json`

### Body
```json
{
  "deviceToken": "string (required)"
}
```

## Response

### Success (200 OK)
```json
{
  "success": true,
  "message": "Device token berhasil dihapus."
}
```

### Token Not Found or Already Inactive (200 OK)
```json
{
  "success": true,
  "message": "Device token tidak ditemukan atau sudah tidak aktif."
}
```

### Invalid Device Token (400 Bad Request)
```json
{
  "message": "Device token tidak valid."
}
```

### Unauthorized (401 Unauthorized)
```json
{
  "success": false,
  "message": "Autentikasi gagal. Silakan login ulang."
}
```

### Rate Limited (429 Too Many Requests)
```json
{
  "message": "Terlalu banyak permintaan. Coba lagi nanti."
}
```

### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Terjadi kesalahan pada server.",
  "error": "Error details (development only)"
}
```

## Implementation Details

### Soft Delete
The endpoint uses a **soft delete** approach by setting `is_active = FALSE` instead of deleting the record. This preserves:
- Notification logs history
- Device token audit trail
- Ability to reactivate tokens if needed

### Security
- JWT authentication required
- Rate limiting: 10 requests per minute per IP
- User can only delete their own device tokens
- Device token is trimmed to prevent whitespace issues

### Database Query
```sql
UPDATE device_tokens 
SET is_active = FALSE, updated_at = NOW()
WHERE user_id = ? AND device_token = ? AND is_active = TRUE
```

## Manual Testing

### Test Case 1: Successful Unregistration
```bash
curl -X DELETE http://localhost:3000/api/notifications/unregister \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceToken": "test-device-token-123"}'
```

**Expected**: 200 OK with success message

### Test Case 2: Invalid Token (Empty String)
```bash
curl -X DELETE http://localhost:3000/api/notifications/unregister \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceToken": ""}'
```

**Expected**: 400 Bad Request

### Test Case 3: Missing Authentication
```bash
curl -X DELETE http://localhost:3000/api/notifications/unregister \
  -H "Content-Type: application/json" \
  -d '{"deviceToken": "test-token"}'
```

**Expected**: 401 Unauthorized

### Test Case 4: Token Already Inactive
```bash
# Run the same request twice
curl -X DELETE http://localhost:3000/api/notifications/unregister \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceToken": "test-device-token-123"}'
```

**Expected**: First request returns success, second request returns "tidak ditemukan atau sudah tidak aktif"

## Integration with Mobile App

The Flutter mobile app should call this endpoint when:
1. User explicitly logs out
2. User switches accounts
3. User deletes their account

Example Flutter code:
```dart
Future<void> unregisterDeviceToken() async {
  final token = await FirebaseMessaging.instance.getToken();
  if (token == null) return;
  
  final response = await http.delete(
    Uri.parse('$baseUrl/api/notifications/unregister'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({'deviceToken': token}),
  );
  
  if (response.statusCode == 200) {
    print('Device token unregistered successfully');
  }
}
```
