from trame.app import get_server
from trame.ui.vuetify3 import SinglePageLayout
from trame.ui.html import DivLayout
from trame.widgets import glayout, html, vuetify3 as v3
import random

server = get_server()
ctrl = server.controller
count = 0

THEMES = [
    "darkBorderless",
    "dark",
    "light",
    "soda",
    "translucent",
]

COLORS = [
    "white",
    "red",
    "green",
    "blue",
    "yellow",
]
SIZE = len(COLORS)


def add_component():
    global count
    count += 1
    template_name = f"dynacontent_{count}"
    title = f"New comp {count}"

    with DivLayout(server, template_name=template_name) as layout:
        layout.root.style = (
            f"background: {COLORS[count % SIZE]}; width: 100%; height: 100%;"
        )

        html.Div(f"Some content {count}")

    ctrl.add_component(title, template_name)


with SinglePageLayout(server, full_height=True) as layout:
    theme = random.choice(THEMES)
    with layout.toolbar:
        v3.VSpacer()
        v3.VLabel(theme)
        v3.VBtn("Add", click=add_component)

    with layout.content:
        with glayout.GoldenLayout(theme) as glayout:
            ctrl.add_component = glayout.add_component

server.start()
