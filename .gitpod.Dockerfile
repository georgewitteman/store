# You can find the new timestamped tags here: https://hub.docker.com/r/gitpod/workspace-full/tags
FROM gitpod/workspace-full:2022-07-18-05-42-34

# Install custom tools, runtime, etc.
RUN curl -L https://fly.io/install.sh | sh
