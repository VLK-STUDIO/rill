// @ts-ignore
import { defineAppConfig } from "#imports";

export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      neutral: "zinc",
    },
    button: {
      slots: {
        trailingIcon: "!ms-0",
      },
    },
    inputNumber: {
      slots: {
        increment: "!pe-0",
        decrement: "!pe-0",
      },
    },
  },
});
