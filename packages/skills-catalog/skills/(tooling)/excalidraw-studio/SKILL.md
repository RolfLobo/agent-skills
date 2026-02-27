---
name: excalidraw-studio
description: Generate Excalidraw diagrams from natural language descriptions. Outputs .excalidraw JSON files openable in Excalidraw. Use when asked to "create a diagram", "make a flowchart", "visualize a process", "draw a system architecture", "create a mind map", "generate an Excalidraw file", "draw an ER diagram", "create a sequence diagram", or "make a class diagram". Supports flowcharts, relationship diagrams, mind maps, architecture, DFD, swimlane, class, sequence, and ER diagrams. Can use icon libraries (AWS, GCP, etc.) when set up. Do NOT use for code architecture analysis (use the architecture skills), Mermaid diagram rendering (use mermaid-studio), or non-visual documentation (use docs-writer).
license: CC-BY-4.0
metadata:
  author: Felipe Rodrigues - github.com/felipfr
  version: 1.0.0
---

# Excalidraw Studio

Generate Excalidraw-format diagrams from natural language descriptions. Outputs `.excalidraw` JSON files that can be opened directly in Excalidraw (web, VS Code extension, or Obsidian plugin).

## Workflow

```
UNDERSTAND → CHOOSE TYPE → EXTRACT → GENERATE → SAVE
```

### Step 1: Understand the Request

Analyze the user's description to determine:

1. **Diagram type** — Use the decision matrix below
2. **Key elements** — Entities, steps, concepts, actors
3. **Relationships** — Flow direction, connections, hierarchy
4. **Complexity** — Number of elements (target: under 20 for clarity)

### Step 2: Choose the Diagram Type

| User Intent                | Diagram Type         | Keywords                                      |
| -------------------------- | -------------------- | --------------------------------------------- |
| Process flow, steps        | **Flowchart**        | "workflow", "process", "steps"                |
| Connections, dependencies  | **Relationship**     | "relationship", "connections", "dependencies" |
| Concept hierarchy          | **Mind Map**         | "mind map", "concepts", "breakdown"           |
| System design              | **Architecture**     | "architecture", "system", "components"        |
| Data movement              | **Data Flow (DFD)**  | "data flow", "data processing"                |
| Cross-functional processes | **Swimlane**         | "business process", "swimlane", "actors"      |
| Object-oriented design     | **Class Diagram**    | "class", "inheritance", "OOP"                 |
| Interaction sequences      | **Sequence Diagram** | "sequence", "interaction", "messages"         |
| Database design            | **ER Diagram**       | "database", "entity", "data model"            |

### Step 3: Extract Structured Information

Extract the key components based on diagram type. For each type, identify:

- **Nodes/entities** — What are the boxes/shapes?
- **Connections** — What connects to what, and with what label?
- **Hierarchy** — What contains what, what comes before what?
- **Decision points** — Where does the flow branch?

For detailed extraction guidelines per diagram type, read `references/element-types.md`.

### Step 4: Generate the Excalidraw JSON

**CRITICAL: Read `references/excalidraw-schema.md` before generating your first diagram.** It contains the correct element format, text container model, and binding system.

Key rules for generation:

1. **Text inside shapes** — Use the `label` property, NOT inline `text`:

   ```json
   {
     "type": "rectangle",
     "x": 100,
     "y": 100,
     "width": 200,
     "height": 80,
     "label": { "text": "My Step" }
   }
   ```

2. **Arrow labels** — Arrows support labels directly:

   ```json
   {
     "type": "arrow",
     "x": 100,
     "y": 150,
     "points": [
       [0, 0],
       [200, 0]
     ],
     "label": { "text": "sends data" }
   }
   ```

3. **Arrow bindings** — Connect arrows to shapes so they move together:

   ```json
   {
     "type": "arrow",
     "start": { "id": "shape-1" },
     "end": { "id": "shape-2" }
   }
   ```

4. **Positioning** — Use grid-aligned coordinates (multiples of 20px when `gridSize: 20`). Leave 200-300px horizontal gap, 100-150px vertical gap between elements.

5. **Unique IDs** — Every element must have a unique `id`. Use descriptive IDs like `"step-1"`, `"decision-valid"`, `"arrow-1-to-2"`.

6. **Colors** — Use a consistent palette:

   | Role | Color | Hex |
   |------|-------|-----|
   | Primary entities | Light blue | `#a5d8ff` |
   | Process steps | Light green | `#b2f2bb` |
   | Important/Central | Yellow | `#ffd43b` |
   | Warnings/Errors | Light red | `#ffc9c9` |
   | Secondary | Cyan | `#96f2d7` |
   | Default stroke | Dark | `#1e1e1e` |

### Step 5: Save and Present

1. Save as `<descriptive-name>.excalidraw`
2. Provide a summary:

   ```
   Created: user-workflow.excalidraw
   Type: Flowchart
   Elements: 7 shapes, 6 arrows, 1 title
   Total: 14 elements

   To view:
   1. Visit https://excalidraw.com → Open → drag and drop the file
   2. Or use the Excalidraw VS Code extension
   3. Or open in Obsidian with the Excalidraw plugin
   ```

## Templates

Pre-built templates are available in `templates/` for quick starting points. Use these when the diagram type matches — they provide correct structure and styling:

| Template         | File                                                   |
| ---------------- | ------------------------------------------------------ |
| Flowchart        | `templates/flowchart-template.excalidraw`              |
| Relationship     | `templates/relationship-template.excalidraw`           |
| Mind Map         | `templates/mindmap-template.excalidraw`                |
| Data Flow (DFD)  | `templates/data-flow-diagram-template.excalidraw`      |
| Swimlane         | `templates/business-flow-swimlane-template.excalidraw` |
| Class Diagram    | `templates/class-diagram-template.excalidraw`          |
| Sequence Diagram | `templates/sequence-diagram-template.excalidraw`       |
| ER Diagram       | `templates/er-diagram-template.excalidraw`             |

Read a template when creating that diagram type for the first time. Use its structure as a base, then modify elements to match the user's request.

## Icon Libraries

For professional architecture diagrams with service icons (AWS, GCP, Azure, etc.), icon libraries can be set up. Read `references/icon-libraries.md` when:

- User requests an AWS/cloud architecture diagram
- User mentions wanting specific service icons
- You need to check if icon libraries are available

## Best Practices

### Element Count

| Diagram Type          | Recommended | Maximum |
| --------------------- | ----------- | ------- |
| Flowchart steps       | 3-10        | 15      |
| Relationship entities | 3-8         | 12      |
| Mind map branches     | 4-6         | 8       |
| Sub-topics per branch | 2-4         | 6       |

If the user's request exceeds maximum, suggest breaking into multiple diagrams:

> "Your request includes 15 components. For clarity, I recommend: (1) High-level architecture diagram with 6 main components, (2) Detailed sub-diagrams for each subsystem. Want me to start with the high-level view?"

### Layout

- **Flow direction**: Left-to-right for processes, top-to-bottom for hierarchies
- **Spacing**: 200-300px horizontal, 100-150px vertical between elements
- **Grid alignment**: Position on multiples of 20px for clean alignment
- **Margins**: Minimum 50px from canvas edge
- **Text sizing**: 28-36px titles, 18-22px labels, 14-16px annotations
- **Font**: Use `fontFamily: 5` (Excalifont) for hand-drawn consistency. Fallback to `1` (Virgil) if 5 is not supported.

### Common Mistakes to Avoid

- ❌ Putting `text` property directly on shapes instead of using `label: { text: "..." }`
- ❌ Creating separate text elements for arrow labels instead of using `label` on the arrow
- ❌ Floating arrows without bindings (won't move with shapes)
- ❌ Overlapping elements (increase spacing)
- ❌ Inconsistent color usage (define palette upfront)
- ❌ Too many elements on one diagram (break into sub-diagrams)

## Validation Checklist

Before delivering the diagram, verify:

- [ ] All elements have unique IDs
- [ ] Shapes with text use `label: { text: "..." }` format
- [ ] Arrows use `start`/`end` bindings when connecting shapes
- [ ] Coordinates prevent overlapping (check spacing)
- [ ] Text is readable (font size 16+)
- [ ] Colors follow consistent scheme
- [ ] File is valid JSON
- [ ] Element count is reasonable (<20 for clarity)

## Troubleshooting

| Issue                         | Solution                                                |
| ----------------------------- | ------------------------------------------------------- |
| Text not showing in shapes    | Use `label: { text: "..." }` not inline `text` property |
| Arrows don't move with shapes | Add `start`/`end` bindings with element IDs             |
| Elements overlap              | Increase spacing between coordinates                    |
| Text doesn't fit              | Increase shape width or reduce font size                |
| Too many elements             | Break into multiple diagrams                            |
| Colors look inconsistent      | Define color palette upfront, apply consistently        |

## Limitations

- Complex curves are simplified to straight/basic curved lines
- Hand-drawn roughness is set to default (1)
- No embedded images in auto-generation (use icon libraries for service icons)
- Maximum recommended: 20 elements per diagram for clarity
- No automatic collision detection — use spacing guidelines
