# IT365 — Data Analytics 1: Multiple Regression Analysis (Lesson 7)

Interactive, animated 17-slide lecture presentation covering Multiple Regression Analysis — from linear algebra by hand (`(XᵀX)⁻¹ Xᵀy`) to Python (`sklearn`, `NumPy`, `statsmodels`) and regression diagnostics (`VIF`, Breusch–Pagan, `HC3`).

## Publish as a Web Page with GitHub Pages

1. Create a new repository on GitHub (for example, `it365-multiple-regression`).
2. Push this project to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Add IT365 Lesson 7 interactive slides"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. In your GitHub repository, open **Settings → Pages**.
4. Under **Build and deployment → Source**, select **GitHub Actions**.
5. GitHub will automatically run `.github/workflows/deploy.yml` and publish your live slide deck at:
   `https://<your-username>.github.io/<your-repo>/`

## Local Development

```bash
npm install
npm run dev
```

## Presenter Controls

- `←` / `→` or `PageUp` / `PageDown`: Navigate slides
- `N`: Toggle instructor discussion notes
- `G`: Open slide overview grid
- **Present** button: Enter fullscreen mode
