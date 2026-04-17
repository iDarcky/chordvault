# Setlists MD Monetization & Cost Analysis

This document breaks down the financial model for a "Private Sync" tier, inspired by the Obsidian Sync model.

---

## 1. Hosting Costs (Estimated for 5,000 Users)

Because Setlists MD uses a **Zero-Knowledge Architecture**, your server only stores "encrypted blobs" (text). This keeps infrastructure costs incredibly low compared to image or video-heavy apps.

| Service | Provider | Usage Tier | Estimated Cost |
| :--- | :--- | :--- | :--- |
| **Storage** | AWS S3 / Supabase | 15GB (5k users @ 3MB each) | **<$0.50 / mo** |
| **Database** | Supabase | 100k rows (Metadata only) | **$0.00 (Free)** |
| **Authentication** | Supabase Auth | 5k Monthly Active Users | **$0.00 (Free)** |
| **API / Edge Functions** | Supabase / Vercel | 100k invocations/mo | **$0.00 (Free)** |
| **Domain & SSL** | Namecheap / Vercel | 1 Domain | **$1.00 / mo** ($12/yr) |
| **Database Reliability** | Supabase Pro | Dedicated instance (Optional) | **$25.00 / mo** |

**Total Monthly Overhead:** **~$26.50**

---

## 2. Revenue Model: "Private Sync" Tier

We recommend a **$4.99 / Month** (or $49.99 / Year) subscription for "Setlists MD Sync."

### Transaction Costs (Stripe)
*   **Stripe Fee:** 2.9% + $0.30 per transaction.
*   **On $4.99:** Fee = $0.45.
*   **Net Revenue per user:** **$4.54 / mo**.

### Revenue Projections (5% Paid Conversion)

| Free User Base | Paid Users (5%) | Monthly Gross | Monthly Net Profit |
| :--- | :--- | :--- | :--- |
| **1,000** | 50 | $249.50 | **~$200** |
| **10,000** | 500 | $2,495.00 | **~$2,200** |
| **50,000** | 2,500 | $12,475.00 | **~$11,300** |

---

## 3. The "Church Plan" Strategy

Small-to-medium churches often have a set budget for worship tools.

*   **Plan:** **$19.99 / Month** "Team Vault."
*   **Features:** Up to 15 team members can sync to one shared private vault.
*   **Revenue Impact:** Just **50 churches** on this plan generates **$1,000/mo** gross with nearly zero extra hosting cost.

---

## 4. Why This Works (The Obsidian Model)

1.  **Trust over Features:** By providing **End-to-End Encryption (E2EE)**, you are selling **Privacy**. Users know you can't see their data, which is a massive trust builder.
2.  **Low Friction:** You keep the Google Drive/Dropbox sync **free**. This acts as your "Marketing Lead." Once a user is hooked but wants a "one-click" experience, they upgrade to Setlists MD Sync.
3.  **Low Risk:** If a user stops paying, they don't lose their data—they just lose the *sync service*. They can still export their `.md` files or switch back to the free Google Drive provider.

---

## 5. Technical Requirements for Monetization
*   **Phase 6 Roadmap:** Integrate **Stripe Billing** + **Web Crypto API** (for client-side encryption).
*   **Vault Storage:** Implement a generic "Blob Storage" adapter in `src/sync/` that calls your Supabase/S3 endpoint.

