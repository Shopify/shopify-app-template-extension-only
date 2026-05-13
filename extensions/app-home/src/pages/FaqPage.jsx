import {useState, useEffect} from 'preact/hooks';
import {useLocation} from 'preact-iso';
import {fetchFAQ, createFAQ, updateFAQ, deleteFAQ, EMPTY_FAQ} from '../../../../shared/models/faq';

/** @typedef {import('../../../../shared/models/faq').FAQ} FAQ */

/** @param {{ id?: string }} props */
export default function FaqPage({id}) {
  const isNew = !id || id === 'new';
  const location = useLocation();

  const [faq, setFaq] = useState({...EMPTY_FAQ});
  const [snapshot, setSnapshot] = useState(faq);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [fieldErrors, setFieldErrors] = useState(
    /** @type {{question?: string, answer?: string}} */ ({}),
  );

  /**
   * @param {keyof FAQ} key
   * @param {any} value
   */
  const setFaqField = (key, value) => {
    setFaq((prev) => ({...prev, [key]: value}));
    if (key === 'question' || key === 'answer') {
      setFieldErrors((prev) => {
        if (!prev[key]) return prev;
        const {[key]: _, ...rest} = prev;
        return rest;
      });
    }
  };

  const handleReset = () => {
    setFaq({...snapshot});
    setFieldErrors({});
  };

  const handleSave = async () => {
    const nextFieldErrors =
      /** @type {{question?: string, answer?: string}} */ ({});
    if (!faq.question.trim()) nextFieldErrors.question = 'Question is required';
    if (!faq.answer.trim()) nextFieldErrors.answer = 'Answer is required';
    if (nextFieldErrors.question || nextFieldErrors.answer) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setStatus('saving');
    setError(null);
    setFieldErrors({});

    if (isNew) {
      try {
        await createFAQ(faq);
      } catch (_) {
        setError('Failed to save FAQ');
        setStatus('idle');
        return;
      }
      location.route('/');
      return;
    }

    try {
      await updateFAQ(id, faq);
    } catch (_) {
      setError('Failed to update FAQ');
      setStatus('idle');
      return;
    }
    setSnapshot({...faq});
    setStatus('idle');
  };

  const handleDelete = async () => {
    if (isNew) return;
    setStatus('deleting');
    try {
      await deleteFAQ(id);
    } catch (_) {
      setError('Failed to delete FAQ');
      setStatus('idle');
      return;
    }
    location.route('/');
  };

  useEffect(() => {
    if (isNew) return;
    setStatus('loading');
    setError(null);

    fetchFAQ(id)
      .then((data) => {
        setSnapshot(data);
        setFaq(data);
      })
      .finally(() => {
        setStatus('idle');
      });
  }, [id]);

  if (status === 'loading') {
    return null;
  }

  return (
    <s-page heading={isNew ? "New FAQ" : snapshot.question} inlineSize="small">
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

      {error && (
        <s-section>
          <s-banner tone="critical">{error}</s-banner>
        </s-section>
      )}

      <s-section heading="FAQ details">
        <s-grid gap="base">
          <s-form onSubmit={handleSave} onReset={handleReset}>
            <s-text-field
              label="Question"
              name="question"
              labelAccessibilityVisibility="visible"
              placeholder="e.g. What is your return policy?"
              value={faq.question}
              onInput={(e) => setFaqField("question", /** @type {HTMLInputElement} */ (e.target).value)}
              details="The question customers will see"
              required
              error={fieldErrors.question}
            />
            <s-text-area
              label="Answer"
              name="answer"
              labelAccessibilityVisibility="visible"
              placeholder="e.g. You can return items within 30 days of purchase."
              value={faq.answer}
              onInput={(e) => setFaqField("answer", /** @type {HTMLTextAreaElement} */ (e.target).value)}
              details="Provide a clear, helpful answer"
              required
              error={fieldErrors.answer}
            />
            <s-switch
              label="Show on the FAQ page"
              name="show_on_faq_page"
              checked={faq.show_on_faq_page}
              onChange={(e) =>
                setFaqField("show_on_faq_page", /** @type {HTMLInputElement} */ (e.target).checked)
              }
              details="If enabled, the FAQ will be shown on the FAQ page."
            />
          </s-form>
        </s-grid>
      </s-section>
    </s-page>
  );
}
