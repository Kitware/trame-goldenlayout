def test_import():
    from trame_golden_layout.widgets.trame_golden_layout import (
        CustomWidget,
    )  # noqa: F401

    # For components only, the CustomWidget is also importable via trame
    from trame.widgets.trame_golden_layout import CustomWidget  # noqa: F401,F811