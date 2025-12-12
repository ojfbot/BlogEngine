import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Heading,
} from '@carbon/react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentTab } from '../store/slices/navigationSlice';
import { TabKey, TAB_ORDER, getTabByKey } from '../models/navigation';
import InteractiveChat from './InteractiveChat';
import ContentLibrary from './ContentLibrary';
import GenerateDashboard from './GenerateDashboard';
import NotionDashboard from './NotionDashboard';
import PublishingDashboard from './PublishingDashboard';
import SettingsDashboard from './SettingsDashboard';
import CondensedChat from './CondensedChat';
import './Dashboard.css';

function Dashboard() {
  const dispatch = useAppDispatch();
  const currentTab = useAppSelector(state => state.navigation.currentTab);
  const currentTabIndex = useAppSelector(state => state.navigation.currentTabIndex);

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
      case TabKey.SETTINGS:
        return <SettingsDashboard />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <>
      <div className="dashboard-wrapper" data-element="app-container">
        <div className="dashboard-header">
          <Heading className="page-header">BlogEngine Dashboard</Heading>
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
        <CondensedChat />
      )}
    </>
  );
}

export default Dashboard;
