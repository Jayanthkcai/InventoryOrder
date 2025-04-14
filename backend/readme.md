# Node.js Microservices with CQRS

## Features
- CQRS pattern for clear separation of concerns.
- Distributed logging to MongoDB, visualized in Grafana.
- Circuit breaker to enhance database resilience.
- Asynchronous messaging using RabbitMQ and Kafka.

## Setup
1. Clone the repository.
2. Configure `.env` with the following:
   - DB_USER, DB_PASS, DB_HOST, DB_NAME
   - RABBITMQ_URL
   - KAFKA_BROKER
3. Install dependencies: `npm install`.
4. Start services: `npm start`.

## Endpoints
- **Order Service**
  - POST `/orders`
  - GET `/orders/:id`
- **Inventory Service**
  - POST `/inventory`
  - GET `/inventory/:id`


docker network connect pubsub_default <container-name>
docker run --network pubsub_default -p 3000:3000 --name my-node-app my-node-app

docker network connect pubsub_default mongodb

docker network connect pubsub_default pgdbcontainer

docker run --network pubsub_default -p 3000:3000 --name backend backend