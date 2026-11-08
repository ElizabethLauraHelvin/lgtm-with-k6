#!/bin/bash

set -e

echo "===================================="
echo "       INSTALLING HELM 3"
echo "===================================="

# Update package index
echo "[1/4] Updating package index..."
sudo apt-get update

# Install dependencies
echo "[2/4] Installing dependencies..."
sudo apt-get install -y curl gpg apt-transport-https

# Add Helm GPG key
echo "[3/4] Adding Helm repository..."

sudo mkdir -p /usr/share/keyrings

curl -fsSL https://packages.buildkite.com/helm-linux/helm-debian/gpgkey \
  | gpg --dearmor \
  | sudo tee /usr/share/keyrings/helm.gpg > /dev/null

# Add Helm repository
echo "deb [signed-by=/usr/share/keyrings/helm.gpg] https://packages.buildkite.com/helm-linux/helm-debian/ any main" \
  | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list

# Install Helm
echo "[4/4] Installing Helm..."
sudo apt-get update
sudo apt-get install -y helm

# Verify installation
echo ""
echo "===================================="
echo "       HELM INSTALLATION"
echo "===================================="

helm version

echo ""
echo "Helm installation completed successfully!"