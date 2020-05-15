# nodeakeneo
Interfaces and modules to access Akeneo v3.x from its web API

## How to clone, install modules, and compile

```
git clone git@github.com:donaldbales/nodeakeneo.git
cd nodeakeneo
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

## How to run inline tests

Comment in/out the apis to exercise in the main() method, then compile and run as follows:

```
tsc && node src/akeneo
```