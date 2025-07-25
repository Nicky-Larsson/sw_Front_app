import { inject, provide } from 'vue'

const MENU_KEY = 'menu-actions'

// Provider function - use this in default.vue
export function provideMenuActions(actions) {
  provide(MENU_KEY, actions)
}

// Consumer function - use this in FlipbookViewer.vue
export function useMenuActions() {
  return inject(MENU_KEY)
}