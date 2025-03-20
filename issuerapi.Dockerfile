FROM waltid/issuer-api:0.8.1

COPY packages/backend/issuer-api/prod /waltid-issuer-api

USER root
RUN apt-get update && apt-get install -y jq
USER waltid

ENTRYPOINT ["/waltid-issuer-api/entrypoint.sh"]
CMD ["/waltid-issuer-api/bin/waltid-issuer-api"]