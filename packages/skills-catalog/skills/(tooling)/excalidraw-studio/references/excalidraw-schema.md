# Excalidraw JSON Schema Reference

Read this file before generating your first diagram. It contains the correct element format, text container model, and binding system.

## Top-Level Structure

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

## Element Properties

All elements share these base properties:

| Property          | Type        | Default         | Description                                                                             |
| ----------------- | ----------- | --------------- | --------------------------------------------------------------------------------------- |
| `id`              | string      | required        | Unique identifier (e.g., `"step-1"`, `"arrow-a-b"`)                                     |
| `type`            | string      | required        | `"rectangle"`, `"ellipse"`, `"diamond"`, `"arrow"`, `"line"`, `"text"`                  |
| `x`, `y`          | number      | required        | Position in pixels from top-left. Use multiples of 20 for grid alignment.               |
| `width`, `height` | number      | required        | Dimensions in pixels                                                                    |
| `strokeColor`     | string      | `"#1e1e1e"`     | Hex color for outline                                                                   |
| `backgroundColor` | string      | `"transparent"` | Hex color for fill                                                                      |
| `fillStyle`       | string      | `"solid"`       | `"solid"`, `"hachure"`, `"cross-hatch"`                                                 |
| `strokeWidth`     | number      | `2`             | Outline thickness (1-4)                                                                 |
| `strokeStyle`     | string      | `"solid"`       | `"solid"`, `"dashed"`, `"dotted"`                                                       |
| `roughness`       | number      | `1`             | Hand-drawn effect (0 = clean, 1 = sketch, 2 = rough)                                    |
| `opacity`         | number      | `100`           | Transparency (0-100)                                                                    |
| `roundness`       | object/null | varies          | `{ "type": 3 }` for rounded corners, `{ "type": 2 }` for curved arrows, `null` for text |
| `groupIds`        | string[]    | `[]`            | Group membership for compound elements                                                  |
| `locked`          | boolean     | `false`         | Lock element from editing                                                               |

**Properties you should set but keep constant:**

```json
{
  "angle": 0,
  "frameId": null,
  "isDeleted": false,
  "link": null,
  "locked": false,
  "seed": 1234567890,
  "version": 1,
  "versionNonce": 987654321,
  "updated": 1706659200000
}
```

Generate unique `seed` and `versionNonce` per element: `Math.floor(Math.random() * 2147483647)`.

## Text Inside Shapes (CRITICAL)

**DO NOT put `text`, `fontSize`, `textAlign` directly on shape elements.** This is not how Excalidraw works.

**Correct approach:** Use the `label` property on shapes. This auto-creates a properly bound text element:

```json
{
  "id": "step-1",
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
    "fontFamily": 5,
    "textAlign": "center",
    "verticalAlign": "middle"
  }
}
```

This works for `rectangle`, `ellipse`, and `diamond` elements.

**Label properties:**

| Property        | Default    | Options                                                              |
| --------------- | ---------- | -------------------------------------------------------------------- |
| `text`          | required   | The text content. Use `\n` for line breaks.                          |
| `fontSize`      | `20`       | 14-36 depending on purpose                                           |
| `fontFamily`    | `5`        | 5 = Excalifont (hand-drawn), 1 = Virgil, 2 = Helvetica, 3 = Cascadia |
| `textAlign`     | `"center"` | `"left"`, `"center"`, `"right"`                                      |
| `verticalAlign` | `"middle"` | `"top"`, `"middle"`, `"bottom"`                                      |
| `strokeColor`   | inherits   | Override text color                                                  |

## Arrows and Bindings (CRITICAL)

### Basic Arrow

```json
{
  "id": "arrow-1",
  "type": "arrow",
  "x": 300,
  "y": 140,
  "width": 100,
  "height": 0,
  "points": [
    [0, 0],
    [100, 0]
  ],
  "roundness": { "type": 2 },
  "strokeWidth": 2
}
```

### Arrow with Label

Arrows support labels directly — do NOT create separate text elements:

```json
{
  "id": "arrow-1",
  "type": "arrow",
  "x": 300,
  "y": 140,
  "points": [
    [0, 0],
    [200, 0]
  ],
  "label": {
    "text": "sends data",
    "fontSize": 14,
    "fontFamily": 5
  }
}
```

### Bound Arrows (connect to shapes)

For arrows that should move when shapes are repositioned, use `start` and `end` bindings:

**By element ID (connect to existing shapes):**

```json
[
  {
    "id": "box-a",
    "type": "rectangle",
    "x": 100,
    "y": 100,
    "width": 160,
    "height": 80,
    "label": { "text": "Service A" }
  },
  {
    "id": "box-b",
    "type": "rectangle",
    "x": 460,
    "y": 100,
    "width": 160,
    "height": 80,
    "label": { "text": "Service B" }
  },
  {
    "id": "arrow-a-b",
    "type": "arrow",
    "x": 260,
    "y": 140,
    "points": [
      [0, 0],
      [200, 0]
    ],
    "start": { "id": "box-a" },
    "end": { "id": "box-b" },
    "label": { "text": "REST API" }
  }
]
```

**By inline shape creation (arrow creates its own start/end shapes):**

```json
{
  "type": "arrow",
  "x": 100,
  "y": 100,
  "start": {
    "type": "rectangle",
    "label": { "text": "Source" }
  },
  "end": {
    "type": "ellipse",
    "label": { "text": "Target" }
  },
  "label": { "text": "flows to" }
}
```

### Arrow Directions

| Direction      | Points                           |
| -------------- | -------------------------------- |
| Horizontal (→) | `[[0, 0], [200, 0]]`             |
| Vertical (↓)   | `[[0, 0], [0, 150]]`             |
| Diagonal (↘)   | `[[0, 0], [200, 150]]`           |
| L-shaped (→↓)  | `[[0, 0], [200, 0], [200, 150]]` |

## Design Tokens — Elegant Palette

Use these curated colors for professional, modern diagrams. Avoid raw primary colors.

### Light Theme (default)

| Role                  | Fill        | Stroke       | Hex Fill  | Hex Stroke |
| --------------------- | ----------- | ------------ | --------- | ---------- |
| **Primary**           | Soft blue   | Deeper blue  | `#a5d8ff` | `#1971c2`  |
| **Success/Process**   | Mint green  | Forest green | `#b2f2bb` | `#2f9e44`  |
| **Warning/Decision**  | Warm amber  | Deep amber   | `#ffec99` | `#e67700`  |
| **Danger/Error**      | Soft rose   | Deep rose    | `#ffc9c9` | `#e03131`  |
| **Neutral/Secondary** | Light gray  | Medium gray  | `#e9ecef` | `#868e96`  |
| **Accent**            | Soft violet | Deep violet  | `#d0bfff` | `#7048e8`  |
| **Info/Highlight**    | Soft cyan   | Teal         | `#96f2d7` | `#0c8599`  |
| **Canvas**            | White       | —            | `#ffffff` | —          |
| **Default stroke**    | —           | Near-black   | —         | `#1e1e1e`  |

### Dark Theme

When user requests dark mode, set `"viewBackgroundColor": "#1e1e1e"` and use these:

| Role               | Fill       | Stroke      | Hex Fill  | Hex Stroke |
| ------------------ | ---------- | ----------- | --------- | ---------- |
| **Primary**        | Deep blue  | Light blue  | `#1864ab` | `#74c0fc`  |
| **Success**        | Deep green | Light green | `#2b8a3e` | `#8ce99a`  |
| **Warning**        | Deep amber | Light amber | `#e67700` | `#ffd43b`  |
| **Danger**         | Deep red   | Light red   | `#c92a2a` | `#ff8787`  |
| **Neutral**        | Dark gray  | Light gray  | `#343a40` | `#adb5bd`  |
| **Default stroke** | —          | White       | —         | `#ffffff`  |

### Typography Scale

| Purpose         | Font Size | Font Family     |
| --------------- | --------- | --------------- |
| Diagram title   | 28-32     | `fontFamily: 5` |
| Section header  | 22-24     | `fontFamily: 5` |
| Element label   | 18-20     | `fontFamily: 5` |
| Arrow label     | 14-16     | `fontFamily: 5` |
| Annotation/note | 12-14     | `fontFamily: 5` |

### Spacing System

All spacing based on `gridSize: 20`:

| Context                         | Value     | Grid multiples |
| ------------------------------- | --------- | -------------- |
| Between elements (horizontal)   | 200-300px | 10-15 units    |
| Between elements (vertical)     | 100-150px | 5-7.5 units    |
| Element padding (inside shapes) | 20-40px   | 1-2 units      |
| Arrow-to-shape clearance        | 20px      | 1 unit         |
| Canvas margin                   | 60px      | 3 units        |
| Between groups of elements      | 400px     | 20 units       |

## Font Families

| ID  | Name       | Style                | When to use                                        |
| --- | ---------- | -------------------- | -------------------------------------------------- |
| 5   | Excalifont | Hand-drawn (newest)  | Default — matches Excalidraw's signature aesthetic |
| 1   | Virgil     | Hand-drawn (classic) | Fallback if fontFamily 5 is not supported          |
| 2   | Helvetica  | Clean sans-serif     | Technical/formal diagrams when requested           |
| 3   | Cascadia   | Monospace            | Code labels, technical identifiers                 |

**Default to fontFamily 5 for all text** unless the user explicitly requests a formal/clean style.

## Coordinate System

- Origin `(0, 0)` is top-left corner
- X increases to the right
- Y increases downward
- All units are in pixels
- Align to grid: position on multiples of 20 (when `gridSize: 20`)

## Element Sizing Guide

| Shape     | Content                  | Width     | Height    |
| --------- | ------------------------ | --------- | --------- |
| Rectangle | Single word              | 140-160px | 60-80px   |
| Rectangle | Short phrase (2-4 words) | 180-220px | 80-100px  |
| Rectangle | Sentence                 | 250-320px | 100-120px |
| Ellipse   | Short text (circle)      | 120×120px | —         |
| Ellipse   | Longer text              | 160×120px | —         |
| Diamond   | Short question           | 140×140px | —         |
| Diamond   | Longer question          | 180×180px | —         |

**Width formula for text:** `text.length × fontSize × 0.6`
**Height formula:** `fontSize × 1.2 × numberOfLines`

## Grouping Elements

Use `groupIds` to create compound elements that move together:

```json
[
  {
    "id": "server-box",
    "type": "rectangle",
    "groupIds": ["server-group"],
    "label": { "text": "Web Server" }
  },
  {
    "id": "server-icon",
    "type": "text",
    "groupIds": ["server-group"],
    "text": "🖥️"
  }
]
```

## `customData` for Metadata

Store extra information on elements that persists with the file but doesn't render:

```json
{
  "id": "step-1",
  "type": "rectangle",
  "customData": {
    "diagramType": "flowchart",
    "stepNumber": 1,
    "generatedBy": "excalidraw-studio"
  }
}
```

## Complete Minimal Example

A flowchart with two connected shapes:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "title",
      "type": "text",
      "x": 100,
      "y": 40,
      "width": 300,
      "height": 35,
      "text": "User Registration Flow",
      "fontSize": 28,
      "fontFamily": 5,
      "textAlign": "center",
      "strokeColor": "#1e1e1e",
      "opacity": 100,
      "roundness": null
    },
    {
      "id": "step-1",
      "type": "rectangle",
      "x": 100,
      "y": 120,
      "width": 200,
      "height": 80,
      "strokeColor": "#1971c2",
      "backgroundColor": "#a5d8ff",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "roughness": 1,
      "roundness": { "type": 3 },
      "label": {
        "text": "Enter Email",
        "fontSize": 20,
        "fontFamily": 5
      }
    },
    {
      "id": "arrow-1-2",
      "type": "arrow",
      "x": 300,
      "y": 160,
      "width": 100,
      "height": 0,
      "points": [
        [0, 0],
        [100, 0]
      ],
      "strokeColor": "#1e1e1e",
      "strokeWidth": 2,
      "roundness": { "type": 2 },
      "start": { "id": "step-1" },
      "end": { "id": "step-2" }
    },
    {
      "id": "step-2",
      "type": "rectangle",
      "x": 400,
      "y": 120,
      "width": 200,
      "height": 80,
      "strokeColor": "#2f9e44",
      "backgroundColor": "#b2f2bb",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "roughness": 1,
      "roundness": { "type": 3 },
      "label": {
        "text": "Verify Email",
        "fontSize": 20,
        "fontFamily": 5
      }
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```
