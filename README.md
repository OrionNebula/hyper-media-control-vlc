# hyper-media-control-vlc

[![License](https://img.shields.io/github/license/OrionNebula/hyper-media-control-vlc.svg)](LICENSE)
[![hyper](https://img.shields.io/badge/Hyper-v2.0.0-brightgreen.svg)](https://github.com/zeit/hyper/releases/tag/2.0.0)
[![GitHub issues](https://img.shields.io/github/issues/OrionNebula/hyper-media-control-vlc.svg)](https://github.com/OrionNebula/hyper-media-control-vlc/issues)

> Extend [`hyper-media-control`](https://github.com/OrionNebula/hyper-media-control) with support for [VLC Media Player](https://www.videolan.org/vlc/index.html).

## Installation

Add `hyper-media-control` and `hyper-media-control-vlc` to your Hyper configuration.

Enable the `http` interface in VLC and set a password in Access Control ([instructions here](https://wiki.videolan.org/Documentation:Modules/http_intf/#How_to_use))

Enter the password you chose into your Hyper configuration.

## Configuration

`hyper-media-control-vlc` defines the following configuration options:

```js
module.exports = {
    config: {
        ...
        hyperMedia: {
            ...
            vlc: {
                port: 8080, // The port used to communicate with VLC.
                username: '', // The username used to authenticate with VLC. For most users, this will be blank.
                password: '' // The password used to authenticate with VLC.
            }
            ...
        }
    }
}
```