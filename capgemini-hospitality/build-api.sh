#!/bin/bash
echo "Building Azure Functions..."
cd api
npm install
npm run build
echo "Build completed successfully!"