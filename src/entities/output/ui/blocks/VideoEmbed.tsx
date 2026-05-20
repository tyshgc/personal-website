import type {
  EmbedBlockObjectResponse,
  VideoBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

type VideoOrEmbedBlock = VideoBlockObjectResponse | EmbedBlockObjectResponse;

type VideoEmbedProps = {
  block: VideoOrEmbedBlock;
};

type VideoSource =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "file"; src: string }
  | { kind: "unknown"; href: string };

function resolveSource(block: VideoOrEmbedBlock): VideoSource {
  let url = "";
  if (block.type === "video") {
    url = block.video.type === "file" ? block.video.file.url : block.video.external.url;
  } else {
    url = block.embed.url;
  }
  if (!url) return { kind: "unknown", href: "" };

  // YouTube
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt?.[1]) {
    return { kind: "youtube", embedUrl: `https://www.youtube.com/embed/${yt[1]}` };
  }

  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm?.[1]) {
    return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm[1]}` };
  }

  // Direct video file
  if (/\.(mp4|webm|mov|ogg)(?:\?|$)/i.test(url)) {
    return { kind: "file", src: url };
  }

  return { kind: "unknown", href: url };
}

export const VideoEmbed: FC<VideoEmbedProps> = ({ block }) => {
  const source = resolveSource(block);

  if (source.kind === "youtube" || source.kind === "vimeo") {
    return (
      <div class="my-6 overflow-hidden rounded-md border border-line">
        <div class="relative aspect-video">
          <iframe
            src={source.embedUrl}
            class="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            title="Embedded video"
          />
        </div>
      </div>
    );
  }

  if (source.kind === "file") {
    return (
      <figure class="my-6">
        <video controls preload="metadata" class="w-full rounded-md border border-line">
          <source src={source.src} />
        </video>
      </figure>
    );
  }

  if (source.kind === "unknown" && source.href) {
    return (
      <a
        href={source.href}
        target="_blank"
        rel="noopener noreferrer"
        class="my-6 block rounded-md border border-line bg-surface px-4 py-3 text-sm text-paper hover:border-accent"
      >
        {source.href}
      </a>
    );
  }

  return null;
};
