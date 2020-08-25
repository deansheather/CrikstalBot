#!/bin/bash

set -euxo pipefail

docker-compose build --build-arg "PROJECT_VERSION=vCrikstal" --build-arg "TARGETPLATFORM=linux/amd64"
