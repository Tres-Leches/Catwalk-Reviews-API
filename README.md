# Project Catwalk API Optimization
Given legacy data for a mock e-commerce retailer, the goal was to develop and optimize an API server for high-traffic. Using an ETL process for legacy data (over 20M records), database indexing, local stress testing, horizontal scaling by load balancing across several cloned db servers, and establishing API caching, the system achieves a throughput of ~10,000 RPS and under 1% error rate.

## Technologies
* Express
* NodeJS
* PostgreSQL
* PG Admin
* Docker
* AWS EC2
* NGINX
* K6
* New Relic
* Loader.io
