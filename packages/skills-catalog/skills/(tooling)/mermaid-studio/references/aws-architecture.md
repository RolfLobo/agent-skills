# AWS Architecture Diagrams — Complete Reference

Load this file when the user requests cloud architecture diagrams, AWS infrastructure visualization, or `architecture-beta` diagrams.

## Overview

Mermaid's `architecture-beta` diagram type enables cloud architecture visualization with icons representing services. Combined with custom icon packs (like AWS), it produces professional infrastructure diagrams.

**Important:** `architecture-beta` requires Mermaid v11+. Some markdown renderers (GitHub, GitLab) may not render these yet. For universal compatibility, consider using C4 diagrams with descriptive labels instead.

## Basic Syntax

```mermaid
architecture-beta

    group groupId(icon)[Label]

    service serviceId(icon)[Label] in groupId

    serviceA:R --> L:serviceB
```

### Building Blocks

| Element          | Syntax                               | Purpose                                |
| ---------------- | ------------------------------------ | -------------------------------------- |
| Group            | `group id(icon)[Label]`              | Visual boundary (VPC, region, account) |
| Service          | `service id(icon)[Label]`            | Individual service node                |
| Service in group | `service id(icon)[Label] in groupId` | Service inside a group                 |
| Edge             | `serviceA:Side --> Side:serviceB`    | Connection with direction              |

### Edge Sides

Edges connect from/to specific sides of services:

- `L` — Left
- `R` — Right
- `T` — Top
- `B` — Bottom

```
api:R --> L:lambda        %% api's right connects to lambda's left
lambda:B --> T:db          %% lambda's bottom connects to db's top
```

### Built-in Icons

Available without any icon pack:
`cloud`, `database`, `disk`, `internet`, `server`

## Icon Packs

### Using Iconify Icons

Mermaid supports 200,000+ icons from iconify.design. Common technology icons:

```
%% Format: iconPack:icon-name
service node(logos:nodejs-icon)[Node.js]
service react(logos:react)[React]
service docker(logos:docker-icon)[Docker]
service k8s(logos:kubernetes)[Kubernetes]
service postgres(logos:postgresql)[PostgreSQL]
service redis(logos:redis)[Redis]
service nginx(logos:nginx)[Nginx]
service graphql(logos:graphql)[GraphQL]
```

**Note:** Iconify icons require the icon pack to be registered in the rendering environment. They do NOT work in static markdown renderers.

### AWS Icon Pack

The `aws-mermaid-icons` project provides 855+ AWS service icons in iconifyJSON format. Two variants exist:

1. **Standard** — transparent backgrounds, colored glyphs
2. **Background** — colored tiles, white glyphs (classic AWS style)

**Registration (in rendering code):**

```javascript
import mermaid from 'mermaid'

mermaid.registerIconPacks([
  {
    name: 'aws',
    loader: () =>
      fetch('https://raw.githubusercontent.com/harmalh/aws-mermaid-icons/main/iconify-json/aws-icons.json').then(
        (res) => res.json(),
      ),
  },
])
```

**AWS icon naming conventions:**

- AWS services: `aws:aws-{service}` (e.g., `aws:aws-lambda`, `aws:aws-glue`)
- Amazon services: `aws:amazon-{service}` (e.g., `aws:amazon-rds`, `aws:amazon-s3`)
- Resources: `aws:{resource}` (e.g., `aws:amazon-eventbridge-topic`)

### Common AWS Service Icons

| Service         | Icon name                                | Category       |
| --------------- | ---------------------------------------- | -------------- |
| Lambda          | `aws:aws-lambda`                         | Compute        |
| EC2             | `aws:aws-ec2`                            | Compute        |
| ECS             | `aws:amazon-ecs`                         | Compute        |
| Fargate         | `aws:aws-fargate`                        | Compute        |
| S3              | `aws:amazon-simple-storage-service`      | Storage        |
| EBS             | `aws:amazon-elastic-block-store`         | Storage        |
| EFS             | `aws:amazon-efs`                         | Storage        |
| RDS             | `aws:amazon-rds`                         | Database       |
| DynamoDB        | `aws:amazon-dynamodb`                    | Database       |
| ElastiCache     | `aws:amazon-elasticache`                 | Database       |
| Aurora          | `aws:amazon-aurora`                      | Database       |
| API Gateway     | `aws:amazon-api-gateway`                 | Networking     |
| CloudFront      | `aws:amazon-cloudfront`                  | Networking     |
| Route 53        | `aws:amazon-route-53`                    | Networking     |
| ELB/ALB         | `aws:elastic-load-balancing`             | Networking     |
| VPC             | `aws:amazon-virtual-private-cloud`       | Networking     |
| SQS             | `aws:amazon-sqs`                         | Messaging      |
| SNS             | `aws:amazon-sns`                         | Messaging      |
| EventBridge     | `aws:amazon-eventbridge`                 | Messaging      |
| Kinesis         | `aws:amazon-kinesis`                     | Messaging      |
| Step Functions  | `aws:aws-step-functions`                 | Integration    |
| CloudWatch      | `aws:amazon-cloudwatch`                  | Monitoring     |
| X-Ray           | `aws:aws-x-ray`                          | Monitoring     |
| IAM             | `aws:aws-identity-and-access-management` | Security       |
| Cognito         | `aws:amazon-cognito`                     | Security       |
| KMS             | `aws:aws-key-management-service`         | Security       |
| WAF             | `aws:aws-waf`                            | Security       |
| CodePipeline    | `aws:aws-codepipeline`                   | DevOps         |
| CodeBuild       | `aws:aws-codebuild`                      | DevOps         |
| CodeDeploy      | `aws:aws-codedeploy`                     | DevOps         |
| ECR             | `aws:amazon-elastic-container-registry`  | Containers     |
| SageMaker       | `aws:amazon-sagemaker`                   | ML/AI          |
| Bedrock         | `aws:amazon-bedrock`                     | ML/AI          |
| CloudFormation  | `aws:aws-cloudformation`                 | Infrastructure |
| Secrets Manager | `aws:aws-secrets-manager`                | Security       |
| Parameter Store | `aws:aws-systems-manager`                | Management     |

## Architecture Patterns

### Pattern 1: Three-Tier Web Application

```mermaid
architecture-beta
    group vpc(cloud)[VPC]
    group publicSubnet(cloud)[Public Subnet] in vpc
    group privateSubnet(cloud)[Private Subnet] in vpc
    group dataSubnet(database)[Data Subnet] in vpc

    service cdn(internet)[CloudFront]
    service alb(server)[ALB] in publicSubnet
    service ecs(server)[ECS Fargate] in privateSubnet
    service rds(database)[Aurora PostgreSQL] in dataSubnet
    service cache(database)[ElastiCache Redis] in dataSubnet

    cdn:R --> L:alb
    alb:R --> L:ecs
    ecs:R --> L:rds
    ecs:B --> T:cache
```

### Pattern 2: Serverless API

```mermaid
architecture-beta
    group api(cloud)[API Layer]
    group compute(cloud)[Compute]
    group storage(cloud)[Storage]

    service gw(server)[API Gateway] in api
    service auth(server)[Cognito] in api
    service fn1(server)[Lambda: Orders] in compute
    service fn2(server)[Lambda: Products] in compute
    service dynamo(database)[DynamoDB] in storage
    service s3(disk)[S3] in storage

    gw:B --> T:auth
    gw:R --> L:fn1
    gw:R --> L:fn2
    fn1:R --> L:dynamo
    fn2:R --> L:s3
```

### Pattern 3: Event-Driven Microservices

```mermaid
architecture-beta
    group ingest(cloud)[Ingestion]
    group processing(cloud)[Processing]
    group storage(cloud)[Storage]
    group notify(cloud)[Notification]

    service apigw(server)[API Gateway] in ingest
    service eventBridge(server)[EventBridge] in ingest
    service orderFn(server)[Order Lambda] in processing
    service paymentFn(server)[Payment Lambda] in processing
    service inventoryFn(server)[Inventory Lambda] in processing
    service dynamo(database)[DynamoDB] in storage
    service sqs(server)[SQS Dead Letter] in notify
    service sns(server)[SNS] in notify

    apigw:R --> L:eventBridge
    eventBridge:R --> L:orderFn
    eventBridge:R --> L:paymentFn
    eventBridge:R --> L:inventoryFn
    orderFn:R --> L:dynamo
    paymentFn:R --> L:dynamo
    inventoryFn:R --> L:dynamo
    orderFn:B --> T:sqs
    paymentFn:B --> T:sns
```

### Pattern 4: Data Pipeline

```mermaid
architecture-beta
    group sources(cloud)[Data Sources]
    group pipeline(cloud)[Pipeline]
    group analytics(cloud)[Analytics]

    service s3raw(disk)[S3 Raw Data] in sources
    service kinesis(server)[Kinesis Stream] in sources
    service glue(server)[Glue ETL] in pipeline
    service stepFn(server)[Step Functions] in pipeline
    service s3processed(disk)[S3 Processed] in pipeline
    service athena(server)[Athena] in analytics
    service quicksight(server)[QuickSight] in analytics

    s3raw:R --> L:glue
    kinesis:R --> L:glue
    glue:R --> L:stepFn
    stepFn:R --> L:s3processed
    s3processed:R --> L:athena
    athena:R --> L:quicksight
```

### Pattern 5: CI/CD Pipeline

```mermaid
architecture-beta
    group source(cloud)[Source]
    group build(cloud)[Build & Test]
    group deploy(cloud)[Deploy]
    group runtime(cloud)[Runtime]

    service repo(server)[CodeCommit] in source
    service pipeline(server)[CodePipeline] in build
    service codebuild(server)[CodeBuild] in build
    service ecr(server)[ECR] in build
    service codedeploy(server)[CodeDeploy] in deploy
    service ecs(server)[ECS Fargate] in runtime
    service cw(server)[CloudWatch] in runtime

    repo:R --> L:pipeline
    pipeline:R --> L:codebuild
    codebuild:R --> L:ecr
    ecr:R --> L:codedeploy
    codedeploy:R --> L:ecs
    ecs:B --> T:cw
```

## Fallback Strategy

When `architecture-beta` is not supported by the rendering environment, use these alternatives:

### Option A: C4 Container Diagram (Best Alternative)

C4 diagrams work everywhere and convey the same information:

```mermaid
C4Container
    title AWS Architecture — Serverless API

    Container(gw, "API Gateway", "AWS", "REST API endpoint")
    Container(auth, "Cognito", "AWS", "Authentication")
    Container(fn, "Lambda", "Node.js", "Business logic")
    ContainerDb(db, "DynamoDB", "AWS", "NoSQL storage")
    ContainerDb(s3, "S3", "AWS", "Object storage")

    Rel(gw, auth, "Authenticates", "JWT")
    Rel(gw, fn, "Invokes", "Event")
    Rel(fn, db, "Reads/writes", "SDK")
    Rel(fn, s3, "Stores files", "SDK")
```

### Option B: Flowchart with AWS Labels

```mermaid
flowchart LR
    subgraph AWS["AWS Cloud"]
        subgraph VPC
            ALB[ALB<br/>Load Balancer]
            subgraph ECS["ECS Cluster"]
                Svc1[Service A]
                Svc2[Service B]
            end
            RDS[(Aurora<br/>PostgreSQL)]
        end
        S3[(S3 Bucket)]
        CF[CloudFront]
    end

    Users([Users]) --> CF
    CF --> ALB
    ALB --> Svc1 & Svc2
    Svc1 & Svc2 --> RDS
    Svc1 --> S3
```

## Best Practices

1. **Group by boundary** — VPC, subnet, region, account
2. **Left-to-right flow** — request path should read naturally
3. **Label connections** — protocol and purpose
4. **One diagram per concern** — networking, compute, data, separately
5. **Include external systems** — show what connects from outside
6. **Security boundaries** — show public vs private subnets
7. **Use built-in icons as fallback** — `cloud`, `database`, `disk`, `server`, `internet` work everywhere without icon packs
