import BaseSetting from '@/popup/components/BaseSetting'
import ToggleSwitch from '@/popup/components/ToggleSwitch'
import useStorageSyncedState from '@/popup/hooks/useStorageSyncedState'

type Props = {
    settingKey: string
    label: string
}

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
