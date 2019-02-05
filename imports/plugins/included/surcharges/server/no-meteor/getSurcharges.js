import Random from "@reactioncommerce/random";
import xformCartGroupToCommonOrder from "/imports/plugins/core/cart/server/no-meteor/util/xformCartGroupToCommonOrder";
import extendCommonOrder from "/imports/plugins/core/shipping/server/no-meteor/util/extendCommonOrder";
import { surchargeCheck } from "./util/surchargeCheck";


/**
 * @summary Returns a list of surcharges to apply based on the cart.
 * @param {Object} context - Context
 * @param {Object} cart - the user's cart
 * @return {Array} - an array that surcharges to apply to cart / order
 * @private
 */
export default async function getSurcharges(context, { commonOrder }) {
  const { collections: { Surcharges } } = context;
  const extendedCommonOrder = await extendCommonOrder(context, commonOrder);

  // Get surcharges from Mongo
  // Use forEach to use Mongos built in memory handling to not
  // overload memory while fetching the entire colleciotn
  const surcharges = [];
  await Surcharges.find({ shopId: extendedCommonOrder.shopId }).forEach((surcharge) => {
    surcharges.push(surcharge);
  });

  const allAppliedSurcharges = await surcharges.reduce(async (appliedSurcharges, surcharge) => {
    const awaitedAppliedSurcharges = await appliedSurcharges;

    const applySurcharge = await surchargeCheck(surcharge, extendedCommonOrder);

    // If surcharge passes all checks, it is valid and should be added to valid surcharges array
    if (applySurcharge) {
      awaitedAppliedSurcharges.push(surcharge);
    }

    return awaitedAppliedSurcharges;
  }, Promise.resolve([]));

  // We don't need all data to be passed to Cart / Order
  // Parse provided surcharge data to pass only relevent data to match Cart / Order schema
  const appliedSurchargesFormattedForFulfillment = allAppliedSurcharges.map((surcharge) => (
    {
      _id: Random.id(),
      surchargeId: surcharge._id,
      amount: surcharge.amount,
      messagesByLanguage: surcharge.messagesByLanguage,
      cartId: commonOrder.cartId
    }
  ));

  return appliedSurchargesFormattedForFulfillment;
}
