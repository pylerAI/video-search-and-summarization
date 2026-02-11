FROM alpine:3.23.2

# Create a working directory
WORKDIR /opt/mdx/

# Copy the init scripts into the working directory
COPY ./import-calibration/init-scripts ./init-scripts
COPY ./calibration ./calibration

# Install bash and curl commands.
RUN apk update && apk add bash

RUN apk --no-cache add curl