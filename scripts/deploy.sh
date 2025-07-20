#!/bin/bash

echo "Deploying HashGait Application..."

cd icp_backend
dfx start --clean --background

echo "Deploying canister..."
dfx deploy

CANISTER_ID=$(dfx canister id behavioral_auth_canister)
echo "Canister deployed with ID: $CANISTER_ID"

cd ../HashGaitApp
npx react-native start &

echo "Deployment complete."
echo "Run: npx react-native run-ios or npx react-native run-android"
