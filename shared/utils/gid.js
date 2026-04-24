export function gidToId(gid) {
  return gid.split("/").pop() ?? "";
}

export function idToGid(numericId) {
  return `gid://shopify/Metaobject/${numericId}`;
}
