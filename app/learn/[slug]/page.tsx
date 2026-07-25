import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { articleSlugs, getArticle, tocFromBody, CLUSTERS } from "../../lib/knowledge";
import { mdxComponents } from "../../components/knowledge/mdxComponents";
import {
  AnswerSummary,
  Toc,
  References,
  FaqBlock,
  Byline,
  ProductCTA,
  Disclaimer,
} from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export function generateStaticParams() {
  return articleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = getArticle(slug);
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `/learn/${slug}/` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/learn/${slug}/`,
      type: "article",
      ...(meta.hero ? { images: [meta.hero] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { meta, body } = getArticle(slug);
  const toc = tocFromBody(body);
  const cluster = CLUSTERS[meta.cluster];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: meta.title,
        description: meta.description,
        inLanguage: "th",
        datePublished: meta.updated,
        dateModified: meta.updated,
        author: { "@type": "Organization", name: "SAV Automation" },
        publisher: {
          "@type": "Organization",
          name: "SAV Mechanical Services & Supplies",
          logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
        },
        mainEntityOfPage: `${SITE}/learn/${slug}/`,
        ...(meta.references?.length
          ? { citation: meta.references.map((r) => [r.name, r.detail].filter(Boolean).join(" — ")) }
          : {}),
        ...(meta.hero ? { image: `${SITE}${meta.hero}` } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "คลังความรู้", item: `${SITE}/learn/` },
          { "@type": "ListItem", position: 3, name: meta.title, item: `${SITE}/learn/${slug}/` },
        ],
      },
      ...(meta.faq?.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: meta.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <main className="bg-gray-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* breadcrumb */}
        <nav className="text-[12.5px] text-gray-500 mb-4 flex flex-wrap gap-1.5">
          <Link href="/" className="hover:text-brand">หน้าแรก</Link>
          <span>/</span>
          <Link href="/learn/" className="hover:text-brand">คลังความรู้</Link>
          {cluster && (
            <>
              <span>/</span>
              <span>{cluster.label}</span>
            </>
          )}
        </nav>

        <article className="bg-white rounded-lg border border-gray-200 border-t-[3px] border-t-brand p-7 sm:p-10">
          {cluster && (
            <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand mb-2">
              {cluster.label}
            </p>
          )}
          <h1 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-ink">
            {meta.title}
          </h1>
          <Byline basis={meta.basis} updated={meta.updated} />

          {meta.summary && <AnswerSummary>{meta.summary}</AnswerSummary>}
          <Toc items={toc} />

          <div className="knowledge-body">
            <MDXRemote
              source={body}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>

          {meta.products?.length ? <ProductCTA products={meta.products} /> : null}

          <FaqBlock items={meta.faq ?? []} />
          <References items={meta.references ?? []} />
          <Disclaimer />
        </article>

        <div className="mt-6 text-center">
          <Link href="/learn/" className="text-[13px] font-semibold text-brand hover:underline">
            ← กลับไปที่คลังความรู้
          </Link>
        </div>
      </div>
    </main>
  );
}
