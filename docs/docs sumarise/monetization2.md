# Monetization & Cloud Strategy

This document outlines the business model and backend architecture required to turn Setlists MD into a profitable SaaS application.

## 1. The 3-Tier Business Model

We use a Freemium model to drive adoption, while reserving true Cloud and Collaboration features for paid tiers.

### Tier 1: Free Forever (The "Tech-Savvy Solo" Tier)
* **Price:** $0
* **Features:**
  * Full access to the Editor (Visual, Form, Raw).
  * Local storage (IndexedDB).
  * Manual ZIP Import/Export.
  * "Bring Your Own Cloud" (Google Drive / Dropbox sync adapters).
* **Why it works:** It acts as a powerful marketing tool. Solo musicians love it, and if they recommend it to their worship leader, the church is likely to buy Tier 3.

### Tier 2: Private Sync (The "Convenience" Tier)
* **Price:** ~$3/month or $30/year (or potentially a $15-$25 One-Time PRO unlock)
* **Features:**
  * **Setlists MD Cloud:** Seamless, instant sync across all your devices without the hassle of configuring Google Drive.
  * **End-to-End Encryption (E2EE):** Only the user can read their files.
  * **Smart Import:** Unlock parsing from Ultimate Guitar, ChordPro, and plain text.
  * **Version History:** 30-day undo for accidental deletions.

### Tier 3: Team Sync (The "Church/Band" Tier)
* **Price:** ~$8/month or $80/year
* **Features:**
  * Includes all Tier 2 features.
  * **Workspaces:** Create groups like "Sunday Service" or "Youth Band."
  * **Role Management:** Admins, Editors, and Read-Only Viewers.
  * **Live "Leader Mode":** Real-time page turning and key changes for the whole band via WebSockets.

---

## 2. Team UI/UX Design

To support Tier 3, the UI must handle multiple "Vaults" or Teams.

**The Library View:**
* Implement a Dropdown at the top of the Library (or Bottom Nav) to switch contexts:
  * 🏠 Personal Vault (Local / Drive)
  * ⛪ Grace Church (Cloud)
  * 🎸 Youth Band (Cloud)
* When a workspace is selected, the entire app state (Songs, Setlists) swaps to that team's context.

**Team Management (Settings):**
* A dedicated panel to create a team, invite members via email, and assign roles.

---

## 3. Supabase Architecture & End-to-End Encryption

To provide a flawless cloud experience (and protect ourselves legally from hosting copyrighted lyrics), we will use Supabase with Client-Side Encryption.

### How E2EE Works
1. **Vault Password:** When a user creates a Team/Vault, they set a Sync Password (e.g., `Praise2026!`).
2. **Client Encryption:** When the app saves a `.md` file, the browser uses the Web Crypto API and the Sync Password to encrypt the text into an AES-GCM blob.
3. **Storage:** Supabase only receives the encrypted blob. We literally cannot read user data.
4. **Decryption:** When a bandmate logs in, the app prompts them for the Sync Password, downloads the blobs, and decrypts them locally.

### Supabase Database Schema
```sql
-- Users (Managed by Supabase Auth)

-- Workspaces/Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users
);

-- Team Members & Permissions
CREATE TABLE team_members (
  team_id UUID REFERENCES teams,
  user_id UUID REFERENCES auth.users,
  role TEXT NOT NULL -- 'admin', 'editor', 'viewer'
);

-- Encrypted Files
CREATE TABLE encrypted_songs (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams,
  updated_at TIMESTAMP,
  encrypted_blob TEXT NOT NULL
);

CREATE TABLE encrypted_setlists (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams,
  updated_at TIMESTAMP,
  encrypted_blob TEXT NOT NULL
);
```

By storing only `encrypted_blob`, Setlists MD acts purely as a data synchronization utility, drastically reducing liability.
