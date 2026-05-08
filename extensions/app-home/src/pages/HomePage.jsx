import {useState, useEffect} from 'preact/hooks';
import {listFAQs} from '../../../../shared/models/faq';
import {gidToId} from '../../../../shared/utils/gid';

/** @typedef {import('../../../../shared/models/faq').FAQSummary} FAQSummary */

export default function HomePage() {
  const [faqs, setFaqs] = useState(/** @type {FAQSummary[]} */ ([]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setFaqs(await listFAQs());
      setLoading(false);
    })();
  }, []);

  const hasFaqs = faqs.length > 0;

  return (
    <s-page heading="FAQs">
      <s-button slot="primary-action" variant="primary" href="/faq/new">
        Create FAQ
      </s-button>

      {!loading && (
        <s-section slot="aside" heading={shopify.i18n.translate('welcome', {target: shopify.extension.target})}>
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-paragraph>
              <s-text>Framework: </s-text>
              <s-link href="https://preactjs.com/" target="_blank">
                Preact
              </s-link>
            </s-paragraph>
            <s-link href="https://preactjs.com/" target="_blank">
              <s-box maxInlineSize="24px" maxBlockSize="24px">
                <s-image src="./assets/preact-logo.png" alt="Preact logo" />
              </s-box>
            </s-link>
          </s-stack>
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-paragraph>
              <s-text>Interface: </s-text>
              <s-link
                href="https://shopify.dev/docs/api/app-home/web-components"
                target="_blank"
              >
                Polaris web components
              </s-link>
            </s-paragraph>
            <s-link
              href="https://shopify.dev/docs/api/app-home/web-components"
              target="_blank"
            >
              <s-box maxInlineSize="32px" maxBlockSize="32px">
                <s-image src="./assets/polaris-icon.png" alt="Polaris logo" />
              </s-box>
            </s-link>
          </s-stack>
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-paragraph>
              <s-text>API: </s-text>
              <s-link
                href="https://shopify.dev/docs/api/admin-graphql"
                target="_blank"
              >
                GraphQL Admin API
              </s-link>
            </s-paragraph>
            <s-link
              href="https://shopify.dev/docs/api/admin-graphql"
              target="_blank"
            >
              <s-box maxInlineSize="24px" maxBlockSize="24px">
                <s-image src="./assets/graphql-logo.png" alt="GraphQL logo" />
              </s-box>
            </s-link>
          </s-stack>
          <s-paragraph>
            <s-text>Database: </s-text>
            <s-link
              href="https://shopify.dev/docs/apps/build/custom-data/metaobjects"
              target="_blank"
            >
              Metaobjects
            </s-link>
          </s-paragraph>
        </s-section>
      )}

      {!loading && !hasFaqs && (
        <s-section accessibilityLabel="Empty state section">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-box maxInlineSize="200px" maxBlockSize="200px">
              <s-image
                aspectRatio="1/0.5"
                src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                alt="Illustration of FAQ creation"
              />
            </s-box>
            <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
              <s-stack alignItems="center">
                <s-heading>Start creating FAQs</s-heading>
                <s-paragraph>
                  Create frequently asked questions to boost sales.
                </s-paragraph>
              </s-stack>
              <s-button-group>
                <s-button
                  slot="primary-action"
                  accessibilityLabel="Add a new FAQ"
                  href="/faq/new"
                >
                  Create FAQ
                </s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>
      )}

      {!loading && hasFaqs && (
        <s-section padding="none" accessibilityLabel="FAQs table section">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Question</s-table-header>
              <s-table-header>FAQ page</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {faqs.map((faq) => (
                <s-table-row key={faq.id}>
                  <s-table-cell>
                    <s-link href={`/faq/${gidToId(faq.id)}`}>
                      {faq.question || 'Untitled'}
                    </s-link>
                  </s-table-cell>
                  <s-table-cell>
                    <s-badge
                      tone={faq.show_on_faq_page ? 'auto' : 'neutral'}
                    >
                      {faq.show_on_faq_page ? 'Shown' : 'Hidden'}
                    </s-badge>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-section>
      )}
    </s-page>
  );
}
