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

This is sourced at deployment, not runtime.

Assuming production deployment and local AWS credentials stored as `vibes`:

```
STAGE=prd AWS_PROFILE=vibes npm run deploy
```
