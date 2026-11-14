#!/usr/bin/env bash
set -euo pipefail

# Install Grafana k6 on Ubuntu using the official Grafana APT repository.
if ! command -v apt-get >/dev/null 2>&1; then
  echo "Error: this script requires an Ubuntu/Debian-based system with apt-get."
  exit 1
fi

sudo apt-get update
sudo apt-get install -y ca-certificates gnupg curl

sudo install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://dl.k6.io/key.gpg \
  | sudo gpg --dearmor --yes -o /etc/apt/keyrings/k6-archive-keyring.gpg
sudo chmod 0644 /etc/apt/keyrings/k6-archive-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list >/dev/null

sudo apt-get update
sudo apt-get install -y k6

echo "k6 installation completed."