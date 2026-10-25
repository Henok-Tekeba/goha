import CopyButton from "@/shared/components/share/copy-button.component";
import ShareButton from "@/shared/components/share/share-button.component";

import type { CreatorPost } from "../lib/creator-kit.server";

export default function CreatorPostCard({ post }: { post: CreatorPost }) {
  return (
    <article className="flex flex-col rounded-[18px] border border-muted-black-stroke bg-white px-6 py-6">
      <h3 className="font-medium text-primary text-sm tracking-tight">
        {post.label}
      </h3>
      <pre className="mt-5 flex-1 whitespace-pre-wrap break-words font-sans text-[12px] text-black/70 leading-[1.7]">
        {post.text}
      </pre>
      <div className="mt-6 flex gap-2">
        <CopyButton text={post.text} label="Copy" />
        <ShareButton
          path={post.path}
          title={post.label}
          text={post.text}
          label="Share"
        />
      </div>
    </article>
  );
}
