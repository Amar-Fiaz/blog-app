pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = 'amarfiaz/blog-app'
        DOCKER_CREDENTIALS = credentials('dockerhub-credentials')
        KUBECONFIG = '/home/ec2-user/.kube/config'
        GIT_REPO = 'https://github.com/Amar-Fiaz/blog-app.git'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Build Info') {
            steps {
                script {
                    echo "Building commit: ${env.GIT_COMMIT}"
                    echo "Branch: ${env.GIT_BRANCH}"
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7)}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} .
                        docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                script {
                    sh """
                        echo \$DOCKER_CREDENTIALS_PSW | docker login -u \$DOCKER_CREDENTIALS_USR --password-stdin
                        docker push ${DOCKER_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                        docker logout
                    """
                }
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                echo 'Updating Kubernetes deployment with new image...'
                script {
                    sh """
                        sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${IMAGE_TAG}|g' k8s/deployment.yaml
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes cluster...'
                script {
                    sh """
                        # Set up kubectl to work with KIND cluster
                        export KUBECONFIG=/home/ec2-user/.kube/config

                        # Apply namespace first
                        kubectl apply -f k8s/namespace.yaml

                        # Apply PostgreSQL deployment
                        kubectl apply -f k8s/postgres-deployment.yaml

                        # Wait for PostgreSQL to be ready
                        kubectl wait --for=condition=ready pod -l app=postgres -n blog-app --timeout=300s || true

                        # Apply application configurations
                        kubectl apply -f k8s/configmap.yaml
                        kubectl apply -f k8s/secret.yaml

                        # Apply application deployment and service
                        kubectl apply -f k8s/deployment.yaml
                        kubectl apply -f k8s/service.yaml

                        # Wait for deployment to be ready
                        kubectl rollout status deployment/blog-app -n blog-app --timeout=300s

                        # Show deployment status
                        kubectl get pods -n blog-app
                        kubectl get svc -n blog-app
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment...'
                script {
                    sh """
                        export KUBECONFIG=/home/ec2-user/.kube/config
                        kubectl get deployment blog-app -n blog-app
                        kubectl get pods -n blog-app -l app=blog-app
                        kubectl get svc blog-app-service -n blog-app
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            echo "Application deployed with image: ${DOCKER_IMAGE}:${IMAGE_TAG}"
            echo "Access the application at: http://<EC2-PUBLIC-IP>:30080"
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
        }
        always {
            echo 'Cleaning up Docker images...'
            sh """
                docker image prune -f
            """
        }
    }
}
