import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tagAnatomy.keys);

const md = defineStyle({
  fontSize: "0.825em",
  px: "1em",
  py: "0.25em",
  minH: "auto"
});

const sizes = {
  md: definePartsStyle({ container: md, label: md })
};

const primary = definePartsStyle({
  container: {
    bg: "brand.200",
    color: "brand.900",
    borderRadius: "2em"
  }
});

export const tagTheme = defineMultiStyleConfig({
  variants: { primary },
  sizes
});
