import {useState, useEffect} from 'preact/hooks';
import {useLocation} from 'preact-iso';
import {fetchFAQ, createFAQ, updateFAQ, deleteFAQ, EMPTY_FAQ} from '../../../../shared/models/faq';
import {gidToId} from '../../../../shared/utils/gid';

export default function FaqPage({id}) {
  const isNew = !id || id === 'new';
  const location = useLocation();

  const [faq, setFaq] = useState({...EMPTY_FAQ});
  const [snapshot, setSnapshot] = useState(faq);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const setFaqField = (key, value) => {
    setFaq((prev) => ({...prev, [key]: value}));
  };

  const handleReset = () => {
    setFaq({...snapshot});
  };

  const handleSave = async () => {
    setStatus('saving');
    setError(null);

    if (isNew) {
      let result;
      try {
        result = await createFAQ(faq);
      } catch (_) {
        setError('Failed to save FAQ');
        setStatus('idle');
        return;
      }
      if (!result || result.error) {
        setError((result && result.error) || 'Failed to save FAQ');
        setStatus('idle');
        return;
      }
      const newId = gidToId(result);
      location.route(`/faq/${newId}`);
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
              onInput={(e) => setFaqField("question", e.target.value)}
              details="The question customers will see"
            />
            <s-text-area
              label="Answer"
              name="answer"
              labelAccessibilityVisibility="visible"
              placeholder="e.g. You can return items within 30 days of purchase."
              value={faq.answer}
              onInput={(e) => setFaqField("answer", e.target.value)}
              details="Provide a clear, helpful answer"
            />
            <s-switch
              label="Show on the FAQ page"
              name="show_on_faq_page"
              checked={faq.show_on_faq_page}
              onChange={(e) =>
                setFaqField("show_on_faq_page", e.target.checked)
              }
              details="If enabled, the FAQ will be shown on the FAQ page."
            />
          </s-form>
        </s-grid>
      </s-section>
    </s-page>
  );
}
