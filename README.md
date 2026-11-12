# Sidebar menu

A DSH plugin that adds a manageable shortcut menu to the left sidebar. The entry
lives in **Settings**, the shortcuts themselves run from the sidebar.

- **Settings → Sidebar menu** has two groups: the built-in panels (Plugins, Plugin market, Tasks, and any panel you installed) and your own shortcut entries.
- Each built-in panel can be shown in the sidebar or folded into its **More** menu. Nothing is ever deleted, and the Plugins panel always stays.
- Rows in the left sidebar's **More** menu run the saved entries.
- Entries are stored in the browser profile and restored after a restart.
- An entry whose target cannot run reports it in a short toast instead of failing silently.

Panel placement is host-owned and page-session-scoped: DSH resets it on reload, so the plugin re-applies your saved choice once the sidebar's More menu mounts (the first time you open it). Until then the sidebar lists every panel. Shortcut entries and panel choices both survive a restart.
