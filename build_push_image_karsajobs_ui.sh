#!/bin/bash

# 1. Build Docker image frontend dari Dockerfile di direktori ini, dengan format nama GitHub Packages
docker build -t ghcr.io/rizqiwidianto14/karsajobs-ui:latest .

# 2. Login ke GitHub Packages; token diambil dari environment variable agar tidak tertulis di file
echo $PASSWORD_GITHUB_PACKAGES | docker login ghcr.io -u rizqiwidianto14 --password-stdin

# 3. Push image frontend ke GitHub Packages
docker push ghcr.io/rizqiwidianto14/karsajobs-ui:latest
