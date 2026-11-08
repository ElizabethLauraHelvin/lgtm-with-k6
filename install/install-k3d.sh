
#!/bin/bash
set -euo pipefail

echo "======================================"
echo "   INSTALLATION K3D KUBERNETES"
echo "======================================"

# 1. Update system
echo "[1/6] Updating system..."
sudo apt-get update -y
sudo apt-get install -y curl wget ca-certificates gnupg

# 2. Install Docker if unavailable
echo "[2/6] Checking Docker..."

if ! command -v docker >/dev/null 2>&1; then
    echo "Installing Docker..."

    curl -fsSL https://get.docker.com | sudo sh

    sudo systemctl enable --now docker
else
    echo "Docker already installed."
fi

sudo systemctl enable --now docker

# Allow current user to access Docker
sudo usermod -aG docker "$USER"

# 3. Install kubectl
echo "[3/6] Installing kubectl..."

if ! command -v kubectl >/dev/null 2>&1; then
    KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt)

    curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"

    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

    rm -f kubectl
fi

# 4. Install k3d
echo "[4/6] Installing k3d..."

if ! command -v k3d >/dev/null 2>&1; then
    curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
fi

# 5. Verify installation
echo "[5/6] Checking versions..."

docker --version
kubectl version --client
k3d version

# 6. Create cluster
echo "[6/6] Creating k3d cluster..."

if ! k3d cluster list | grep -q '^dev-cluster'; then
    k3d cluster create dev-cluster \
        --servers 1 \
        --agents 2 \
        --port "8080:80@loadbalancer" \
        --port "8443:443@loadbalancer" \
        --wait
else
    echo "Cluster dev-cluster already exists."
fi

echo "======================================"
echo "   K3D INSTALLATION COMPLETED"
echo "======================================"

kubectl get nodes
kubectl get pods -A
