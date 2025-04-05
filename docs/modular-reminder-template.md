# Pickle+ Modular Architecture Reminder

When requesting new features or changes to Pickle+, please use these conversation starters to maintain our modular architecture:

## Feature Request Template

```
I'd like to add a new feature to Pickle+:

- Module: [Specify which module: user, match, tournament, achievement, social, or coaching]
- Feature Description: [Brief description of what you want to add]
- Cross-Module Interactions: [If applicable, which other modules need to be notified]
- Feature Flag: [If this should be behind a feature flag, suggest a name]

Additional details:
[Any other information about how the feature should work]
```

## Bug Fix Template

```
I've found a bug in Pickle+ that needs fixing:

- Module: [Which module contains the bug]
- Issue Description: [What's happening vs. what should happen]
- Cross-Module Impact: [Does this affect other modules?]

Steps to reproduce:
[List the steps to reproduce the issue]
```

## Enhancement Template

```
I'd like to improve an existing feature in Pickle+:

- Module: [Which module to enhance]
- Current Functionality: [How it works now]
- Desired Improvement: [How it should work]
- Event Bus Usage: [Does this need new events?]

Reason for enhancement:
[Why this improvement is needed]
```

---

**Reminder:** Our modular architecture is designed to:
1. Keep modules independent with clear responsibilities
2. Use the event bus for cross-module communication
3. Hide implementation details behind module APIs
4. Enable gradual feature rollout with feature flags

For detailed guidelines, see `docs/modular-architecture-reference.md`