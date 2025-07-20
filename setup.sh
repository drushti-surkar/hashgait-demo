#!/bin/bash

set -e

echo "Setting up HashGait Behavioral Authentication App..."

if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "This script is for macOS. Please install dependencies manually."
    exit 1
fi

command_exists() { command -v "$1" >/dev/null 2>&1; }

if ! command_exists brew; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

if ! command_exists node; then
    echo "Installing Node.js..."
    brew install node
fi

if ! command_exists watchman; then
    echo "Installing Watchman..."
    brew install watchman
fi

if ! command_exists dfx; then
    echo "Installing DFX..."
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    export PATH="$HOME/bin:$PATH"
fi

if ! command_exists react-native; then
    echo "Installing React Native CLI..."
    npm install -g @react-native-community/cli
fi

if ! command_exists pod; then
    echo "Installing CocoaPods..."
    sudo gem install cocoapods
fi

echo "Prerequisites installed."

echo "Creating React Native app..."
npx react-native init HashGaitApp --template react-native-template-typescript --skip-git-init
cd HashGaitApp

echo "Installing React Native dependencies..."
npm install react-native-sensors @react-native-async-storage/async-storage react-native-sqlite-storage
npm install @dfinity/agent @dfinity/principal @dfinity/identity @dfinity/auth-client
npm install react-native-vector-icons @react-navigation/native @react-navigation/stack

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Setting up iOS dependencies..."
    cd ios && pod install && cd ..
fi

cd ..

echo "Setting up ICP backend..."
mkdir -p icp_backend/src

if ! command_exists azle; then
    echo "Installing Azle..."
    npm install -g azle
fi

echo "Setup complete."
echo "Next steps:"
echo "1. cd icp_backend && dfx start --background && dfx deploy"
echo "2. cd ../HashGaitApp && npx react-native run-ios"
