import React from 'react'
import { storage, type StorageItemKey } from '#imports'

import useActiveTab from '@/popup/hooks/useActiveTab'

/**
 * Hook to manage a state that is synchronized with the browser's storage.
 *
 * @param initialValue The initial value for the state.
 * @param storageKey The key under which the state will be stored in the browser's storage.
 * @param typeGuard A type guard function to ensure the value retrieved from storage is of the expected type.
 * @param storageDebounceTime The debounce time in milliseconds for storage updates. Defaults to 0 (no debounce).
 * @returns A tuple containing the current state and a function to update it.
 */
export default function useStorageSyncedState<T>(
    initialValue: T,
    storageKey: string,
    typeGuard: (value: unknown) => value is T,
    storageDebounceTime: number = 0
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const activeTab = useActiveTab(['url'])
    const activeTabUrl = React.useMemo<URL | null>(() => {
        if (activeTab?.url) {
            try {
                // Create a URL object from the active tab's URL
                return new URL(activeTab.url)
            } catch (_) {}
        }
        return null
    }, [activeTab?.url])

    const [value, setValue] = React.useState<T>(initialValue)
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false)

    // Create a page-specific storage key based on the active tab's origin and the provided storage key
    const pageSpecificStorageKey = React.useMemo<StorageItemKey | null>(() => {
        if (!activeTabUrl || !activeTabUrl.origin) {
            return null
        }
        return `local:page:${activeTabUrl.origin}/${storageKey}`
    }, [activeTabUrl?.origin, storageKey])

    /**
     * Effect to load the initial value from storage.
     *
     * The effect is rerun when the page-specific storage key changes.
     */
    React.useEffect(() => {
        setIsLoaded(false)
        if (pageSpecificStorageKey) {
            const initialValue = value
            storage.getItem(pageSpecificStorageKey).then((storedValue) => {
                if (typeGuard(storedValue)) {
                    // If the stored value is of the expected type, set it as the current value and mark as loaded
                    setValue((prevValue) => (prevValue === initialValue ? storedValue : prevValue))
                    setIsLoaded(true)
                }
            })
        }
    }, [pageSpecificStorageKey])

    /**
     * Effect to update the storage when the value changes.
     *
     * The effect is rerun when the loading state, the value or the page-specific storage key changes.
     * It starts a timeout, which is used to debounce the storage updates.
     * The cleanup function clears the timeout.
     */
    React.useEffect(() => {
        let debounceTimeout: NodeJS.Timeout | null = null
        if (isLoaded && pageSpecificStorageKey) {
            // Set a timeout during which the value must be stable before updating storage
            debounceTimeout = setTimeout(() => {
                storage.setItem(pageSpecificStorageKey, value)
                debounceTimeout = null
            }, storageDebounceTime)
        }

        return () => {
            if (!debounceTimeout) return
            // Cleanup: clear the timeout if the value or any other dependency changes before the timeout completes
            clearTimeout(debounceTimeout)
        }
    }, [isLoaded, pageSpecificStorageKey, value])

    return [value, setValue]
}
