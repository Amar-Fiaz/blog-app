# DevOps CI/CD Pipeline Setup

Complete CI/CD pipeline for the Blog Application using Terraform, Docker, Kubernetes, Jenkins, Prometheus, and Grafana.

## Architecture Overview

```
GitHub → Jenkins → Docker Build → Docker Hub → Kubernetes → Prometheus/Grafana
```

## Infrastructure Components

### 1. Terraform (Infrastructure as Code)
- **Location**: `/terraform`
- **Purpose**: Provision AWS EC2 infrastructure
- **Components**:
  - VPC with public subnet
  - EC2 instance (t3.xlarge)
  - Security groups for all services
  - Elastic IP

### 2. Docker (Containerization)
- **Dockerfile**: Multi-stage build for Next.js
- **Registry**: Docker Hub (amarfiaz/blog-app)
- **Features**:
  - Production-optimized build
  - Standalone Next.js output
  - Non-root user
  - Health checks

### 3. Kubernetes (Orchestration)
- **Platform**: KIND (Kubernetes in Docker)
- **Namespace**: blog-app
- **Components**:
  - Deployment with 2 replicas
  - NodePort Service (port 30080)
  - ConfigMaps for configuration
  - Secrets for sensitive data
  - PostgreSQL database with persistent storage

### 4. Jenkins (CI/CD)
- **URL**: http://EC2-IP:8080
- **Pipeline**: Jenkinsfile
- **Stages**:
  1. Checkout code from GitHub
  2. Build Docker image
  3. Push to Docker Hub
  4. Update Kubernetes manifests
  5. Deploy to Kubernetes
  6. Verify deployment

### 5. Prometheus (Monitoring)
- **URL**: http://EC2-IP:9090
- **Metrics**:
  - Kubernetes cluster metrics
  - Application metrics
  - Pod and container metrics
  - Jenkins metrics

### 6. Grafana (Visualization)
- **URL**: http://EC2-IP:3000
- **Default Credentials**: admin/admin
- **Dashboards**: Blog App DevOps Monitoring

## Setup Instructions

### Prerequisites
- AWS Account with access keys
- Docker Hub account
- GitHub account
- SSH key pair for EC2

### 1. Deploy Infrastructure with Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply the configuration
terraform apply -auto-approve

# Note the outputs (EC2 IP, URLs, etc.)
terraform output
```

### 2. Configure Jenkins

#### Access Jenkins
```bash
# Get initial admin password
ssh -i ec2-access-key.pem ec2-user@<EC2-IP>
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### Setup Jenkins Pipeline
1. Open Jenkins at http://EC2-IP:8080
2. Install suggested plugins
3. Create admin user
4. Install additional plugins:
   - Docker Pipeline
   - Kubernetes
   - Git
5. Add credentials:
   - Docker Hub credentials (ID: `dockerhub-credentials`)
   - GitHub credentials (if private repo)

#### Create Pipeline Job
1. New Item → Pipeline
2. Name: `blog-app-pipeline`
3. Pipeline Definition: Pipeline script from SCM
4. SCM: Git
5. Repository URL: https://github.com/Amar-Fiaz/blog-app.git
6. Branch: main
7. Script Path: Jenkinsfile

### 3. Setup Kubernetes Cluster

```bash
# SSH into EC2
ssh -i ec2-access-key.pem ec2-user@<EC2-IP>

# Verify KIND cluster
docker ps | grep kind
kubectl cluster-info

# Configure kubectl for Jenkins
sudo mkdir -p /var/lib/jenkins/.kube
sudo kind get kubeconfig --name devops-cluster > /tmp/config
sudo mv /tmp/config /var/lib/jenkins/.kube/config
sudo chown jenkins:jenkins /var/lib/jenkins/.kube/config
```

### 4. Update Prometheus Configuration

```bash
# SSH into EC2
ssh -i ec2-access-key.pem ec2-user@<EC2-IP>

# Update Prometheus config
sudo cp monitoring/prometheus-config.yaml /etc/prometheus/prometheus.yml
sudo systemctl restart prometheus
```

### 5. Configure Grafana

1. Open Grafana at http://EC2-IP:3000
2. Login with admin/admin
3. Add Prometheus data source:
   - URL: http://localhost:9090
   - Access: Server
4. Import dashboard from `monitoring/grafana-dashboard.json`

### 6. Deploy Application

#### Option A: Using Jenkins Pipeline
1. Go to Jenkins
2. Click on `blog-app-pipeline`
3. Click "Build Now"
4. Monitor the pipeline execution

#### Option B: Manual Deployment
```bash
# SSH into EC2
ssh -i ec2-access-key.pem ec2-user@<EC2-IP>

# Clone repository
git clone https://github.com/Amar-Fiaz/blog-app.git
cd blog-app

# Run deployment script
./deploy.sh
```

## Access URLs

After successful deployment:

- **Blog Application**: http://EC2-IP:30080
- **Jenkins**: http://EC2-IP:8080
- **Grafana**: http://EC2-IP:3000
- **Prometheus**: http://EC2-IP:9090

## Kubernetes Commands

```bash
# View all resources
kubectl get all -n blog-app

# View pods
kubectl get pods -n blog-app

# View logs
kubectl logs -f deployment/blog-app -n blog-app

# View services
kubectl get svc -n blog-app

# Describe deployment
kubectl describe deployment blog-app -n blog-app

# Scale deployment
kubectl scale deployment blog-app --replicas=3 -n blog-app

# Delete deployment
kubectl delete namespace blog-app
```

## Monitoring

### Prometheus Queries

```promql
# CPU usage
rate(container_cpu_usage_seconds_total{namespace="blog-app"}[5m])

# Memory usage
container_memory_usage_bytes{namespace="blog-app"}

# Pod count
count(kube_pod_info{namespace="blog-app"})

# HTTP requests
rate(http_requests_total{namespace="blog-app"}[5m])
```

### Grafana Metrics
- Application pod status
- CPU and memory usage
- HTTP request rates
- Database connections
- Pod restart counts

## Troubleshooting

### Jenkins Issues
```bash
# Check Jenkins status
sudo systemctl status jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f

# Restart Jenkins
sudo systemctl restart jenkins
```

### Kubernetes Issues
```bash
# Check pod status
kubectl get pods -n blog-app

# View pod logs
kubectl logs <pod-name> -n blog-app

# Describe pod for events
kubectl describe pod <pod-name> -n blog-app

# Check events
kubectl get events -n blog-app --sort-by='.lastTimestamp'
```

### Docker Issues
```bash
# Check Docker status
sudo systemctl status docker

# View Docker logs
docker logs <container-id>

# Remove unused images
docker image prune -f
```

## Pipeline Workflow

1. **Code Push**: Developer pushes code to GitHub
2. **Jenkins Trigger**: Webhook triggers Jenkins pipeline
3. **Build**: Jenkins builds Docker image
4. **Test**: Run tests (if configured)
5. **Push**: Push image to Docker Hub
6. **Deploy**: Update Kubernetes deployment
7. **Verify**: Health checks and verification
8. **Monitor**: Prometheus scrapes metrics
9. **Visualize**: Grafana displays dashboards

## Security Considerations

- Update secrets in `k8s/secret.yaml`
- Use environment-specific configurations
- Enable RBAC in Kubernetes
- Use private Docker registry for production
- Configure SSL/TLS certificates
- Enable authentication on all services
- Regular security updates

## Cleanup

```bash
# Delete Kubernetes resources
kubectl delete namespace blog-app

# Destroy Terraform infrastructure
cd terraform
terraform destroy -auto-approve
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test locally
5. Submit pull request

## Support

For issues and questions:
- GitHub Issues: https://github.com/Amar-Fiaz/blog-app/issues
- Documentation: README.md

## License

MIT License
