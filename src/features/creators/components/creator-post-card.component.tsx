import CopyButton from "@/shared/components/share/copy-button.component";
import ShareButton from "@/shared/components/share/share-button.component";

import type { CreatorPost } from "../lib/creator-kit.server";

export default function CreatorPostCard({ post }: { post: CreatorPost }) {
  return (
    <article className="flex flex-col rounded-[18px] border border-muted-black-stroke bg-white px-5 py-5">
      <div>
        <h3
          className="text-[15px] text-primary tracking-[-0.01em]"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          {post.label}
        </h3>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {post.description}
        </p>
      </div>
      <pre className="mt-4 flex-1 whitespace-pre-wrap break-words rounded-[12px] bg-secondary/50 px-4 py-3 font-sans text-[12px] text-black/70 leading-relaxed">
        {post.text}
      </pre>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton text={post.text} label="Copy post" />
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
