import { mount } from "@vue/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "./index";

describe("DEBUG focus", () => {
  it("check rendered HTML and tabindex", () => {
    const wrapper = mount(Button, {
      props: { disabled: true, focusableWhenDisabled: true },
    });
    console.log("HTML:", wrapper.html());
    console.log("In body?", document.body.contains(wrapper.element));
    console.log("tabindex attr:", wrapper.element.getAttribute("tabindex"));
    expect(true).toBe(true);
  });

  it("with attachTo", async () => {
    const user = userEvent.setup();
    const wrapper = mount(Button, {
      props: { disabled: true, focusableWhenDisabled: true },
      attachTo: document.body,
    });
    console.log("HTML:", wrapper.html());
    console.log("In body?", document.body.contains(wrapper.element));
    await user.tab();
    console.log(
      "activeElement:",
      document.activeElement?.tagName,
      document.activeElement === wrapper.element,
    );
    wrapper.unmount();
    expect(true).toBe(true);
  });
});
