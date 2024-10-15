import { ref, unref } from "vue";

export default {
  setup(props, { expose }) {
    const container = ref(null);

    function setPosAndSize(left, top, width, height) {
      if (container.value) {
        const el = unref(container);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
      }
    }

    function setVisibility(visible) {
      if (container.value) {
        const el = unref(container);
        if (visible) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      }
    }

    function setZIndex(value) {
      if (container.value) {
        const el = unref(container);
        el.style.zIndex = value;
      }
    }

    expose({
      setPosAndSize,
      setVisibility,
      setZIndex,
    });

    return {
      container,
    };
  },
  template: `<div ref="container" style="position: absolute; overflow: hidden"><slot></slot></div>`,
};
