// Тема оформления: как в системе, всегда светлая или всегда тёмная
export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

export const THEME_LABELS: Record<Theme, string> = {
  system: 'Как в системе',
  light: 'Светлая',
  dark: 'Тёмная',
}

const THEME_KEY = 'job-tracker:theme'

export function loadTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return THEMES.includes(value as Theme) ? (value as Theme) : 'system'
  } catch {
    return 'system'
  }
}

// Записываем тему в атрибут <html data-theme="...">, CSS подхватывает её через переменные
export function applyTheme(theme: Theme): void {
  if (theme === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // без localStorage тема просто не запомнится
  }
}
