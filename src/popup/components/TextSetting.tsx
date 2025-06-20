import BaseSetting from '@/popup/components/BaseSetting'
import TextInput from '@/popup/components/TextInput'
import useStorageSyncedState from '@/popup/hooks/useStorageSyncedState'

type Props = {
    settingKey: string
    label: string
    placeholder?: string
}

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
