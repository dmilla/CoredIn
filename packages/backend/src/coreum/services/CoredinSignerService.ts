import { CoredinClient, DID } from "@coredin/shared";

export class CoredinSignerService {
  constructor(private readonly coredinClient: CoredinClient) { }

  async register(did: DID, username: string) {
    return this.coredinClient.register({ did, username });
  }
}
