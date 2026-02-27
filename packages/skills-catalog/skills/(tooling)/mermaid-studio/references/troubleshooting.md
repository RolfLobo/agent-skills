# Troubleshooting — Common Errors and Fixes

Load this file when validation fails or diagrams don't render correctly.

## Syntax Errors

### 1. Unexpected token / Parse error

**Symptom:** `Parse error on line N: ...`

**Common causes and fixes:**

| Cause                   | Bad              | Good                    |
| ----------------------- | ---------------- | ----------------------- |
| Special chars in labels | `A[User's Data]` | `A["User's Data"]`      |
| Unmatched brackets      | `A[Open label`   | `A[Open label]`         |
| Missing arrow           | `A B`            | `A --> B`               |
| Wrong arrow direction   | `A >>- B`        | `A ->> B`               |
| Keyword as node ID      | `end --> start`  | `endNode --> startNode` |
| Curly braces in comment | `%% {config}`    | `%% config here`        |

### 2. Reserved Words as Node IDs

These words CANNOT be used as bare node IDs:

`end`, `graph`, `subgraph`, `flowchart`, `classDiagram`, `sequenceDiagram`, `stateDiagram`, `erDiagram`, `gantt`, `pie`, `click`, `style`, `class`, `linkStyle`, `default`, `direction`

**Fix:** Append a suffix or use different names:

```
%% Bad
end --> start

%% Good
endState --> startState
```

### 3. Quotes and Escaping

```
%% Bad — unescaped quotes
A["She said "hello""]

%% Good — use single quotes inside double, or HTML entities
A["She said 'hello'"]
A["She said &quot;hello&quot;"]

%% Bad — backslash in labels
A[C:\Users\path]

%% Good — use forward slash or quote the label
A["C:\Users\path"]
```

### 4. Empty Labels or Missing Content

```
%% Bad — empty node
A[] --> B

%% Good
A[Start] --> B[End]

%% Bad — empty subgraph
subgraph Group
end

%% Good
subgraph Group
    A[Content]
end
```

## Rendering Issues

### 5. Diagram Renders but Layout is Wrong

**Symptom:** Nodes overlap, arrows cross unnecessarily

**Fixes:**

- Change direction: `TD` ↔ `LR`
- Add invisible links for spacing: `A ~~~ B`
- Use subgraphs to group related nodes
- Reduce node count (split into multiple diagrams)
- Try `layout: elk` in frontmatter (if supported)

### 6. Labels Cut Off or Truncated

**Symptom:** Long text gets clipped

**Fixes:**

```
%% Use line breaks
A["Order Processing<br/>Service"]

%% Shorten labels
A["Order Svc"]

%% For sequence diagrams, use aliases
participant OrderSvc as Order Processing Service
```

### 7. Subgraph Won't Render

**Symptom:** Subgraph shows as flat, no boundary

**Fixes:**

```
%% Bad — subgraph must have content
subgraph Empty
end

%% Good — needs at least one node
subgraph Group["Service Layer"]
    A[Service A]
end

%% Bad — nested subgraph direction before content
subgraph Parent
    direction LR
end

%% Good — direction followed by nodes
subgraph Parent
    direction LR
    A --> B
end
```

### 8. Theme Not Applied

**Symptom:** Diagram renders with default colors

**Causes:**

- beautiful-mermaid themes only work with that engine
- Frontmatter must be at the very start of the file
- `%%{init}` directive must be on line 1
- Some renderers ignore theme config

**Fix:** Verify which engine is being used. For mmdc, use `--theme` flag. For beautiful-mermaid, use `--theme` parameter.

### 9. SVG Output is Blank or Tiny

**Symptom:** File is generated but empty or 0x0 pixels

**Causes:**

- Puppeteer/Chrome not installed (mmdc)
- File encoding issue (BOM marker)
- Syntax error that fails silently

**Fixes:**

```bash
# Re-run setup
bash $SKILL_DIR/scripts/setup.sh

# Check file encoding
file diagram.mmd
# Should say: UTF-8 Unicode text

# Validate first
node $SKILL_DIR/scripts/validate.mjs diagram.mmd
```

### 10. mmdc Command Not Found

```bash
# Check if installed
npx mmdc --version

# If not, install
npm install -g @mermaid-js/mermaid-cli

# Or use npx (no global install)
npx -y @mermaid-js/mermaid-cli -i input.mmd -o output.svg
```

### 11. Puppeteer/Chrome Issues

**Symptom:** `Error: Could not find Chrome`

```bash
# Install Chromium for puppeteer
npx puppeteer browsers install chrome

# Or set custom path
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Or use puppeteer config
echo '{"args": ["--no-sandbox"]}' > puppeteer-config.json
npx mmdc -i input.mmd -o output.svg -p puppeteer-config.json
```

## Diagram-Specific Issues

### 12. Sequence Diagram — Activation Mismatch

**Symptom:** `Activation error` or misaligned boxes

```
%% Bad — activate without deactivate
A->>+B: Request
B->>C: Forward

%% Good — always pair +/-
A->>+B: Request
B-->>-A: Response
```

### 13. ERD — Relationship Syntax Error

```
%% Bad — wrong cardinality syntax
USER --o{ ORDER

%% Good — must include both sides
USER ||--o{ ORDER : "places"

%% Bad — missing label
USER ||--o{ ORDER

%% Good — relationship label is required
USER ||--o{ ORDER : "places"
```

### 14. C4 — Element Not Rendering

```
%% Bad — missing quotes around parameters
Container(api, API, NestJS, Backend service)

%% Good — all text parameters in quotes
Container(api, "API", "NestJS", "Backend service")

%% Bad — wrong boundary nesting
Container_Boundary(app, "App") {
    System(sys, "External")  %% System inside Container boundary
}

%% Good — use appropriate element types for context
Container_Boundary(app, "App") {
    Component(cmp, "Internal Component", "Tech", "Desc")
}
```

### 15. Gantt — Dates Not Parsing

```
%% Bad — wrong format
dateFormat DD-MM-YYYY

%% Good — supported formats
dateFormat YYYY-MM-DD
%% or
dateFormat DD/MM/YYYY
%% or
dateFormat X  (Unix timestamp)
```

### 16. Flowchart — Circular Reference Warning

**Symptom:** Infinite loop in rendering

```
%% Problematic — direct circular
A --> B --> A

%% Still valid but may cause layout issues. Fix by adding direction:
flowchart LR
    A --> B
    B --> A  %% Renders as two arrows between A and B
```

### 17. State Diagram — Composite State Errors

```
%% Bad — missing initial state in composite
state Active {
    Running --> Paused
}

%% Good — composite states need initial transition
state Active {
    [*] --> Running
    Running --> Paused
}
```

### 18. Architecture-beta — Not Rendering

**Symptom:** Raw text displayed instead of diagram

**Cause:** `architecture-beta` requires Mermaid v11+

**Fixes:**

- Verify Mermaid version: `npx mmdc --version` (needs 11+)
- Use C4 or flowchart as fallback (see aws-architecture.md)
- Update mermaid-cli: `npm install -g @mermaid-js/mermaid-cli@latest`

## Validation Script Errors

### 19. validate.mjs Reports False Positives

If the validator rejects valid syntax, it might be using an older Mermaid parser version. Try:

```bash
# Update the validation script's dependency
cd $SKILL_DIR && npm update mermaid

# Or skip validation and render directly (rendering validates implicitly)
node $SKILL_DIR/scripts/render.mjs --input diagram.mmd --output test.svg
```

### 20. Batch Script Hangs

**Symptom:** batch.mjs processes some files then stops

**Causes:**

- Too many workers for available memory
- One diagram has infinite loop syntax
- Puppeteer timeout on complex diagrams

**Fixes:**

```bash
# Reduce workers
node $SKILL_DIR/scripts/batch.mjs --workers 1

# Increase timeout (ms)
node $SKILL_DIR/scripts/batch.mjs --timeout 60000

# Process problematic files individually to isolate the issue
```

## Performance Tips

1. **Simple diagrams first** — start with fewer nodes, add incrementally
2. **Split large diagrams** — over 20 nodes hurts readability and rendering
3. **Use SVG over PNG** — SVG renders faster and scales infinitely
4. **ASCII for CI/CD** — no Puppeteer needed, fast and portable
5. **Batch in parallel** — use `--workers 4` for multiple files
6. **Cache renders** — only re-render when .mmd source changes
