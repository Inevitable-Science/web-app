import { ArticleResponse } from "@/lib/types/AdminArticleTypes";
import Image from "next/image";

export function AuthorsBar({ article }: { article?: ArticleResponse }) {
  return (
    <div className="flex w-full max-w-full items-center gap-2 overflow-x-auto">
      {" "}
      {/* Review this skewing the screen */}
      {article && (
        <div className="bg-grey-450 mb-2 flex w-max flex-col gap-1 rounded-lg p-2 font-light">
          <p className="text-xs">Written By</p>
          <div className="flex items-center gap-1">
            {article.metadata.author.profilePicture && (
              <Image
                src={article.metadata.author.profilePicture}
                alt={`Org Logo`}
                width={18}
                height={18}
                className="min-h-[18px] min-w-[18px] shrink-0 rounded-full"
              />
            )}
            <p className="text-sm">{article?.metadata.author.username}</p>
          </div>
        </div>
      )}
      {(article?.metadata.editors?.length ?? 0) > 0 && (
        <div className="bg-grey-450 flex w-max flex-col gap-1 rounded-lg p-2 font-light">
          <p className="text-xs">Edited By</p>
          {article?.metadata.editors.map((editor) => (
            <div className="flex items-center gap-1">
              {editor.profilePicture && (
                <Image
                  src={editor.profilePicture}
                  alt={`Org Logo`}
                  width={18}
                  height={18}
                  className="min-h-[24px] min-w-[24px] shrink-0 rounded-full"
                />
              )}
              <p>{editor.username}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
