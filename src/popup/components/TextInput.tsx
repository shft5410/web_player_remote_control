import '@/popup/components/TextInput.scss'

type Props = {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
}

export default function TextInput(props: Props) {
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
