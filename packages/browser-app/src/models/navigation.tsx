import { ReactNode } from 'react';
import {
  Chat,
  DocumentBlank,
  Add,
  Upload,
  Notebook,
  BookmarkAdd,
} from '@carbon/icons-react';

export enum TabKey {
  INTERACTIVE = 'interactive',
  LIBRARY = 'library',
  GENERATE = 'generate',
  WORKING_MEMORY = 'working-memory',
  NOTION = 'notion',
  PUBLISHING = 'publishing',
}

export interface Tab {
  key: TabKey;
  label: string;
  icon: ReactNode;
}

/**
 * Canonical tab order for the dashboard navigation.
 *
 * Order rationale:
 * 1. INTERACTIVE - Primary chat interface (most frequent use)
 * 2. LIBRARY - Published products browsing (supports generation workflows)
 * 3. GENERATE - Content creation (core feature)
 * 4. WORKING_MEMORY - Reference materials and research storage
 * 5. NOTION - Integration/sync (secondary workflow)
 * 6. PUBLISHING - Final step in content workflow
 *
 * This order follows the typical user journey: chat → browse products → create → reference → sync → publish
 */
export const TAB_ORDER: TabKey[] = [
  TabKey.INTERACTIVE,
  TabKey.LIBRARY,
  TabKey.GENERATE,
  TabKey.WORKING_MEMORY,
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
    label: 'Product Library',
    icon: <DocumentBlank size={16} />,
  },
  [TabKey.GENERATE]: {
    key: TabKey.GENERATE,
    label: 'Generate',
    icon: <Add size={16} />,
  },
  [TabKey.WORKING_MEMORY]: {
    key: TabKey.WORKING_MEMORY,
    label: 'Working Memory',
    icon: <BookmarkAdd size={16} />,
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
