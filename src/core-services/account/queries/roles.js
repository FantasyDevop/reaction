/**
 * @name roles
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Shops collection, filter over packages, and return available roles data
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of Shop to query
 * @returns {Object} roles object Promise
 */
export default async function rolesQuery(context, shopId) {
  const { checkPermissions, collections } = context;
  const { roles } = collections;

  await checkPermissions(["owner", "admin"], shopId);

  return roles.find({});
}