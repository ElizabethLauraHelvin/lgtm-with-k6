
#!/bin/bash
set -euo pipefail

CLUSTER_NAME="dev-cluster"

echo "===== K3D INSTALLATION ====="

# 1. Update packages
echo "[1/6] Updating packages..."
sudo apt-get update -y
sudo apt-get install -y curl wget ca-certificates

# 2. Install Docker
echo "[2/6] Checking Docker..."

if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com | sudo sh
fi

sudo systemctl enable --now docker

# Add current user to Docker group
sudo groupadd -f docker
sudo usermod -aG docker "$USER"

# 3. Install kubectl
echo "[3/6] Installing kubectl..."

if ! command -v kubectl >/dev/null 2>&1; then
    ARCH=$(dpkg --print-architecture)
    VERSION=$(curl -Ls https://dl.k8s.io/release/stable.txt)

    curl -LO "https://dl.k8s.io/release/${VERSION}/bin/linux/${ARCH}/kubectl"

    sudo install -m 0755 kubectl /usr/local/bin/kubectl
    rm -f kubectl
fi

# 4. Install k3d
echo "[4/6] Installing k3d..."

if ! command -v k3d >/dev/null 2>&1; then
    curl -fsSL https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
fi

# 5. Verify tools
echo "[5/6] Checking installation..."

docker --version
kubectl version --client
k3d version

# 6. Create cluster
echo "[6/6] Creating Kubernetes cluster..."

if ! sg docker -c "k3d cluster list" | grep -q "^${CLUSTER_NAME}"; then

    sg docker -c "k3d cluster create ${CLUSTER_NAME} \
        --servers 1 \
        --agents 1 \
        --port '127.0.0.1:8080:80@loadbalancer' \
        --port '127.0.0.1:8443:443@loadbalancer' \
        --wait"

else
    echo "Cluster already exists."
fi

echo ""
echo "===== INSTALLATION COMPLETED ====="

kubectl get nodes
kubectl get pods -A
