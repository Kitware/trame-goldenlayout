from trame_client.widgets.core import AbstractElement
from .. import module


class HtmlElement(AbstractElement):
    def __init__(self, _elem_name, theme="light", children=None, **kwargs):
        super().__init__(_elem_name, children, **kwargs)
        if self.server:
            module.update_theme(theme)
            self.server.enable_module(module)


__all__ = [
    "GoldenLayout",
]


class GoldenLayout(HtmlElement):
    _next_id = 0

    def __init__(self, theme="light", **kwargs):
        super().__init__(
            "golden-layout",
            theme=theme,
            **kwargs,
        )

        self.__ref = kwargs.get("ref")
        if self.__ref is None:
            GoldenLayout._next_id += 1
            self.__ref = f"_glayout_{GoldenLayout._next_id}"
        self._attributes["ref"] = f'ref="{self.__ref}"'

    def add_component(self, title, template_name):
        self.server.js_call(self.__ref, "addComponent", title, template_name)
