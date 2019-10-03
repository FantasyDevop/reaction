import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocUserInternalId = assocInternalId(namespaces.User);
export const assocUserOpaqueId = assocOpaqueId(namespaces.User);
export const decodeUserOpaqueId = decodeOpaqueIdForNamespace(namespaces.User);
export const encodeUserOpaqueId = encodeOpaqueId(namespaces.User);
