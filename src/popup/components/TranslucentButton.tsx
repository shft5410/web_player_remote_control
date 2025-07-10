import React from 'react'

import '@/popup/components/TranslucentButton.scss'

type Props = {
    onClick?: () => void
}

/**
 * Component for a button with a translucent background.
 *
 * @param props - Component props.
 * @param props.onClick Optional click handler for the button.
 * @param props.children Content to be displayed inside the button.
 */
export default function TranslucentButton(props: React.PropsWithChildren<Props>) {
    return (
        <button className="translucent-button" onClick={props.onClick}>
            {props.children}
        </button>
    )
}
