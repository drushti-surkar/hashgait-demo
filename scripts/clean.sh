#!/bin/bash

echo "Cleaning project..."

dfx stop

cd icp_backend
dfx start --clean --background
dfx stop

cd ../HashGaitApp
npx react-native clean
rm -rf node_modules
npm install

if [[ "$OSTYPE" == "darwin"* ]]; then
    cd ios
    rm -rf build
    pod install
    cd ..
fi

echo "Cleanup complete."
