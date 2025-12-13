import { useState } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Heading,
  Tooltip,
} from '@carbon/react';
import { Menu, Close } from '@carbon/icons-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentTab } from '../store/slices/navigationSlice';
import { TabKey, TAB_ORDER, getTabByKey } from '../models/navigation';
import InteractiveChat from './InteractiveChat';
import ContentLibrary from './ContentLibrary';
import GenerateDashboard from './GenerateDashboard';
import NotionDashboard from './NotionDashboard';
import PublishingDashboard from './PublishingDashboard';
import CondensedChat from './CondensedChat';
import ThreadSidebar from './ThreadSidebar';
import './Dashboard.css';

function Dashboard() {
  const dispatch = useAppDispatch();
  const currentTab = useAppSelector(state => state.navigation.currentTab);
  const currentTabIndex = useAppSelector(state => state.navigation.currentTabIndex);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const showThreadSidebar = true; // TODO: Make this configurable via settings

  const renderTabContent = (tabKey: TabKey) => {
    switch (tabKey) {
      case TabKey.INTERACTIVE:
        return <InteractiveChat />;
      case TabKey.LIBRARY:
        return <ContentLibrary />;
      case TabKey.GENERATE:
        return <GenerateDashboard />;
      case TabKey.NOTION:
        return <NotionDashboard />;
      case TabKey.PUBLISHING:
        return <PublishingDashboard />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <>
      {/* Thread sidebar for managing conversation sessions */}
      {showThreadSidebar && (
        <ThreadSidebar
          isExpanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />
      )}

      <div
        className={`dashboard-wrapper ${showThreadSidebar && sidebarExpanded ? 'with-sidebar' : ''}`}
        data-element="app-container"
      >
        <div className="dashboard-header">
          <Heading className="page-header">BlogEngine Dashboard</Heading>

          {/* Thread sidebar toggle button */}
          {showThreadSidebar && (
            <Tooltip
              align="bottom-right"
              label={sidebarExpanded ? 'Close threads' : 'Show threads'}
            >
              <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                aria-label="Toggle thread sidebar"
              >
                {sidebarExpanded ? <Close size={20} /> : <Menu size={20} />}
              </button>
            </Tooltip>
          )}
        </div>

        <Tabs
          selectedIndex={currentTabIndex}
          onChange={({ selectedIndex }) => dispatch(setCurrentTab(selectedIndex))}
        >
          <TabList aria-label="BlogEngine sections" contained>
            {TAB_ORDER.map(tabKey => {
              const tab = getTabByKey(tabKey);
              return (
                <Tab
                  key={tabKey}
                  data-element={`${tabKey}-tab`}
                >
                  {tab.icon} {tab.label}
                </Tab>
              );
            })}
          </TabList>
          <TabPanels>
            {TAB_ORDER.map(tabKey => (
              <TabPanel
                key={tabKey}
                data-element={`${tabKey}-panel`}
              >
                {renderTabContent(tabKey)}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>

      {/* Show condensed chat on all non-Interactive tabs */}
      {currentTab !== TabKey.INTERACTIVE && (
        <CondensedChat sidebarExpanded={showThreadSidebar && sidebarExpanded} />
      )}
    </>
  );
}

export default Dashboard;
