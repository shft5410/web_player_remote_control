import React from 'react'
import { storage, type StorageItemKey } from '#imports'

import useActiveTabUrl from '@/popup/hooks/useActiveTabUrl'

export default function useStorageSyncedState<T>(
    initialValue: T,
    storageKey: string,
    typeGuard: (value: unknown) => value is T,
    storageDebounceTime: number = 0
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const activeTabUrl = useActiveTabUrl()

    const [value, setValue] = React.useState<T>(initialValue)
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false)

    const pageSpecificStorageKey = React.useMemo<StorageItemKey | null>(() => {
        if (!activeTabUrl || !activeTabUrl.origin) {
            return null
        }
        return `local:page:${activeTabUrl.origin}/${storageKey}`
    }, [activeTabUrl?.origin, storageKey])

    React.useEffect(() => {
        setIsLoaded(false)
        if (pageSpecificStorageKey) {
            const initialValue = value
            storage.getItem(pageSpecificStorageKey).then((storedValue) => {
                if (typeGuard(storedValue)) {
                    setValue((prevValue) => (prevValue === initialValue ? storedValue : prevValue))
                    setIsLoaded(true)
                }
            })
        }
    }, [pageSpecificStorageKey])

    React.useEffect(() => {
        let debounceTimeout: NodeJS.Timeout | null = null
        if (isLoaded && pageSpecificStorageKey) {
            debounceTimeout = setTimeout(() => {
                storage.setItem(pageSpecificStorageKey, value)
                debounceTimeout = null
            }, storageDebounceTime)
        }
        return () => {
            if (!debounceTimeout) return
            clearTimeout(debounceTimeout)
        }
    }, [isLoaded, pageSpecificStorageKey, value])

    return [value, setValue]
}
