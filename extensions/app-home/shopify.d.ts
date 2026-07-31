import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/AppHome.jsx' {
  const shopify: import('@shopify/ui-extensions/admin.app.home.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/pages/HomePage.jsx' {
  const shopify: import('@shopify/ui-extensions/admin.app.home.render').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/pages/FaqPage.jsx' {
  interface UpdateFaqInput {
    question?: string;
    answer?: string;
    show_on_faq_page?: boolean;
    [k: string]: unknown;
  }

  interface UpdateFaqOutput {
    success: boolean;
    [k: string]: unknown;
  }

  interface ShopifyTools {
    register(
      name: 'update_faq',
      handler: (input: UpdateFaqInput) => UpdateFaqOutput | Promise<UpdateFaqOutput>,
    ): () => void;
  }

  const shopify: import('@shopify/ui-extensions/admin.app.home.render').Api & {
    tools?: ShopifyTools;
    intents?: {
      request?: { value?: { data?: { id?: string } & Record<string, unknown> } };
      response?: { ok?: (data: Record<string, unknown>) => Promise<void> };
    };
  };
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/pages/NotFoundPage.jsx' {
  const shopify: import('@shopify/ui-extensions/admin.app.home.render').Api;
  const globalThis: { shopify: typeof shopify };
}

