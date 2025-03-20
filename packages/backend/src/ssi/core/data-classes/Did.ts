export type Did = {
  did: string;
  alias: string;
  document: string;
  keyId: string;
  default: boolean;
  // This are actually timestamps but not required for the moment
  // createdOn: string
};
