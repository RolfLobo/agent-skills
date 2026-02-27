# Excalidraw Element Types Guide

Read this file when you need detailed guidance on which elements to use for specific diagram types, and how to construct them correctly.

For the JSON properties and format, see `excalidraw-schema.md`.

## Element Type Overview

| Type        | Shape | Primary Use                            | Text via `label` | Binding         |
| ----------- | ----- | -------------------------------------- | ---------------- | --------------- |
| `rectangle` | □     | Boxes, containers, process steps       | ✅ Yes           | Arrows can bind |
| `ellipse`   | ○     | Start/end, states, emphasis            | ✅ Yes           | Arrows can bind |
| `diamond`   | ◇     | Decision points, conditions            | ✅ Yes           | Arrows can bind |
| `arrow`     | →     | Directional flow, relationships        | ✅ Yes           | Binds to shapes |
| `line`      | —     | Non-directional connections, dividers  | ❌               | Binds to shapes |
| `text`      | A     | Standalone labels, titles, annotations | —                | Not bindable    |

## Shapes — Rectangle, Ellipse, Diamond

### When to use each

| Shape         | Best for                                         | Visual meaning                            |
| ------------- | ------------------------------------------------ | ----------------------------------------- |
| **Rectangle** | Process steps, entities, components, data stores | "This is a thing" or "This is an action"  |
| **Ellipse**   | Start/end terminals, states, emphasis            | "This is a boundary" or "This is a state" |
| **Diamond**   | Decision points, conditional branches            | "This is a question"                      |

### Text in shapes

Always use the `label` property:

```json
{
  "type": "rectangle",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 80,
  "backgroundColor": "#a5d8ff",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "roundness": { "type": 3 },
  "label": {
    "text": "Process Input",
    "fontSize": 20,
    "fontFamily": 5
  }
}
```

**Styled label options:**

```json
"label": {
  "text": "Important Step",
  "fontSize": 22,
  "fontFamily": 5,
  "strokeColor": "#1971c2",
  "textAlign": "center",
  "verticalAlign": "middle"
}
```

**Multi-line text:** Use `\n` for line breaks:

```json
"label": { "text": "User\nAuthentication\nService" }
```

### Size guidelines

| Content length | Rectangle | Ellipse | Diamond |
| -------------- | --------- | ------- | ------- |
| 1 word         | 140×70    | 120×120 | 140×140 |
| 2-4 words      | 200×80    | 160×120 | 180×180 |
| Short sentence | 280×100   | 200×140 | 220×220 |

### Styling for elegance

**Use stroke + fill combinations** — matching stroke to the fill's deeper shade:

| Role    | Fill      | Stroke    | Effect                        |
| ------- | --------- | --------- | ----------------------------- |
| Primary | `#a5d8ff` | `#1971c2` | Blue card with defined border |
| Success | `#b2f2bb` | `#2f9e44` | Green step with emphasis      |
| Warning | `#ffec99` | `#e67700` | Amber decision with warmth    |
| Danger  | `#ffc9c9` | `#e03131` | Red error with urgency        |
| Neutral | `#e9ecef` | `#868e96` | Subtle, de-emphasized         |
| Accent  | `#d0bfff` | `#7048e8` | Purple highlight              |

**fillStyle variations** for visual variety within the same diagram:

- `"solid"` — Clean, modern look (default for most shapes)
- `"hachure"` — Sketchy fill, good for secondary/background elements
- `"cross-hatch"` — Dense fill, good for emphasis or "completed" states

## Arrows

### Basic directional arrow

```json
{
  "id": "flow-1",
  "type": "arrow",
  "x": 300,
  "y": 140,
  "points": [
    [0, 0],
    [200, 0]
  ],
  "strokeWidth": 2,
  "roundness": { "type": 2 }
}
```

### Arrow with label

```json
{
  "id": "flow-1",
  "type": "arrow",
  "x": 300,
  "y": 140,
  "points": [
    [0, 0],
    [200, 0]
  ],
  "label": {
    "text": "HTTP/JSON",
    "fontSize": 14,
    "fontFamily": 5
  }
}
```

### Bound arrow (connects to shapes)

```json
{
  "id": "flow-1",
  "type": "arrow",
  "x": 300,
  "y": 140,
  "points": [
    [0, 0],
    [200, 0]
  ],
  "start": { "id": "shape-source" },
  "end": { "id": "shape-target" }
}
```

### Arrow with inline shape creation

Creates the connected shapes automatically:

```json
{
  "type": "arrow",
  "x": 100,
  "y": 100,
  "start": {
    "type": "rectangle",
    "label": { "text": "Client" }
  },
  "end": {
    "type": "rectangle",
    "label": { "text": "Server" }
  },
  "label": { "text": "request" }
}
```

### Arrow styles for semantic meaning

| Style                  | strokeStyle | strokeWidth | Meaning                              |
| ---------------------- | ----------- | ----------- | ------------------------------------ |
| **Primary flow**       | `"solid"`   | 2           | Main path, normal flow               |
| **Important flow**     | `"solid"`   | 3           | Critical path, emphasis              |
| **Optional/alternate** | `"dashed"`  | 2           | Optional path, fallback              |
| **Indirect/async**     | `"dotted"`  | 2           | Event-driven, async, weak dependency |

### Arrow directions

| Direction          | Points                           | Use case                |
| ------------------ | -------------------------------- | ----------------------- |
| → Right            | `[[0, 0], [200, 0]]`             | Process flow            |
| ↓ Down             | `[[0, 0], [0, 150]]`             | Hierarchy, sequence     |
| ↘ Diagonal         | `[[0, 0], [200, 150]]`           | Cross-connections       |
| → then ↓ (L-shape) | `[[0, 0], [200, 0], [200, 150]]` | Routing around elements |

## Lines

Non-directional connections with no arrowhead:

```json
{
  "type": "line",
  "x": 100,
  "y": 300,
  "points": [
    [0, 0],
    [400, 0]
  ],
  "strokeStyle": "dashed",
  "strokeWidth": 1,
  "strokeColor": "#868e96"
}
```

**Use cases:** Section dividers, boundaries, non-directional relationships (UML association).

## Standalone Text

For titles, headers, annotations not inside a shape:

```json
{
  "type": "text",
  "x": 100,
  "y": 40,
  "text": "System Architecture Overview",
  "fontSize": 28,
  "fontFamily": 5,
  "textAlign": "center",
  "strokeColor": "#1e1e1e"
}
```

**Width/height calculation:**

- Width ≈ `text.length × fontSize × 0.6`
- Height ≈ `fontSize × 1.2 × numberOfLines`

## Diagram Type Recipes

### Flowchart

```
[Start ellipse] → [Step rect] → [Decision diamond] → Yes → [Step rect] → [End ellipse]
                                                     ↓ No
                                                [Step rect]
```

- Start/End: `ellipse` with light green/red
- Steps: `rectangle` with light blue
- Decisions: `diamond` with amber/yellow
- Flow: solid arrows, labeled at decision branches ("Yes"/"No")

### Architecture Diagram

```
┌─────────────────────────────────────┐
│  [Client rect]  →  [API rect]  →  [DB rect]  │
│                     ↓                           │
│                [Queue rect]  →  [Worker rect]   │
└─────────────────────────────────────┘
```

- Components: `rectangle` with varied colors by layer (blue = frontend, green = backend, amber = data)
- Connections: solid arrows with protocol labels ("REST", "gRPC", "SQL")
- Boundaries: large rectangles with dashed stroke and `fillStyle: "hachure"` at low opacity

### ER Diagram

- Entities: `rectangle` with entity name as label
- Attributes: smaller `rectangle` or listed in multi-line label
- Relationships: `diamond` with relationship name
- Cardinality: text labels on arrows ("1", "N", "0..1")

### Sequence Diagram

- Actors: `rectangle` at top with actor name
- Lifelines: `line` (vertical, dashed)
- Messages: `arrow` (horizontal, solid = sync, dashed = async)
- Return: `arrow` (dashed, reverse direction)
- Activation: thin `rectangle` on lifeline

### Mind Map

- Center: large `ellipse` with main topic (bright color)
- Branches: `rectangle` connected via arrows from center
- Sub-topics: smaller `rectangle` connected from branches
- Use different colors per branch for visual grouping

### Class Diagram

- Classes: `rectangle` with multi-line label:
  ```
  ClassName
  ─────────
  -field: Type
  +field: Type
  ─────────
  +method(): Return
  -method(arg): Return
  ```
- Inheritance: solid arrow with label "extends"
- Implementation: dashed arrow with label "implements"
- Association: solid line

### Swimlane

- Lanes: tall `rectangle` with `fillStyle: "hachure"`, low opacity
- Lane headers: `text` at top of each lane
- Activities: `rectangle` inside lanes
- Handoffs: arrows crossing lane boundaries

### Data Flow Diagram (DFD)

- External entities: `rectangle` (bold stroke)
- Processes: `ellipse` with process number and name
- Data stores: `rectangle` with open side (use two horizontal lines)
- Data flows: labeled arrows (always show data name)
- Direction: left-to-right or top-left to bottom-right

## Design Principles for Elegant Diagrams

1. **Visual hierarchy** — Use size and color intensity to signal importance. Primary elements get saturated fills; secondary elements use neutral or hachure fills.

2. **Consistent stroke weight** — Use `strokeWidth: 2` for all shapes and arrows. Only increase to 3-4 to emphasize critical paths.

3. **Color harmony** — Use at most 3-4 fill colors per diagram. Pick from the same palette row (see excalidraw-schema.md Design Tokens). Avoid mixing warm and cool haphazardly.

4. **Whitespace is structure** — More spacing between unrelated groups, less between related elements. This creates visual grouping without borders.

5. **Aligned, not scattered** — Align elements on a grid. Centers should be aligned vertically or horizontally whenever possible.

6. **Label everything that isn't obvious** — Every arrow should either have a label or its meaning should be clear from context. Every shape needs text.

7. **Flow direction convention** — Left-to-right for process flows. Top-to-bottom for hierarchies and sequences. Pick one and be consistent.

8. **Matching stroke to fill** — Use the deeper shade from the palette as stroke color for the corresponding fill. This creates depth and definition.

## Summary

| When you need...               | Use this element                                              |
| ------------------------------ | ------------------------------------------------------------- |
| Process box, entity, component | `rectangle` with `label`                                      |
| Decision point                 | `diamond` with question as `label`                            |
| Start/End terminal             | `ellipse` with `label`                                        |
| Flow direction                 | `arrow` (optionally with `label` and `start`/`end` bindings)  |
| Title/Header                   | `text` (large font, standalone)                               |
| Annotation                     | `text` (small font, positioned near target)                   |
| Non-directional connection     | `line`                                                        |
| Section divider                | `line` (horizontal, dashed)                                   |
| Boundary/region                | `rectangle` (large, dashed stroke, hachure fill, low opacity) |
