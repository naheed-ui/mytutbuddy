# How to add a new worksheet

You don't need to write any code to add a worksheet. You add one **data file**
(a `.json` file) describing the questions, and the website builds itself
automatically.

## The short version

1. Go to the `data/worksheets/` folder in the repository.
2. Copy an existing file (e.g. `solving-linear-equations.json`) as a starting point.
3. Rename it and edit the title, questions and answers.
4. Commit / save the file on the `main` branch (e.g. upload it through the
   GitHub website, or ask Claude to add it for you).
5. Within a minute or two, the live site rebuilds itself automatically and
   your new worksheet appears — no other steps needed.

You can have as many `.json` files in that folder as you like — each one
becomes its own worksheet page automatically.

---

## The fields in a worksheet file

```json
{
  "slug": "solving-linear-equations",
  "title": "Solving Linear Equations",
  "shortDescription": "Practise solving simple linear equations step by step.",
  "intro": "Solve each equation to find the value of x.",
  "grade": "GCSE",
  "topic": "Algebra",
  "subtopic": "Linear Equations",
  "difficulty": "Easy",
  "seoTitle": "GCSE Algebra Worksheet: Solving Linear Equations | MyTutBuddy",
  "seoDescription": "Free interactive GCSE Maths worksheet on solving linear equations.",
  "featured": true,
  "questions": [ ... ]
}
```

| Field | What it's for |
|---|---|
| `slug` | The web address for this worksheet (letters, numbers, hyphens only). Must be unique across all worksheets. |
| `title` | The heading shown on the page. |
| `shortDescription` | One sentence shown on worksheet cards in the library. |
| `intro` | Optional instructions shown under the title. |
| `grade` | e.g. `"Grade 6"`, `"Grade 7"`, `"Grade 8"`, `"Grade 9"`, `"GCSE"`, `"A-Level"`, `"SAT"`. This also controls the folder in the worksheet's web address. |
| `topic` | e.g. `"Algebra"`, `"Fractions"`, `"Geometry"`, `"Trigonometry"`, `"Statistics"`, `"Probability"`. Also used in the web address. |
| `subtopic` | Optional, more specific label shown as a tag (e.g. `"Linear Equations"`). |
| `difficulty` | e.g. `"Easy"`, `"Medium"`, `"Hard"`. |
| `seoTitle` / `seoDescription` | What shows up in Google search results. If you skip these, sensible defaults are used. |
| `featured` | Set to `true` to make it eligible to appear on the homepage. |
| `questions` | The list of questions — see below. |

The worksheet's web address is built automatically from `grade` + `topic` +
`slug`, for example:

```
/worksheets/gcse/algebra/solving-linear-equations/
```

## Writing maths notation

Anywhere you write text (titles, questions, answer options), you can write
real maths by wrapping it in dollar signs. This uses a system called KaTeX.

- `$2x + 5 = 17$` → displays inline as proper maths
- `$$2x + 5 = 17$$` → displays as a larger, centred equation (use this for the main equation in a question)
- Fractions: `$\frac{x}{2}$`
- Powers: `$x^2$`
- Square roots: `$\sqrt{x}$`

You don't need to know the full system — copy the patterns from the example
worksheets already in `data/worksheets/`.

## Question types

Every question needs a `"type"`. Here are the five supported types:

### 1. Text answer (student types the answer)
```json
{
  "type": "text",
  "prompt": "Solve for $x$: $$2x + 5 = 17$$",
  "answer": "6"
}
```
Spaces and capitalisation don't matter when marking — `"6"`, `" 6 "` and
`"6 "` are all treated the same. If there's more than one acceptable way to
write the answer, list them:
```json
{
  "type": "text",
  "prompt": "Factorise: $$6x + 9$$",
  "answer": "3(2x+3)",
  "acceptableAnswers": ["3(2x+3)", "(2x+3)3"]
}
```

### 2. Multiple choice (student picks one option)
```json
{
  "type": "multiple-choice",
  "prompt": "Expand: $$3(x + 4)$$",
  "options": ["$3x + 4$", "$3x + 12$", "$x + 12$", "$3x + 7$"],
  "answer": "$3x + 12$"
}
```
`answer` must exactly match one of the entries in `options`.

### 3. Dropdown (student picks one option from a dropdown menu)
Same shape as multiple choice — just a different visual style. Good for
short "fill the blank" style questions:
```json
{
  "type": "dropdown",
  "prompt": "Expand $2(x - 5)$:",
  "options": ["2x - 10", "2x - 5", "2x + 10", "x - 10"],
  "answer": "2x - 10"
}
```

### 4. True / False
```json
{
  "type": "true-false",
  "prompt": "True or false: $$\\frac{1}{2} + \\frac{1}{4} = \\frac{3}{4}$$",
  "answer": true
}
```
`answer` must be `true` or `false` (no quotation marks).

> Note: when writing a backslash for maths commands like `\frac`, JSON needs
> you to type it twice: `\\frac`. Copy this pattern from the examples.

### 5. Matching
```json
{
  "type": "matching",
  "prompt": "Match each fraction to its decimal equivalent.",
  "pairs": [
    { "left": "$\\frac{1}{2}$", "right": "0.5" },
    { "left": "$\\frac{1}{4}$", "right": "0.25" }
  ]
}
```
Each `left` item gets a dropdown of shuffled `right` values for the student
to match against.

### Optional: adding a diagram or graph image
Any question can include an image above the question text:
```json
{
  "type": "text",
  "prompt": "Find the area of the triangle shown.",
  "image": "/mytutbuddy/assets/images/triangle-diagram.png",
  "answer": "24"
}
```
(Add the image file itself into the `static/assets/images/` folder — ask
Claude to help with this if needed.)

---

## If something goes wrong

If a worksheet file has a mistake in it (like a missing field, or invalid
JSON), the automatic build will **fail on purpose** rather than publish a
broken page. Check the "Actions" tab on GitHub — it will show you exactly
which file and which field caused the problem, in plain English.

The most common mistakes are:
- A missing comma between fields
- Forgetting to close a quote `"`
- Using the same `slug` twice across two worksheets
- Writing `"answer": "true"` (with quotes) instead of `"answer": true` for a true/false question
