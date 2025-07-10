import React from 'react'
import { browser, type Browser } from '#imports'

/**
 * Hook to get the currently active tab in the current window.
 *
 * @param watchProperties Optional array of properties to watch for changes. If specified, the active tab state will only be updated if one of these properties changes. If not specified, the active tab state will be updated for any change.
 * @returns The currently active tab or null if no active tab is found.
 */
export default function useActiveTab(watchProperties?: string[]): Browser.tabs.Tab | null {
    const [activeTab, setActiveTab] = React.useState<Browser.tabs.Tab | null>(null)

    /**
     * Effect to initialize the active tab when the component mounts.
     */
    React.useEffect(() => {
        browser.tabs.query({ active: true, currentWindow: true }).then(([activeTab]) => {
            if (!activeTab) return
            setActiveTab(activeTab)
        })
    }, [])

    /**
     * Effect to update the active tab when it changes.
     *
     * The effect is rerun when the stringified object of properties to watch changes.
     * It registers a listener, which is triggered when a tab is updated.
     * The cleanup function removes the listener.
     */
    React.useEffect(() => {
        /**
         * Update the active tab state when the active tab is updated.
         *
         * The state is only updated if one of the specified properties in `watchProperties` has changed.
         * If no properties are specified, the state is updated for any change.
         *
         * @param _tabId The ID of the tab that was updated.
         * @param changeInfo Information about the change that occurred.
         * @param tab The updated tab object.
         */
        function handleActiveTabChange(_tabId: number, changeInfo: Browser.tabs.TabChangeInfo, tab: Browser.tabs.Tab) {
            // If the tab is not active or the specified properties have not changed, do nothing
            if (!tab.active || watchProperties?.every((property) => !(property in changeInfo))) return
            browser.windows.getCurrent().then((currentWindow) => {
                // If the tab is not in the current window, do nothing
                if (tab.windowId !== currentWindow.id) return
                // Update the active tab state
                setActiveTab(tab)
            })
        }

        // Register the listener for tab updates
        browser.tabs.onUpdated.addListener(handleActiveTabChange)

        return () => {
            // Cleanup: remove the tab change listener
            browser.tabs.onUpdated.removeListener(handleActiveTabChange)
        }
    }, [JSON.stringify(watchProperties)])

    return activeTab
}
