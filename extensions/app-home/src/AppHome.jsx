import {render} from 'preact';
import {LocationProvider, ErrorBoundary, Router, Route, useLocation} from 'preact-iso';

import HomePage from './pages/HomePage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import NavTestPage, {NavTestSubPage} from './pages/NavTestPage.jsx';

export default async () => {
  render(<App />, document.body);
};

function App() {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path="/" component={HomePage} />
          <Route path="/faq/:id" component={FaqPage} />
          <Route default component={NotFoundPage} />
          <Route path="/nav-test" component={NavTestPage} />
          <Route path="/nav-test/sub/:name" component={NavTestSubPage} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
}
