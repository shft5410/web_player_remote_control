import '@/popup/components/TextInput.scss'

type Props = {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
}

/**
 * Component for a text input field.
 *
 * @param props - Component props.
 * @param props.value The current value of the text input.
 * @param props.onChange Callback function that is called when the input value changes.
 * @param props.placeholder Placeholder text for the input.
 */
export default function TextInput(props: Props) {
    /**
     * Execute the `onChange` callback passed as a prop when the input value changes.
     *
     * @param event Change event from the text input.
     */
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        props.onChange?.(event.target.value)
    }

    return (
        <input
            className="text-input"
            type="text"
            placeholder={props.placeholder}
            value={props.value}
            onChange={handleChange}
        />
    )
}
