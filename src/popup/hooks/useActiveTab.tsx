import React from 'react'
import { browser, type Browser } from '#imports'

export default function useActiveTab(watchProperties?: string[]): Browser.tabs.Tab | null {
    const [activeTab, setActiveTab] = React.useState<Browser.tabs.Tab | null>(null)

    React.useEffect(() => {
        browser.tabs.query({ active: true, currentWindow: true }).then(([activeTab]) => {
            if (!activeTab) return
            setActiveTab(activeTab)
        })
    }, [])

    React.useEffect(() => {
        function handleActiveTabChange(_tabId: number, changeInfo: Browser.tabs.TabChangeInfo, tab: Browser.tabs.Tab) {
            console.log('Tab updated:', changeInfo)
            if (!tab.active || watchProperties?.every((property) => !(property in changeInfo))) return
            browser.windows.getCurrent().then((currentWindow) => {
                if (tab.windowId !== currentWindow.id) return
                setActiveTab(tab)
            })
        }

        browser.tabs.onUpdated.addListener(handleActiveTabChange)

        return () => {
            browser.tabs.onUpdated.removeListener(handleActiveTabChange)
        }
    }, [JSON.stringify(watchProperties)])

    return activeTab
}
