#!/bin/bash
echo "=== Build Script Starting ==="
echo "Current directory: $(pwd)"
echo "NODE_ENV: $NODE_ENV"

# Install dependencies
echo "=== Installing root dependencies ==="
npm install

# Build client
echo "=== Building client ==="
cd client
npm install
npx vite build --outDir ../dist/client
cd ..

# Check if build succeeded
echo "=== Checking build output ==="
if [ -d "dist/client" ]; then
    echo "dist/client directory exists"
    ls -la dist/client/
else
    echo "ERROR: dist/client directory does not exist!"
fi

echo "=== Build Script Complete ===" 