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