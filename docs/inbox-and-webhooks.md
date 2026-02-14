# Inbox & Webhooks Documentation

This document describes how to receive incoming SMS messages via webhooks from Telnyx, Twilio, and SignalWire, and how to view them in the Inbox.

## Overview

The BulkSMS application includes:

- **Inbox** – A dedicated page to view all incoming SMS messages
- **Webhook endpoints** – Public HTTP endpoints that receive inbound message notifications from each provider
- **Provider-specific handlers** – Parsers that extract message data according to each provider's webhook format

## Webhook URLs

Configure these URLs in your provider dashboards as the inbound message webhook:

| Provider | Endpoint | Full URL |
|----------|----------|----------|
| Telnyx | `POST /webhooks/telnyx` | `{APP_URL}/webhooks/telnyx` |
| Twilio | `POST /webhooks/twilio` | `{APP_URL}/webhooks/twilio` |
| SignalWire | `POST /webhooks/signalwire` | `{APP_URL}/webhooks/signalwire` |

Replace `{APP_URL}` with your application URL (e.g. `https://yourdomain.com`). The webhooks are public (no authentication) and excluded from CSRF verification.

## Provider Configuration

### Telnyx

1. Log in to the [Telnyx Mission Control Portal](https://portal.telnyx.com/)
2. Go to **Messaging > Programmable Messaging**
3. Select your messaging profile
4. Under **Inbound**, set the webhook URL to your `{APP_URL}/webhooks/telnyx`

**Payload format (JSON):**

- Event: `message.received`
- Fields used: `payload.from.phone_number`, `payload.to[].phone_number`, `payload.text`, `payload.id`, `payload.media`, `payload.received_at`

**Optional:** Add `TELNYX_PUBLIC_KEY` to `.env` for webhook signature verification.

**Documentation:** [Receiving Webhooks – Telnyx](https://developers.telnyx.com/docs/messaging/messages/receiving-webhooks)

---

### Twilio

1. Log in to the [Twilio Console](https://console.twilio.com/)
2. Go to **Phone Numbers > Manage > Active Numbers**
3. Click the phone number
4. Under **Messaging Configuration**, set **A MESSAGE COMES IN** webhook URL to `{APP_URL}/webhooks/twilio`

**Payload format (application/x-www-form-urlencoded):**

- Fields used: `MessageSid`, `From`, `To`, `Body`, `NumMedia`, `MediaUrl0`, `MediaContentType0`

**Response:** The endpoint returns TwiML (`<Response></Response>`) as required by Twilio.

**Documentation:** [Webhook Request – Twilio](https://www.twilio.com/docs/messaging/guides/webhook-request)

---

### SignalWire

1. Log in to your [SignalWire Space](https://signalwire.com/)
2. Go to **Phone Numbers** and select your number
3. Set the inbound SMS webhook URL to `{APP_URL}/webhooks/signalwire`

**Payload format:** Same as Twilio (Twilio-compatible API).

**Response:** Must return valid TwiML XML. The endpoint returns `<Response></Response>`.

**Documentation:** [Handling Incoming Messages – SignalWire](https://developer.signalwire.com/compatibility-api/guides/messaging/general/handling-incoming-messages-from-code)

## Environment Variables

Add to `.env` as needed:

```env
# Telnyx webhook signature verification (optional)
TELNYX_PUBLIC_KEY=your_telnyx_public_key_base64
```

Twilio and SignalWire use the `auth_token` / `api_token` stored in the SMS provider credentials for signature validation.

## Inbox Page

The Inbox is available at `/inbox` (requires authentication) and shows:

- **From** – Sender phone number
- **To** – Your number that received the message
- **Message** – Text body (or "No text (media only)" for MMS)
- **Provider** – Telnyx, Twilio, or SignalWire
- **Date** – When the message was received

Media attachments (MMS) are stored in metadata and can be opened via links in the Inbox.

## Database Schema

Inbound messages use the same `sms_messages` table with:

| Column | Inbound Usage |
|--------|---------------|
| `direction` | `inbound` |
| `user_id` | `null` (no user context when webhook fires) |
| `from` | Sender's phone number |
| `to` | Your number that received the message |
| `message` | Text content |
| `provider_message_id` | Provider's message ID |
| `received_at` | When the message arrived |
| `metadata` | Optional JSON (e.g. `media` URLs for MMS) |
| `status` | `delivered` |

## Security

- **CSRF:** Webhook routes (`webhooks/*`) are excluded from CSRF verification.
- **Signature verification:**
  - **Telnyx:** Ed25519 (requires `TELNYX_PUBLIC_KEY`)
  - **Twilio / SignalWire:** HMAC-SHA1 with auth token
- Requests with invalid signatures receive HTTP 403.

## Testing

For local development, use a tunnel (e.g. [ngrok](https://ngrok.com/)) so providers can reach your webhooks:

```bash
ngrok http 8000
```

Use the ngrok URL (e.g. `https://abc123.ngrok.io`) as `APP_URL` when configuring webhooks in the provider dashboards.
