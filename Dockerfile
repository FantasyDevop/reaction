##############################################################################
# meteor-dev stage - builds image for dev and used with docker-compose.yml
##############################################################################
FROM reactioncommerce/base:v4.0.2 as meteor-dev

LABEL maintainer="Reaction Commerce <architecture@reactioncommerce.com>"

ENV PATH $PATH:/home/node/.meteor

COPY --chown=node package-lock.json $APP_SOURCE_DIR/
COPY --chown=node package.json $APP_SOURCE_DIR/


# # Install jq, a lightweight and flexible command-line JSON processor.
# We use it to determine the base branch of a PR so we can run diffs to conditionally run circle workflows
RUN curl -L "https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64" -o /home/node/jq
RUN chmod +x /home/node/jq

# Because Docker Compose uses a named volume for node_modules and named volumes are owned
# by root by default, we have to initially create node_modules here with correct owner.
# Without this NPM cannot write packages into node_modules later, when running in a container.
RUN mkdir "$APP_SOURCE_DIR/node_modules" && chown node "$APP_SOURCE_DIR/node_modules"

RUN meteor npm install

COPY --chown=node . $APP_SOURCE_DIR


##############################################################################
# builder stage - builds the production bundle
##############################################################################
FROM meteor-dev as builder

RUN printf "\\n[-] Running Reaction plugin loader...\\n" \
 && reaction plugins load
RUN printf "\\n[-] Building Meteor application...\\n" \
 && meteor build --server-only --architecture os.linux.x86_64 --directory "$APP_BUNDLE_DIR"

WORKDIR $APP_BUNDLE_DIR/bundle/programs/server/

RUN meteor npm install --production


##############################################################################
# final build stage - create the final production image
##############################################################################
FROM node:8.9.4-slim

# Default environment variables
ENV ROOT_URL "http://localhost"
ENV PORT 3000

# grab the dependencies and built app from the previous builder image
COPY --chown=node --from=builder /opt/reaction/dist/bundle /app

WORKDIR /app

EXPOSE 3000

CMD ["node", "main.js"]
