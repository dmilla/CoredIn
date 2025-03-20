import React from "react";
import { useQuill } from "react-quilljs-vite-fix";
import BlotFormatter from "@enzedonline/quill-blot-formatter2";
import "quill/dist/quill.snow.css";
import { Box, BoxProps } from "@chakra-ui/react";
import { inputTheme } from "../../../themes/inputTheme";

interface RichTextEditorProps {
  value: string;
  onTextChange?: (content: string) => void;
  readOnly?: boolean;
  hideToolbar?: boolean;
  maxHeight?: string;
  preview?: boolean;
  id: string;
  placeholder?: string;
}

const RichTextEditorQuillHook: React.FC<RichTextEditorProps & BoxProps> = ({
  id,
  value,
  onTextChange,
  readOnly = false,
  maxHeight = "500px",
  preview = false,
  placeholder = "Write your text here...",
  ...boxProps
}) => {
  const modules = React.useMemo(
    () => ({
      toolbar: readOnly
        ? false
        : [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" }
            ],
            [{ align: [] }],
            ["link", "image", "video"],
            ["clean"]
          ],
      blotFormatter: {}
    }),
    [readOnly]
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
    "video"
  ];

  const { quill, quillRef, Quill } = useQuill({
    modules,
    formats,
    theme: "snow",
    readOnly,
    placeholder: readOnly ? undefined : placeholder
  });

  React.useEffect(() => {
    if (Quill && !quill) {
      Quill.register("modules/blotFormatter", BlotFormatter);
    }
  }, [Quill, quill]);

  React.useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        if (onTextChange) {
          onTextChange(quill.root.innerHTML);
        }
      });
    }
  }, [quill, onTextChange]);

  React.useEffect(() => {
    if (quill && value !== undefined) {
      if (value !== quill.root.innerHTML) {
        quill.root.innerHTML = value;
        quill.update();
      }
    }
  }, [quill, value]);

  return (
    <Box position="relative" {...boxProps}>
      <style>{`
        .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #F5F5F5;
        }
      `}</style>
      <Box
        maxHeight={preview ? maxHeight : undefined}
        overflowY={preview ? "hidden" : "auto"}
        overflowX="auto"
        position="relative"
        maxH={readOnly ? undefined : "50vh"}
      >
        <div
          ref={quillRef}
          style={{
            ...(inputTheme.baseStyle?.field ?? {}),
            ...(inputTheme.variants?.richTextEditor?.field ?? {}),
            minHeight: readOnly ? undefined : "250px",
            border: readOnly ? "none" : "1px solid rgba(1,1,1,0.2)",
            background: preview ? "brand.100" : "white",
            color: "inherit",
            fontFamily: "inherit",
            fontSize: "inherit",
            textAlign: undefined
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
};

export default RichTextEditorQuillHook;
