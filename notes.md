## TODO

- [ ] Authentication & Authorization with RBAC
- [ ] Create guard
- [ ] Tenant routes
- [ ] Model responses. Normalize and type the responses throught entire app

## DB Models

### `users`

| Field         | Type     | Description                                 |
| ------------- | -------- | ------------------------------------------- |
| id            | UUID PK  |                                             |
| email         | string   |                                             |
| password_hash | string   |                                             |
| full_name     | string   |                                             |
| role          | enum     | `client`, `employee`, `admin`, `superadmin` |
| tenant_id     | UUID FK  | Refers to `tenants.id`                      |
| created_at    | datetime |                                             |
| updated_at    | datetime |                                             |

### `tenants`

| Field         | Type     | Description                 |
| ------------- | -------- | --------------------------- |
| id            | UUID PK  | Tenant ID                   |
| name          | string   | Agency name                 |
| users         | User[]   | Refers to `users.tenant_id` |
| custom_domain | string   | `agency-1.com`              |
| plan_id       | UUID FK  | Refers to `plans.id`        |
| created_at    | datetime |                             |
| updated_at    | datetime |                             |
