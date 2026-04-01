import preact, { render } from "preact";
import { LocationProvider, Router, Route, useLocation } from "preact-iso";

import { Home } from "./pages/home.js";
import { NotFound } from "./pages/_404.js";
import { FAQ } from "./pages/faq.js";
import { useEffect } from "preact/hooks";

function usePageActionInterceptor() {
  const { route } = useLocation();

  useEffect(() => {
    const abortController = new AbortController();
    const handleNavigate = (event: Event) => {
      const href = (event.target as HTMLElement)?.getAttribute('href');
      if (href) {
        route(href);
      }
    };

    document.addEventListener('shopify:navigate', handleNavigate, {signal: abortController.signal});
    return () => {
      abortController.abort();
    };
  }, []);
}

function AppProvider({ children }: { children: preact.ComponentChildren }) {
  usePageActionInterceptor();
  return <>{children}</>;
}

export function App() {
  return (
    <LocationProvider>
      <AppProvider>
        <s-app-nav>
          <s-link href="/" rel="home">Home</s-link>
          <s-link href="/faq/new">FAQ</s-link>
        </s-app-nav>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/faq/:id" component={FAQ} />
          <Route default component={NotFound} />
        </Router>
      </AppProvider>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app"));
