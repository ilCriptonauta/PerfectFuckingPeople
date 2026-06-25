import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // MultiversX SDK UI web components
      'mvx-toast-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'mvx-sign-transactions-panel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'mvx-unlock-panel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
