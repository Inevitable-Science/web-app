"use client";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import Editor from "./Editor";
import { ArticleResponse } from "@/lib/types/AdminArticleTypes";
import { useUser } from "@/store/AdminAuthStore";
import { useTitle } from "@/store/ArticleEditorStore";
import { OrganisationSelect } from "./sidebar/OrganisationSelect";
import { KeywordTable, TagsTable } from "./sidebar/WordTables";
import { DisplayRulesTable } from "./sidebar/DisplayRulesTable";
import { LandingImageTable } from "./sidebar/LandingImageTable";
import { ActionButtonsTable } from "./sidebar/ActionButtonsTable";
import { AuthorsBar } from "./AuthorsBar";

export function ArticleEditor({ article }: { article?: ArticleResponse }) {
  const { user } = useUser();
  const { title, setTitle } = useTitle();

  // Conditional rendering or early return
  if (!user) return null;

  return (
    <>
      <div className="absolute top-0 left-0 z-90 hidden h-screen w-screen cursor-wait" />{" "}
      {/* Toggle during image upload or article save */}
      <div className="ctWrapper">
        <div className="text-md text-muted-foreground mt-28 mb-4 flex items-center gap-1 font-light">
          <Link
            href="/admin/articles"
            className="flex items-start border-b border-transparent leading-[18px] hover:border-(--text-muted-foreground)"
          >
            Admin Articles
            <ArrowUpRight height={14} width={14} />
          </Link>
          <ChevronRight height={18} width={18} />
          <p>Editor</p>
        </div>
        <div className="flex gap-2">
          <div className="flex w-full flex-col gap-2">
            <input
              type="text"
              className="bg-grey-450 placeholder:text-muted-foreground focus:ring-cerulean focus:ring-offset-grey-450 w-full rounded-lg border-none p-2 text-lg font-light outline-hidden transition-shadow focus:ring-2 focus:ring-offset-2"
              placeholder="Article Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex flex-col">
              <AuthorsBar article={article} />

              <Editor />
            </div>
          </div>

          <div className="flex w-[320px] flex-col gap-2">
            <LandingImageTable />

            <OrganisationSelect />

            <DisplayRulesTable />

            <KeywordTable />

            <TagsTable />

            <ActionButtonsTable article={article} />
          </div>
        </div>
      </div>
    </>
  );
}
