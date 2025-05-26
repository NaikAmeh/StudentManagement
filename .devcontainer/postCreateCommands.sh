      
#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "--- Running postCreateCommands.sh ---"

# Navigate to the workspace root (where your backend/frontend folders are)
cd "/workspaces/${localWorkspaceFolderBasename}" || exit 1

# --- Backend Setup ---
echo "--- Restoring .NET backend dependencies ---"
# Check if backend folder exists
if [ -d "backend" ]; then
  cd backend
  # Ensure there's a project or solution file
  if [ -n "$(find . -maxdepth 1 -name '*.csproj' -print -quit)" ] || [ -n "$(find . -maxdepth 1 -name '*.sln' -print -quit)" ]; then
    dotnet restore
  else
    echo "No .csproj or .sln file found in backend directory. Skipping dotnet restore."
  fi
  cd ..
else
  echo "Backend directory not found. Skipping backend setup."
fi


# --- Frontend Setup ---
echo "--- Installing frontend dependencies ---"
# Check if frontend folder exists
if [ -d "frontend" ]; then
  cd frontend
  # Ensure there's a package.json
  if [ -f "package.json" ]; then
    # Detect package manager
    if [ -f "yarn.lock" ]; then
      echo "Yarn detected, installing dependencies..."
      yarn install
    elif [ -f "pnpm-lock.yaml" ]; then
      echo "PNPM detected, installing dependencies..."
      # Ensure pnpm is installed if you use it (add to Dockerfile if so)
      # npm install -g pnpm 
      pnpm install
    elif [ -f "package-lock.json" ] || [ -f "package.json" ]; then
      echo "NPM detected, installing dependencies..."
      npm install
    else
      echo "No lock file found, attempting npm install."
      npm install
    fi

    # --- Dynamically create .env file for React ---
    # CODESPACE_NAME and GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN are automatically set by Codespaces
    # We assume your .NET backend will run on HTTPS port 5001. Adjust if it's HTTP/5000.
    # If your .NET app serves Kestrel on http://0.0.0.0:5000 and Codespaces forwards it to HTTPS
    # then the URL would be HTTPS. If Kestrel serves HTTPS directly, then it's also HTTPS.
    # Prioritize HTTPS for security if your .NET app is configured for it.
    BACKEND_PORT=5001 # Default to HTTPS. Change to 5000 if your backend only does HTTP
    BACKEND_PROTOCOL="https" # Default to HTTPS

    # You might need to check if your .NET app is configured for HTTPS.
    # For simplicity, we assume it is on 5001 or HTTP on 5000.
    # This could be more sophisticated by checking the actual forwarded port status.

    echo "--- Creating/Updating frontend/.env.development.local ---"
    # Construct the base URL for the backend API
    # Example: https://your-codespace-name-5001.app-region.preview.app.github.dev
    REACT_APP_API_BASE_URL="${BACKEND_PROTOCOL}://${CODESPACE_NAME}-${BACKEND_PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    
    # If your backend is ONLY HTTP on port 5000:
    # REACT_APP_API_BASE_URL="http://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

    echo "REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}" > .env.development.local
    echo "Generated .env.development.local with API URL: ${REACT_APP_API_BASE_URL}"

  else
    echo "No package.json found in frontend directory. Skipping frontend npm/yarn install."
  fi
  cd ..
else
  echo "Frontend directory not found. Skipping frontend setup."
fi

echo "--- postCreateCommands.sh finished ---"

    