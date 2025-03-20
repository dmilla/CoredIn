import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { textStyles } from "./textStyles";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const sizes = {
  sm: definePartsStyle({
    tab: {
      ...textStyles.sm
    }
  }),
  md: definePartsStyle({
    tab: {
      ...textStyles.md,
      py: "0.75em"
    }
  })
};

const unstyled = definePartsStyle({
  tab: {
    bg: "transparent",
    borderTopRadius: "1.125em",
    // borderBottom: "1px solid #E6E6E6",
    _selected: {
      color: "brand.500",
      border: "1px solid #E6E6E6",
      borderBottom: "none",
      bg: "#FFFFFFBF",
      backdropFilter: "blur(12px)"
    },
    _hover: {
      color: "brand.300",
      _selected: {
        color: "brand.500"
      }
    }
  },
  tabpanel: {
    px: "2em",
    py: "2.5em",
    border: "1px solid #E6E6E6",
    borderTop: "0",
    borderTopRadius: "0",
    borderBottomRadius: "1.125em",
    bg: "#FFFFFFBF",
    backdropFilter: "blur(12px)"
  }
});

const softRounded = definePartsStyle({
  tab: {
    // w: "33%",
    bg: "transparent",
    color: "brand.900",
    border: "1px solid #FBB030", // === brand.200
    borderRadius: "2em",
    _selected: {
      bg: "brand.200",
      color: "brand.900",
      border: "2px solid #FBB030"
      // border: "none"
    },
    _hover: {
      bg: "#FBB03033",
      _selected: {
        bg: "brand.200"
      }
    }
  },
  tablist: {
    gap: "1em"
  },
  root: {
    layerStyle: "cardBox"
  },
  tabpanel: {
    px: "0"
  }
});

export const tabsTheme = defineMultiStyleConfig({
  sizes,
  variants: { unstyled, softRounded }
});
