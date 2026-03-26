/**
 * Type declarations for Polaris web components.
 */

import "preact";

declare module "preact/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `s-${string}`]: {
        children?: preact.ComponentChildren;
        [attr: string]: any;
      };
    }
  }
}
