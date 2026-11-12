/**
 * dsh-plugin-sidebar-menu — Host half.
 *
 * The plugin owns browser-side menu entries only: the sidebar entry, the
 * management page, and the rows it contributes to the sidebar's More menu.
 * It registers no Host row behavior and stores its menu list in the browser
 * profile, so this half stays empty on purpose.
 */

/** No Host-side behavior. */
export function apply() {}
