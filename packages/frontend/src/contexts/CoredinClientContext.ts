import { createContext } from "react";
import { CoredinClient } from "@coredin/shared";

export const CoredinClientContext = createContext(null as CoredinClient | null);
