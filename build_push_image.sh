#!/bin/bash

# Nama lengkap image di GitHub Packages (ghcr.io/<username>/<nama-image>:<tag>)
IMAGE=ghcr.io/rizqiwidianto14/shipping-service:latest

# Login ke GitHub Packages; token diambil dari environment variable agar tidak tertulis di file
echo $PASSWORD_GITHUB_PACKAGES | docker login ghcr.io -u rizqiwidianto14 --password-stdin

# Buat builder multi-arsitektur bernama "multiarch" jika belum ada
docker buildx inspect multiarch > /dev/null 2>&1 || docker buildx create --name multiarch --driver docker-container

# Gunakan builder "multiarch" untuk proses build
docker buildx use multiarch

# Build image untuk amd64 dan arm64 sekaligus, tautkan ke repository, lalu langsung push ke GitHub Packages
docker buildx build --platform linux/amd64,linux/arm64 --label org.opencontainers.image.source=https://github.com/rizqiwidianto14/a433-microservices -t $IMAGE --push .
