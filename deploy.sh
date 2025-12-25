#!/bin/bash
set -e

echo "========================================="
echo "Blog App Deployment Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl not found. Please install kubectl first.${NC}"
    exit 1
fi

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}docker not found. Please install docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

echo -e "${GREEN}Step 2: Deploying PostgreSQL...${NC}"
kubectl apply -f k8s/postgres-deployment.yaml

echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n blog-app --timeout=300s || true

echo -e "${GREEN}Step 3: Applying ConfigMaps and Secrets...${NC}"
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

echo -e "${GREEN}Step 4: Building Docker image...${NC}"
docker build -t amarfiaz/blog-app:latest .

echo -e "${GREEN}Step 5: Deploying application...${NC}"
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

echo -e "${YELLOW}Waiting for application deployment to be ready...${NC}"
kubectl rollout status deployment/blog-app -n blog-app --timeout=300s

echo -e "${GREEN}Step 6: Deployment Status${NC}"
echo "========================================="
kubectl get all -n blog-app

echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo "========================================="
echo -e "Access your application at: ${YELLOW}http://<NODE-IP>:30080${NC}"
echo ""
echo "Useful commands:"
echo "  - View pods: kubectl get pods -n blog-app"
echo "  - View logs: kubectl logs -f deployment/blog-app -n blog-app"
echo "  - View services: kubectl get svc -n blog-app"
echo "  - Delete deployment: kubectl delete namespace blog-app"
echo "========================================="
