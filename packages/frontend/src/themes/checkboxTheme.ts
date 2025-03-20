import { checkboxAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(checkboxAnatomy.keys);

const baseStyle = definePartsStyle({
  label: {
    fontFamily: "body"
  },
  control: {
    borderRadius: "50%",
    borderColor: "brand.900",
    borderWidth: "1px",
    p: 3,
    mr: "6px",
    _hover: {
      borderColor: "brand.900",
      _checked: {
        borderColor: "brand.900",
        bg: "brand.900"
      }
    },
    _checked: {
      bg: "brand.900",
      borderColor: "brand.900",
      color: "brand.100"
    }
  }
});

export const checkboxTheme = defineMultiStyleConfig({ baseStyle });
