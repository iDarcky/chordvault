-- Adds an account-level preferences bag so signed-in users get the same
-- theme / chart defaults / pedal bindings on every device they use.
--
-- Shape: free-form JSON. Keys mirror the portable subset of local
-- `settings` in src/App.jsx (theme, defaultColumns, defaultFontSize,
-- pedalNext, pedalPrev, showInlineNotes, inlineNoteStyle, displayRole,
-- duplicateSections, chartLayout). Device-local fields (onboardingComplete,
-- helpPageSeen, notifications) are intentionally NOT synced.

alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;
