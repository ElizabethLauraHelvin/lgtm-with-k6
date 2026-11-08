#!/bin/bash

set -e

HELM_VERSION="v3.17.3"
ARCH="amd64"
OS="linux"

echo "=================================="
echo "       INSTALL HELM 3"
echo "=================================="

# Download Helm
echo "[1/4] Downloading Helm..."

curl -fsSL \
  "https://get.helm.sh/helm-${HELM_VERSION}-${OS}-${ARCH}.tar.gz" \
  -o /tmp/helm.tar.gz

# Extract archive
echo "[2/4] Extracting Helm..."

tar -xzf /tmp/helm.tar.gz -C /tmp

# Install binary
echo "[3/4] Installing Helm..."

sudo install \
  /tmp/linux-amd64/helm \
  /usr/local/bin/helm

# Cleanup
rm -rf /tmp/helm.tar.gz /tmp/linux-amd64

# Verify
echo "[4/4] Verifying installation..."

helm version

echo ""
echo "Helm installation completed!"