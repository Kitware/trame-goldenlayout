def test_import():
    from trame_golden_layout.widgets.glayout import (
        GoldenLayout,
    )  # noqa: F401

    # For components only, the GoldenLayout is also importable via trame
    from trame.widgets.glayout import GoldenLayout  # noqa: F401,F811
