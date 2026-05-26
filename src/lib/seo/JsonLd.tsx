type Json = Record<string, unknown>;

/**
 * Server-rendered JSON-LD <script>. Accepts a single object or an array of
 * objects. Each object is emitted as its own <script> tag so search engines
 * and AI crawlers parse them independently.
 */
export default function JsonLd({ data }: { data: Json | Json[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
