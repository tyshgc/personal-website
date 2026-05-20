import type { ImageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

type ImageProps = {
  block: ImageBlockObjectResponse;
};

export const Image: FC<ImageProps> = ({ block }) => {
  const src = block.image.type === "file" ? block.image.file.url : block.image.external.url;
  const caption = block.image.caption.map((t) => t.plain_text).join("");

  return (
    <figure class="my-6">
      <img src={src} alt={caption} class="w-full rounded-md border border-line" />
      {caption ? (
        <figcaption class="mt-2 font-mono text-xs text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
};
