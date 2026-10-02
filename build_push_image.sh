#!/bin/bash

# 1. Build Docker image dari Dockerfile di direktori ini dengan nama item-app dan tag v1
docker build -t item-app:v1 .

# 2. Tampilkan daftar Docker image yang ada di lokal
docker images

# 3. Ubah nama image agar sesuai format GitHub Packages (ghcr.io/<username>/<image>:<tag>)
docker tag item-app:v1 ghcr.io/rizqiwidianto14/item-app:v1

# 4. Login ke GitHub Packages; token diambil dari environment variable agar tidak tertulis di file
echo $PASSWORD_GITHUB_PACKAGES | docker login ghcr.io -u rizqiwidianto14 --password-stdin

# 5. Unggah image ke GitHub Packages
docker push ghcr.io/rizqiwidianto14/item-app:v1
