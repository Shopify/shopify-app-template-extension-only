export function NotFound() {
  return (
    <s-page heading="Page not found">
      <s-section>
        <s-stack direction="block" gap="large" alignItems="center">
          <s-paragraph>
            The page you're looking for doesn't exist.
          </s-paragraph>
          <s-button href="/">Go to home</s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}
