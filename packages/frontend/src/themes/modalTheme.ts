import { modalAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(modalAnatomy.keys);

const baseStyle = definePartsStyle({
  dialogContainer: {
    px: "0.5em",
    py: "0.5em"
  },
  dialog: {
    py: "1em",
    px: "1em",
    bg: "brand.100",
    borderRadius: "1.125em",
    border: "1px solid #E6E6E6",
    color: "brand.900"
  },
  overlay: {
    bg: "#14141380",
    backdropFilter: "blur(2px)"
  }
});

const secondary = defineMultiStyleConfig({});

const full = definePartsStyle({
  dialogContainer: {
    p: "0"
  },
  dialog: {
    px: "0"
  },
  closeButton: {
    color: "brand.900",
    width: "26px",
    aspectRatio: "1",
    top: "10px",
    right: "10px",
    p: "4px",
    cursor: "pointer"
  }
});

export const modalTheme = defineMultiStyleConfig({
  baseStyle,
  sizes: { full }
});
