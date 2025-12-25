output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.blog_server.id
}

output "instance_public_ip" {
  description = "Public IP address of EC2 instance"
  value       = aws_eip.blog_eip.public_ip
}

output "instance_private_ip" {
  description = "Private IP address of EC2 instance"
  value       = aws_instance.blog_server.private_ip
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.blog_vpc.id
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.blog_sg.id
}

output "jenkins_url" {
  description = "Jenkins access URL"
  value       = "http://${aws_eip.blog_eip.public_ip}:8080"
}

output "grafana_url" {
  description = "Grafana access URL"
  value       = "http://${aws_eip.blog_eip.public_ip}:3000"
}

output "prometheus_url" {
  description = "Prometheus access URL"
  value       = "http://${aws_eip.blog_eip.public_ip}:9090"
}

output "blog_app_url" {
  description = "Blog application URL (NodePort)"
  value       = "http://${aws_eip.blog_eip.public_ip}:30080"
}
