import '@/popup/App.scss'
import RippleBackground from '@/popup/components/RippleBackground'
import TranslucentButton from '@/popup/components/TranslucentButton'
import ToggleSetting from '@/popup/components/ToggleSetting'
import TextSetting from '@/popup/components/TextSetting'

function App() {
    return (
        <div className="app">
            <RippleBackground />
            <TranslucentButton>Connect</TranslucentButton>
            <ToggleSetting settingKey="remember-connection" label="Remember Connection" />
            <TextSetting settingKey="ws-server" label="WebSocket-Server" placeholder="URL" />
        </div>
    )
}

export default App
