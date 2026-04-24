/**
 * NavTestPage — exercises all navigation APIs to verify routing works correctly.
 *
 * Test cases:
 *   TC-01  Link navigation via useLocation().route()
 *   TC-02  history.pushState programmatic navigation
 *   TC-03  history.replaceState (no new history entry — back skips this step)
 *   TC-04  history.back()
 *   TC-05  history.forward()
 *   TC-06  history.go(delta) with positive and negative delta
 *   TC-07  URL bar in admin reflects current path after pushState
 *   TC-08  window.location.pathname / .search / .href readable
 *   TC-09  Browser back button → popstate fires → preact-iso re-renders
 *   TC-10  Browser forward button → popstate fires → preact-iso re-renders
 *   TC-11  Deep-link: load directly at /nav-test/sub/alpha renders correctly
 */

import {useState, useEffect} from 'preact/hooks';
import {useLocation} from 'preact-iso';

export default function NavTestPage() {
  const location = useLocation();
  const [log, setLog] = useState([`[init] pathname=${window.location.pathname} href=${window.location.href}`]);

  function addLog(msg) {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 29)]);
  }

  // Track popstate — proves browser back/forward work (TC-09, TC-10)
  useEffect(() => {
    const handler = () => addLog(`popstate → pathname=${window.location.pathname}`);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // TC-02: history.pushState
  function testPushState() {
    const path = `/nav-test/pushed-${Date.now() % 10000}`;
    addLog(`pushState(${path})`);
    history.pushState({source: 'test'}, '', path);
  }

  // TC-03: history.replaceState
  function testReplaceState() {
    const path = `/nav-test/replaced-${Date.now() % 10000}`;
    addLog(`replaceState(${path})`);
    history.replaceState({source: 'replace'}, '', path);
  }

  // TC-04
  function testBack() {
    addLog('history.back()');
    history.back();
  }

  // TC-05
  function testForward() {
    addLog('history.forward()');
    history.forward();
  }

  // TC-06 go(-2)
  function testGoMinus2() {
    addLog('history.go(-2)');
    history.go(-2);
  }

  return (
    <s-page heading="Navigation Test">
      {/* TC-08: location info */}
      <s-section heading="TC-08 — window.location">
        <s-text as="p">pathname: <s-text>{window.location.pathname}</s-text></s-text>
        <s-text as="p">search: <s-text>{window.location.search || '(none)'}</s-text></s-text>
        <s-text as="p">href: <s-text>{window.location.href}</s-text></s-text>
        <s-text as="p">history.state: <s-text>{JSON.stringify(history.state) || 'null'}</s-text></s-text>
      </s-section>

      {/* TC-01: link navigation via useLocation().route() */}
      <s-section heading="TC-01 — Link navigation (useLocation().route)">
        <s-button onclick={() => { addLog('route → /nav-test/sub/alpha'); location.route('/nav-test/sub/alpha'); }}>
          Go to Sub-page Alpha
        </s-button>
        <s-button onclick={() => { addLog('route → /nav-test/sub/beta'); location.route('/nav-test/sub/beta'); }}>
          Go to Sub-page Beta
        </s-button>
        <s-button onclick={() => { addLog('route → /'); location.route('/'); }}>
          Go to Home
        </s-button>
      </s-section>

      {/* TC-02 to TC-06: direct history API calls */}
      <s-section heading="TC-02/03 — pushState / replaceState">
        <s-button onclick={testPushState}>pushState (new path)</s-button>
        <s-button onclick={testReplaceState}>replaceState (same stack slot)</s-button>
      </s-section>

      <s-section heading="TC-04/05/06 — back / forward / go">
        <s-button onclick={testBack}>history.back()</s-button>
        <s-button onclick={testForward}>history.forward()</s-button>
        <s-button onclick={testGoMinus2}>history.go(-2)</s-button>
      </s-section>

      {/* TC-09 / TC-10: verified via event log below */}
      <s-section heading="Event log (TC-07/09/10: watch URL bar and log)">
        {log.map((entry, i) => (
          <s-text key={i} as="p">{entry}</s-text>
        ))}
      </s-section>
    </s-page>
  );
}

/**
 * Sub-page shown at /nav-test/sub/:name.
 * TC-11: direct deep-link load.
 */
export function NavTestSubPage({params}) {
  const name = params?.name ?? 'unknown';
  const location = useLocation();

  return (
    <s-page heading={`Sub-page: ${name}`}>
      <s-section heading="Breadcrumb / location (TC-11)">
        <s-text as="p">You are at: <s-text>{window.location.pathname}</s-text></s-text>
        <s-text as="p">Param name: <s-text>{name}</s-text></s-text>
      </s-section>

      <s-section heading="Navigate">
        <s-button onclick={() => location.route('/nav-test')}>← Back to Nav Test</s-button>
        <s-button onclick={() => location.route('/nav-test/sub/alpha')}>Alpha</s-button>
        <s-button onclick={() => location.route('/nav-test/sub/beta')}>Beta</s-button>
        <s-button onclick={() => location.route('/nav-test/sub/gamma')}>Gamma</s-button>
        <s-button onclick={() => history.back()}>history.back()</s-button>
      </s-section>
    </s-page>
  );
}
