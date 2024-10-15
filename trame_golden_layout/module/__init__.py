from pathlib import Path

THEMES = {
    "darkBorderless": "__trame_golden_layout/css/themes/goldenlayout-borderless-dark-theme.css",
    "dark": "__trame_golden_layout/css/themes/goldenlayout-dark-theme.css",
    "light": "__trame_golden_layout/css/themes/goldenlayout-light-theme.css",
    "soda": "__trame_golden_layout/css/themes/goldenlayout-soda-theme.css",
    "translucent": "__trame_golden_layout/css/themes/goldenlayout-translucent-theme.css",
}

serve_path = str(Path(__file__).with_name("serve").resolve())
serve = {"__trame_golden_layout": serve_path}
scripts = ["__trame_golden_layout/trame_golden_layout.umd.cjs"]
styles = ["__trame_golden_layout/style.css"]
vue_use = ["trame_golden_layout"]


def update_theme(name):
    global styles
    theme_css = THEMES.get(name, THEMES["light"])
    styles = ["__trame_golden_layout/style.css", theme_css]
