#!/bin/bash

PERMISSIONS="--allow-all --allow-run --allow-env --unstable"
TARGETS=("x86_64-unknown-linux-gnu" "x86_64-apple-darwin" "aarch64-apple-darwin")

mkdir -p release
pushd release

for TARGET in ${TARGETS[@]}; do
  TAR_NAME="accio-$TARGET.tar.gz"
  echo
  echo "Building for ${TARGET} architecture..."
  deno compile ${PERMISSIONS} --output="accio" --target "${TARGET}" ../accio.ts
  tar -czvf ${TAR_NAME} accio
  rm accio
  echo "Built ${TAR_NAME}"
done

popd
echo
echo "Done!"
