# Web Player Remote Control

**Web Player Remote Control (WPRC)** is a browser extension that allows you to remote control supported web players via a WebSocket connection.
In order to receive commands, the extension connects to a WebSocket server, e.g. the [Web Player Remote Control Server](https://github.com/shft5410/web_player_remote_control_server), which is specifically designed for this purpose.

The WPRC Browser Extension and Server are designed to let you control media playback &ndash; such as music, audiobooks, or podcasts &ndash; without interrupting your current activity.
For example, you could register a global keyboard shortcut that maps to the play/pause command of your web player, allowing you to control playback without switching to the browser tab where the player is running.

However, as there are many different ways in which users might want to trigger playback commands, this project does not provide a built-in way to register global keyboard shortcuts or other input methods.
Instead, it focuses on providing a simple to use interface that can be adapted to your needs.
If you are using the WPRC Server, this inferface is the server's HTTP endpoint, which you can send commands to via HTTP requests.
For even more flexibility, you can also implement your own WebSocket server and make the browser extension connect to it.
Please refer to the [Use a Custom Server](#use-a-custom-server) section for more information on how to do this.

## Installation & Setup

### Server

1. **Download** the [Web Player Remote Control Server](https://github.com/shft5410/web_player_remote_control_server) and follow the instructions in its README to set it up.

2. **Start** the server.
   By default, it listens on port 9772, but you can specify a different port using the `--port` command line argument.
   Please refer to the server's README for more details on configuration options.

    > For testing purposes, it might be helpful to start the server with the command line argument `--log debug`.
    > This will enable debug logging, which outputs both incoming WebSocket connections and forwarded commands to the console.

3. **Ensure** the server started without errors and is running properly. You can check the server logs for any issues.

### Browser Extension

1. **Install** the extension in your browser.
   You'll find installation instructions for all supported browsers in the [Browser Support](#browser-support) section.

2. **Navigate** to a web player that is supported by the extension.
   You can find a list of supported players in the [Web Player Support](#web-player-support) section.

3. **Open** the extension popup.

4. If you are not using WPRC server or specified a port other than the default, you may need to change the WebSocket-Server URL in the input field accordingly.
   The default URL is `ws://localhost:9772`.

5. Click the **Connect** button to establish a connection to the WebSocket server.

6. **Verify** that the connection was established successfully.
   You can do that by checking the connection status indicator next to the connect button.

## Settings

The browser extension popup provides a simple interface with only a few settings.
The settings are player specific, meaning they are only applied to the currently open web player.
Under the hood, however, the extension stores settings based on the page origin.
This means that if you open the same player page in multiple tabs, those tabs will share the same settings.

| Setting             | Description                                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Connect/Disconnect  | Enable/disable the WebSocket connection to the server. This allows you to control whether open web players can be controlled remotely.                                                                                                                                               |
| Remember Connection | If enabled, the extension will automatically reestablish the WebSocket connection when the player page is reopened after being closed while connected. If this setting is disabled, or if the page was closed while disconnected, the connection is not reestablished automatically. |
| WebSocket-Server    | The URL of the WebSocket server to connect to. This is only relevant if you are not using the default WPRC Server or if you specified a different port than the default.                                                                                                             |

The [Web Player Remote Control Server](https://github.com/shft5410/web_player_remote_control_server) also provides a few configuration options that can be set via command line arguments when starting the server.
Refer to the server's README for more details on the available options.

## Player Commands

Currently, the following commands are supported.
However, not every command will work with every web player.
Refer to the [Web Player Support](#web-player-support) section to check which commands are supported by which player.

| Command        | Description                                                                                       | JSON Format                                        |
| -------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Play/Pause     | Toggles the playback state of the player.                                                         | `{ "type": "toggle-play-pause" }`                  |
| Next Track     | Skips to the next track in the player's queue.                                                    | `{ "type": "next-track" }`                         |
| Previous Track | Skips to the previous track in the player's queue.                                                | `{ "type": "previous-track" }`                     |
| Set Volume     | Sets the volume of the player. The payload must be a number in the range from 0 to 1.             | `{ "type": "set-volume", "payload": <volume> }`    |
| Fast Forward   | Fast forwards the player by a specified number of seconds. The payload must be a positive number. | `{ "type": "fast-forward", "payload": <seconds> }` |
| Fast Rewind    | Fast rewinds the player by a specified number of seconds. The payload must be a positive number.  | `{ "type": "fast-rewind", "payload": <seconds> }`  |

## Web Player Support

The extension currently supports the following web players:

| Web Player    | Supported Commands                                                          | Comments                                                              |
| ------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| YouTube Music | `Play/Pause`, `Next Track`, `Previous Track`, `Set Volume`                  | &ndash;                                                               |
| Audible       | `Play/Pause`, `Next Track`, `Previous Track`, `Fast Forward`, `Fast Rewind` | Fast forward and fast rewind only work with a duration of 30 seconds. |

## Browser Support

The extension is currently available for the following browsers:

| Browser | Installation instructions                                                                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firefox | Download the `.xpi` file from the [latest GitHub release](https://github.com/shft5410/web_player_remote_control/releases/latest) and install it via the "Install Add-on From File" option in the Firefox Add-ons Manager. |

## Use a Custom Server

While the WPRC Server is the recommended WebSocket server for this extension, it is not strictly required to use it.
WPRC Server simply relays everything it receives via its HTTP endpoint to all connected WebSocket clients.
Therefore, it can be replaced with any other WebSocket server that is capable of broadcasting commands in the required format to its clients.

The browser extension uses the standard [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) API provided by modern browsers.
Because the underlying WebSocket implementation is compliant with the [RFC 6455 WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455) &ndash; the official standard for WebSocket communication &ndash; you can use a wide range of WebSocket server libraries and frameworks to implement a custom server in your language of choice.

The browser extension expects the WebSocket server to broadcast commands in the form of JSON strings.
Please refer to the [Player Commands](#player-commands) section for a list of supported commands and their corresponding JSON format.

## Acknowledgements

This extension is built on top of the [WXT Framework](https://github.com/wxt-dev/wxt), which greatly simplifies the development of browser extensions.
