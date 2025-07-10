import BaseSetting from '@/popup/components/BaseSetting'
import ToggleSwitch from '@/popup/components/ToggleSwitch'
import useStorageSyncedState from '@/popup/hooks/useStorageSyncedState'

type Props = {
    settingKey: string
    label: string
}

/**
 * Component for a toggle switch setting that syncs with storage.
 *
 * @param props - Component props.
 * @param props.settingKey - The key for the setting in storage.
 * @param props.label - The label for the setting.
 */
export default function ToggleSetting(props: Props) {
    const [isChecked, setIsChecked] = useStorageSyncedState<boolean>(
        false,
        props.settingKey,
        (value): value is boolean => typeof value === 'boolean'
    )

    return (
        <BaseSetting label={props.label}>
            <ToggleSwitch isChecked={isChecked} onChange={setIsChecked} />
        </BaseSetting>
    )
}
