import { Textarea, TextareaProps } from "@chakra-ui/react";
import ResizeTextarea from "react-textarea-autosize";
import React from "react";
import { formElementBorderStyles } from "@/themes";

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>((props, ref) => {
  return (
    <Textarea
      as={ResizeTextarea}
      minH="60px"
      w="100%"
      resize="none"
      ref={ref}
      minRows={1}
      fontSize={{ base: "0.875rem", lg: "1rem" }}
      overflow="auto"
      borderRadius="1.125em"
      {...formElementBorderStyles}
      borderColor="other.200"
      _placeholder={{
        color: "other.600"
      }}
      {...props}
    />
  );
});
