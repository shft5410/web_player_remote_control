import React from 'react'

import '@/popup/components/ToggleSwitch.scss'

type Props = {
    isChecked?: boolean
    onChange?: (checked: boolean) => void
}

export default function ToggleSwitch(props: Props) {
    const id = React.useId()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked
        props.onChange?.(isChecked)
    }

    return (
        <div className="toggle-switch">
            <input
                type="checkbox"
                id={'toggle-switch-' + id}
                className="toggle-switch__checkbox"
                checked={props.isChecked}
                onChange={handleChange}
            />
            <label className="toggle-switch__label" htmlFor={'toggle-switch-' + id} />
        </div>
    )
}
