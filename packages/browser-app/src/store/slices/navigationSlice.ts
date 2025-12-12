import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TabKey, TAB_ORDER } from '../../models/navigation';

export interface NavigationState {
  currentTab: TabKey;
  currentTabIndex: number;
  previousTab: TabKey | null;
}

const initialState: NavigationState = {
  currentTab: TabKey.INTERACTIVE,
  currentTabIndex: 0,
  previousTab: null,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setCurrentTab: (state, action: PayloadAction<number>) => {
      const newIndex = action.payload;
      const newTab = TAB_ORDER[newIndex];

      if (newTab) {
        state.previousTab = state.currentTab;
        state.currentTab = newTab;
        state.currentTabIndex = newIndex;
      }
    },
    navigateToTab: (state, action: PayloadAction<TabKey>) => {
      const tabKey = action.payload;
      const newIndex = TAB_ORDER.indexOf(tabKey);

      if (newIndex !== -1) {
        state.previousTab = state.currentTab;
        state.currentTab = tabKey;
        state.currentTabIndex = newIndex;
      }
    },
  },
});

export const { setCurrentTab, navigateToTab } = navigationSlice.actions;
export default navigationSlice.reducer;
