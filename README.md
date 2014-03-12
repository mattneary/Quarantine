# Quarantine

Quarantine limits internet usage temporarily, by the command of an
administrator.

## Installation

Quarantine is a proxy server that needs to be run on a dedicated server and then setup on each client machine. Setup varies from platform to platform.

### Unix

```sh
$ ./Google\ Chrome --proxy-server=domain:port --ignore-certificate-errors
```

### Windows

```sh
Target: "C:\...\chrome.exe" "--proxy-server" "--ignore-certificate-errors"
```

### iOS

```sh
HTTP PROXY: Manual
Server: domain
Port: port
```

## Usage

The administrator needs to login from the distinguished URL and can then
enforce the quarantine. Once enforcing, each user to login afterward will be
logged and listed for the administrator. Once all are logged, any tests or
activities may be conducted, and the quarantine can be disabled when finished.

