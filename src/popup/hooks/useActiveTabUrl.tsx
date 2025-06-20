import React from 'react'
import { browser } from '#imports'

export default function useActiveTabUrl(): URL | null {
    const [activeTabUrl, setActiveTabUrl] = React.useState<URL | null>(null)

    React.useEffect(() => {
        browser.tabs.query({ active: true, currentWindow: true }).then(([activeTab]) => {
            if (activeTab && activeTab.url) {
                try {
                    const url = new URL(activeTab.url)
                    setActiveTabUrl(url)
                } catch (_) {}
            }
        })
    }, [])

    return activeTabUrl
}
