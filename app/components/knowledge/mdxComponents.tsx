import type { ReactNode } from "react";
import Link from "next/link";
import { headingId } from "../../lib/knowledge";
import { Callout, Formula, ProductCTA } from "./parts";
import { FailureModes, ProtectionMatrix, UsedIn } from "./equipmentTables";

function textOf(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in (children as never)) {
    // @ts-expect-error runtime child
    return textOf(children.props?.children);
  }
  return "";
}

/* Component map for MDX article bodies — styles standard markdown and exposes
   the custom in-article blocks (<Callout>, <Formula>, <ProductCTA/>). */
export const mdxComponents = {
  h2: ({ children }: { children?: ReactNode }) => (
    <h2
      id={headingId(textOf(children))}
      className="font-display font-extrabold text-2xl text-ink mt-10 mb-3 scroll-mt-24"
    >
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="font-display font-bold text-lg text-ink mt-7 mb-2">{children}</h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="text-[16px] leading-[1.85] text-gray-800 my-4">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc pl-6 my-4 space-y-1.5 text-[16px] leading-relaxed text-gray-800 marker:text-brand">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal pl-6 my-4 space-y-1.5 text-[16px] leading-relaxed text-gray-800 marker:text-gray-400">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="pl-1">{children}</li>,
  a: ({ href = "#", children }: { href?: string; children?: ReactNode }) =>
    href.startsWith("/") ? (
      <Link href={href} className="text-brand font-semibold hover:underline">
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noopener" className="text-brand font-semibold hover:underline">
        {children}
      </a>
    ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-bold text-ink">{children}</strong>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[14px] text-brand-dark">
      {children}
    </code>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-6 overflow-x-auto rounded border border-gray-200">
      <table className="w-full text-[14.5px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead className="bg-gray-50 text-left">{children}</thead>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-b border-gray-200 px-3 py-2.5 font-display font-bold text-ink">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-b border-gray-100 px-3 py-2.5 align-top text-gray-800">{children}</td>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-5 border-l-4 border-gray-300 pl-4 text-gray-600 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-gray-200" />,
  Callout,
  Formula,
  ProductCTA,
  // Sections E and F of the article template, rendered from the shared
  // driven-equipment dataset so no article hand-writes a failure table.
  FailureModes,
  ProtectionMatrix,
  UsedIn,
};
