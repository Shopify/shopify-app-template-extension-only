import { useState, useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { gidToId } from "../../shared/utils/gid";
import {
  type FAQ,
  EMPTY_FAQ,
  fetchFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../../shared/models/faq";

type Status = "idle" | "loading" | "saving" | "deleting";

export function FAQ({ id }: { id?: string }) {
  const isNew = !id || id === "new";

  const { route } = useLocation();
  const [faq, setFaq] = useState<FAQ>({ ...EMPTY_FAQ });
  const [snapshot, setSnapshot] = useState<FAQ>(faq);
  const [status, setStatus] = useState<Status>("idle");

  const setFaqField = <K extends keyof FAQ>(key: K, value: FAQ[K]) => {
    setFaq((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = (e: Event) => {
    e.preventDefault();
    setFaq({ ...snapshot });
  };

  const handleSave = async (e: Event) => {
    e.preventDefault();
    setStatus("saving");

    if (isNew) {
      const faqGid = await createFAQ(faq);
      shopify.toast.show("FAQ created");
      shopify.saveBar.hide("faq-save-bar");
      return route(`/faq/${gidToId(faqGid)}`);
    }

    await updateFAQ(id!, faq);
    setSnapshot({ ...faq });
    setStatus("idle");
    shopify.toast.show("FAQ updated");
    shopify.saveBar.hide("faq-save-bar");
  };

  const handleDelete = async () => {
    if (isNew) return;
    setStatus("deleting");
    await deleteFAQ(id!);
    shopify.toast.show("FAQ deleted");
    route("/");
    setStatus("idle");
  };

  useEffect(() => {
    if (isNew) return;
    setStatus("loading");
    shopify.loading(true);

    fetchFAQ(id!)
      .then((data) => {
        setSnapshot(data);
        setFaq(data);
      })
      .finally(() => {
        setStatus("idle");
        shopify.loading(false);
      });
  }, []);

  if (status === "loading") {
    return null;
  }

  return (
    <s-page heading={isNew ? "New FAQ" : faq.question} inlineSize="small">
      <s-link slot="breadcrumb-actions" href="/">
        FAQs
      </s-link>

      {!isNew && (
        <s-button
          slot="secondary-actions"
          onClick={handleDelete}
          loading={status === "deleting"}
        >
          Delete
        </s-button>
      )}

      <form data-save-bar onReset={handleReset} onSubmit={handleSave}>
        <s-section heading="FAQ details">
          <s-grid gap="base">
            <s-text-field
              label="Question"
              name="question"
              labelAccessibilityVisibility="visible"
              placeholder="e.g. What is your return policy?"
              value={faq.question}
              onInput={(e: Event) =>
                setFaqField("question", (e.target as HTMLInputElement).value)
              }
              details="The question customers will see"
            />
            <s-text-area
              label="Answer"
              name="answer"
              labelAccessibilityVisibility="visible"
              placeholder="e.g. You can return items within 30 days of purchase."
              value={faq.answer}
              onInput={(e: Event) =>
                setFaqField("answer", (e.target as HTMLInputElement).value)
              }
              details="Provide a clear, helpful answer"
            />
            <s-switch
              label="Show on the FAQ page"
              name="show_on_faq_page"
              checked={faq.show_on_faq_page}
              onChange={(e: Event) =>
                setFaqField(
                  "show_on_faq_page",
                  (e.target as HTMLInputElement).checked,
                )
              }
              details="If enabled, the FAQ will be shown on the FAQ page."
            />
          </s-grid>
        </s-section>
      </form>
    </s-page>
  );
}
