/**
 * dsh-plugin-sidebar-menu — Client half.
 *
 * Browser registrations, one list:
 * - a Settings section ("Sidebar menu") that edits the list,
 * - shortcut rows in `sidebar.panellist.actions` (the sidebar's More menu)
 *   that run the list.
 *
 * The list lives in this browser's localStorage, so it survives reloads and
 * app restarts without a Host route. DSH's own panel entries are untouched:
 * their pin controls belong to the sidebar shell.
 */
window.__ModuleLoader__.load({
  id: 'dsh-plugin-sidebar-menu',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'sidebarMenu'
    const PANEL_ID = 'sidebar-menu'
    const STORAGE_KEY = 'dsh.sidebar-menu.v1'
    const KINDS = ['panel', 'session', 'conversation', 'link']
    /** How long a just-added or just-edited row keeps its highlight. */
    const HIGHLIGHT_MS = 1200
    /** Panel the host always keeps in the sidebar; it can never be folded away. */
    const FIXED_PANEL_ID = 'plugins'

    /** English is the fallback dictionary; Simplified Chinese mirrors it. */
    const en = {
      panel: 'Sidebar menu',
      pageTitle: 'Sidebar menu',
      pageSubtitle: 'These entries appear in the left sidebar\u2019s More menu.',
      count: '{count} entries',
      countHidden: '{count} entries \u00b7 {hidden} hidden',
      persistFailed: 'This browser could not save the menu. Changes stay for this session only.',
      corruptRestored: 'The saved menu could not be read, so defaults were restored. The unreadable copy was kept as a backup.',
      runFailed: '{name} could not run here: its target is unavailable. Edit it or remove it from the list.',
      dismiss: 'Dismiss',
      unavailableShort: 'Unavailable',
      confirmDelete: 'Delete {name}',
      showSwitch: 'Show {name} in the menu',
      defaultGroup: 'Default sidebar panels',
      customGroup: 'Shortcut entries',
      defaultActive: 'Choices apply to the sidebar immediately.',
      defaultPending: 'The sidebar has not connected in this session yet. Open its More menu once and these choices apply automatically.',
      fixedPanel: 'Always shown',
      stateSidebar: 'Shown in the sidebar',
      stateMore: 'Folded into More',
      add: 'Add entry',
      addTitle: 'New entry',
      editTitle: 'Edit entry',
      name: 'Name',
      action: 'Action',
      target: 'Target',
      kindPanel: 'Open a panel',
      kindSession: 'Start a new chat',
      kindConversation: 'Return to the chat',
      kindLink: 'Open a link',
      choosePanel: 'Choose a panel',
      urlPlaceholder: 'https://example.com',
      sessionNote: 'Starts a blank chat in the current Workspace.',
      conversationNote: 'Returns to the current chat without changing the session.',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Delete',
      up: 'Move up',
      down: 'Move down',
      showAria: 'Show {name} in the menu',
      hideAria: 'Hide {name} from the menu',
      hiddenBadge: 'Hidden',
      empty: 'No entries yet',
      emptyHint: 'Add a shortcut, then open More in the left sidebar to use it.',
      reset: 'Restore defaults',
      resetConfirm: 'Restore defaults?',
      hint: 'Drag a row in the More menu onto another to reorder it, or use the arrows here. Entries are saved in this app and restored after a restart; hidden entries stay in the list so you can bring them back. DSH\u2019s own panel entries keep their built-in pin controls.',
      missingPanel: 'This panel is not available right now.',
      unavailableTarget: '{name} (unavailable)',
      errName: 'Enter a name.',
      errTarget: 'Choose a panel.',
      errUrl: 'Enter a link that starts with http:// or https://.',
      seedPlugins: 'Plugins',
      seedNewSession: 'New chat',
    }

    const zh = {
      panel: '侧边栏菜单',
      pageTitle: '侧边栏菜单',
      pageSubtitle: '这些入口显示在左侧边栏的「更多」菜单里。',
      count: '共 {count} 项',
      countHidden: '共 {count} 项 · 已隐藏 {hidden} 项',
      persistFailed: '浏览器无法保存菜单，本次改动仅在当前会话有效。',
      corruptRestored: '无法读取已保存的菜单，已恢复为默认列表；原数据已备份保留。',
      runFailed: '{name} 当前无法运行：目标已不可用，请在此修改或删除该项。',
      dismiss: '知道了',
      unavailableShort: '不可用',
      confirmDelete: '删除{name}',
      showSwitch: '在菜单中显示{name}',
      defaultGroup: '默认侧边栏面板',
      customGroup: '自定义快捷入口',
      defaultActive: '选择已立即应用到侧边栏。',
      defaultPending: '本次会话中侧边栏尚未连接：打开一次「更多」菜单后会自动应用这些选择。',
      fixedPanel: '固定显示',
      stateSidebar: '显示在侧边栏',
      stateMore: '已收进「更多」菜单',
      add: '添加菜单项',
      addTitle: '新建菜单项',
      editTitle: '编辑菜单项',
      name: '名称',
      action: '动作',
      target: '目标',
      kindPanel: '打开面板',
      kindSession: '新建对话',
      kindConversation: '返回对话',
      kindLink: '打开链接',
      choosePanel: '选择面板',
      urlPlaceholder: 'https://example.com',
      sessionNote: '在当前工作区开始一个新的空白对话。',
      conversationNote: '返回当前对话，不改变当前会话。',
      save: '保存',
      cancel: '取消',
      edit: '编辑',
      delete: '删除',
      confirm: '删除',
      up: '上移',
      down: '下移',
      showAria: '在菜单中显示{name}',
      hideAria: '从菜单中隐藏{name}',
      hiddenBadge: '已隐藏',
      empty: '还没有菜单项',
      emptyHint: '添加常用入口后，可从左侧边栏「更多」菜单打开。',
      reset: '恢复默认',
      resetConfirm: '恢复默认？',
      hint: '在「更多」菜单里按住一行拖到另一行上即可排序，也可以在这里用箭头调整。菜单项保存在本机，重启后仍然有效；隐藏的菜单项仍保留在列表中，可随时恢复。DSH 自带面板入口的显示与隐藏仍由「更多」菜单的原生固定功能管理。',
      missingPanel: '该面板当前不可用。',
      unavailableTarget: '{name}（不可用）',
      errName: '请输入名称。',
      errTarget: '请选择面板。',
      errUrl: '请输入以 http:// 或 https:// 开头的链接。',
      seedPlugins: '插件',
      seedNewSession: '新建对话',
    }

    const CSS = `
      /* Settings content column: the panel owns scrolling and padding, so this
         section is a plain column that never scrolls or sets its own width. */
      .dsm-section{display:flex;flex-direction:column;gap:12px;color:var(--dsw-alias-label-primary)}

      .dsm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .dsm-headText{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 240px}
      .dsm-titleRow{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
      .dsm-title{margin:0;font-size:18px;line-height:26px;font-weight:600}
      .dsm-count{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
      .dsm-sub{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary)}
      .dsm-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

      .dsm-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;
        border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,8px);background:0 0;
        color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:18px;cursor:pointer;
        white-space:nowrap}
      @media (hover: hover){.dsm-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}}
      .dsm-btn:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}
      .dsm-btn:disabled{opacity:.4;cursor:default}
      .dsm-btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid
        var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
      .dsm-btn[data-variant=primary]{border-color:transparent;background:var(--dsw-alias-button-primary-fill);
        color:var(--dsw-alias-label-primary-foreground);font-weight:500}
      @media (hover: hover){.dsm-btn[data-variant=primary]:hover:not(:disabled){
        background:var(--dsw-alias-button-primary-hover)}}
      .dsm-btn[data-variant=ghost]{border-color:transparent;padding:0 8px}
      .dsm-btn[data-variant=icon]{width:28px;height:28px;padding:0;border-color:transparent}
      .dsm-btn[data-variant=danger]{color:var(--dsw-alias-state-error-primary)}

      .dsm-card{display:flex;flex-direction:column;gap:12px;padding:14px;box-sizing:border-box;
        border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,12px);
        background:var(--dsw-alias-bg-layer-1)}
      .dsm-formHead{margin:0;font-size:14px;line-height:20px;font-weight:500}
      .dsm-field{display:flex;flex-direction:column;gap:6px;font-size:13px;line-height:18px}
      .dsm-fieldLabel{color:var(--dsw-alias-label-secondary)}
      .dsm-input,.dsm-select{height:32px;box-sizing:border-box;min-width:0;padding:0 10px;
        border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,8px);
        background:var(--dsw-alias-bg-base);
        color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
      .dsm-input:focus-visible,.dsm-select:focus-visible{outline:none;
        border-color:var(--dsw-alias-state-business-primary)}
      .dsm-input[aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}
      .dsm-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
      .dsm-error{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary)}
      .dsm-formActions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}

      .dsm-group{display:flex;flex-direction:column;gap:2px}
      .dsm-groupTitle{margin:16px 0 0;font-size:13px;line-height:20px;font-weight:600;
        color:var(--dsw-alias-label-secondary)}
      .dsm-groupHint{margin:2px 0 6px;font-size:12px;line-height:18px;
        color:var(--dsw-alias-label-tertiary)}
      .dsm-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
      .dsm-row{display:flex;align-items:center;gap:10px;padding:16px 0;box-sizing:border-box;
        border-bottom:0.5px solid var(--dsw-alias-border-l2)}
      .dsm-row:last-child{border-bottom:none}
      .dsm-row[data-hidden=true] .dsm-rowMain{opacity:.6}
      .dsm-row[data-focus=true]{background:var(--dsw-alias-interactive-bg-hover)}
      .dsm-order{display:flex;flex-direction:column;gap:2px;flex:none}
      .dsm-kind{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;
        border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-interactive-bg-hover);
        color:var(--dsw-alias-menu-icon)}
      .dsm-rowMain{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
      .dsm-rowLabel{display:flex;align-items:center;gap:6px;min-width:0;font-size:14px;line-height:20px;font-weight:500}
      .dsm-rowLabelText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dsm-rowMeta{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .dsm-badge{flex:none;padding:0 6px;border-radius:var(--dsw-radius-xs,4px);
        background:var(--dsw-alias-bg-layer-2);
        color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;font-weight:400}
      .dsm-notice{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;box-sizing:border-box;
        border:0.5px solid var(--dsw-alias-state-warn-secondary);border-radius:var(--dsw-radius-lg,12px);
        color:var(--dsw-alias-state-warn-label);font-size:12px;line-height:18px}
      .dsm-confirm{display:flex;align-items:center;gap:6px;flex:none}
      .dsm-switch{position:relative;flex:none;width:36px;height:20px;padding:0;border:none;
        border-radius:999px;background:var(--dsw-alias-border-l3);cursor:pointer;
        transition:background .15s ease}
      .dsm-switch:disabled{opacity:.45;cursor:default}
      .dsm-switch:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid
        var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
      .dsm-switch[aria-checked=true]{background:var(--dsw-alias-brand-primary)}
      .dsm-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;
        background:var(--dsw-alias-switch-thumb);transition:transform .15s ease}
      .dsm-switch[aria-checked=true]::after{transform:translateX(16px)}
      @media (prefers-reduced-motion: reduce){.dsm-switch,.dsm-switch::after{transition:none}}
      .dsm-empty{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:20px;
        box-sizing:border-box;border:0.5px dashed var(--dsw-alias-border-l3);
        border-radius:var(--dsw-radius-lg,12px)}
      .dsm-emptyTitle{margin:0;font-size:14px;line-height:20px;font-weight:500}
      .dsm-emptyText{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
      .dsm-hint{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}

      .dsm-menuRow{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:6px 8px;
        min-height:34px;border:none;border-radius:var(--dsw-radius-md,8px);background:0 0;
        color:var(--dsw-alias-label-primary);
        font:inherit;font-size:13px;line-height:18px;text-align:start;cursor:pointer}
      @media (hover: hover){.dsm-menuRow:hover{background:var(--dsw-alias-interactive-bg-hover)}}
      .dsm-menuRow:active{background:var(--dsw-alias-interactive-bg-active)}
      .dsm-menuRow:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid
        var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
      .dsm-menuRow[aria-disabled=true]{opacity:.5;cursor:default}
      .dsm-menuRow[aria-disabled=true]:hover{background:0 0}
      .dsm-menuIcon{flex:none;display:inline-flex;align-items:center;color:var(--dsw-alias-menu-icon)}
      .dsm-menuLabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:start}
      .dsm-menuTrail{flex:none;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
      .dsm-menuRow[draggable=true]{cursor:grab}
      .dsm-menuRow[draggable=true]:active{cursor:grabbing}
      .dsm-menuRow[data-dragging=true]{opacity:.45}
      .dsm-menuRow[data-drop=before]{box-shadow:inset 0 2px 0 var(--dsw-alias-state-business-primary)}
      .dsm-menuRow[data-drop=after]{box-shadow:inset 0 -2px 0 var(--dsw-alias-state-business-primary)}
      .dsm-grip{flex:none;display:inline-flex;align-items:center;
        color:var(--dsw-alias-label-tertiary);opacity:.5}
      .dsm-menuRow:hover .dsm-grip,.dsm-menuRow:focus-visible .dsm-grip{opacity:1}
      /* shell.overlay is a click-through layer; the toast opts back in. */
      .dsm-toastLayer{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);
        display:flex;align-items:center;gap:10px;max-width:min(560px,calc(100vw - 48px));
        padding:10px 12px;box-sizing:border-box;border-radius:var(--dsw-radius-lg,12px);
        background:var(--dsw-alias-toast-bg);color:var(--dsw-alias-toast-label);
        box-shadow:var(--dsw-elevation-prominent);font-size:13px;line-height:18px;
        pointer-events:auto}
      .dsm-toastText{flex:1;min-width:0}
      .dsm-toastAction{flex:none;border:0;padding:2px 6px;border-radius:var(--dsw-radius-sm,8px);
        background:0 0;color:var(--dsw-alias-toast-action);font:inherit;font-size:13px;cursor:pointer}
      .dsm-toastAction:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid
        var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
      .dsm-glyph{display:block}
    `

    /** Interpolate `{name}` placeholders in a localized string. */
    function interpolate(text, params) {
      if (params === undefined) return text
      return String(text).replace(/\{(\w+)\}/g, (match, key) => (
        params[key] === undefined ? match : String(params[key])))
    }

    /**
     * Settings navigation mark: a rail beside stacked rows, so the section reads
     * as "the sidebar" instead of inheriting the shell's generic settings gear.
     * Inherits `currentColor`, which the host paints for the selected state.
     */
    function SidebarGlyph({ size = 16 }) {
      return h('svg', {
        className: 'dsm-glyph', viewBox: '0 0 24 24', width: size, height: size,
        'aria-hidden': true, focusable: 'false',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
        strokeLinecap: 'round', strokeLinejoin: 'round',
      },
      h('rect', { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }),
      h('path', { d: 'M9.5 4.5v15' }),
      h('path', { d: 'M13 9.5h4M13 14h4' }))
    }

    /** One glyph per entry action. */
    function KindGlyph({ kind, size = 16 }) {
      const common = {
        className: 'dsm-glyph', viewBox: '0 0 24 24', width: size, height: size,
        'aria-hidden': true, focusable: 'false',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
        strokeLinecap: 'round', strokeLinejoin: 'round',
      }
      if (kind === 'session') return h('svg', common, h('path', { d: 'M12 5v14M5 12h14' }))
      if (kind === 'link') return h('svg', common, h('path', { d: 'M7 17 17 7M9 7h8v8' }))
      if (kind === 'conversation') {
        return h('svg', common, h('path', { d: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-6 4V6.5Z' }))
      }
      return h('svg', common, h('rect', { x: 4, y: 5, width: 16, height: 14, rx: 3 }))
    }

    /** Directional chevron for the ordering controls. */
    function Chevron({ direction, size = 14 }) {
      const d = direction === 'up' ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'
      return h('svg', {
        className: 'dsm-glyph', viewBox: '0 0 24 24', width: size, height: size,
        'aria-hidden': true, focusable: 'false',
        fill: 'none', stroke: 'currentColor', strokeWidth: 2,
        strokeLinecap: 'round', strokeLinejoin: 'round',
      }, h('path', { d }))
    }

    /** X mark for the delete control. */
    function CrossGlyph({ size = 14 }) {
      return h('svg', {
        className: 'dsm-glyph', viewBox: '0 0 24 24', width: size, height: size,
        'aria-hidden': true, focusable: 'false',
        fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round',
      }, h('path', { d: 'M6 6l12 12M18 6 6 18' }))
    }

    /** Seed labels are resolved at render time so a locale switch relabels them. */
    const SEED_KEYS = { 'default-plugins': 'seedPlugins', 'default-new-session': 'seedNewSession' }

    /** Make one stable array snapshot from stored JSON. */
    function sanitize(rows) {
      if (!Array.isArray(rows)) return []
      const seen = new Set()
      const next = []
      for (const row of rows) {
        if (row === null || typeof row !== 'object') continue
        const label = typeof row.label === 'string' ? row.label.trim() : ''
        const kind = KINDS.includes(row.kind) ? row.kind : 'panel'
        const target = typeof row.target === 'string' ? row.target.trim() : ''
        if (label.length === 0) continue
        if ((kind === 'panel' || kind === 'link') && target.length === 0) continue
        if (kind === 'link' && !/^https?:\/\//i.test(target)) continue
        let id = typeof row.id === 'string' && row.id.length > 0 ? row.id : ''
        if (id.length === 0 || seen.has(id)) id = 'item-' + next.length + '-' + Math.random().toString(36).slice(2, 8)
        seen.add(id)
        next.push({
          id,
          label: label.slice(0, 120),
          kind,
          target: kind === 'panel' || kind === 'link' ? target.slice(0, 2048) : '',
          hidden: row.hidden === true,
          seedKey: row.seedKey === null ? null : SEED_KEYS[id],
        })
      }
      return next
    }

    /** Read the stored state; `null` means this profile has no saved state yet. */
    function loadState() {
      let raw = null
      try {
        raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw === null) return null
        const parsed = JSON.parse(raw)
        if (parsed === null || typeof parsed !== 'object' || !Array.isArray(parsed.items)) return null
        const hiddenPanels = Array.isArray(parsed.hiddenPanels)
          ? parsed.hiddenPanels.filter(id => typeof id === 'string' && id !== FIXED_PANEL_ID).slice(0, 100)
          : []
        return { items: sanitize(parsed.items), hiddenPanels }
      } catch {
        // Keep unreadable data recoverable before the first save overwrites it.
        try {
          if (raw !== null) window.localStorage.setItem(STORAGE_KEY + '.bak', raw)
        } catch {
          /* the backup is best-effort */
        }
        return null
      }
    }

    /** Whether the stored payload had to be discarded (a backup was kept). */
    function hadUnreadablePayload() {
      try {
        return window.localStorage.getItem(STORAGE_KEY + '.bak') !== null
      } catch {
        return false
      }
    }

    /** Persist both lists; `false` means this browser refused the write. */
    function writeState(items, hiddenPanels) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, items, hiddenPanels }))
        return true
      } catch {
        return false
      }
    }

    /** Entries and default-panel choices, with the mutations both surfaces share. */
    function createStore(makeDefaults) {
      const stored = loadState()
      let items = stored === null ? makeDefaults() : stored.items
      let hiddenPanels = stored === null ? [] : stored.hiddenPanels
      const storedCorrupt = stored === null && hadUnreadablePayload()
      const listeners = new Set()
      let status = { saveFailed: false, corrupt: storedCorrupt }
      const notify = () => { for (const listener of [...listeners]) listener() }
      const subscribe = (listener) => {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      }
      /** Write, then publish; the status object keeps its identity unless health changes. */
      const commit = (nextItems, nextPanels) => {
        items = nextItems
        if (nextPanels !== undefined) hiddenPanels = nextPanels
        const refused = !writeState(items, hiddenPanels)
        if (refused !== status.saveFailed) status = { ...status, saveFailed: refused }
        notify()
      }
      if (stored === null) {
        const refused = !writeState(items, hiddenPanels)
        if (refused !== status.saveFailed) status = { ...status, saveFailed: refused }
      }

      const source = { getSnapshot: () => items, subscribe }
      const panels = { getSnapshot: () => hiddenPanels, subscribe }
      const statusSource = { getSnapshot: () => status, subscribe }
      let notice = null
      const noticeSource = { getSnapshot: () => notice, subscribe }

      // The host hands its pin callbacks to the More menu only, so the saved
      // layout is applied the first time that menu reports in. Afterwards the
      // same channel mirrors host-side pin clicks back into the preference.
      let bridge = null
      let bridgeReady = false
      const bridgeSource = { getSnapshot: () => bridgeReady, subscribe }

      /**
       * Adopt the sidebar's pin callbacks.
       * @param entries - the host's panel entries (id, label, pinned, active).
       * @param onPinnedChange - host callback that pins or unpins one panel.
       */
      const adoptBridge = (entries, onPinnedChange) => {
        if (typeof onPinnedChange !== 'function') return
        const first = bridge === null
        bridge = onPinnedChange
        if (!bridgeReady) {
          bridgeReady = true
          notify()
        }
        if (first) {
          for (const entry of entries) {
            const want = !hiddenPanels.includes(entry.id)
            if (entry.pinned !== want) onPinnedChange(entry.id, want)
          }
          return
        }
        // Mirror the host's own pin controls into the saved preference.
        const next = [...hiddenPanels]
        let changed = false
        for (const entry of entries) {
          if (typeof entry.id !== 'string') continue
          const wanted = !entry.pinned
          const listed = next.includes(entry.id)
          if (wanted === listed) continue
          changed = true
          if (wanted) next.push(entry.id)
          else next.splice(next.indexOf(entry.id), 1)
        }
        if (changed) commit(items, next)
      }

      return {
        source,
        panels,
        status: statusSource,
        notice: noticeSource,
        bridgeReady: bridgeSource,
        adoptBridge,
        /** @returns the new row id, so the page can reveal and highlight it. */
        add: (draft) => {
          const created = 'item-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)
          commit([...items, { ...draft, id: created, hidden: false }])
          return created
        },
        update: (id, draft) => {
          // `null` survives JSON, so a renamed seed row stays renamed after reload.
          commit(items.map(item => (item.id === id ? { ...item, ...draft, seedKey: null } : item)))
        },
        remove: (id) => { commit(items.filter(item => item.id !== id)) },
        setHidden: (id, hidden) => {
          commit(items.map(item => (item.id === id ? { ...item, hidden } : item)))
        },
        /**
         * Show or fold away one default panel. The row itself is never deleted,
         * and the host's fixed panel is ignored exactly as the host ignores it.
         */
        setPanelHidden: (id, visible) => {
          if (id === FIXED_PANEL_ID) return
          const next = visible
            ? hiddenPanels.filter(candidate => candidate !== id)
            : (hiddenPanels.includes(id) ? hiddenPanels : [...hiddenPanels, id])
          commit(items, next)
          if (bridge !== null) bridge(id, visible)
        },
        /**
         * Drop one entry onto another, the way the More menu's drag gesture
         * reports it. Hidden rows keep their absolute slots, so dragging never
         * disturbs a folded-away entry.
         * @param fromId - dragged entry.
         * @param toId - entry the pointer dropped on.
         * @param edge - whether the dragged row lands before or after the target.
         */
        moveTo: (fromId, toId, edge) => {
          const visible = items.filter(item => !item.hidden)
          const from = visible.findIndex(item => item.id === fromId)
          if (from < 0 || fromId === toId) return
          const reordered = [...visible]
          const filtered = items  // keep the full list untouched until the splices succeed
          const [held] = reordered.splice(from, 1)
          if (held === undefined || !filtered.some(item => item.id === toId)) return
          const target = reordered.findIndex(item => item.id === toId)
          if (target < 0) return
          reordered.splice(edge === 'after' ? target + 1 : target, 0, held)
          let cursor = 0
          commit(items.map(item => (item.hidden ? item : reordered[cursor++])))
        },
        /** Move past the nearest visible neighbour, so hidden rows never swallow a step. */
        move: (id, delta) => {
          const visible = items.filter(item => !item.hidden)
          const at = visible.findIndex(item => item.id === id)
          const partner = visible[at + (delta < 0 ? -1 : 1)]
          const index = items.findIndex(item => item.id === id)
          const target = partner === undefined ? -1 : items.findIndex(item => item.id === partner.id)
          if (at < 0 || target < 0) return
          const next = [...items]
          const held = next[index]
          next[index] = next[target]
          next[target] = held
          commit(next)
        },
        reset: () => {
          const restore = hiddenPanels
          commit(makeDefaults(), [])
          // Re-pin what the reset just made visible, so the sidebar matches.
          if (bridge !== null) for (const id of restore) bridge(id, true)
        },
        /** Report why an entry did nothing; the overlay toast shows it. */
        setNotice: (name) => {
          notice = { name, seq: Date.now() }
          notify()
        },
        clearNotice: () => {
          if (notice === null) return
          notice = null
          notify()
        },
      }
    }

    /** Resolve a registered panel label without depending on the slots package. */
    function resolveLabel(label) {
      if (typeof label === 'string') return label
      if (typeof label === 'function') {
        try {
          const value = label()
          return typeof value === 'string' ? value : undefined
        } catch {
          return undefined
        }
      }
      return undefined
    }

    /**
     * Live list of sidebar panels, refreshed when registrations or the locale
     * change. `failed` separates "the registry could not be read" from "there
     * are no panels", so a read failure never marks every entry unavailable.
     */
    function createPanelSource(ctx) {
      let snapshot = { panels: [], failed: false }
      const listeners = new Set()
      const readEntries = () => {
        const slots = ctx.slots
        if (typeof slots.entriesOfSlot === 'function') return { rows: slots.entriesOfSlot('sidebar.panellist'), failed: false }
        if (typeof slots.entries === 'function') return { rows: slots.entries('sidebar.panellist'), failed: false }
        return { rows: [], failed: true }
      }
      const read = () => {
        let result
        try {
          result = readEntries()
        } catch (error) {
          console.warn('[sidebar-menu] could not read the sidebar panel list', error)
          return { panels: [], failed: true }
        }
        const panels = Array.isArray(result.rows) ? result.rows.map(({ options }) => ({
          id: String(options.id),
          order: options.order ?? 0,
          label: resolveLabel(options.label) ?? String(options.id),
        })).sort((a, b) => a.order - b.order) : []
        return { panels, failed: result.failed || !Array.isArray(result.rows) }
      }
      const same = (a, b) => a.failed === b.failed && a.panels.length === b.panels.length
        && a.panels.every((row, index) => {
          const other = b.panels[index]
          return row.id === other.id && row.label === other.label && row.order === other.order
        })
      const sync = () => {
        const next = read()
        if (same(snapshot, next)) return
        snapshot = next
        for (const listener of [...listeners]) listener()
      }
      ctx.effect(() => {
        let offSlots
        let offLocale
        try {
          offSlots = ctx.slots.subscribe('sidebar.panellist', sync)
        } catch (error) {
          console.warn('[sidebar-menu] could not subscribe to the sidebar panel list', error)
        }
        const locale = ctx.get('locale')
        if (locale !== undefined && typeof locale.subscribe === 'function') {
          offLocale = locale.subscribe(sync)
        }
        return () => {
          if (typeof offSlots === 'function') offSlots()
          if (typeof offLocale === 'function') offLocale()
        }
      }, 'dsh-plugin-sidebar-menu: panel source')
      sync()
      return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
      }
    }

    /** First-run entries; `seedKey` keeps their labels following the active locale. */
    function makeDefaults(t) {
      return [
        {
          id: 'default-plugins', label: t('seedPlugins'), kind: 'panel', target: 'plugins',
          hidden: false, seedKey: 'seedPlugins',
        },
        {
          id: 'default-new-session', label: t('seedNewSession'), kind: 'session', target: '',
          hidden: false, seedKey: 'seedNewSession',
        },
      ]
    }

    /** Resolve the label a row shows, preferring a live seed label. */
    function labelOf(item, t) {
      return typeof item.seedKey === 'string' ? t(item.seedKey) : item.label
    }

    /** Run one entry; returns false when its target cannot run in this profile. */
    function runItem(ctx, item) {
      if (item.kind === 'session') {
        const workspace = ctx.get('uiWorkspace')
        if (workspace === undefined || typeof workspace.startSession !== 'function') return false
        workspace.startSession()
        return true
      }
      if (item.kind === 'conversation') {
        try {
          ctx.layout.selectPanel(null)
          return true
        } catch {
          return false
        }
      }
      if (item.kind === 'link') {
        if (!/^https?:\/\//i.test(item.target)) return false
        // A blocked popup returns null; that is a failed run, not a success.
        return window.open(item.target, '_blank', 'noopener,noreferrer') !== null
      }
      try {
        ctx.layout.selectPanel(item.target)
        return true
      } catch {
        return false
      }
    }

    /** Validate one form draft; returns an empty string when it is usable. */
    function validate(draft, t) {
      if (typeof draft.label !== 'string' || draft.label.trim().length === 0) return t('errName')
      if (draft.kind === 'panel' && String(draft.target ?? '').trim().length === 0) return t('errTarget')
      if (draft.kind === 'link' && !/^https?:\/\//i.test(String(draft.target ?? '').trim())) return t('errUrl')
      return ''
    }

    /** Normalize a validated draft before it is stored. */
    function cleanDraft(draft) {
      const kind = KINDS.includes(draft.kind) ? draft.kind : 'panel'
      return {
        label: draft.label.trim().slice(0, 120),
        kind,
        target: kind === 'panel' || kind === 'link' ? String(draft.target ?? '').trim().slice(0, 2048) : '',
      }
    }

    /** The shared add/edit form. */
    function EntryForm({ t, panels, draft, error, title, onChange, onSave, onCancel }) {
      const set = (patch) => onChange({ ...draft, ...patch })
      const panelMissing = draft.kind === 'panel' && draft.target.length > 0
        && !panels.some(panel => panel.id === draft.target)
      const errorId = React.useId()
      const nameIsWrong = error.length > 0 && (typeof draft.label !== 'string' || draft.label.trim().length === 0)
      const targetIsWrong = error.length > 0 && !nameIsWrong
      return h('form', {
        className: 'dsm-card',
        onSubmit: (event) => { event.preventDefault(); onSave() },
      },
      h('h2', { className: 'dsm-formHead' }, title),
      h('label', { className: 'dsm-field' },
        h('span', { className: 'dsm-fieldLabel' }, t('name')),
        h('input', {
          className: 'dsm-input', type: 'text', value: draft.label, autoFocus: true,
          maxLength: 120, placeholder: t('name'),
          'aria-invalid': nameIsWrong,
          'aria-describedby': error.length > 0 && nameIsWrong ? errorId : undefined,
          onChange: (event) => set({ label: event.target.value }),
        })),
      h('label', { className: 'dsm-field' },
        h('span', { className: 'dsm-fieldLabel' }, t('action')),
        h('select', {
          className: 'dsm-select', value: draft.kind,
          onChange: (event) => {
            const kind = event.target.value
            set({ kind, target: kind === 'panel' ? '' : kind === 'link' ? draft.target : '' })
          },
        },
        h('option', { value: 'panel' }, t('kindPanel')),
        h('option', { value: 'session' }, t('kindSession')),
        h('option', { value: 'conversation' }, t('kindConversation')),
        h('option', { value: 'link' }, t('kindLink')))),
      draft.kind === 'panel' && h('label', { className: 'dsm-field' },
        h('span', { className: 'dsm-fieldLabel' }, t('target')),
        h('select', {
          className: 'dsm-select', value: draft.target,
          'aria-invalid': targetIsWrong,
          'aria-describedby': targetIsWrong ? errorId : undefined,
          onChange: (event) => set({ target: event.target.value }),
        },
        h('option', { value: '' }, t('choosePanel')),
        panels.map(panel => h('option', { key: panel.id, value: panel.id }, panel.label)),
        panelMissing && h('option', { value: draft.target },
          t('unavailableTarget', { name: draft.target })))),
      draft.kind === 'link' && h('label', { className: 'dsm-field' },
        h('span', { className: 'dsm-fieldLabel' }, t('target')),
        h('input', {
          className: 'dsm-input', type: 'url', value: draft.target, placeholder: t('urlPlaceholder'),
          'aria-invalid': targetIsWrong,
          'aria-describedby': targetIsWrong ? errorId : undefined,
          onChange: (event) => set({ target: event.target.value }),
        })),
      draft.kind === 'session' && h('p', { className: 'dsm-note' }, t('sessionNote')),
      draft.kind === 'conversation' && h('p', { className: 'dsm-note' }, t('conversationNote')),
      error.length > 0 && h('p', { className: 'dsm-error', id: errorId, role: 'alert' }, error),
      h('div', { className: 'dsm-formActions' },
        h('button', { type: 'button', className: 'dsm-btn', onClick: onCancel }, t('cancel')),
        h('button', { type: 'submit', className: 'dsm-btn', 'data-variant': 'primary' }, t('save'))))
    }

    /** One read-only row with its ordering, visibility, and delete controls. */
    function ItemRow({ t, item, firstVisible, lastVisible, highlighted, panels, confirming, onMove, onToggleHidden, onEdit, onAskDelete, onDelete, onCancelDelete }) {
      const panel = panels.find(candidate => candidate.id === item.target)
      const label = labelOf(item, t)
      const rowRef = React.useRef(null)
      React.useEffect(() => {
        if (highlighted) rowRef.current?.scrollIntoView({ block: 'nearest' })
      }, [highlighted])
      const confirmRef = React.useRef(null)
      React.useEffect(() => {
        if (confirming) confirmRef.current?.focus()
      }, [confirming])
      const meta = item.kind === 'panel'
        ? t('kindPanel') + ' \u00b7 ' + (panel === undefined ? t('unavailableTarget', { name: item.target }) : panel.label)
        : item.kind === 'link'
          ? t('kindLink') + ' \u00b7 ' + item.target
          : t(item.kind === 'session' ? 'kindSession' : 'kindConversation')
      return h('li', {
        ref: rowRef, className: 'dsm-row', 'data-hidden': item.hidden, 'data-focus': highlighted === true,
      },
        h('span', { className: 'dsm-order' },
          h('button', {
            type: 'button', className: 'dsm-btn', 'data-variant': 'icon',
            disabled: item.hidden || firstVisible, 'aria-label': t('up'), title: t('up'),
            onClick: () => onMove(-1),
          }, h(Chevron, { direction: 'up' })),
          h('button', {
            type: 'button', className: 'dsm-btn', 'data-variant': 'icon',
            disabled: item.hidden || lastVisible, 'aria-label': t('down'), title: t('down'),
            onClick: () => onMove(1),
          }, h(Chevron, { direction: 'down' }))),
        h('span', { className: 'dsm-kind', 'aria-hidden': true }, h(KindGlyph, { kind: item.kind })),
        h('span', { className: 'dsm-rowMain' },
          h('span', { className: 'dsm-rowLabel' },
            h('span', { className: 'dsm-rowLabelText' }, label),
            item.hidden && h('span', { className: 'dsm-badge' }, t('hiddenBadge'))),
          h('span', { className: 'dsm-rowMeta' }, meta)),
        confirming
          ? h('span', { className: 'dsm-confirm' },
            h('button', { type: 'button', ref: confirmRef, className: 'dsm-btn', onClick: onCancelDelete }, t('cancel')),
            h('button', {
              type: 'button', className: 'dsm-btn', 'data-variant': 'danger',
              'aria-label': t('confirmDelete', { name: label }), onClick: onDelete,
            }, t('confirm')))
          : h(React.Fragment, null,
            h('button', {
              type: 'button', role: 'switch', className: 'dsm-switch',
              'aria-checked': !item.hidden,
              'aria-label': t('showSwitch', { name: label }),
              title: item.hidden ? t('showAria', { name: label }) : t('hideAria', { name: label }),
              onClick: onToggleHidden,
            }),
            h('button', { type: 'button', className: 'dsm-btn', 'data-variant': 'ghost', onClick: onEdit }, t('edit')),
            h('button', {
              type: 'button', className: 'dsm-btn', 'data-variant': 'icon', 'aria-label': t('delete'),
              title: t('delete'), onClick: onAskDelete,
            }, h(CrossGlyph))))
    }

    /** The management section registered into Settings (`settings.section`). */
    function MenuSettingsSection(props) {
      const { t, useMenuItems, usePanels, usePersistState, useHiddenPanels, useBridgeReady, actions } = props
      const items = useMenuItems(list => list)
      const panelSource = usePanels(source => source)
      const panels = panelSource.panels
      const hiddenPanels = useHiddenPanels(list => list)
      const bridgeReady = useBridgeReady(ready => ready)
      const persist = usePersistState(state => state)
      const [draft, setDraft] = React.useState(null)
      const [editingId, setEditingId] = React.useState(null)
      const [confirmId, setConfirmId] = React.useState(null)
      const [resetArmed, setResetArmed] = React.useState(false)
      const [error, setError] = React.useState('')
      const [highlight, setHighlight] = React.useState(null)
      const highlightId = highlight?.id ?? null

      React.useEffect(() => {
        if (highlight === null) return undefined
        const timer = window.setTimeout(() => setHighlight(null), HIGHLIGHT_MS)
        return () => window.clearTimeout(timer)
      }, [highlight])

      const hiddenCount = items.filter(item => item.hidden).length
      const firstVisibleId = items.find(item => !item.hidden)?.id
      const lastVisibleId = [...items].reverse().find(item => !item.hidden)?.id

      const startAdd = () => {
        setError('')
        setResetArmed(false)
        setConfirmId(null)
        setEditingId(null)
        setDraft({ label: '', kind: 'panel', target: '' })
      }
      const startEdit = (item) => {
        setError('')
        setResetArmed(false)
        setConfirmId(null)
        setEditingId(item.id)
        setDraft({ label: labelOf(item, t), kind: item.kind, target: item.target })
      }
      const cancelForm = () => {
        setDraft(null)
        setEditingId(null)
        setError('')
      }
      const commitDraft = (mode) => {
        const stored = draft
        if (stored === null) return
        const problem = validate(stored, t)
        if (problem.length > 0) {
          setError(problem)
          return
        }
        const cleaned = cleanDraft(stored)
        if (mode === 'add') {
          setHighlight({ id: actions.add(cleaned), seq: Date.now() })
        } else {
          actions.update(editingId, cleaned)
          setHighlight({ id: editingId, seq: Date.now() })
        }
        cancelForm()
      }

      return h('div', { className: 'dsm-section' },
          h('header', { className: 'dsm-head' },
            h('div', { className: 'dsm-headText' },
              h('div', { className: 'dsm-titleRow' },
                h('h2', { className: 'dsm-title' }, t('pageTitle')),
                h('span', { className: 'dsm-count' }, hiddenCount > 0
                  ? t('countHidden', { count: items.length, hidden: hiddenCount })
                  : t('count', { count: items.length }))),
              h('p', { className: 'dsm-sub' }, t('pageSubtitle'))),
            h('div', { className: 'dsm-toolbar' },
              h('button', {
                type: 'button', className: 'dsm-btn', 'data-variant': 'primary',
                disabled: draft !== null, onClick: startAdd,
              }, t('add')),
              resetArmed
                ? h(React.Fragment, null,
                  h('button', {
                    type: 'button', className: 'dsm-btn', 'data-variant': 'danger',
                    onClick: () => {
                      actions.reset()
                      setResetArmed(false)
                      setConfirmId(null)
                      cancelForm()
                    },
                  }, t('resetConfirm')),
                  h('button', {
                    type: 'button', className: 'dsm-btn', onClick: () => setResetArmed(false),
                  }, t('cancel')))
                : h('button', {
                  type: 'button', className: 'dsm-btn',
                  onClick: () => { setResetArmed(true); setConfirmId(null) },
                }, t('reset')))),
          persist.corrupt && h('p', { className: 'dsm-notice', role: 'status' }, t('corruptRestored')),
          persist.saveFailed && h('p', { className: 'dsm-notice', role: 'status' }, t('persistFailed')),
          draft !== null && editingId === null && h(EntryForm, {
            t, panels, draft, error, title: t('addTitle'),
            onChange: (next) => { setDraft(next); setError('') },
            onSave: () => commitDraft('add'),
            onCancel: cancelForm,
          }),
          panels.length > 0 && h('section', { className: 'dsm-group' },
            h('h3', { className: 'dsm-groupTitle' }, t('defaultGroup')),
            h('p', { className: 'dsm-groupHint' }, bridgeReady ? t('defaultActive') : t('defaultPending')),
            h('ul', { className: 'dsm-list' }, panels.map(panel => {
              const fixed = panel.id === FIXED_PANEL_ID
              const visible = !hiddenPanels.includes(panel.id)
              const visibleCount = panels.filter(candidate => !hiddenPanels.includes(candidate.id)).length
              // Every default panel keeps at least one row: hiding only folds
              // the panel into More, and the last visible row is never removed.
              const locked = fixed || (visible && visibleCount === 1)
              return h('li', { key: panel.id, className: 'dsm-row' },
                h('span', { className: 'dsm-kind', 'aria-hidden': true }, h(KindGlyph, { kind: 'panel' })),
                h('span', { className: 'dsm-rowMain' },
                  h('span', { className: 'dsm-rowLabel' },
                    h('span', { className: 'dsm-rowLabelText' }, panel.label),
                    fixed && h('span', { className: 'dsm-badge' }, t('fixedPanel'))),
                  h('span', { className: 'dsm-rowMeta' }, visible ? t('stateSidebar') : t('stateMore'))),
                h('button', {
                  type: 'button', role: 'switch', className: 'dsm-switch',
                  'aria-checked': visible, disabled: locked,
                  'aria-label': t('showSwitch', { name: panel.label }),
                  title: fixed ? t('fixedPanel') : undefined,
                  onClick: () => actions.setPanelHidden(panel.id, !visible),
                }))
            }))),
          h('h3', { className: 'dsm-groupTitle' }, t('customGroup')),
          items.length === 0
            ? h('div', { className: 'dsm-empty' },
              h('p', { className: 'dsm-emptyTitle' }, t('empty')),
              h('p', { className: 'dsm-emptyText' }, t('emptyHint')),
              h('button', { type: 'button', className: 'dsm-btn', 'data-variant': 'primary', onClick: startAdd }, t('add')))
            : h('ul', { className: 'dsm-list' },
              items.map(item => item.id === editingId && draft !== null
                ? h('li', { key: item.id },
                  h(EntryForm, {
                    t, panels, draft, error, title: t('editTitle'),
                    onChange: (next) => { setDraft(next); setError('') },
                    onSave: () => commitDraft('edit'),
                    onCancel: cancelForm,
                  }))
                : h(ItemRow, {
                  key: item.id,
                  t,
                  item,
                  firstVisible: item.id === firstVisibleId,
                  lastVisible: item.id === lastVisibleId,
                  highlighted: item.id === highlightId,
                  panels,
                  confirming: confirmId === item.id,
                  onMove: (delta) => { setResetArmed(false); actions.move(item.id, delta) },
                  onToggleHidden: () => { setResetArmed(false); actions.setHidden(item.id, !item.hidden) },
                  onEdit: () => startEdit(item),
                  onAskDelete: () => { setResetArmed(false); setConfirmId(item.id) },
                  onDelete: () => { actions.remove(item.id); setConfirmId(null) },
                  onCancelDelete: () => setConfirmId(null),
                }))),
          h('p', { className: 'dsm-hint' }, t('hint')))
    }

    /** Six-dot grip: the affordance that says "drag me". */
    function GripGlyph({ size = 12 }) {
      return h('svg', {
        className: 'dsm-glyph', viewBox: '0 0 12 20', width: size, height: size * 20 / 12,
        'aria-hidden': true, focusable: 'false',
      }, h('g', { fill: 'currentColor' },
        h('circle', { cx: 4, cy: 5, r: 1.3 }), h('circle', { cx: 8, cy: 5, r: 1.3 }),
        h('circle', { cx: 4, cy: 10, r: 1.3 }), h('circle', { cx: 8, cy: 10, r: 1.3 }),
        h('circle', { cx: 4, cy: 15, r: 1.3 }), h('circle', { cx: 8, cy: 15, r: 1.3 })))
    }

    /**
     * Shortcut rows for the left sidebar's More menu. Rows drag onto each other
     * to reorder: a native drag never fires the click that would run the entry,
     * so the same button keeps both gestures. `aria-disabled` (not the native
     * attribute) keeps an unavailable row focusable, so keyboard and
     * screen-reader users still reach the reason.
     */
    function SidebarMenuRows(props) {
      const { t, useMenuItems, usePanels, runMenuItem, onDismiss, adoptBridge, entries, onPinnedChange, actions } = props
      const items = useMenuItems(list => list)
      const panelSource = usePanels(source => source)
      // The host only offers its pin callbacks here, so this is where the saved
      // default-panel layout is applied and host-side pin clicks are mirrored.
      React.useEffect(() => {
        adoptBridge(entries, onPinnedChange)
      }, [entries, onPinnedChange, adoptBridge])
      const [drag, setDrag] = React.useState(null)
      // A drag can end on top of the source row, where some engines still fire a
      // click; swallow exactly one after a real move so the entry does not run.
      const moved = React.useRef(false)
      const visible = items.filter(item => !item.hidden)
      const close = () => {
        if (typeof onDismiss === 'function') onDismiss()
      }
      // A panel entry whose target is no longer registered says so instead of
      // failing silently; its row stays focusable but inert.
      const missing = (item) => !panelSource.failed && item.kind === 'panel'
        && !panelSource.panels.some(panel => panel.id === item.target)
      if (visible.length === 0) return null
      const canDrag = visible.length > 1
      const children = visible.map(item => {
        const dragging = drag !== null && drag.id === item.id
        const edge = drag !== null && drag.overId === item.id && drag.id !== item.id ? drag.edge : null
        return h('button', {
          key: item.id, type: 'button', role: 'menuitem', className: 'dsm-menuRow',
          'aria-disabled': missing(item),
          'aria-label': missing(item) ? labelOf(item, t) + ' \u00b7 ' + t('unavailableShort') : undefined,
          title: missing(item) ? t('missingPanel') : undefined,
          draggable: canDrag,
          'data-dragging': dragging,
          'data-drop': edge ?? undefined,
          onDragStart: (event) => {
            moved.current = false
            if (typeof event.dataTransfer?.setData === 'function') {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', item.id)
            }
            setDrag({ id: item.id, overId: null, edge: null })
          },
          onDragOver: (event) => {
            if (!canDrag || drag === null || drag.id === item.id) return
            event.preventDefault()
            if (event.dataTransfer !== undefined) event.dataTransfer.dropEffect = 'move'
            const rect = event.currentTarget.getBoundingClientRect()
            const next = event.clientY - rect.top < rect.height / 2 ? 'before' : 'after'
            if (drag.overId !== item.id || drag.edge !== next) {
              setDrag({ id: drag.id, overId: item.id, edge: next })
            }
          },
          onDrop: (event) => {
            event.preventDefault()
            const from = drag?.id
            setDrag(null)
            if (from === undefined || from === item.id) return
            moved.current = true
            actions.moveTo(from, item.id, drag.edge ?? 'before')
          },
          onDragEnd: () => { setDrag(null) },
          onClick: () => {
            if (moved.current) { moved.current = false; return }
            if (missing(item)) return
            close()
            runMenuItem(item)
          },
        },
        h('span', { className: 'dsm-menuIcon', 'aria-hidden': true }, h(KindGlyph, { kind: item.kind })),
        h('span', { className: 'dsm-menuLabel' }, labelOf(item, t)),
        missing(item) && h('span', { className: 'dsm-menuTrail' }, t('unavailableShort')),
        canDrag && h('span', { className: 'dsm-grip', 'aria-hidden': true }, h(GripGlyph)))
      })
      return h(React.Fragment, null, children)
    }

    /** How long a failed-entry toast stays before dismissing itself. */
    const TOAST_MS = 6000

    /**
     * Failure feedback for a More-menu row that could not run. It lives in
     * `shell.overlay` because the menu closes as soon as a row is chosen, so an
     * inline message would never be seen.
     */
    function RunFailureToast(props) {
      const { t, useNotice, clearNotice } = props
      const notice = useNotice(value => value)
      React.useEffect(() => {
        if (notice === null) return undefined
        const timer = window.setTimeout(clearNotice, TOAST_MS)
        return () => window.clearTimeout(timer)
      }, [notice, clearNotice])
      if (notice === null) return null
      return h('div', { className: 'dsm-toastLayer', role: 'status', 'aria-live': 'polite' },
        h('span', { className: 'dsm-toastText' }, t('runFailed', { name: notice.name })),
        h('button', { type: 'button', className: 'dsm-toastAction', onClick: clearNotice }, t('dismiss')))
    }

    /** Install the styles once per plugin lifetime. */
    function installStyles() {
      if (typeof document === 'undefined') return () => {}
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-plugin-sidebar-menu'
      tag.textContent = CSS
      document.head.appendChild(tag)
      return () => { tag.remove() }
    }

    function apply(ctx) {
      const locale = ctx.get('locale')
      let bound = (key) => (Object.prototype.hasOwnProperty.call(en, key) ? en[key] : key)
      if (locale !== undefined) {
        try {
          ctx.effect(() => locale.register(NS, { en, zh }), 'dsh-plugin-sidebar-menu: dictionaries')
        } catch {
          /* a previous run's dictionaries stay usable through bind */
        }
        try {
          bound = locale.bind(NS)
        } catch {
          /* keep the embedded fallback */
        }
      }
      const t = (key, params) => interpolate(bound(key), params)

      const store = createStore(() => makeDefaults(t))
      const panels = createPanelSource(ctx)
      const injected = () => ({
        hooks: {
          menuItems: store.source,
          panels,
          persistState: store.status,
          notice: store.notice,
          hiddenPanels: store.panels,
          bridgeReady: store.bridgeReady,
        },
        actions: {
          add: store.add,
          update: store.update,
          remove: store.remove,
          setHidden: store.setHidden,
          setPanelHidden: store.setPanelHidden,
          move: store.move,
          moveTo: store.moveTo,
          reset: store.reset,
        },
        adoptBridge: store.adoptBridge,
        clearNotice: store.clearNotice,
        runMenuItem: (item) => {
          const ran = runItem(ctx, item)
          if (!ran) store.setNotice(labelOf(item, t))
          return ran
        },
      })

      ctx.effect(installStyles, 'dsh-plugin-sidebar-menu: styles')

      // Settings is the management surface: no sidebar row, no main panel.
      // Order 25 sits after Models (10), Plugins (15), and Agent presets (20),
      // and clear of the Archived chats section installed at 30.
      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: PANEL_ID,
        order: 25,
        locale: NS,
        label: () => t('panel'),
        inject: injected,
      }, MenuSettingsSection))

      // The shell falls back to its generic gear for an unknown section id,
      // which made this row look like the General row.
      ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
        name: 'settings.section.icon',
        id: PANEL_ID,
      }, SidebarGlyph))

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'sidebar-menu.run-failure',
        locale: NS,
        inject: injected,
      }, RunFailureToast))

      // The shortcut rows themselves stay in the sidebar's More menu; -10 puts
      // them above the discovery/creation rows that package appends at 0.
      ctx.slots.inject('sidebar.panellist.actions', () => ctx.slots.register({
        name: 'sidebar.panellist.actions',
        id: 'sidebar-menu.actions',
        order: -10,
        locale: NS,
        inject: injected,
      }, SidebarMenuRows))
    }

    return { inject: ['slots', 'locale', 'layout'], apply }
  },
})
