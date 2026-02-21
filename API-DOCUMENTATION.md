# ViralFluencer API Documentation

**Base URL:** `http://localhost:3000/api` (development) | `https://your-domain.com/api` (production)

**Total Routes:** 119 | **Auth:** JWT (Bearer token + HTTP-only cookies)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Collaborations](#2-collaborations)
3. [Wallet & Payments](#3-wallet--payments)
4. [Escrow](#4-escrow)
5. [Invoices](#5-invoices)
6. [Payout Methods](#6-payout-methods)
7. [Reputation & Reviews](#7-reputation--reviews)
8. [Verification & Disputes](#8-verification--disputes)
9. [Social Feed](#9-social-feed)
10. [Follow System](#10-follow-system)
11. [CRM (Brand)](#11-crm-brand)
12. [Marketplace](#12-marketplace)
13. [Analytics](#13-analytics)
14. [AI Intelligence](#14-ai-intelligence)
15. [Subscriptions](#15-subscriptions)
16. [Messaging](#16-messaging)
17. [Discovery](#17-discovery)
18. [Tracking & Links](#18-tracking--links)
19. [Reports](#19-reports)
20. [Contracts](#20-contracts)
21. [Content Approval](#21-content-approval)
22. [System](#22-system)

---

## Authentication

All protected routes require a valid JWT token sent as:

- **Cookie:** `access_token` (set automatically on login)
- **Header:** `Authorization: Bearer <token>`

### Auth Middleware Types

| Middleware       | Who Can Access            |
| ---------------- | ------------------------- |
| `withAuth`       | Any authenticated user    |
| `withBrand`      | Brand users only          |
| `withInfluencer` | Influencer users only     |
| `withAdmin`      | Admin users only          |
| `withPublic`     | Anyone (no auth required) |

---

## 1. Authentication

### POST /api/auth/register

Create a new user account.

**Auth:** None (public)

```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "BRAND"  // BRAND | INFLUENCER
}

// Response (201)
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "clx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "BRAND",
    "emailVerified": false,
    "onboardingCompleted": false
  },
  "verificationToken": "abc123..."  // Only in development
}
```

### POST /api/auth/login

Authenticate user and receive tokens.

**Auth:** None (public)

```json
// Request
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}

// Response (200) — also sets access_token & refresh_token cookies
{
  "message": "Login successful",
  "user": {
    "id": "clx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "BRAND",
    "avatar": null,
    "emailVerified": true,
    "onboardingCompleted": true,
    "brandId": "clx...",
    "influencerId": null
  },
  "accessToken": "eyJhbG...",
  "expiresAt": "2026-02-15T12:00:00.000Z"
}
```

### POST /api/auth/logout

Logout and invalidate session.

**Auth:** None

```json
// Response (200)
{ "message": "Logged out successfully" }
```

### POST /api/auth/refresh

Refresh access token using refresh token cookie.

**Auth:** None (uses refresh_token cookie)

```json
// Response (200) — sets new cookies
{
  "message": "Token refreshed",
  "accessToken": "eyJhbG...",
  "expiresAt": "2026-02-15T12:15:00.000Z"
}
```

### GET /api/auth/me

Get current user profile.

**Auth:** `withAuth`

```json
// Response (200)
{
  "user": {
    "id": "clx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "BRAND",
    "avatar": null,
    "emailVerified": true,
    "onboardingCompleted": true,
    "brand": { "id": "clx...", "companyName": "Acme Corp" }
  }
}
```

### PUT /api/auth/me

Update current user profile.

**Auth:** `withAuth`

```json
// Request
{ "name": "John Updated", "avatar": "https://..." }
```

### DELETE /api/auth/me

Soft-delete current user account.

**Auth:** `withAuth`

### POST /api/auth/verify-email

Verify email with token.

**Auth:** None

```json
// Request
{ "token": "verification-token-here" }
```

### POST /api/auth/forgot-password

Request password reset email.

**Auth:** None

```json
// Request
{ "email": "john@example.com" }

// Response (200) — always returns success to prevent enumeration
{ "message": "If an account with that email exists, we have sent a password reset link." }
```

### POST /api/auth/reset-password

Reset password using token.

**Auth:** None

```json
// Request
{ "token": "reset-token-here", "password": "NewSecurePass123!" }
```

---

## 2. Collaborations

### POST /api/collaborations

Create a new collaboration.

**Auth:** `withAuth` (BRAND/ADMIN only)

```json
// Request
{
  "campaignId": "clx...",
  "influencerId": "clx...",
  "agreedAmount": 5000,
  "message": "We'd love to work with you!",
  "startDate": "2026-03-01",
  "endDate": "2026-04-01",
  "contentDueDate": "2026-03-15"
}
```

### GET /api/collaborations

List collaborations with filters.

**Auth:** `withAuth`

**Query params:** `page`, `limit`, `status`, `campaignId`, `influencerId`, `brandId`

### GET /api/collaborations/:id

Get collaboration details with history.

**Auth:** `withAuth`

### POST /api/collaborations/:id/transition

Transition collaboration state.

**Auth:** `withAuth`

```json
// Request
{
  "action": "accept", // accept, reject, cancel, complete, etc.
  "reason": "Looking forward to working together",
  "metadata": {}
}
```

### GET /api/collaborations/:id/transition

Get available actions for current state.

**Auth:** `withAuth`

```json
// Response
{
  "data": {
    "currentStatus": "PENDING",
    "availableActions": ["accept", "reject", "cancel"]
  }
}
```

### POST /api/collaborations/:id/contract

Generate contract for collaboration.

**Auth:** `withAuth` (BRAND/ADMIN)

```json
// Request
{ "templateId": "clx...", "customTerms": "Additional terms..." }
```

### GET /api/collaborations/:id/contract

Get collaboration contract.

**Auth:** `withAuth`

### PUT /api/collaborations/:id/contract

Sign the contract.

**Auth:** `withAuth`

```json
// Request
{ "signature": "base64-signature-data" }
```

### POST /api/collaborations/:id/milestones

Create milestones.

**Auth:** `withAuth` (BRAND/ADMIN)

```json
// Request
{
  "milestones": [
    {
      "title": "Content Draft",
      "order": 1,
      "amount": 2500,
      "dueDate": "2026-03-10"
    },
    {
      "title": "Final Delivery",
      "order": 2,
      "amount": 2500,
      "dueDate": "2026-03-20"
    }
  ]
}
```

### GET /api/collaborations/:id/milestones

Get milestones with deliverables and payments.

**Auth:** `withAuth`

### POST /api/collaborations/:id/deliverables

Create deliverables.

**Auth:** `withAuth` (BRAND/ADMIN)

```json
// Request
{
  "deliverables": [
    {
      "type": "POST",
      "platform": "INSTAGRAM",
      "description": "Product showcase",
      "quantity": 1,
      "dueDate": "2026-03-15"
    }
  ]
}
```

### GET /api/collaborations/:id/deliverables

Get all deliverables.

**Auth:** `withAuth`

### POST /api/collaborations/:id/deliverables/:deliverableId/submit

Submit deliverable (Influencer).

**Auth:** `withAuth` (INFLUENCER/ADMIN)

```json
// Request
{
  "mediaUrls": ["https://..."],
  "caption": "Here's the post draft",
  "notes": "Used the brand colors as discussed"
}
```

### POST /api/collaborations/:id/deliverables/:deliverableId/review

Review deliverable (Brand).

**Auth:** `withAuth` (BRAND/ADMIN)

```json
// Request
{
  "status": "APPROVED", // APPROVED | REVISION_NEEDED | REJECTED
  "feedback": "Looks great!"
}
```

### POST /api/collaborations/:id/messages

Send message in collaboration thread.

**Auth:** `withAuth`

```json
// Request
{ "content": "Hey, just checking in!", "attachments": ["https://..."] }
```

### GET /api/collaborations/:id/messages

Get collaboration messages.

**Auth:** `withAuth` | **Query:** `page`, `limit`

---

## 3. Wallet & Payments

### GET /api/wallet

Get wallet balance and transactions.

**Auth:** `withAuth`

**Query params:** `page`, `limit`, `type` (transaction type filter)

```json
// Response
{
  "data": {
    "balance": { "available": 5000, "pending": 1200, "total": 6200 },
    "transactions": [...]
  }
}
```

### POST /api/wallet/deposit

Deposit funds to wallet (Brand only).

**Auth:** `withAuth` (BRAND/ADMIN)

```json
// Request
{ "amount": 10000, "paymentMethodId": "pm_...", "currency": "USD" }
```

### POST /api/wallet/withdraw

Withdraw funds from wallet (Influencer only).

**Auth:** `withAuth` (INFLUENCER/ADMIN)

```json
// Request
{ "amount": 500, "payoutMethodId": "clx..." }

// Response
{
  "data": {
    "message": "Withdrawal initiated",
    "transaction": {...},
    "estimatedArrival": "3-5 business days"
  }
}
```

---

## 4. Escrow

### POST /api/escrow

Create escrow account for collaboration.

**Auth:** `withBrand`

```json
// Request
{ "collaborationId": "clx...", "amount": 5000, "platformFeePercentage": 10 }
```

### GET /api/escrow/:id

Get escrow account details.

**Auth:** `withAuth`

### POST /api/escrow/:id/fund

Fund escrow from brand wallet.

**Auth:** `withBrand`

### POST /api/escrow/:id/release

Release escrow funds to influencer.

**Auth:** `withBrand`

```json
// Request
{ "milestoneId": "clx...", "amount": 2500 }
```

### POST /api/escrow/:id/refund

Refund escrow to brand.

**Auth:** `withAuth`

```json
// Request
{ "reason": "Campaign cancelled by mutual agreement" }
```

---

## 5. Invoices

### POST /api/invoices

Create an invoice.

**Auth:** `withAuth`

```json
// Request
{
  "type": "BRAND_DEPOSIT",
  "collaborationId": "clx...",
  "lineItems": [
    {
      "description": "Instagram post",
      "quantity": 1,
      "unitPrice": 2500,
      "amount": 2500
    }
  ],
  "taxRate": 18,
  "dueDate": "2026-03-01"
}
```

### GET /api/invoices

List invoices.

**Auth:** `withAuth` | **Query:** `page`, `limit`, `status`

### GET /api/invoices/:id

Get invoice details.

**Auth:** `withAuth`

### POST /api/invoices/:id/send

Send invoice to recipient.

**Auth:** `withAuth`

### POST /api/invoices/:id/pay

Mark invoice as paid.

**Auth:** `withAuth`

```json
// Request
{ "paymentReference": "txn_abc123" }
```

---

## 6. Payout Methods

### POST /api/payout-methods

Add payout method.

**Auth:** `withInfluencer`

```json
// Request
{
  "type": "BANK_TRANSFER",
  "bankName": "State Bank",
  "accountNumberLast4": "1234",
  "routingNumber": "110000000",
  "country": "US",
  "currency": "USD",
  "isDefault": true
}
```

### GET /api/payout-methods

List payout methods.

**Auth:** `withInfluencer`

### GET /api/payout-methods/:id

Get specific payout method.

**Auth:** `withInfluencer`

### DELETE /api/payout-methods/:id

Delete payout method.

**Auth:** `withInfluencer`

### POST /api/payout-methods/:id/default

Set as default payout method.

**Auth:** `withInfluencer`

---

## 7. Reputation & Reviews

### GET /api/reputation/:userId

Get reputation breakdown.

**Auth:** `withAuth`

```json
// Response
{
  "data": {
    "overallScore": 4.7,
    "totalReviews": 15,
    "breakdown": {
      "communication": 4.8,
      "quality": 4.6,
      "professionalism": 4.9
    }
  }
}
```

### POST /api/reviews/influencer

Review an influencer (Brand only).

**Auth:** `withBrand`

```json
// Request
{
  "influencerId": "clx...",
  "campaignId": "clx...",
  "rating": 5,
  "comment": "Excellent work!",
  "communicationRating": 5,
  "contentQualityRating": 5,
  "professionalismRating": 5,
  "valueForMoneyRating": 4,
  "wasOnTime": true
}
```

### GET /api/reviews/influencer

Get influencer reviews.

**Auth:** `withAuth` | **Query:** `influencerId` (required), `page`, `limit`

### POST /api/reviews/influencer/:id/respond

Respond to review (Influencer).

**Auth:** `withInfluencer`

```json
// Request
{ "response": "Thank you for the kind words!" }
```

### POST /api/reviews/brand

Review a brand (Influencer only).

**Auth:** `withInfluencer`

```json
// Request
{
  "brandId": "clx...",
  "rating": 4,
  "comment": "Great to work with",
  "communicationRating": 4,
  "paymentSpeedRating": 5,
  "professionalismRating": 4,
  "briefClarityRating": 3
}
```

### GET /api/reviews/brand

Get brand reviews.

**Auth:** `withAuth` | **Query:** `brandId` (required), `page`, `limit`

### POST /api/reviews/brand/:id/respond

Respond to review (Brand).

**Auth:** `withBrand`

---

## 8. Verification & Disputes

### POST /api/verification

Submit verification request.

**Auth:** `withAuth`

```json
// Request
{
  "verificationType": "IDENTITY", // IDENTITY | BUSINESS | PORTFOLIO | SOCIAL_ACCOUNT
  "documents": ["https://..."]
}
```

### GET /api/verification

Get user's verification requests.

**Auth:** `withAuth`

### GET /api/verification/admin

List all pending verifications.

**Auth:** `withAdmin`

### POST /api/verification/:id/review

Review verification (Admin).

**Auth:** `withAdmin`

```json
// Request
{ "status": "APPROVED", "rejectionReason": null }
```

### POST /api/disputes

Create a dispute.

**Auth:** `withAuth`

```json
// Request
{
  "collaborationId": "clx...",
  "againstUserId": "clx...",
  "type": "NON_DELIVERY",
  "description": "Content was never delivered after deadline",
  "evidence": ["https://..."]
}
```

### GET /api/disputes

List disputes.

**Auth:** `withAuth` | **Query:** `page`, `limit`, `status`, `type`

### GET /api/disputes/:id

Get dispute details.

**Auth:** `withAuth`

### POST /api/disputes/:id/resolve

Resolve dispute (Admin).

**Auth:** `withAdmin`

```json
// Request
{
  "resolution": "Refund issued to brand",
  "impactsReputation": true,
  "reputationAction": "WARNING"
}
```

---

## 9. Social Feed

### POST /api/feed

Create a feed post.

**Auth:** `withAuth`

```json
// Request
{
  "type": "TEXT",
  "content": "Just wrapped up an amazing campaign!",
  "visibility": "PUBLIC",
  "mediaUrls": ["https://..."],
  "hashtags": ["marketing", "influencer"],
  "mentions": ["@brandname"]
}
```

### GET /api/feed

Get personalized feed.

**Auth:** `withAuth` | **Query:** `page`, `limit`, `followingOnly`, `authorId`, `hashtag`, `type`

### GET /api/feed/:id

Get single post.

**Auth:** `withAuth`

### PUT /api/feed/:id

Update post.

**Auth:** `withAuth`

### DELETE /api/feed/:id

Delete post (soft delete).

**Auth:** `withAuth`

### POST /api/feed/:id/like

Toggle like on post.

**Auth:** `withAuth`

### POST /api/feed/:id/comments

Add comment.

**Auth:** `withAuth`

```json
// Request
{ "content": "Great work!", "parentId": "clx..." } // parentId for replies
```

### GET /api/feed/:id/comments

Get post comments.

**Auth:** `withAuth` | **Query:** `page`, `limit`

### POST /api/feed/:id/share

Share post.

**Auth:** `withAuth`

```json
// Request
{ "note": "Check this out!" }
```

---

## 10. Follow System

### POST /api/follow/:userId

Toggle follow/unfollow user.

**Auth:** `withAuth`

### GET /api/follow/:userId

Get followers or following list.

**Auth:** `withAuth` | **Query:** `type` (`followers` | `following`), `page`, `limit`

---

## 11. CRM (Brand)

### POST /api/crm/contacts

Add influencer as CRM contact.

**Auth:** `withBrand`

```json
// Request
{
  "influencerId": "clx...",
  "status": "LEAD",
  "customLabels": ["fashion", "high-priority"],
  "internalNotes": "Met at conference",
  "source": "DISCOVERY"
}
```

### GET /api/crm/contacts

List contacts.

**Auth:** `withBrand` | **Query:** `page`, `limit`, `status`, `search`, `labels`

### GET /api/crm/contacts/:id

Get contact details.

**Auth:** `withBrand`

### PUT /api/crm/contacts/:id

Update contact.

**Auth:** `withBrand`

### DELETE /api/crm/contacts/:id

Delete contact.

**Auth:** `withBrand`

### POST /api/crm/contacts/:id/notes

Add note to contact.

**Auth:** `withBrand`

```json
// Request
{ "content": "Follow up next week about summer campaign", "isPinned": true }
```

### GET /api/crm/contacts/:id/notes

Get contact notes.

**Auth:** `withBrand` | **Query:** `page`, `limit`

### GET /api/crm/dashboard

Get CRM dashboard summary.

**Auth:** `withBrand`

### POST /api/crm/lists

Create contact list.

**Auth:** `withBrand`

```json
// Request
{
  "name": "Summer Campaign Shortlist",
  "description": "Top picks for summer",
  "isSmartList": false
}
```

### GET /api/crm/lists

Get all contact lists.

**Auth:** `withBrand`

---

## 12. Marketplace

### POST /api/marketplace/listings

Create marketplace listing.

**Auth:** `withBrand`

```json
// Request
{
  "campaignId": "clx...",
  "title": "Looking for Fashion Influencers",
  "description": "We need influencers for our spring collection...",
  "compensationType": "PAID",
  "budgetMin": 1000,
  "budgetMax": 5000,
  "targetNiches": ["fashion", "lifestyle"],
  "targetPlatforms": ["INSTAGRAM", "TIKTOK"],
  "minFollowers": 10000,
  "totalSlots": 5,
  "applicationDeadline": "2026-03-15"
}
```

### GET /api/marketplace/listings

Search listings.

**Auth:** `withAuth` | **Query:** `page`, `limit`, `search`, `status`, `compensationType`, `niches`, `platforms`, `minBudget`, `maxBudget`, `isFeatured`

### GET /api/marketplace/listings/:id

Get listing details.

**Auth:** `withAuth`

### PUT /api/marketplace/listings/:id

Update listing.

**Auth:** `withBrand`

### POST /api/marketplace/listings/:id/applications

Apply to listing (Influencer).

**Auth:** `withInfluencer`

```json
// Request
{
  "coverLetter": "I'd love to collaborate on this...",
  "proposedRate": 3000,
  "portfolio": ["https://..."],
  "availability": "Available immediately"
}
```

### GET /api/marketplace/listings/:id/applications

Get applications for listing (Brand).

**Auth:** `withBrand` | **Query:** `page`, `limit`, `status`

### POST /api/marketplace/applications/:id/review

Review application (Brand).

**Auth:** `withBrand`

```json
// Request
{ "status": "ACCEPTED", "reviewNotes": "Great portfolio!" }
```

### GET /api/marketplace/my-applications

Get influencer's own applications.

**Auth:** `withInfluencer` | **Query:** `page`, `limit`, `status`

---

## 13. Analytics

### GET /api/analytics/campaign/:campaignId

Get campaign analytics.

**Auth:** `withBrand`

### GET /api/analytics/influencer/:influencerId

Get influencer analytics.

**Auth:** `withAuth`

### GET /api/analytics/platform

Get platform overview (Admin).

**Auth:** `withAdmin` | **Query:** `startDate`, `endDate`, `period`

---

## 14. AI Intelligence

### POST /api/ai/match

Find matching influencers for a campaign.

**Auth:** `withBrand`

```json
// Request
{
  "campaignId": "clx...",
  "filters": {
    "minFollowers": 10000,
    "categories": ["fashion"],
    "platforms": ["INSTAGRAM"],
    "minEngagementRate": 3.0,
    "locations": ["US", "UK"]
  },
  "limit": 20
}
```

### GET /api/ai/match

Get cached match scores.

**Auth:** `withBrand` | **Query:** `campaignId`

### POST /api/ai/content-suggestions

Generate AI content suggestions.

**Auth:** `withBrand`

```json
// Request
{
  "campaignId": "clx...",
  "platform": "INSTAGRAM",
  "contentType": "REEL",
  "brandVoice": "casual, fun",
  "targetAudience": "Gen Z fashion enthusiasts"
}
```

### GET /api/ai/pricing/:influencerId

Get AI pricing recommendations.

**Auth:** `withAuth`

### GET /api/ai/fraud-detection/:influencerId

Run fraud detection analysis.

**Auth:** `withBrand`

---

## 15. Subscriptions

### GET /api/subscriptions/plans

Get available plans.

**Auth:** None (public)

### POST /api/subscriptions

Create subscription.

**Auth:** `withAuth`

```json
// Request
{
  "planId": "clx...",
  "billingInterval": "MONTHLY",
  "paymentMethodId": "pm_..."
}
```

### GET /api/subscriptions

Get current subscription.

**Auth:** `withAuth`

### POST /api/subscriptions/:id/cancel

Cancel subscription.

**Auth:** `withAuth`

```json
// Request
{ "immediate": false } // false = cancel at period end
```

### POST /api/subscriptions/change-plan

Upgrade/downgrade plan.

**Auth:** `withAuth`

```json
// Request
{ "newPlanId": "clx..." }
```

### GET /api/subscriptions/usage

Get usage summary.

**Auth:** `withAuth`

### GET /api/subscriptions/features

Get feature access gates.

**Auth:** `withAuth`

---

## 16. Messaging

### GET /api/messaging/conversations

List conversations.

**Auth:** `withAuth` | **Query:** `page`, `limit`, `search`

### POST /api/messaging/conversations

Start a conversation.

**Auth:** `withAuth`

```json
// Request
{
  "participantIds": ["clx..."],
  "initialMessage": "Hi! I'd like to discuss a collaboration.",
  "campaignId": "clx..."
}
```

### GET /api/messaging/conversations/:id

Get conversation messages.

**Auth:** `withAuth` | **Query:** `page`, `limit`

### POST /api/messaging/conversations/:id/messages

Send message.

**Auth:** `withAuth`

```json
// Request
{
  "content": "Here are the brand guidelines",
  "attachments": [
    {
      "type": "document",
      "url": "https://...",
      "filename": "guidelines.pdf",
      "size": 1024
    }
  ]
}
```

### POST /api/messaging/conversations/:id/read

Mark conversation as read.

**Auth:** `withAuth`

### POST /api/messaging/messages/:id/reactions

Add reaction to message.

**Auth:** `withAuth`

```json
// Request
{ "emoji": "thumbsup" }
```

### DELETE /api/messaging/messages/:id/reactions

Remove reaction.

**Auth:** `withAuth` | **Query:** `emoji`

---

## 17. Discovery

### GET /api/discovery/search

Search influencers.

**Auth:** `withAuth` | **Query:** `page`, `limit`, `query`, `niches`, `platforms`, `minFollowers`, `maxFollowers`, `location`, `verified`

### POST /api/discovery/compare

Compare influencers (2-4).

**Auth:** `withAuth`

```json
// Request
{ "influencerIds": ["clx...", "clx..."], "name": "Spring Campaign Comparison" }
```

### GET /api/discovery/search-history

Get search history.

**Auth:** `withAuth` | **Query:** `limit`

### GET /api/discovery/similar/:id

Get similar influencers.

**Auth:** `withAuth` | **Query:** `limit`

### GET /api/discovery/influencers/:id

Get influencer profile.

**Auth:** `withAuth`

---

## 18. Tracking & Links

### POST /api/tracking/links

Create tracking link (Influencer).

**Auth:** `withAuth` (INFLUENCER)

```json
// Request
{
  "originalUrl": "https://brand.com/product",
  "campaignId": "clx...",
  "utmSource": "instagram",
  "utmMedium": "bio_link",
  "utmCampaign": "spring2026"
}
```

### GET /api/tracking/links

List tracking links.

**Auth:** `withAuth` (INFLUENCER) | **Query:** `page`, `limit`

### POST /api/tracking/links/:id/toggle

Toggle link active/inactive.

**Auth:** `withAuth` (INFLUENCER)

### POST /api/tracking/promo-codes

Create promo code (Influencer).

**Auth:** `withAuth` (INFLUENCER)

```json
// Request
{
  "code": "SARAH20",
  "campaignId": "clx...",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "maxUses": 100,
  "expiresAt": "2026-04-01"
}
```

### GET /api/tracking/promo-codes

List promo codes.

**Auth:** `withAuth` (INFLUENCER) | **Query:** `page`, `limit`

### POST /api/tracking/promo-codes/:id/toggle

Toggle promo code.

**Auth:** `withAuth` (INFLUENCER)

### GET /api/tracking/dashboard

Get tracking dashboard summary.

**Auth:** `withAuth` (INFLUENCER)

### GET /api/tracking/redirect/:shortCode

Redirect and record click.

**Auth:** None (public)

---

## 19. Reports

### GET /api/reports

List reports.

**Auth:** `withBrand` | **Query:** `page`, `limit`

### GET /api/reports/:id

Get report details.

**Auth:** `withBrand`

### POST /api/reports/generate

Generate a report.

**Auth:** `withBrand`

```json
// Request
{
  "reportType": "CAMPAIGN",
  "campaignId": "clx...",
  "dateRange": { "from": "2026-01-01", "to": "2026-02-15" },
  "templateId": "clx..."
}
```

### GET /api/reports/templates

List report templates.

**Auth:** `withBrand`

### POST /api/reports/templates

Create report template.

**Auth:** `withBrand`

```json
// Request
{
  "name": "Monthly Summary",
  "sections": ["overview", "engagement", "roi"],
  "format": "PDF"
}
```

### GET /api/reports/schedule

List scheduled reports.

**Auth:** `withBrand`

### POST /api/reports/schedule

Schedule a report.

**Auth:** `withBrand`

```json
// Request
{
  "templateId": "clx...",
  "frequency": "WEEKLY",
  "recipients": ["team@brand.com"]
}
```

### POST /api/reports/schedule/:id/toggle

Toggle scheduled report.

**Auth:** `withBrand`

---

## 20. Contracts

### GET /api/contracts/templates

List contract templates.

**Auth:** `withAuth` (BRAND)

### POST /api/contracts/:id/sign

Sign a contract.

**Auth:** `withAuth`

```json
// Request
{ "signature": "base64-signature" }
```

### GET /api/contracts/:id/audit

Get contract audit trail.

**Auth:** `withAuth`

### POST /api/contracts/compliance-check

Check FTC compliance.

**Auth:** `withAuth`

```json
// Request
{ "contentId": "clx..." }
```

### GET /api/contracts/compliance

List FTC compliance checks.

**Auth:** `withAuth` (BRAND) | **Query:** `page`, `limit`

---

## 21. Content Approval

### POST /api/content-approval/:id/submit

Submit content for approval.

**Auth:** `withAuth`

```json
// Request
{ "reviewerIds": ["clx...", "clx..."] }
```

### POST /api/content-approval/:id/review

Review content.

**Auth:** `withAuth`

```json
// Request
{
  "status": "APPROVED", // APPROVED | CHANGES_REQUESTED | REJECTED
  "feedback": "Looks perfect!"
}
```

### GET /api/content-approval/:id/timeline

Get approval timeline.

**Auth:** `withAuth`

### GET /api/content-approval/queue

List pending approvals.

**Auth:** `withAuth` | **Query:** `page`, `limit`, `status`

---

## 22. System

### GET /api/health

Health check endpoint.

**Auth:** None (public)

```json
// Response (200)
{
  "status": "healthy",
  "timestamp": "2026-02-15T00:00:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "checks": {
    "database": { "status": "healthy", "responseTime": 12 },
    "memory": { "status": "healthy", "usage": { "rss": 150, "heapUsed": 80 } }
  }
}
```

### POST /api/uploads

Get presigned upload URL.

**Auth:** `withAuth`

```json
// Request
{
  "fileName": "photo.jpg",
  "contentType": "image/jpeg",
  "fileSize": 2048000,
  "folder": "deliverables" // avatars | logos | deliverables | documents | posts
}
```

### POST /api/webhooks/stripe

Stripe webhook handler.

**Auth:** Stripe signature verification

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [...]  // Optional validation details
}
```

### Error Codes

| Code                   | HTTP Status | Description                 |
| ---------------------- | ----------- | --------------------------- |
| `VALIDATION_ERROR`     | 400         | Invalid request body/params |
| `AUTHENTICATION_ERROR` | 401         | Missing or invalid token    |
| `AUTHORIZATION_ERROR`  | 403         | Insufficient permissions    |
| `NOT_FOUND`            | 404         | Resource not found          |
| `CONFLICT`             | 409         | Duplicate resource          |
| `RATE_LIMITED`         | 429         | Too many requests           |
| `INTERNAL_ERROR`       | 500         | Server error                |

### Rate Limits

| Endpoint Type                  | Limit                      |
| ------------------------------ | -------------------------- |
| Auth endpoints (`/api/auth/*`) | 10 requests/minute per IP  |
| All other API endpoints        | 100 requests/minute per IP |

Rate limit headers are included in all API responses:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Pagination

All list endpoints support pagination:

| Param   | Default | Description              |
| ------- | ------- | ------------------------ |
| `page`  | 1       | Page number              |
| `limit` | 20      | Items per page (max 100) |

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Summary

| Module           | Routes  | Brand | Influencer | Admin | Public |
| ---------------- | ------- | ----- | ---------- | ----- | ------ |
| Auth             | 10      | -     | -          | -     | 10     |
| Collaborations   | 17      | 7     | 2          | -     | -      |
| Payments         | 3       | 1     | 1          | -     | -      |
| Escrow           | 5       | 4     | -          | -     | -      |
| Invoices         | 5       | -     | -          | -     | -      |
| Payout Methods   | 5       | -     | 5          | -     | -      |
| Reviews          | 7       | 3     | 3          | -     | -      |
| Reputation       | 1       | -     | -          | -     | -      |
| Verification     | 4       | -     | -          | 2     | -      |
| Disputes         | 4       | -     | -          | 1     | -      |
| Feed             | 9       | -     | -          | -     | -      |
| Follow           | 2       | -     | -          | -     | -      |
| CRM              | 10      | 10    | -          | -     | -      |
| Marketplace      | 8       | 4     | 3          | -     | -      |
| Analytics        | 3       | 1     | -          | 1     | -      |
| AI               | 5       | 4     | -          | -     | -      |
| Subscriptions    | 7       | -     | -          | -     | 1      |
| Messaging        | 7       | -     | -          | -     | -      |
| Discovery        | 5       | -     | -          | -     | -      |
| Tracking         | 8       | -     | 7          | -     | 1      |
| Reports          | 8       | 8     | -          | -     | -      |
| Contracts        | 5       | 3     | -          | -     | -      |
| Content Approval | 4       | -     | -          | -     | -      |
| System           | 2       | -     | -          | -     | 2      |
| **Total**        | **119** |       |            |       |        |
