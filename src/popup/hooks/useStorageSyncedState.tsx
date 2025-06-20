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
    const isValueInitialized = React.useRef(false)
    const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
        if (activeTabUrl) {
            const pageSpecificStorageKey: StorageItemKey = `local:page:${activeTabUrl.origin}/${storageKey}`
            if (!isValueInitialized.current) {
                isValueInitialized.current = true
                const initialValue = value
                storage.getItem(pageSpecificStorageKey).then((storedValue) => {
                    if (typeGuard(storedValue)) {
                        setValue((prevValue) => (prevValue === initialValue ? storedValue : prevValue))
                    }
                })
            } else {
                if (debounceTimeout.current) {
                    clearTimeout(debounceTimeout.current)
                }
                debounceTimeout.current = setTimeout(() => {
                    storage.setItem(pageSpecificStorageKey, value)
                    debounceTimeout.current = null
                }, storageDebounceTime)
            }
        }
    }, [activeTabUrl, value, storageKey])

    return [value, setValue]
}
