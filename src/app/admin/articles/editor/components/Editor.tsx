"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.bubble.css";

// Revoke object URLs to prevent memory leaks
import ImageBlot from "quill/formats/image";
import { uploadImage } from "../../UploadHelper";
import { useToast } from "@/components/ui/use-toast";
import { useAttachments, useEditorValue } from "@/store/ArticleEditorStore";
import { useAdminArticleQuery } from "@/hooks/queries/admin/useFetchAdminArticle";


// Improve image blot to support alt text and revoke URLs on remove
class BetterImageBlot extends ImageBlot {
  static create(value: any) {
    const node = super.create(value);
    if (typeof value === "string") {
      node.setAttribute("src", value);
    } else {
      node.setAttribute("src", value.src);
      if (value.alt) node.setAttribute("alt", value.alt);
    }
    return node;
  }
}
BetterImageBlot.blotName = "image";
BetterImageBlot.tagName = "img";
Quill.register(BetterImageBlot, true);

export default function Editor() {
  const { data: article, isLoading } = useAdminArticleQuery();
  const { editorValue, setEditorValue } = useEditorValue();
  const { attachments, setAttachments } = useAttachments();
  const { toast } = useToast();
  const quillRef = useRef<ReactQuill>(null);

  // set this in here to allow mount before state change
  const initialEditorValue = article?.content.content || "";
  useEffect(() => {
    if (isLoading) return;

    setEditorValue(initialEditorValue);
  }, [initialEditorValue, isLoading]);

  const imageHandler = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const range = quill.getSelection(true);
      if (range == null) return;

      quill.insertEmbed(range.index, "image", "https://cdn.inevitable.science/static/img/branding/logo.svg");
      quill.setSelection(range.index + 1, 0);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadedUrl = await uploadImage(file, "article");

        if (!uploadedUrl) {
          throw new Error("No URL returned from server");
        }

        setAttachments([...attachments, uploadedUrl]);

        // Replace placeholder with the real uploaded image
        quill.deleteText(range.index, 1);
        quill.insertEmbed(range.index, "image", uploadedUrl);
        quill.setSelection(range.index + 1, 0);
      } catch (err) {
        console.error("Image upload failed:", err);

        // Fallback: show local preview if upload fails
        quill.deleteText(range.index, 1);
        quill.setSelection(range.index, 0);

        toast({
          title: "Error",
          variant: "destructive",
          description: "Image upload failed",
        });
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          [{ script: "sub" }, { script: "super" }],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  return (
    <div className="prose max-w-none rounded-xl bg-grey-450">
      <ReactQuill
        ref={quillRef}
        theme="bubble"
        value={editorValue}
        onChange={setEditorValue}
        modules={modules}
        placeholder="Start writing..."
        className="min-h-28"
      />

      <style>{`

        .ql-editor.ql-blank::before {
          content: "Start Writing...";
          height: 100%;
          color: var(--muted-foreground);
          opacity: 1;
          font-style: normal;
          font-size: 15px;
        }

        .ql-editor p {
          font-size: 15px;
        }

        .ql-bubble .ql-tooltip {
          background-color: var(--dark-slate-grey);
          box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 24px;
        }

        .ql-tooltip-arrow {
          border-bottom: 6px solid var(--dark-slate-grey) !important;
        }



        .ql-tooltip .ql-toolbar .ql-formats {
          display: flex;
          gap: 2px;
        }

        .ql-tooltip .ql-toolbar {
          display: flex;
          align-items: center;
        }

        .ql-tooltip .ql-toolbar button {
          border-radius: 4px;
          transition: 0.2s;
        }

        .ql-tooltip .ql-toolbar button:hover {
          background-color: var(--grey-500);
        }

        .ql-tooltip .ql-toolbar .ql-active {
          background-color: var(--grey-450) !important;
        }

        .ql-bubble .ql-picker-label {
          border-radius: 4px;
        }

        .ql-bubble .ql-picker.ql-expanded .ql-picker-options {
          background-color: var(--dark-slate-grey) !important;
          margin-top: 10px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .ql-bubble .ql-picker.ql-expanded .ql-picker-label, .ql-bubble .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
          color: white;
          stroke: white;
        }

        .ql-tooltip-editor input::placeholder {
          color: var(--muted-foreground);
        }

      `}</style>
    </div>
  );
}
