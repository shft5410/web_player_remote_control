import BaseSetting from '@/popup/components/BaseSetting'
import TextInput from '@/popup/components/TextInput'
import useStorageSyncedState from '@/popup/hooks/useStorageSyncedState'

type Props = {
    settingKey: string
    label: string
    placeholder?: string
}

/**
 * Component for a text input setting that syncs with storage.
 *
 * @param props - Component props.
 * @param props.settingKey - The key for the setting in storage.
 * @param props.label - The label for the setting.
 * @param props.placeholder - Optional placeholder text for the input field.
 */
export default function TextSetting(props: Props) {
    const [value, setValue] = useStorageSyncedState<string>(
        '',
        props.settingKey,
        (value): value is string => typeof value === 'string',
        200
    )

    return (
        <BaseSetting label={props.label} isExpandable={true}>
            <TextInput placeholder={props.placeholder} value={value} onChange={setValue} />
        </BaseSetting>
    )
}
