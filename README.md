# node-akeneo
A NodeJS framework to export and import data into/from Akeneo PIM, and integerate with it, using its Web API.

## How to clone, install modules, and compile

```
git clone git@github.com:donaldbales/node-akeneo.git
cd node-akeneo
npm install
./node_modules/.bin/tsc
```

## Environment Variables

You need to set these environment variables:

```
AKENEO_BASE_URL default 'http://akeneo-pimee.local:8080'
AKENEO_CLIENT_ID
AKENEO_EXPORT_PATH default '.'
AKENEO_PASSWORD
AKENEO_PATCH_LIMIT default '100'
AKENEO_SECRET
AKENEO_TOKEN_URL default '/api/oauth/v1/token'
AKENEO_USERNAME
EMAIL_FROM
EMAIL_HOST
EMAIL_PASSWORD
EMAIL_PORT
EMAIL_TO
EMAIL_USERNAME
```
