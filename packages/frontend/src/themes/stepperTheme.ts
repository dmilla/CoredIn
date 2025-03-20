const baseStyle = {
  title: {
    color: "brand.900",
    fontSize: { base: "1.25rem", lg: "1.75rem" },
    lineHeight: "1.25",
    mb: "0.25em"
  },
  description: {
    color: "brand.900",
    fontSize: { base: "1rem" },
    lineHeight: "1.35"
  },
  indicator: {
    bg: "transparent",
    borderColor: "brand.900",
    "[data-status=complete] &": {
      bg: "brand.300"
    },
    "[data-status=active] &": {
      borderColor: "brand.300"
    }
  },
  number: {
    color: "brand.900"
  },
  icon: {
    color: "brand.100"
  },
  separator: {
    bg: "brand.900",
    "[data-status=complete] &": {
      bg: "brand.300"
    }
  }
};

export const stepperTheme = {
  baseStyle
};
