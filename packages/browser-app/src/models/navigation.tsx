import { ReactNode } from 'react';
import {
  Chat,
  DocumentBlank,
  Add,
  Upload,
  Notebook,
} from '@carbon/icons-react';

export enum TabKey {
  INTERACTIVE = 'interactive',
  LIBRARY = 'library',
  GENERATE = 'generate',
  NOTION = 'notion',
  PUBLISHING = 'publishing',
}

export interface Tab {
  key: TabKey;
  label: string;
  icon: ReactNode;
}

export const TAB_ORDER: TabKey[] = [
  TabKey.INTERACTIVE,
  TabKey.LIBRARY,
  TabKey.GENERATE,
  TabKey.NOTION,
  TabKey.PUBLISHING,
];

export const TABS: Record<TabKey, Tab> = {
  [TabKey.INTERACTIVE]: {
    key: TabKey.INTERACTIVE,
    label: 'Interactive',
    icon: <Chat size={16} />,
  },
  [TabKey.LIBRARY]: {
    key: TabKey.LIBRARY,
    label: 'Content Library',
    icon: <DocumentBlank size={16} />,
  },
  [TabKey.GENERATE]: {
    key: TabKey.GENERATE,
    label: 'Generate',
    icon: <Add size={16} />,
  },
  [TabKey.NOTION]: {
    key: TabKey.NOTION,
    label: 'Notion',
    icon: <Notebook size={16} />,
  },
  [TabKey.PUBLISHING]: {
    key: TabKey.PUBLISHING,
    label: 'Publishing',
    icon: <Upload size={16} />,
  },
};

export function getTabByKey(key: TabKey): Tab {
  return TABS[key];
}
