import BaseSetting from '@/popup/components/BaseSetting'
import ToggleSwitch from '@/popup/components/ToggleSwitch'

type Props = {
    settingKey: string
    label: string
}

export default function ToggleSetting(props: Props) {
    return (
        <BaseSetting label={props.label}>
            <ToggleSwitch />
        </BaseSetting>
    )
}
