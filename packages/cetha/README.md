# @charvesta/cetha

Astro-native and SSR-safe UI components. Import components from the package root or granular exports, then import `@charvesta/cetha/styles` once in your base layout.

```astro
---
import { Button, Field, Input } from '@charvesta/cetha';
import '@charvesta/cetha/styles';
---

<Field id="email" label="Email">
  <Input id="email" name="email" type="email" required />
</Field>
<Button type="submit" variant="primary">Save</Button>
```

Cetha has no runtime dependency and does not require Tailwind in the consuming
project. JavaScript is included only by interactive components as progressive
enhancement over semantic HTML.
