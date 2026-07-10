import { gidToId, idToGid } from "../utils/gid";

export interface FAQ {
  question: string;
  answer: string;
  show_on_faq_page: boolean;
}

export type FAQSummary = FAQ & { id: string };

export const EMPTY_FAQ: FAQ = {
  question: "",
  answer: "",
  show_on_faq_page: true,
};

const primedFAQs = new Map<string, FAQ>();

export function primeFAQ(id: string, faq: FAQ) {
  primedFAQs.set(id, { ...faq });
}

export function getPrimedFAQ(id: string): FAQ | null {
  const faq = primedFAQs.get(id);
  return faq ? { ...faq } : null;
}

// Metaobject `values` (read and write) requires Admin API 2026-07 or above.
function gqlFetch(query: string, variables?: Record<string, unknown>) {
  return fetch("shopify:admin/api/2026-07/graphql.json", {
    method: "POST",
    body: JSON.stringify({ query, variables }),
  }).then((r) => r.json());
}

// The `values` field returns each metaobject field already deserialised to its
// native type (text -> string, boolean -> boolean), keyed by field key, so it
// maps straight onto FAQ. We only apply defaults for fields that may be absent.
function fromValues(values: Record<string, unknown>): FAQ {
  return {
    question: (values.question as string) ?? "",
    answer: (values.answer as string) ?? "",
    show_on_faq_page: (values.show_on_faq_page as boolean) ?? true,
  };
}

export async function fetchFAQ(id: string): Promise<FAQ> {
  const json = await gqlFetch(
    `#graphql
    query FAQ($id: ID!) {
      metaobject(id: $id) {
        values
      }
    }`,
    { id: idToGid(id) },
  );

  const faq = fromValues(json.data.metaobject.values);
  primeFAQ(id, faq);
  return faq;
}

export async function listFAQs(): Promise<FAQSummary[]> {
  const json = await gqlFetch(
    `#graphql
    query FAQs {
      metaobjects(type: "$app:faq", first: 50, sortKey: "updated_at", reverse: true) {
        edges {
          node {
            id
            values
          }
        }
      }
    }`,
  );

  const faqs = json.data.metaobjects.edges.map(
    ({
      node,
    }: {
      node: { id: string; values: Record<string, unknown> };
    }) => ({
      id: node.id,
      ...fromValues(node.values),
    }),
  );

  for (const { id, ...faq } of faqs) {
    primeFAQ(gidToId(id), faq);
  }

  return faqs;
}

export async function createFAQ(faq: FAQ): Promise<string> {
  const json = await gqlFetch(
    `#graphql
    mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
      }
    }`,
    {
      metaobject: {
        type: "$app:faq",
        values: faq,
      },
    },
  );
  return json.data.metaobjectCreate.metaobject.id;
}

export async function updateFAQ(
  id: string,
  faq: FAQ,
): Promise<void> {
  await gqlFetch(
    `#graphql
    mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id }
      }
    }`,
    {
      id: idToGid(id),
      metaobject: { values: faq },
    },
  );
  primeFAQ(id, faq);
}

export async function deleteFAQ(id: string): Promise<void> {
  await gqlFetch(
    `#graphql
    mutation DeleteMetaobject($id: ID!) {
      metaobjectDelete(id: $id) {
        deletedId
      }
    }`,
    { id: idToGid(id) },
  );
}
