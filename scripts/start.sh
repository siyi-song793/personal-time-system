#!/bin/bash
set -e

# Start static file server for the 'out' directory
node dist/static-server.js
