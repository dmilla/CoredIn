import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Box, BoxProps } from "@chakra-ui/react";
import { inputTheme } from "../../../themes/inputTheme";

interface RichTextEditorProps extends BoxProps {
  value: string;
  onTextChange?: (content: string) => void;
  readOnly?: boolean;
  hideToolbar?: boolean;
  maxHeight?: string;
  preview?: boolean;
  id: string;
}

export function RichTextEditor({
  id,
  value,
  onTextChange,
  readOnly = false,
  hideToolbar = false,
  maxHeight = "500px",
  preview = false,
  ...boxProps
}: RichTextEditorProps) {
  const modules = {
    toolbar: hideToolbar ? false : [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  const handleChange = (content: string) => {
    if (onTextChange) {
        onTextChange(content);
    }
  };

  return (
    <Box position="relative" {...boxProps}>
      <Box
        maxHeight={preview ? maxHeight : undefined}
        overflowY={preview ? "hidden" : "auto"}
        position="relative"
      >
        <ReactQuill
          id={`editor${id}`}
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          readOnly={readOnly}
          theme="snow"
          style={{
            ...(inputTheme.baseStyle?.field ?? {}),
            minHeight: readOnly ? undefined : "250px",
            maxHeight: preview ? undefined : "50vh",
            border: readOnly ? "none" : "1px solid rgba(1,1,1,0.2)",
            borderRadius: "1.125rem",
            background: preview ? "brand.100" : "white",
            color: "inherit",
            fontFamily: "inherit",
            fontSize: "1rem",
            textAlign: "left",
          }}
        />
      </Box>
      {preview && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          pointerEvents="none"
          background="linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 80%, rgba(255,255,255,1) 100%)"
          zIndex="1"
        />
      )}
    </Box>
  );
}
