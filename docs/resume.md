# Setlists MD - Product Management & Business Analysis Case Study

This document captures the Product Management (PM) and Business Analysis (BA) achievements and strategic decisions made during the development of Setlists MD. It is structured into two sections: actionable resume-style bullet points, and a comprehensive narrative case study.

---

## Part 1: Resume-Style Bullet Points (STAR Method)

### Go-To-Market & Strategy
* **Spearheaded regional Go-To-Market (GTM) strategy** by orchestrating a soft-launch in Eastern Europe (Romania, Bulgaria, Serbia, Hungary, Ukraine), utilizing an "Early Access Beta" positioning to manage user expectations regarding stability while rapidly acquiring early adopters.
* **Defined strategic market positioning and exit strategy**, conducting competitor analysis against industry leaders (Planning Center, MultiTracks) and emphasizing data ownership (local .md files) and zero-friction guest access to position the product as an attractive acquisition target.

### Product Design & UX
* **Redesigned core user workflows** by introducing a "Just save it" global input bar, replacing traditional Floating Action Buttons (FABs) to streamline item creation, resulting in a distraction-free, minimalist user experience.
* **Conceptualized and delivered a "Simulate Viewer Role" feature**, allowing users to experience the application exactly as a read-only guest would, reducing onboarding friction for external collaborators and building trust in the platform's sharing capabilities.

### Roadmap Strategy & Prioritization
* **Driven strategic product pivots**, successfully shifting the backend architecture from a complex End-to-End Encryption (E2EE) model to a Notion-style collaborative cloud sync to significantly enhance team collaboration and time-to-market.
* **Managed MVP feature scoping and roadmap execution**, ruthlessly prioritizing critical internationalization (i18n) capabilities over lower-impact features to unblock the regional soft-launch while actively managing known technical debt.

### User Onboarding & Retention
* **Engineered a high-touch user onboarding workflow** by intentionally designing a manual, admin-activated 3-month free trial system, driving direct communication with early adopters to gather qualitative product feedback and validate core assumptions.

---

## Part 2: Narrative Case Study

### Overview
Setlists MD began as a technical solution to a common problem in the music performance space but rapidly evolved into a product-led growth initiative. The primary challenge was balancing technical constraints (e.g., local markdown parsing) with the need for a seamless, collaborative user experience that could compete with entrenched legacy systems like Planning Center.

### Go-To-Market & Strategic Positioning
Rather than attempting a global launch, a localized soft-launch strategy was implemented targeting Eastern Europe. By explicitly branding the release as an "Early Access Beta," we set clear expectations around product stability. This strategy served a dual purpose: it allowed for rapid iteration based on localized feedback (necessitating the aggressive prioritization of i18n features), and it established a foothold in a growing market. From inception, the product was built with an understanding of the broader market landscape, specifically targeting pain points of major players (data lock-in, complex guest access) to make Setlists MD an attractive acquisition target for companies like MultiTracks or Muse Group.

### Product Design & User Experience Focus
The application's UX was fundamentally rethought to minimize friction. Taking inspiration from distraction-free tools, complex creation workflows were consolidated into a single "Just save it" global input bar. Furthermore, sharing data with band members who are not tech-savvy was identified as a core friction point. To solve this, the "Simulate Viewer Role" was introduced—a toggle that temporarily strips all edit/delete capabilities, allowing the primary user to verify exactly what their guests will see before sharing.

### Prioritization & Technical Pivots
A major product pivot occurred when evaluating the data synchronization strategy. The initial plan called for rigorous End-to-End Encryption (E2EE). However, user research and roadmap analysis revealed that seamless, Notion-style collaboration was far more valuable to target users than absolute data privacy. The pivot to a collaborative cloud backend accelerated development and directly supported the product's core value proposition of easy sharing. Simultaneously, strict MVP scoping was enforced, prioritizing internationalization to support the GTM strategy while knowingly deferring certain automated testing frameworks as managed technical debt.

### Customer Discovery & Onboarding
To deeply understand early user behavior, standard automated trial triggers were deliberately bypassed. Instead, a manual, admin-activated 3-month free trial was implemented. This intentional friction forced a touchpoint between the product team and the user, turning the onboarding phase into a rich source of qualitative user research and fostering strong early-adopter loyalty.
