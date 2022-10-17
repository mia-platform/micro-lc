---
title: Compose
sidebar_label: Compose
sidebar_position: 20
---

A composable application is a pseudo-HTML document enhanced with JavaScript properties dynamically injected
by the composer application. A configuration is mandatory and can either be a full configuration or a URL to be downloaded
to obtain the configuration.

```json5 title=micro-lc.config.json
{
  // ...
  "applications": {
    "orders": {
      "route": "/plugins/orders",
      "integrationMode": "compose",
      "config": "/api/orders.json"
    }
  }
}
```