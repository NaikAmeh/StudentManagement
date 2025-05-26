      
# Use an official .NET SDK image as a parent image
# Choose a version appropriate for your .NET Core backend (e.g., 6.0, 7.0, 8.0)
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS base

# Set Node.js version (LTS is generally good)
ARG NODE_VERSION="18"

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies, including Node.js setup and MySQL client
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    gnupg \
    # For Node.js via NodeSource
    ca-certificates \
    # MySQL client for direct database interaction from terminal if needed
    mysql-client \
    # Clean up
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Node.js using NodeSource (more reliable than apt's default Node)
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# (Optional) Install Yarn if you use it for your React project
# RUN npm install -g yarn

# Verify installations
RUN dotnet --version
RUN node --version
RUN npm --version
# RUN yarn --version # if yarn installed

# Set up a non-root user for security, matching Codespaces default
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    # Add user to sudoers with no password (common for dev containers)
    && apt-get update && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME \
    && apt-get clean

# Switch to non-root user
USER $USERNAME

# Set working directory (Codespaces usually mounts here)
WORKDIR /workspaces

# --- This part is mostly for image layers, actual app code is mounted by Codespaces ---
# To ensure .NET and Node tools are in PATH for the user
ENV PATH="${PATH}:/home/${USERNAME}/.dotnet/tools:/home/${USERNAME}/.npm-global/bin"

# (Optional) Globally install EF tools if you use EF Core migrations
# RUN dotnet tool install --global dotnet-ef

    