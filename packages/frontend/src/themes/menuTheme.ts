import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  list: {
    bg: "brand.100",
    border: "1px solid #E6E6E6",
    borderRadius: "1.75em",
    minW: "150px",
    w: "max-content",
    px: "6px"
  },
  item: {
    bg: "transparent",
    borderRadius: "1.125em",
    border: "1px solid transparent",
    _hover: { borderColor: "brand.200" },
    _focus: { borderColor: "brand.200" }
  }
});

export const menuTheme = defineMultiStyleConfig({ baseStyle });
