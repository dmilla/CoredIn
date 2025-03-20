import { defineStyleConfig } from "@chakra-ui/react";

const baseStyle = {
  borderRadius: "1.125em",
  fontSize: "0.875rem",
  fontWeight: "400",
  color: "brand.100",
  textAlign: "center",
  mt: "0.5em",
  bg: "brand.900"
};

export const tooltipTheme = defineStyleConfig({ baseStyle });
