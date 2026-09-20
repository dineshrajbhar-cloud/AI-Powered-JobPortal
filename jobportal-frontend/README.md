# JobPortal frontend

React + Tailwind CSS + Axios frontend for the [Jobportal Spring Boot backend](https://github.com/dineshrajbhar-cloud/Jobportal). It talks to the real API. There is no mock data anywhere in `src/`.

## Run it

Requirements: Node 20+, the Spring Boot API on port **9090**, and (for the matcher) the FastAPI service on port 8000.

```bash
npm install
npm run dev          # http://localhost:5173
```

The Spring Boot app has no CORS configuration, so the dev server proxies `/api` to `http://localhost:9090` (see `vite.config.js`). To point at another host, copy `.env.example` to `.env` and set `VITE_PROXY_TARGET`.

`npm run build` creates `dist/`. Serve it behind a reverse proxy that forwards `/api` to Spring Boot, or enable CORS on the backend (see below) and set `VITE_API_URL` at build time.

**Demo login:** `npm run dev` shows a "Fill demo login" button that pre-fills the recruiter account seeded by `DataInitializer`. Candidates register through the UI. Set `VITE_SHOW_DEMO=true` to show the button in a production build.

## What is in it

| Area | Route | Backend endpoints used |
|---|---|---|
| Landing (live openings) | `/` | `GET /api/ai/jobs` (public) |
| Register / sign in | `/register`, `/login` | `POST /api/auth/signup`, `POST /api/auth/login` |
| Job search + filters | `/jobs` | `GET /api/jobs/filter` (title, location, company, min/max salary) |
| Job details, apply | `/jobs/:id` | `GET /api/jobs/{id}`, `POST /api/application`, `POST /api/{id}/upload-resume` |
| AI resume matcher | `/matcher` | `POST /api/ai/match-jobs` (public, PDF only) |
| Candidate dashboard | `/candidate` | `GET /api/dashboard/candidate`, `GET /api/application` |
| Application tracking | `/candidate/applications` | `GET/DELETE /api/application`, resume upload/download |
| Recruiter dashboard | `/recruiter` | `GET /api/dashboard/recruiter`, `GET /api/application` |
| Manage jobs | `/recruiter/jobs` | `GET/POST/PUT/DELETE /api/jobs` |
| Review applicants | `/recruiter/applications` | `GET /api/application`, `PATCH /api/application/{id}/status`, `GET /api/{id}/resume` |

## How it handles the backend's quirks

- **Role detection.** `POST /auth/login` returns `{ jwtToken, name, email }` with no role, and the JWT only holds the email. After login the app probes `GET /api/users/0` (recruiter-only): 403 means candidate, 404 means recruiter. If the backend ever returns `role` in the login response or JWT, that is used instead (`src/services/authService.js`).
- **Expired tokens.** Spring answers 403, not 401, for an expired JWT, so the `exp` claim is checked client-side before each request and the user is sent back to sign in.
- **`userId` on apply.** `ApplicationRequest.userId` is `@NotNull`, but the service takes the owner from the JWT. A placeholder `0` is sent (`applicationService.js`).
- **Status emails.** `PATCH .../status` saves the change, then sends an email. If mail is not configured the request fails even though the status changed. The UI re-fetches to reconcile and tells the recruiter the email failed.
- **Resume state.** `ApplicationResponse` has no "has resume" flag, so download attempts show a clear message if nothing was uploaded.

## Backend changes worth making

1. **Raise the multipart limit.** Spring's default is 1 MB, so the 5 MB check in `uploadResume` is never reached. Add to `application.properties`:
   ```properties
   spring.servlet.multipart.max-file-size=5MB
   spring.servlet.multipart.max-request-size=5MB
   ```
2. **Return the role from login** (add `role` to `JwtResponse`) and the probe is skipped.
3. **Add `resumeUploaded` to `ApplicationResponse`** so the UI can show whether a resume exists.
4. **CORS, only if you deploy without a reverse proxy.** Add `.cors(Customizer.withDefaults())` to the security filter chain and:
   ```java
   @Bean
   CorsConfigurationSource corsConfigurationSource() {
       var config = new CorsConfiguration();
       config.setAllowedOrigins(List.of("https://your-frontend.example"));
       config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
       config.setAllowedHeaders(List.of("*"));
       var source = new UrlBasedCorsConfigurationSource();
       source.registerCorsConfiguration("/api/**", config);
       return source;
   }
   ```

## Structure

```
src/
  config.js            app name, upload limits, currency
  lib/                 axios client, session storage, formatters, status metadata
  services/            one module per backend controller
  context/AuthContext  session, sign in / register / sign out
  hooks/               useAsync, useDebounce, useDocumentTitle
  components/          ui kit, layouts, charts, match ring, application tracker
  pages/               route screens (candidate/, recruiter/)
  routes/guards.jsx    RequireAuth (with roles) and GuestOnly
```

Salary formatting defaults to INR (`en-IN`). Change it with `VITE_CURRENCY_CODE` and `VITE_CURRENCY_LOCALE`.
