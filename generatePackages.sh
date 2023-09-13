#/bin/sh

cp README.md ./build/
rm -rf ./build/types/internal
cp package.json ./build/package.json

echo '{ "type": "module" }' >> ./build/esm/package.json
echo '{ "type": "commonjs" }' >> ./build/cjs/package.json

