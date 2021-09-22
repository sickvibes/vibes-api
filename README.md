# vibes-api

Centralized API that caches metadata for VIBES NFTs.

https://sickvibes.xyz

## Development

```
npm i
```

## Deployment

Add an SSM parameter for the Polygon RPC endpoint:

* `/$STAGE/vibes/api/rpc-endpoint`
	* eg, `https://rpc.provider.com/foo`

Add an SSM parameter for the key and secret (comma-separated) for the Pinata API:

* `/$STAGE/vibes/api/pinata-config`
	* eg, `fooasdfkasdf, barjkaekdfkjejfaj`

These are sourced at deployment, not runtime.

Assuming production deployment and local AWS credentials stored as `vibes`:

```
STAGE=prd AWS_PROFILE=vibes npm run deploy
```
