import React from 'react'

import BaseSetting from '@/popup/components/BaseSetting'
import TextInput from '@/popup/components/TextInput'

type Props = {
    settingKey: string
    label: string
    placeholder?: string
}

export default function TextSetting(props: Props) {
    const [value, setValue] = React.useState<string>('')

    return (
        <BaseSetting label={props.label} isExpandable={true}>
            <TextInput placeholder={props.placeholder} value={value} onChange={setValue} />
        </BaseSetting>
    )
}
