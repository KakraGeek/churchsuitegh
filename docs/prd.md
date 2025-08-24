# Product Requirements Document (ChurchSuiteGH) — God-Mode 4

> **Prompt Objective:**  
> - [ ] BUILD  
> - [ ] FIX  
> - [ ] SHIP  

---

## 1. Vision & Outcomes
**Vision:**  
Deliver a **mobile-first PWA** that empowers Ghanaian churches to manage members, track attendance, support MoMo-first giving, streamline communications, and enhance community growth — affordable and adapted to local realities.  

**Business Outcomes:**  
- Increase digital adoption among Ghanaian churches.  
- Reduce admin overhead with simplified workflows.  
- Improve transparency in giving and financial reporting.  
- Boost engagement with members and volunteers.  

**User Outcomes:**  
- Pastors/Admins: easier reporting, MoMo-first donations, child security.  
- Members: frictionless giving, calendar/event reminders.  
- Parents: secure child check-in/out.  
- Volunteers: scheduling and notifications.  

**Non-Goals:**  
- Full enterprise-grade accounting suite (beyond Phase 2).  
- Advanced gamification or AI insights in MVP.

---

## 2. Users & Context
- **Pastors/Admins**: oversee members, finances, events.  
- **Members**: engage with services, give, and receive communications.  
- **Parents**: handle secure child check-in.  
- **Volunteers/Leaders**: coordinate services and outreach.  

Usage assumptions:  
- Primary devices: low–mid range smartphones.  
- Connectivity: often 2G/3G; intermittent offline support required.  
- Access control: role-based (Admin, Pastor, Member, Volunteer).  

---

## 3. Scope (MVP → Later)
**MVP (Phase 1):**  
- Membership & People management.  
- Attendance tracking.  
- MoMo-first giving + cash/card fallback.  
- Events/calendar.  
- SMS/WhatsApp notifications.  
- Mobile-first PWA baseline.  

**Later (Phase 2+):**  
- Child check-in & security.  
- Finance/accounting dashboards.  
- Worship/service planning.  
- Community growth tools & gamification.  

**Assumptions & Risks:**  
- Reliability of MoMo APIs (different telcos).  
- Training for non-tech-savvy admins.  
- Cost competition from global tools.  
- Ghana data-protection compliance.  

---

## 4. Functional Requirements
For each vertical slice:

### Membership
- Register/edit members (contacts, demographics, family links).
- Guest tracking & follow-ups.  

### Attendance
- QR-based check-ins; service growth reports.  

### Donations (MoMo-first)
- MoMo APIs: MTN, Vodafone, AirtelTigo.  
- Card fallback (Stripe/Paystack).  
- Automated receipts; giving history.  

### Events/Calendar
- Church calendar with service schedules.  
- Volunteer scheduling.  
- Event reminders via SMS/WhatsApp.  

### Communications
- Bulk SMS/WhatsApp/email.  
- Self-service profile updates.  

*(Phase 2 slices will add Child check-in, Finance, Worship planning, Community tools.)*

---

## 5. Non-Functional Requirements
- **Security:** OWASP Top 10, encrypted storage, RBAC.  
- **Performance:** Optimized PWA; responsive under 2G/3G.  
- **Scalability:** Support 50–5,000+ members. Modular backend.  
- **Privacy:** Ghana Data Protection Act compliance.  
- **Reliability:** Sync & offline support; error recovery.  

---

## 6. Platform Tracks
- **Website Track (Next.js)** — App Router, SEO, PWA install.  
- **App Track (React+Vite/Next.js SPA)** — offline emphasis, MoMo-first integration.  

---

## 7. Data & Integrations
- **Database:** Neon Postgres.  
- **ORM:** Drizzle.  
- **Auth:** NextAuth.js + Clerk optional.  
- **Payments:** MoMo APIs, Stripe fallback.  
- **Storage:** S3-equivalent for media.  
- **Comms:** WhatsApp API, SMS gateway.  

---

## 8. Definition of Ready (DoR)
A slice is ready when:  
- User story + acceptance + UX states defined.  
- Data contract drafted (Zod).  
- Test outline exists.  
- Security/env keys listed.  

---

## 9. Definition of Done (DoD)
A slice is done when:  
- Code + tests + docs + storybook committed.  
- Per-Feature Smoke passes.  
- Telemetry + accessibility validated.  
- Changelog entry updated.  

---

## 10. Open Questions
- Which MoMo integration (Hubtel, Paystack, direct telco APIs)?  
- WhatsApp messaging costs vs. SMS?  
- Hosting preference (Vercel vs local Ghana host)?  
