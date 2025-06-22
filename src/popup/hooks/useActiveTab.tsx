import React from 'react'
import { browser, type Browser } from '#imports'

export default function useActiveTab(): Browser.tabs.Tab | null {
    const [activeTab, setActiveTab] = React.useState<Browser.tabs.Tab | null>(null)

    React.useEffect(() => {
        browser.tabs.query({ active: true, currentWindow: true }).then(([activeTab]) => {
            if (activeTab) {
                setActiveTab(activeTab)
            }
        })
    }, [])

    return activeTab
}
