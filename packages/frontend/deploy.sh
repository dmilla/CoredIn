#!/bin/zsh -e
yarn build

OUT_DIR=dist

aws s3 sync $OUT_DIR s3://$COREDIN_FRONTEND_BUCKET/ \
  --delete \
  --metadata-directive REPLACE \
  --cache-control max-age=31536000,public

aws configure set preview.cloudfront true
aws cloudfront create-invalidation --distribution-id $COREDIN_DISTRIBUTION_ID --paths "/*"
