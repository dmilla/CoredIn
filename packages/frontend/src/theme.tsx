import { extendTheme } from "@chakra-ui/react";
import "@fontsource-variable/public-sans";
import {
  badgeTheme,
  buttonTheme,
  checkboxTheme,
  inputTheme,
  layerStyles,
  menuTheme,
  modalTheme,
  radioTheme,
  selectTheme,
  stepperTheme,
  tabsTheme,
  tagTheme,
  textStyles,
  tooltipTheme
} from "./themes";

const fonts = {
  heading: `'Public Sans Variable', sans-serif`,
  body: `'Public Sans Variable', sans-serif`
};

const colors = {
  brand: {
    100: "#F5F5F5", // white
    200: "#FBB030", // yellow
    300: "#00AA54", // green
    400: "#FF550F", // red
    500: "#7F02FE", // purple
    900: "#141413" // black
  },
  other: {
    200: "#b0b0b0", // Used to identify self-issued credential, as a helper text in NotRegisteredProfile, for form elements border
    600: "#75746B" // Use this for placeholders and helper texts
  }
};

const styles = {
  global: {
    "::-webkit-scrollbar": {
      width: "10px"
    },
    "::-webkit-scrollbar-thumb": {
      bg: "#FFFFFFBF",
      border: "1px solid #141413",
      borderRadius: "8px"
    },
    "::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "brand.200"
    },
    "html, body": {
      color: "brand.900",
      boxSizing: "border-box"
    },
    body: {
      background: "brand.100"
    },
    html: {
      scrollBehavior: "smooth"
    },
    a: {
      textUnderlineOffset: "0.25em",
      _hover: { color: "brand.300" }
    },
    p: {}
  }
};

const components = {
  Badge: badgeTheme,
  Button: buttonTheme,
  Checkbox: checkboxTheme,
  Input: inputTheme,
  Menu: menuTheme,
  Modal: modalTheme,
  Radio: radioTheme,
  Select: selectTheme,
  Stepper: stepperTheme,
  Tabs: tabsTheme,
  Tag: tagTheme,
  Tooltip: tooltipTheme
};

const breakpoints = {
  base: "0em", // 0px
  sm: "30em", // ~480px. em is a relative unit and is dependant on the font size.
  md: "48em", // ~768px
  lg: "62em", // ~992px
  xl: "80em", // ~1280px
  "2xl": "96em" // ~1536px
};

export const theme = extendTheme({
  fonts,
  styles,
  colors,
  components,
  breakpoints,
  layerStyles,
  textStyles
});
