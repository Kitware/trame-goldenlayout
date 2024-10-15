// https://github.com/chyj4747/vue3-golden-layout-virtualcomponent/tree/master
import { onMounted, ref, nextTick, unref, onBeforeUnmount, watchEffect } from "vue";

import { LayoutConfig, VirtualLayout } from "golden-layout";

import "golden-layout/dist/css/goldenlayout-base.css";

class TemplateManager {
  constructor() {
    this.nextId = 1;
    this.recycleIds = [];
    this.templateMapping = {};
  }

  registerTemplate(templateName) {
    const id = this.recycleIds.length ? this.recycleIds.pop() : this.nextId++;
    this.templateMapping[id] = templateName;
    return id;
  }

  getTemplate(id) {
    return this.templateMapping[id];
  }

  unregisterTemplate(id) {
    this.recycleIds.push(id);
    const templateName = this.templateMapping[id];
    delete this.templateMapping[id];
    return templateName;
  }
}

export default {
  props: {},
  emits: [],
  setup(props) {
    const templateManager = new TemplateManager();
    let layoutManager = null;
    let managerContainerRect = null;
    const managerContainer = ref(null);
    const components = ref([]);
    const componentsDomElem = {};
    const componentsMap = new Map();

    async function addComponent(title, template) {
      // console.log("addComponent::begin");
      const refId = templateManager.registerTemplate(template);
      // console.log("addComponent", title, template, refId);
      components.value = [...components.value, { template, refId, title }];
      await nextTick();
      layoutManager.addComponent(template, { refId }, title);
      // console.log("addComponent::end");
    }

    function exportConfig() {
      return layoutManager.saveLayout();
    }

    async function importConfig(layoutConfig) {
      layoutManager.clear();
      components.value = {};

      const config = layoutConfig.resolved
        ? LayoutConfig.fromResolved(layoutConfig)
        : layoutConfig;

      const contents = [config.root.content];

      let index = 0;
      while (contents.length > 0) {
        const content = contents.shift();
        for (const itemConfig of content) {
          if (itemConfig.type == "component") {
            index = addComponent(itemConfig.componentType, itemConfig.title);
            if (typeof itemConfig.componentState == "object")
              itemConfig.componentState["refId"] = index;
            else itemConfig.componentState = { refId: index };
          } else if (itemConfig.content.length > 0) {
            contents.push(itemConfig.content);
          }
        }
      }

      await nextTick();
      layoutManager.loadLayout(config);
    }

    function onResize() {
      // console.log("onResize");
      const dom = unref(managerContainer);
      const width = dom ? dom.offsetWidth : 0;
      const height = dom ? dom.offsetHeight : 0;
      layoutManager.setSize(width, height);
    }

    function handleBeforeVirtualRectingEvent() {
      managerContainerRect = unref(managerContainer).getBoundingClientRect();
      // console.log("handleBeforeVirtualRectingEvent", managerContainerRect);
    }

    function handleContainerVirtualRectingRequiredEvent(
      container,
      width,
      height
    ) {
      // console.log(
      //   "handleContainerVirtualRectingRequiredEvent::container",
      //   container
      // );
      const component = componentsMap.get(container);
      if (!component || !component?.glc) {
        throw new Error(
          "handleContainerVirtualRectingRequiredEvent: Component not found"
        );
      }

      const compRect = container.element.getBoundingClientRect();
      const left = compRect.left - managerContainerRect.left;
      const top = compRect.top - managerContainerRect.top;
      component.glc.setPosAndSize(left, top, width, height);
    }

    function handleContainerVirtualVisibilityChangeRequiredEvent(
      container,
      visible
    ) {
      // console.log(
      //   "handleContainerVirtualVisibilityChangeRequiredEvent::container",
      //   container
      // );
      // console.log("map", componentsMap);
      const component = componentsMap.get(container);
      // console.log("got", component);
      if (!component || !component?.glc) {
        throw new Error(
          "handleContainerVirtualVisibilityChangeRequiredEvent: Component not found"
        );
      }

      component.glc.setVisibility(visible);
    }

    function handleContainerVirtualZIndexChangeRequiredEvent(
      container,
      logicalZIndex,
      defaultZIndex
    ) {
      const component = componentsMap.get(container);
      if (!component || !component?.glc) {
        throw new Error(
          "handleContainerVirtualZIndexChangeRequiredEvent: Component not found"
        );
      }

      component.glc.setZIndex(defaultZIndex);
    }

    function bindComponentEventListener(container, itemConfig) {
      // console.log("bindComponentEventListener", container, itemConfig);
      const refId = itemConfig?.componentState?.refId;
      if (!refId) {
        throw new Error(
          "bindComponentEventListener: component's ref id is required"
        );
      }

      const glc = componentsDomElem[templateManager.getTemplate(refId)];
      // console.log(refId, "=>", templateManager.getTemplate(refId));
      // console.log(componentsDomElem);
      // console.log("update map", container, refId, glc);
      componentsMap.set(container, { refId, glc });

      container.virtualRectingRequiredEvent =
        handleContainerVirtualRectingRequiredEvent;
      container.virtualVisibilityChangeRequiredEvent =
        handleContainerVirtualVisibilityChangeRequiredEvent;
      container.virtualZIndexChangeRequiredEvent =
        handleContainerVirtualZIndexChangeRequiredEvent;

      return {
        component: glc,
        virtual: true,
      };
    }

    function unbindComponentEventListener(container) {
      // console.log("unbindComponentEventListener", container);
      const component = componentsMap.get(container);
      if (!component || !component?.glc) {
        throw new Error("handleUnbindComponentEvent: Component not found");
      }

      const templateName = templateManager.unregisterTemplate(component.refId);
      componentsMap.delete(container);
      // console.log("components", components.value);
      components.value = components.value.filter(
        ({ template }) => template !== templateName
      );
    }

    onBeforeUnmount(() => {
      // console.log("onBeforeUnmount");
      window.removeEventListener("resize", onResize);
    });

    onMounted(() => {
      // console.log("onMounted");
      if (!managerContainer.value) {
        throw new Error("Golden Layout can't find the root DOM!");
      }
      window.addEventListener("resize", onResize, { passive: true });

      layoutManager = new VirtualLayout(
        managerContainer.value,
        bindComponentEventListener,
        unbindComponentEventListener
      );

      layoutManager.beforeVirtualRectingEvent = handleBeforeVirtualRectingEvent;
      // console.log("onMounted::done");
    });

    return {
      componentsDomElem,
      managerContainer,
      components,
      addComponent,
      exportConfig,
      importConfig,
    };
  },
  template: `
        <div style="position: relative; height: 100%; width: 100%;">
            <div ref="managerContainer" style="position: absolute; width: 100%; height: 100%">
            </div>
            <div style="position: absolute; width: 100%; height: 100%">
                <golden-component
                    v-for="item in components"
                    :key="item.template"
                    :ref="(el) => componentsDomElem[item.template] = el"
                >
                    <trame-template :templateName="item.template" />
                </golden-component>
            </div>
        </div>
    `,
};
