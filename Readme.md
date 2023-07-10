# Prerequisites

- Install and configure the vonage cloud runtime CLI (neru CLI) from https://vonage-neru.herokuapp.com/neru/guides/cli

# Initial Setup

1. Run `neru app create --name "vcr-simple-queue-demo"` and copy application id (only if you don't have an app yet)
2. Run `cp neru.yml.example neru.yml` and copy application id and any missing env variables into neru.yml
3. Run `neru app configure --app-id [YOUR_APP_ID]` (this is only needed if you want to process inbound requests)


# Debug it

- Run `neru debug`


# Deploy it

- Run `neru deploy`


# Example API requests

## POST /queues/create

Usage: Create a new queue into which you can add items to be processed.

Payload:

```
{
    "name": "testqueue01",
    "maxInflight": 1, 
    "msgPerSecond": 1
}
```

Response:

```
{
    "success": true,
    "queue": "testqueue01"
}
```

## POST /queues/additem/:queue_name

Usage: Add a request to be processed to a queue that you created. This demo usese Messages API requests.

Payload:

```
{
    "from": {
        "number": "Toni",
        "type": "sms"
    },
    "to": {
        "number": "4915112345678",
        "type": "sms"
    },
    "text": "This is a test SMS."
}
```

Response:

```
{
    "success": true
}
```

## DELETE /queues/:queue_name

Usage: delete a queue and all it's contents immediately.

Payload: none

Response:

```
{
    "success": true
}
```