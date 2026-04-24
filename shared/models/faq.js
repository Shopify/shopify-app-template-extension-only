import { idToGid } from "../utils/gid.js";

export const EMPTY_FAQ = {
  question: "",
  answer: "",
  show_on_faq_page: true,
};

function gqlFetch(query, variables) {
  return fetch("shopify:admin/api/2026-04/graphql.json", {
    method: "POST",
    body: JSON.stringify({ query, variables }),
  }).then((r) => r.json());
}

function parseFields(fields) {
  const valueOf = (key) => fields.find((f) => f.key === key)?.value;
  return {
    question: valueOf("question") ?? "",
    answer: valueOf("answer") ?? "",
    show_on_faq_page: valueOf("show_on_faq_page") !== "false",
  };
}

function toFieldsPayload(faq) {
  return [
    { key: "question", value: faq.question },
    { key: "answer", value: faq.answer },
    { key: "show_on_faq_page", value: String(faq.show_on_faq_page) },
  ];
}

export async function fetchFAQ(id) {
  const json = await gqlFetch(
    `#graphql
    query FAQ($id: ID!) {
      metaobject(id: $id) {
        fields { key value }
      }
    }`,
    { id: idToGid(id) },
  );

  return parseFields(json.data.metaobject.fields);
}

export async function listFAQs() {
  const json = await gqlFetch(
    `#graphql
    query FAQs {
      metaobjects(type: "$app:faq", first: 50, sortKey: "updated_at", reverse: true) {
        edges {
          node {
            id
            fields { key value }
          }
        }
      }
    }`,
  );

  return json.data.metaobjects.edges.map(({ node }) => ({
    id: node.id,
    ...parseFields(node.fields),
  }));
}

export async function createFAQ(faq) {
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
        fields: toFieldsPayload(faq),
      },
    },
  );
  return json.data.metaobjectCreate.metaobject.id;
}

export async function updateFAQ(id, faq) {
  await gqlFetch(
    `#graphql
    mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id }
      }
    }`,
    {
      id: idToGid(id),
      metaobject: { fields: toFieldsPayload(faq) },
    },
  );
}

export async function deleteFAQ(id) {
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
