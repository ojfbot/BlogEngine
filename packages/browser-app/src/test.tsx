import React from 'react';
import ReactDOM from 'react-dom/client';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import './index.scss';

function TestApp() {
  console.log('[TestApp] Rendering');
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Tab Test</h1>
      <Tabs>
        <TabList aria-label="List of tabs">
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
          <TabPanel>Content 3</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

document.documentElement.setAttribute('data-carbon-theme', 'g100');
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
