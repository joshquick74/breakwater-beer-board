import { useState } from "react";

const BASE_URL = window.location.origin;

function CodeBlock({ children, language = "bash" }: { children: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
        <code>{children.trim()}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  auth,
  body,
  response,
  curl,
}: {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  body?: string;
  response?: string;
  curl: string;
}) {
  const [open, setOpen] = useState(false);
  const methodColors: Record<string, string> = {
    GET: "bg-green-600",
    POST: "bg-blue-600",
    PATCH: "bg-amber-600",
    DELETE: "bg-red-600",
  };
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-colors text-left"
      >
        <span className={`${methodColors[method] || "bg-gray-600"} text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide`}>
          {method}
        </span>
        <code className="text-amber-400 font-mono text-sm">{path}</code>
        {auth && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Auth</span>}
        <span className="text-gray-400 text-sm ml-auto hidden sm:inline">{description}</span>
        <span className="text-gray-500 text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-gray-700 p-4 space-y-4 bg-gray-900/30">
          <p className="text-gray-300 text-sm">{description}</p>
          {auth && (
            <p className="text-xs text-gray-400">
              Requires <code className="text-amber-400">Authorization: Bearer &lt;token&gt;</code> header
            </p>
          )}
          {body && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Request Body</h4>
              <CodeBlock language="json">{body}</CodeBlock>
            </div>
          )}
          {response && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Response</h4>
              <CodeBlock language="json">{response}</CodeBlock>
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Example</h4>
            <CodeBlock>{curl}</CodeBlock>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <a href="/" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block">&larr; Back to Home</a>
          <h1 className="text-4xl font-bold mb-3">Beer Board API</h1>
          <p className="text-gray-400 text-lg">
            Programmatically manage your beer board. All write operations require authentication.
          </p>
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300">
              <strong className="text-white">Base URL:</strong>{" "}
              <code className="text-amber-400">{BASE_URL}/api</code>
            </p>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Authentication
          </h2>
          <p className="text-gray-400 mb-4">
            To use write endpoints, first obtain a token by logging in with the admin password.
            Include the token in subsequent requests as a Bearer token.
          </p>
          <div className="space-y-3">
            <Endpoint
              method="POST"
              path="/api/admin/login"
              description="Get an auth token"
              body={`{
  "password": "your-admin-password"
}`}
              response={`{
  "success": true,
  "token": "abc123..."
}`}
              curl={`curl -X POST ${BASE_URL}/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your-admin-password"}'`}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            Beers
          </h2>
          <div className="space-y-3">
            <Endpoint
              method="GET"
              path="/api/beers"
              description="List all beers ordered by position"
              response={`[
  {
    "id": 1,
    "tapNumber": 1,
    "beerName": "Wild Miami Rice",
    "brewery": "Hop Dogma/Barebottle",
    "style": "Wild Rice IPA",
    "abv": "7%",
    "price": "$8",
    "available": true,
    "position": 0
  }
]`}
              curl={`curl ${BASE_URL}/api/beers`}
            />

            <Endpoint
              method="POST"
              path="/api/beers"
              description="Add a new beer"
              auth
              body={`{
  "tapNumber": 7,
  "beerName": "Pliny the Elder",
  "brewery": "Russian River",
  "style": "Double IPA",
  "abv": "8%",
  "price": "$9",
  "available": true
}`}
              response={`{
  "id": 7,
  "tapNumber": 7,
  "beerName": "Pliny the Elder",
  "brewery": "Russian River",
  "style": "Double IPA",
  "abv": "8%",
  "price": "$9",
  "available": true,
  "position": 6
}`}
              curl={`curl -X POST ${BASE_URL}/api/beers \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "tapNumber": 7,
    "beerName": "Pliny the Elder",
    "brewery": "Russian River",
    "style": "Double IPA",
    "abv": "8%",
    "price": "$9",
    "available": true
  }'`}
            />

            <Endpoint
              method="PATCH"
              path="/api/beers/:id"
              description="Update a beer (partial update)"
              auth
              body={`{
  "price": "$10",
  "available": false
}`}
              response={`{
  "id": 7,
  "tapNumber": 7,
  "beerName": "Pliny the Elder",
  "brewery": "Russian River",
  "style": "Double IPA",
  "abv": "8%",
  "price": "$10",
  "available": false,
  "position": 6
}`}
              curl={`curl -X PATCH ${BASE_URL}/api/beers/7 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"price": "$10", "available": false}'`}
            />

            <Endpoint
              method="DELETE"
              path="/api/beers/:id"
              description="Remove a beer"
              auth
              curl={`curl -X DELETE ${BASE_URL}/api/beers/7 \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
            />

            <Endpoint
              method="PATCH"
              path="/api/beers/reorder"
              description="Set the display order of beers"
              auth
              body={`{
  "beerIds": [3, 1, 5, 2, 4, 6]
}`}
              response={`{
  "success": true
}`}
              curl={`curl -X PATCH ${BASE_URL}/api/beers/reorder \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"beerIds": [3, 1, 5, 2, 4, 6]}'`}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            Board Settings
          </h2>
          <div className="space-y-3">
            <Endpoint
              method="GET"
              path="/api/settings"
              description="Get current board settings"
              response={`{
  "id": 1,
  "headerTitle": "Breakwater Barbecue",
  "overlayEnabled": true,
  "overlayOpacity": 60,
  "backgroundImageUrl": "/api/uploads/background.png",
  "logoImageUrl": null,
  "logoSizePercent": 100,
  "breweryFont": "Oswald",
  "breweryColor": "#ffffff",
  "beerNameFont": "Oswald",
  "beerNameColor": "#f59e0b",
  "styleFont": "Open Sans",
  "styleColor": "#cccccc",
  "abvFont": "Open Sans",
  "abvColor": "#cccccc",
  "priceFont": "Bebas Neue",
  "priceColor": "#f59e0b"
}`}
              curl={`curl ${BASE_URL}/api/settings`}
            />

            <Endpoint
              method="PATCH"
              path="/api/settings"
              description="Update board settings (partial update)"
              auth
              body={`{
  "breweryFont": "Oswald",
  "breweryColor": "#ffffff",
  "beerNameColor": "#f59e0b",
  "priceFont": "Bebas Neue",
  "overlayOpacity": 50
}`}
              curl={`curl -X PATCH ${BASE_URL}/api/settings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"breweryFont": "Oswald", "beerNameColor": "#f59e0b"}'`}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
            Quick Start
          </h2>
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 space-y-4">
            <p className="text-gray-300 text-sm">Replace the entire beer list in one script:</p>
            <CodeBlock>{`# 1. Get a token
TOKEN=$(curl -s -X POST ${BASE_URL}/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your-password"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Delete all existing beers
for id in $(curl -s ${BASE_URL}/api/beers | grep -o '"id":[0-9]*' | cut -d: -f2); do
  curl -s -X DELETE ${BASE_URL}/api/beers/$id \\
    -H "Authorization: Bearer $TOKEN"
done

# 3. Add new beers
curl -X POST ${BASE_URL}/api/beers \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{
    "tapNumber": 1,
    "beerName": "Hazy IPA",
    "brewery": "Local Brewing",
    "style": "IPA",
    "abv": "6.5%",
    "price": "$8"
  }'`}</CodeBlock>
          </div>
        </section>

        <footer className="text-center text-gray-600 text-sm pt-8 border-t border-gray-800">
          Breakwater's Bad Ass Beer Board API
        </footer>
      </div>
    </div>
  );
}
