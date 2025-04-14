#!/bin/bash
# Wait until RabbitMQ is fully started
#sleep 10
#!/bin/bash
set -e

echo "Creating RabbitMQ users and permissions..."

# Create user
rabbitmqctl add_user user3 password

# Set permissions for user
rabbitmqctl set_permissions -p / user3 ".*" ".*" ".*"

# (Optional) Set user tags (like administrator)
rabbitmqctl set_user_tags user3 administrator

echo "RabbitMQ init complete."
