# Maths — Ronan Downes

**One mathematics site.** Number, Algebra, Functions, Geometry, Trigonometry, Statistics, Probability and Combinatorics are the main menus. Every mathematical topic is in its relevant section, regardless of school year or exam level. This is not divided into separate JC, TY and LC books.

## Classroom-ready content included

- **Number:** Sets and subsets.
- **Algebra:** Sequences; Factorising.
- **Geometry:** Rectangle dimensions, perimeter and area (scale-model app).
- **Trigonometry:** Separate Sine, Cosine and Tangent apps, a mixed-ratio app, and the draggable Triangle Rules app.
- **Probability:** Tree diagrams.
- **Statistics:** Describing data.
- **Functions:** Quadratic functions.
- **Combinatorics:** Counting principles.

The Rectangle Explorer is paired with the Book section on variables and geometric models: the Maths lesson embeds the app, and the app links back to the matching Book section.

The Trigonometry apps link directly to their matching Book section. Other sidebar labels are **planned** and deliberately not live links; no empty lesson is represented as finished.

## Publishing

This is a static HTML site. It needs no PreTeXt, Ruby, packages or build workflow on GitHub. In GitHub Pages, set the source to **Deploy from a branch**, branch `main`, directory `/(root)`. The site URL should be `https://ronandownes.github.io/maths/` once GitHub has deployed it.

The generated HTML pages are included in the repository. To edit:

1. Edit `content/catalogue.json` for navigation, and/or `content/pages/*.html` for teaching content.
2. Run `python build_site.py`. It uses only the Python standard library and refuses to overwrite unrelated HTML files.
3. Review the resulting pages, then commit and push when you choose.

Do not edit the generated topic `index.html` files directly; they are rebuilt from the content files. The included `apps/triangle-rules/index.html` and `geometry/rectangle-variables/app.html` are independent of the site generator and remain standalone interactive apps.

## Design

The white document area follows the Education site: width up to 900px, desktop padding 56px top and 72px horizontally, white page on pale grey background, and contextual left navigation. The four-dot branding is based on the original `ronandownes/education` logo and favicon (red, green, blue, black). The header title is simply **Maths**.

## Safety

This ZIP does not delete or modify any existing GitHub repository. If replacing an existing PreTeXt project, back up the repository and Git history **before** deleting or overwriting it. No student names or confidential school materials are included.

## Canonical teaching resources

All student-facing material is in this repository. `Algebra → Factorising` contains HCF, grouping, the interactive expansion/factorisation tool and downloadable PDF worksheets. Maintain `content/pages/factorising.html` as the canonical source and run `python build_site.py` to regenerate the HTML.
