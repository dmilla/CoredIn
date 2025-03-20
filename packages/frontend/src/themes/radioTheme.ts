import { radioAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(radioAnatomy.keys);

const baseStyle = definePartsStyle({
  control: {
    borderRadius: "50%",
    borderColor: "brand.200",
    bg: "transparent",
    color: "brand.200",
    _checked: {
      borderColor: "brand.200",
      bg: "transparent",
      color: "brand.200",
      _hover: {
        borderColor: "brand.200",
        bg: "brand.200"
      }
    }
  }
});

export const radioTheme = defineMultiStyleConfig({ baseStyle });
