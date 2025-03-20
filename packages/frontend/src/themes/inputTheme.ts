import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const baseStyle = definePartsStyle({
  field: {
    color: "brand.900",
    fontFamily: "body",
    fontSize: { base: "0.875rem", lg: "1rem" },
    textAlign: "start",
    borderRadius: "1.125em",

    _placeholder: {
      color: "other.600"
    }
  },
  addon: {
    borderRadius: "0.5em",
    background: "#eaecec"
  },
  element: {
    color: "other.600"
  }
});

const richTextEditorStyle = definePartsStyle({
  field: {
    // borderBottomLeftRadius: "1.125em",
    // borderBottomRightRadius: "1.125em",
    background: "#fefcfc"
  },
  toolbar: {
    display: "block",
    background: "#eaecec",
    borderTopLeftRadius: "1.125em",
    borderTopRightRadius: "1.125em",
    borderBottomLeftRadius: "0",
    borderBottomRightRadius: "0"
  },
  editor: {
    minHeight: "18em"
  }
});

export const inputTheme = defineMultiStyleConfig({
  baseStyle,
  variants: {
    richTextEditor: richTextEditorStyle
  }
});
