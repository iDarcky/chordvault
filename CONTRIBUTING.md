# Contributing to Setlists MD

First off, thank you for considering contributing to Setlists MD! It's people like you that make open-source tools great for the community.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please check the existing issues to see if it has already been reported. If not, open a new issue and include:
* A clear description of the problem.
* Steps to reproduce the issue.
* Your operating system and browser version.
* Screenshots, if applicable.

### Suggesting Enhancements
We welcome ideas! Please open an issue and use the "Enhancement" label. Describe the feature, why it would be useful, and ideally, how you envision it working within the app's current design philosophy (offline-first, markdown-based).

### Pull Requests
1. **Fork the repo** and create your branch from `master`.
2. **Discuss first:** If you plan to add a major feature, please open an issue to discuss it before spending hours coding. This ensures your work aligns with the project roadmap.
3. **Run the dev environment locally:**
   `npm install`
   `npm run dev &`
4. **Follow conventions:**
   * We use React hooks and functional components.
   * UI components use HeroUI v3. Stick to the design system (Teal accent, rounded-xl corners).
   * Styling is handled via Tailwind CSS v4.
5. **Linting:** Ensure your code passes linting before submitting:
   `npm run lint`
6. **Commit Messages:** Write clear, concise commit messages. We prefer the conventional commits format (e.g., `feat: add dark mode toggle`, `fix: parser crash on empty tab block`).
7. **Submit the PR:** Describe your changes clearly in the pull request description.

## Architecture Context
Before diving into the code, we highly recommend reading `docs/architecture.md` and `docs/product-spec.md` to understand how the markdown parser, local storage, and sync engines interact.

## Code of Conduct
Please note that this project is released with a Contributor [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
