# Translation Strings (en.json)

Below is a consolidated list of English UI strings used across Setlists MD.
You can use this as a reference to create your `ro.json` file.

```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "setlists": "Setlists",
    "library": "Library",
    "notifications": "Notifications",
    "preferences": "Preferences",
    "settings": "Settings",
    "account": "Account",
    "back": "← Back"
  },
  "library": {
    "empty_title": "Your library is empty",
    "empty_subtitle": "Start by adding a new song or pasting a chord sheet.",
    "new_song": "New song",
    "paste_chord_sheet": "Paste chord sheet",
    "no_tags_found": "No tags found",
    "search_placeholder": "Search library...",
    "filter_tags": "Filter by tags",
    "sort_by": "Sort by",
    "title_az": "Title A-Z",
    "recently_added": "Recently Added",
    "all_songs": "All Songs"
  },
  "setlists": {
    "new_setlist": "New Setlist",
    "empty_title": "No setlists yet",
    "live_show": "Live Show",
    "no_location": "No Location Set",
    "keyboard_shortcuts": "Keyboard shortcuts",
    "add_song": "Add Song",
    "reorder": "Reorder",
    "print_pdf": "Print / PDF"
  },
  "editor": {
    "title_placeholder": "Song Title",
    "artist_placeholder": "Artist",
    "key_placeholder": "Original Key",
    "tempo_placeholder": "BPM",
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "visual_editor": "Visual",
    "text_editor": "Raw Markdown"
  },
  "settings": {
    "sync_status": "Status",
    "pro_tier": "Pro",
    "download_all": "Download all",
    "sign_in": "Sign In",
    "sign_out": "Sign Out",
    "language": "Language",
    "cloud_synced": "Cloud Synced",
    "offline_ready": "Offline Ready"
  },
  "misc": {
    "founder_note_title": "Hey — glad you're here.",
    "founder_note_body": "Setlists MD was built to be fast, private, and simple.",
    "close": "Close",
    "confirm": "Confirm",
    "success": "Success",
    "error": "Error"
  }
}
```

### Next Steps for Implementation:
1. Copy this block into `src/locales/en.json`.
2. Duplicate it as `src/locales/ro.json` and translate the values on the right side of the colons to Romanian.
3. Once those files exist, we can install `react-i18next` and wrap your text elements in the translation function `t('navigation.dashboard')`.
