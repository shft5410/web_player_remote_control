import React from 'react'

import '@/popup/components/ToggleSwitch.scss'

type Props = {
    isChecked?: boolean
    onChange?: (checked: boolean) => void
}

/**
 * Component for a toggle switch.
 *
 * @param props - Component props.
 * @param props.isChecked Whether the switch is checked.
 * @param props.onChange Callback function that is called when the switch is toggled.
 */
export default function ToggleSwitch(props: Props) {
    const id = React.useId()

    /**
     * Execute the `onChange` callback passed as a prop when the switch is toggled.
     *
     * @param event Change event from the checkbox input.
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange?.(event.target.checked)
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
