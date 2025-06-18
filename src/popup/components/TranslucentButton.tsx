import React from 'react'

import '@/popup/components/TranslucentButton.scss'

type Props = {
    onClick?: () => void
}

export default function TranslucentButton(props: React.PropsWithChildren<Props>) {
    return (
        <button className="translucent-button" onClick={props.onClick}>
            {props.children}
        </button>
    )
}
