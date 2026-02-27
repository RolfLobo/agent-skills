# C4 Architecture Diagrams — Complete Reference

Load this file when the user requests C4 diagrams or system architecture documentation. The C4 model provides four levels of abstraction.

## C4 Levels — When to Use Each

| Level | Diagram      | Audience       | Purpose                               |
| ----- | ------------ | -------------- | ------------------------------------- |
| 1     | C4Context    | Everyone       | System boundaries and external actors |
| 2     | C4Container  | Technical team | Applications, databases, services     |
| 3     | C4Component  | Developers     | Internal module structure             |
| 4     | C4Deployment | DevOps/SRE     | Infrastructure and deployment nodes   |
| —     | C4Dynamic    | Technical team | Numbered request flows                |

**Rule of thumb:** Context + Container diagrams are sufficient for most teams. Only create Component/Code diagrams when they genuinely add clarity.

### Audience-Appropriate Recommendations

- **Executives/PMs:** Context only
- **Architects:** Context + Container
- **Developers:** Context + Container + Components for their area
- **DevOps/SRE:** Container + Deployment

## Element Syntax

### People and Systems

```
Person(alias, "Label", "Description")
Person_Ext(alias, "Label", "Description")
System(alias, "Label", "Description")
System_Ext(alias, "Label", "Description")
SystemDb(alias, "Label", "Description")
SystemDb_Ext(alias, "Label", "Description")
SystemQueue(alias, "Label", "Description")
SystemQueue_Ext(alias, "Label", "Description")
```

### Containers

```
Container(alias, "Label", "Technology", "Description")
Container_Ext(alias, "Label", "Technology", "Description")
ContainerDb(alias, "Label", "Technology", "Description")
ContainerDb_Ext(alias, "Label", "Technology", "Description")
ContainerQueue(alias, "Label", "Technology", "Description")
ContainerQueue_Ext(alias, "Label", "Technology", "Description")
```

### Components

```
Component(alias, "Label", "Technology", "Description")
Component_Ext(alias, "Label", "Technology", "Description")
ComponentDb(alias, "Label", "Technology", "Description")
ComponentQueue(alias, "Label", "Technology", "Description")
```

### Boundaries

```
Enterprise_Boundary(alias, "Label") { ... }
System_Boundary(alias, "Label") { ... }
Container_Boundary(alias, "Label") { ... }
Boundary(alias, "Label", "type") { ... }
```

### Relationships

```
Rel(from, to, "Label")
Rel(from, to, "Label", "Technology")
BiRel(from, to, "Label")
Rel_U(from, to, "Label")       %% Upward
Rel_D(from, to, "Label")       %% Downward
Rel_L(from, to, "Label")       %% Leftward
Rel_R(from, to, "Label")       %% Rightward
Rel_Back(from, to, "Label")    %% Back relationship
```

### Deployment Nodes

```
Deployment_Node(alias, "Label", "Type") { ... }
Deployment_Node(alias, "Label", "Type", "Description") { ... }
Node(alias, "Label") { ... }
Node_L(alias, "Label") { ... }
Node_R(alias, "Label") { ... }
```

## Complete Examples

### Level 1 — System Context

```mermaid
C4Context
    title System Context — Order Management Platform

    Person(customer, "Customer", "Places and tracks orders")
    Person(admin, "Admin", "Manages products and fulfillment")

    Enterprise_Boundary(company, "Company") {
        System(orderPlatform, "Order Platform", "Manages the full order lifecycle")
    }

    System_Ext(paymentGW, "Payment Gateway", "Stripe — processes payments")
    System_Ext(shipping, "Shipping Provider", "Handles delivery logistics")
    System_Ext(emailSvc, "Email Service", "SendGrid — transactional emails")
    System_Ext(analytics, "Analytics", "Mixpanel — usage tracking")

    Rel(customer, orderPlatform, "Places orders, tracks status", "HTTPS")
    Rel(admin, orderPlatform, "Manages catalog, fulfills orders", "HTTPS")
    Rel(orderPlatform, paymentGW, "Processes payments", "REST API")
    Rel(orderPlatform, shipping, "Creates shipments", "REST API")
    Rel(orderPlatform, emailSvc, "Sends notifications", "SMTP/API")
    Rel(orderPlatform, analytics, "Sends events", "HTTPS")
```

### Level 2 — Container

```mermaid
C4Container
    title Container Diagram — Order Platform

    Person(customer, "Customer")
    Person(admin, "Admin")

    System_Boundary(platform, "Order Platform") {
        Container(spa, "Web App", "React, TypeScript", "Customer-facing storefront")
        Container(adminApp, "Admin Panel", "React, TypeScript", "Back-office management")
        Container(api, "API Gateway", "NestJS", "Routes and authenticates requests")
        Container(orderSvc, "Order Service", "NestJS", "Order lifecycle management")
        Container(catalogSvc, "Catalog Service", "NestJS", "Product management")
        Container(notifSvc, "Notification Service", "Node.js", "Email and push notifications")
        ContainerQueue(eventBus, "Event Bus", "RabbitMQ", "Async event routing")
        ContainerDb(orderDb, "Order DB", "PostgreSQL", "Orders and transactions")
        ContainerDb(catalogDb, "Catalog DB", "PostgreSQL", "Products and categories")
        ContainerDb(cache, "Cache", "Redis", "Session and query cache")
    }

    System_Ext(paymentGW, "Stripe", "Payment processing")
    System_Ext(emailSvc, "SendGrid", "Email delivery")

    Rel(customer, spa, "Uses", "HTTPS")
    Rel(admin, adminApp, "Uses", "HTTPS")
    Rel(spa, api, "Calls", "JSON/HTTPS")
    Rel(adminApp, api, "Calls", "JSON/HTTPS")
    Rel(api, orderSvc, "Routes to", "gRPC")
    Rel(api, catalogSvc, "Routes to", "gRPC")
    Rel(api, cache, "Reads/writes", "Redis protocol")
    Rel(orderSvc, orderDb, "Reads/writes", "SQL")
    Rel(orderSvc, eventBus, "Publishes events", "AMQP")
    Rel(catalogSvc, catalogDb, "Reads/writes", "SQL")
    Rel(eventBus, notifSvc, "Delivers events", "AMQP")
    Rel(notifSvc, emailSvc, "Sends emails", "REST API")
    Rel(orderSvc, paymentGW, "Processes payment", "REST API")
```

### Level 3 — Component (Order Service)

```mermaid
C4Component
    title Component Diagram — Order Service

    Container_Boundary(orderSvc, "Order Service") {
        Component(orderCtrl, "Order Controller", "NestJS Controller", "HTTP/gRPC endpoints")
        Component(orderUseCase, "Order Use Cases", "Application Layer", "Create, cancel, fulfill orders")
        Component(paymentPort, "Payment Port", "Interface", "Payment processing abstraction")
        Component(orderRepo, "Order Repository", "TypeORM", "Order persistence")
        Component(eventPub, "Event Publisher", "AMQP Client", "Publishes domain events")
        Component(orderModel, "Order Aggregate", "Domain Model", "Business rules and invariants")
    }

    ContainerDb(orderDb, "Order DB", "PostgreSQL")
    ContainerQueue(eventBus, "Event Bus", "RabbitMQ")
    Container_Ext(paymentGW, "Stripe", "Payment API")

    Rel(orderCtrl, orderUseCase, "Invokes")
    Rel(orderUseCase, orderModel, "Operates on")
    Rel(orderUseCase, paymentPort, "Uses")
    Rel(orderUseCase, orderRepo, "Persists via")
    Rel(orderUseCase, eventPub, "Publishes events")
    Rel(orderRepo, orderDb, "SQL queries")
    Rel(eventPub, eventBus, "AMQP")
    Rel(paymentPort, paymentGW, "REST API")
```

### C4 Dynamic — Request Flow

```mermaid
C4Dynamic
    title Dynamic Diagram — Place Order Flow

    Container(spa, "Web App", "React")
    Container(api, "API Gateway", "NestJS")
    Container(orderSvc, "Order Service", "NestJS")
    Container(paymentGW, "Stripe", "Payment API")
    ContainerDb(db, "Order DB", "PostgreSQL")
    ContainerQueue(bus, "Event Bus", "RabbitMQ")

    Rel(spa, api, "1. POST /orders", "JSON/HTTPS")
    Rel(api, orderSvc, "2. CreateOrder()", "gRPC")
    Rel(orderSvc, db, "3. INSERT order (pending)", "SQL")
    Rel(orderSvc, paymentGW, "4. Process payment", "REST")
    Rel(orderSvc, db, "5. UPDATE order (confirmed)", "SQL")
    Rel(orderSvc, bus, "6. Publish OrderConfirmed", "AMQP")
    Rel(orderSvc, api, "7. Return order", "gRPC")
    Rel(api, spa, "8. 201 Created", "JSON/HTTPS")
```

### C4 Deployment

```mermaid
C4Deployment
    title Deployment — Production Environment

    Deployment_Node(cdn, "CloudFront", "CDN") {
        Container(static, "Static Assets", "React Build", "JS/CSS/HTML")
    }

    Deployment_Node(aws, "AWS", "us-east-1") {
        Deployment_Node(ecs, "ECS Cluster", "Fargate") {
            Deployment_Node(apiTask, "API Task", "2 vCPU, 4GB") {
                Container(api, "API Gateway", "NestJS")
            }
            Deployment_Node(orderTask, "Order Task", "2 vCPU, 4GB") {
                Container(orderSvc, "Order Service", "NestJS")
            }
        }

        Deployment_Node(rds, "RDS", "db.r6g.xlarge") {
            ContainerDb(db, "Order DB", "PostgreSQL 16")
        }

        Deployment_Node(elasticache, "ElastiCache", "r6g.large") {
            ContainerDb(cache, "Cache", "Redis 7")
        }

        Deployment_Node(mq, "Amazon MQ", "mq.m5.large") {
            ContainerQueue(bus, "Event Bus", "RabbitMQ")
        }
    }

    Rel(cdn, api, "Routes API calls", "HTTPS")
    Rel(api, orderSvc, "Internal", "gRPC")
    Rel(orderSvc, db, "Reads/writes", "SQL/TLS")
    Rel(api, cache, "Caches", "Redis/TLS")
    Rel(orderSvc, bus, "Publishes", "AMQP/TLS")
```

## Styling and Layout

### Layout Configuration

```
UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Element Styling

```
UpdateElementStyle(alias, $fontColor="red", $bgColor="grey", $borderColor="red")
```

### Relationship Styling

Use `$offsetX` and `$offsetY` to fix overlapping labels:

```
UpdateRelStyle(from, to, $textColor="blue", $lineColor="blue", $offsetY="-10")
```

## Microservices Patterns

### Single-Team Ownership

When one team owns all services, model each as a **container**:

```mermaid
C4Container
    title Microservices — Single Team

    System_Boundary(platform, "E-commerce Platform") {
        Container(orderSvc, "Order Service", "NestJS", "Order processing")
        ContainerDb(orderDb, "Order DB", "PostgreSQL")
        Container(inventorySvc, "Inventory Service", "NestJS", "Stock management")
        ContainerDb(inventoryDb, "Inventory DB", "MongoDB")
    }
```

### Multi-Team Ownership

When separate teams own services, promote them to **systems**:

```mermaid
C4Context
    title Microservices — Multi-Team

    Person(customer, "Customer")
    System(orderSys, "Order System", "Team Alpha")
    System(inventorySys, "Inventory System", "Team Beta")
    System(paymentSys, "Payment System", "Team Gamma")

    Rel(customer, orderSys, "Places orders")
    Rel(orderSys, inventorySys, "Checks stock")
    Rel(orderSys, paymentSys, "Processes payment")
```

### Event-Driven Architecture

Show individual topics/queues as containers — NOT a single "Kafka" box:

```mermaid
C4Container
    title Event-Driven Architecture

    Container(orderSvc, "Order Service", "Java", "Creates orders")
    Container(stockSvc, "Stock Service", "Java", "Manages inventory")
    ContainerQueue(orderTopic, "order.created", "Kafka", "Order events")
    ContainerQueue(stockTopic, "stock.reserved", "Kafka", "Stock events")

    Rel(orderSvc, orderTopic, "Publishes to")
    Rel(stockSvc, orderTopic, "Subscribes to")
    Rel(stockSvc, stockTopic, "Publishes to")
    Rel(orderSvc, stockTopic, "Subscribes to")
```

## Essential Rules

1. **Every element must have:** Name, Type, Technology (where applicable), Description
2. **Use unidirectional arrows** — bidirectional creates ambiguity
3. **Label arrows with action verbs** — "Sends email using", not just "uses"
4. **Include technology labels** — "JSON/HTTPS", "SQL", "gRPC"
5. **Under 20 elements per diagram** — split if more
6. **Always include a title**
7. **Meaningful aliases** — `orderService` not `s1`

## Common Mistakes

| Mistake                  | Why it's wrong                  | Fix                    |
| ------------------------ | ------------------------------- | ---------------------- |
| Shared lib as Container  | Containers are deployable units | Model as Component     |
| Single "Kafka" container | Hides topic structure           | Show individual topics |
| "Subcomponents" level    | Not a C4 concept                | Use Component or Class |
| Removing type labels     | Loses information               | Always show type/tech  |
| Bidirectional arrows     | Ambiguous flow direction        | Use unidirectional     |
| No technology labels     | Can't assess architecture       | Add protocol/tech      |

## File Naming Convention

```
docs/architecture/
├── c4-context.md
├── c4-containers.md
├── c4-components-{feature}.md
├── c4-deployment.md
└── c4-dynamic-{flow}.md
```
