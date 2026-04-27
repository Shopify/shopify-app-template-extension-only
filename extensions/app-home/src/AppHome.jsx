import {render} from 'preact';
import {LocationProvider, ErrorBoundary, Router, Route} from 'preact-iso';

import HomePage from './pages/HomePage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

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
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
}
